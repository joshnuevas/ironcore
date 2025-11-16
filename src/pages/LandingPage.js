import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import styles from "./LandingPage.module.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Calendar, Clock, CreditCard, Award, CheckCircle, AlertCircle } from "lucide-react";

const LandingPage = () => {
  const navigate = useNavigate();
  const [activatedTransactions, setActivatedTransactions] = useState([]);
  const [unactivatedTransactions, setUnactivatedTransactions] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserAndTransactions = async () => {
      try {
        setLoading(true);
        
        // Fetch current user
        const userRes = await axios.get("http://localhost:8080/api/users/me", {
          withCredentials: true,
        });
        setCurrentUser(userRes.data);

        // Fetch user's transactions
        const transactionsRes = await axios.get(
          `http://localhost:8080/api/transactions/user/${userRes.data.id}`,
          { withCredentials: true }
        );

        const now = new Date();

        // ⭐ Filter for paid, not completed, and NOT EXPIRED transactions
        const allTransactions = transactionsRes.data.filter((t) => {
          const isPaid = t.paymentStatus === "COMPLETED" || t.paymentStatus === "PAID";
          const notCompleted = !t.sessionCompleted;
          
          if (!isPaid || !notCompleted) return false;
          
          // ⭐ NEW: Check expiration for memberships
          if (t.membershipType && t.membershipExpiryDate) {
            const expiryDate = new Date(t.membershipExpiryDate);
            if (expiryDate < now) {
              return false; // Hide expired memberships
            }
          }
          
          // ⭐ NEW: Check expiration for scheduled classes
          if (t.scheduleDate && t.scheduleTime) {
            // Combine date and time for accurate comparison
            const scheduleDateTimeStr = `${t.scheduleDate} ${t.scheduleTime}`;
            const scheduleDateTime = new Date(scheduleDateTimeStr);
            
            if (scheduleDateTime < now) {
              return false; // Hide past classes
            }
          }
          
          return true;
        });

        // ⭐ Split into activated and unactivated
        const activated = allTransactions.filter((t) => {
          // For memberships and membership-included classes
          if (t.membershipType) {
            return t.membershipActivatedDate !== null;
          }
          // For regular class enrollments (always show as activated)
          if (t.className && t.scheduleDay) {
            return true;
          }
          return false;
        });

        const unactivated = allTransactions.filter((t) => {
          // Only memberships and membership-included classes can be unactivated
          if (t.membershipType && t.membershipActivatedDate === null) {
            return true;
          }
          return false;
        });

        setActivatedTransactions(activated);
        setUnactivatedTransactions(unactivated);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndTransactions();
  }, []);

  const handleContact = () => {
    navigate("/contact");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      return dateString;
    }
  };

  const renderTransactionCard = (transaction, index, isActivated) => (
    <div
      key={transaction.id}
      className={`${styles.codeCard} ${!isActivated ? styles.codeCardPending : ''}`}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Card Header */}
      <div className={styles.cardHeader}>
        <div className={`${styles.cardIcon} ${!isActivated ? styles.cardIconPending : ''}`}>
          {transaction.membershipType && !transaction.scheduleDay ? (
            <Award size={24} />
          ) : (
            <Calendar size={24} />
          )}
        </div>
        <div className={`${styles.cardType} ${!isActivated ? styles.cardTypePending : ''}`}>
          {transaction.membershipType && !transaction.scheduleDay ? "MEMBERSHIP" : "CLASS"}
        </div>
      </div>

      {/* Card Content */}
      <div className={styles.cardContent}>
        <h3 className={styles.cardTitle}>
          {transaction.className || transaction.membershipType}
        </h3>

        {/* Class Details - Only for classes with schedule */}
        {transaction.className && transaction.scheduleDay && (
          <div className={styles.cardDetails}>
            <div className={styles.detailRow}>
              <Calendar size={16} />
              <span>
                {transaction.scheduleDay}, {transaction.scheduleDate}
              </span>
            </div>
            <div className={styles.detailRow}>
              <Clock size={16} />
              <span>{transaction.scheduleTime}</span>
            </div>
          </div>
        )}

        {/* Pure Membership Details */}
        {transaction.membershipType && !transaction.scheduleDay && !transaction.className && (
          <div className={styles.cardDetails}>
            {isActivated ? (
              <>
                <div className={styles.detailRow}>
                  <CheckCircle size={16} />
                  <span>Active until {formatDate(transaction.membershipExpiryDate)}</span>
                </div>
                {transaction.membershipActivatedDate && (
                  <div className={styles.detailRow}>
                    <Calendar size={16} />
                    <span>Started: {formatDate(transaction.membershipActivatedDate)}</span>
                  </div>
                )}
              </>
            ) : (
              <div className={styles.detailRow}>
                <AlertCircle size={16} />
                <span>Waiting for admin activation</span>
              </div>
            )}
          </div>
        )}

        {/* Membership-Included Classes */}
        {transaction.className && !transaction.scheduleDay && transaction.membershipType && (
          <div className={styles.cardDetails}>
            {isActivated ? (
              <>
                <div className={styles.detailRow}>
                  <CheckCircle size={16} />
                  <span>Included in {transaction.membershipType} membership</span>
                </div>
                <div className={styles.detailRow}>
                  <Calendar size={16} />
                  <span>Valid until {formatDate(transaction.membershipExpiryDate)}</span>
                </div>
              </>
            ) : (
              <div className={styles.detailRow}>
                <AlertCircle size={16} />
                <span>Waiting for membership activation</span>
              </div>
            )}
          </div>
        )}

        {/* Transaction Code */}
        <div className={`${styles.transactionCodeBox} ${!isActivated ? styles.transactionCodeBoxPending : ''}`}>
          <CreditCard size={16} />
          <span className={styles.codeLabel}>Code:</span>
          <span className={styles.codeValue}>
            {transaction.transactionCode}
          </span>
        </div>
      </div>

      {/* Card Footer */}
      <div className={styles.cardFooter}>
        <span className={styles.footerText}>
          Paid: ₱{transaction.totalAmount.toLocaleString()}
        </span>
        <span className={`${styles.statusBadge} ${!isActivated ? styles.statusBadgePending : ''}`}>
          {isActivated ? (
            <>
              <CheckCircle size={14} />
              Active
            </>
          ) : (
            <>
              <AlertCircle size={14} />
              Pending
            </>
          )}
        </span>
      </div>
    </div>
  );

  return (
    <div className={styles.landingContainer}>
      <Navbar activeNav="HOME" />

      {/* Animated background elements */}
      <div className={styles.backgroundOverlay}>
        <div className={`${styles.bgBlur} ${styles.bgBlur1}`}></div>
        <div className={`${styles.bgBlur} ${styles.bgBlur2}`}></div>
        <div className={`${styles.bgBlur} ${styles.bgBlur3}`}></div>
      </div>

      {/* Hero Section */}
      <div className={styles.heroSection}>
        <div className={styles.heroContent}>
          {currentUser && (
            <div className={styles.welcomeMessage}>
              Welcome back, <span className={styles.userName}>{currentUser.username}</span>!
            </div>
          )}
          
          <h1 className={styles.heroQuote}>
            <span className={styles.quoteMain}>WORK HARD.</span>
            <span className={styles.quoteSub}>Stay Humble</span>
          </h1>
          <button onClick={handleContact} className={styles.contactButton}>
            CONTACT
          </button>
        </div>
      </div>

      {/* ⭐ Unactivated Codes Section */}
      {!loading && unactivatedTransactions.length > 0 && (
        <div className={styles.activeCodesSection}>
          <div className={styles.activeCodesContainer}>
            <div className={styles.sectionHeader}>
              <h2 className={`${styles.sectionTitle} ${styles.sectionTitlePending}`}>
                ⏳ Pending Activation
              </h2>
              <p className={styles.sectionSubtitle}>
                These codes are waiting for admin verification
              </p>
            </div>

            <div className={styles.codesGrid}>
              {unactivatedTransactions.map((transaction, index) => 
                renderTransactionCard(transaction, index, false)
              )}
            </div>
          </div>
        </div>
      )}

      {/* ⭐ Activated Codes Section */}
      {!loading && activatedTransactions.length > 0 && (
        <div className={styles.activeCodesSection}>
          <div className={styles.activeCodesContainer}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                ✅ Your Active Codes
              </h2>
              <p className={styles.sectionSubtitle}>
                Show these codes at the gym to access your classes and memberships
              </p>
            </div>

            <div className={styles.codesGrid}>
              {activatedTransactions.map((transaction, index) => 
                renderTransactionCard(transaction, index, true)
              )}
            </div>
          </div>
        </div>
      )}

      {/* No Active Codes Message */}
      {!loading && activatedTransactions.length === 0 && unactivatedTransactions.length === 0 && (
        <div className={styles.noCodesSection}>
          <div className={styles.noCodesContent}>
            <div className={styles.noCodesIcon}>📋</div>
            <h3 className={styles.noCodesTitle}>No Active Codes Yet</h3>
            <p className={styles.noCodesText}>
              Enroll in a class or get a membership to see your active codes here
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import styles from "./LandingPage.module.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Calendar, Clock, CreditCard, Award, CheckCircle } from "lucide-react";

const LandingPage = () => {
  const navigate = useNavigate();
  const [activeTransactions, setActiveTransactions] = useState([]);
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

        // ⭐ UPDATED: Filter for active transactions with proper membership activation check
        const active = transactionsRes.data.filter((t) => {
          const isPaid = t.paymentStatus === "COMPLETED" || t.paymentStatus === "PAID";
          const notCompleted = !t.sessionCompleted;
          
          // For pure memberships (no className, no scheduleDay)
          if (t.membershipType && !t.scheduleDay && !t.className) {
            // Only show if admin has activated it (membershipActivatedDate exists)
            return isPaid && notCompleted && t.membershipActivatedDate !== null;
          }
          
          // For membership-included classes (has className, has membershipType, no scheduleDay)
          if (t.className && t.membershipType && !t.scheduleDay) {
            // Only show if membership has been activated by admin
            return isPaid && notCompleted && t.membershipActivatedDate !== null;
          }
          
          // For regular class enrollments (has className and scheduleDay)
          if (t.className && t.scheduleDay) {
            return isPaid && notCompleted;
          }
          
          // Default: show if paid and not completed
          return isPaid && notCompleted;
        });

        setActiveTransactions(active);
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

  // Format date helper function
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
          {/* Welcome message */}
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

      {/* Active Codes Section */}
      {!loading && activeTransactions.length > 0 && (
        <div className={styles.activeCodesSection}>
          <div className={styles.activeCodesContainer}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Your Active Codes</h2>
              <p className={styles.sectionSubtitle}>
                Show these codes at the gym to access your classes and memberships
              </p>
            </div>

            <div className={styles.codesGrid}>
              {activeTransactions.map((transaction, index) => (
                <div
                  key={transaction.id}
                  className={styles.codeCard}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Card Header */}
                  <div className={styles.cardHeader}>
                    <div className={styles.cardIcon}>
                      {transaction.membershipType && !transaction.scheduleDay ? (
                        <Award size={24} />
                      ) : (
                        <Calendar size={24} />
                      )}
                    </div>
                    <div className={styles.cardType}>
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

                    {/* Pure Membership Details - Only for memberships without schedule */}
                    {transaction.membershipType && !transaction.scheduleDay && !transaction.className && (
                      <div className={styles.cardDetails}>
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
                      </div>
                    )}

                    {/* Membership-Included Classes - Classes with membershipType but no schedule */}
                    {transaction.className && !transaction.scheduleDay && transaction.membershipType && (
                      <div className={styles.cardDetails}>
                        <div className={styles.detailRow}>
                          <CheckCircle size={16} />
                          <span>Included in {transaction.membershipType} membership</span>
                        </div>
                        <div className={styles.detailRow}>
                          <Calendar size={16} />
                          <span>Valid until {formatDate(transaction.membershipExpiryDate)}</span>
                        </div>
                      </div>
                    )}

                    {/* Transaction Code */}
                    <div className={styles.transactionCodeBox}>
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
                    <span className={styles.statusBadge}>
                      <CheckCircle size={14} />
                      Active
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* No Active Codes Message */}
      {!loading && activeTransactions.length === 0 && (
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
import React, { useState, useEffect } from "react";
import { Check, AlertCircle } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import styles from "./TransactionPage.module.css";
import axios from "axios";

const TransactionPage = ({ onLogout }) => {
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [activeMembership, setActiveMembership] = useState(null);
  const [showMembershipWarning, setShowMembershipWarning] = useState(false);
  const [isCheckingMembership, setIsCheckingMembership] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const plan = location.state?.plan || {
    name: "GOLD",
    price: "₱1,600",
    icon: "🏆",
    features: [
      "5 Classes per Week",
      "Access to Gym Floor",
      "Nutrition & Fitness Plan",
      "1 Personal Training Session",
      "Premium Equipment Access",
    ],
  };

  const subtotal = parseInt(plan.price.replace(/[₱,]/g, ""));
  const vat = Math.round(subtotal * 0.12);
  const total = subtotal + vat;

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        setUserLoading(true);
        const res = await axios.get("http://localhost:8080/api/users/me", {
          withCredentials: true,
        });
        setCurrentUser(res.data);
      } catch (error) {
        console.error("Failed to fetch current user:", error);
        alert("Please log in to continue.");
        navigate("/login");
      } finally {
        setUserLoading(false);
      }
    };

    fetchCurrentUser();
  }, [navigate]);

  useEffect(() => {
    const checkActiveMembership = async () => {
      if (!currentUser) return;

      try {
        setIsCheckingMembership(true);
        const response = await axios.get(
          `http://localhost:8080/api/transactions/check-active-membership?userId=${currentUser.id}`,
          { withCredentials: true }
        );

        if (response.data.hasActiveMembership) {
          const expiryDate = new Date(response.data.membershipExpiryDate);
          const now = new Date();
          
          if (expiryDate > now) {
            setActiveMembership(response.data);
            setShowMembershipWarning(true);
          } else {
            setActiveMembership(null);
          }
        } else {
          setActiveMembership(null);
        }
      } catch (error) {
        console.error("Error checking membership:", error);
      } finally {
        setIsCheckingMembership(false);
      }
    };

    if (currentUser) {
      checkActiveMembership();
    }
  }, [currentUser]);

  const handleBuyNow = () => {
    if (!currentUser) {
      alert("User information not loaded. Please try again.");
      return;
    }

    if (activeMembership) {
      setShowMembershipWarning(true);
      return;
    }

    setShowSuccessModal(true);
  };

  const handleCloseWarning = () => {
    setShowMembershipWarning(false);
    navigate("/landing");
  };

  const handleConfirmPayment = async () => {
    if (!currentUser) {
      alert("User information not loaded.");
      return;
    }

    if (activeMembership) {
      setShowSuccessModal(false);
      setShowMembershipWarning(true);
      return;
    }

    try {
      const payload = {
        userId: currentUser.id,
        classId: null,
        scheduleId: null,
        membershipType: plan.name,
        processingFee: vat,
        totalAmount: total,
        paymentMethod: "GCash",
        paymentStatus: "PENDING",
      };

      const response = await axios.post(
        "http://localhost:8080/api/transactions",
        payload,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      if (response.status === 200 || response.status === 201) {
        navigate("/gcash-payment", {
          state: {
            plan: `${plan.name} Membership`,
            amount: total,
            transactionId: response.data.id,
            transactionCode: response.data.transactionCode,
          },
        });
      }
    } catch (error) {
      console.error("Error:", error);
      
      if (error.response?.status === 409 && error.response?.data?.error === "ACTIVE_MEMBERSHIP_EXISTS") {
        setShowSuccessModal(false);
        setActiveMembership(error.response.data);
        setShowMembershipWarning(true);
      } else {
        alert(`Failed to create membership transaction.\nError: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
  };

  const formatExpiryDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (userLoading || isCheckingMembership) {
    return (
      <div className={styles.transactionContainer}>
        <Navbar activeNav="MEMBERSHIP" onLogout={onLogout} />
        <div className={styles.contentSection}>
          <div className={styles.contentContainer}>
            <div className={styles.loadingState}>
              <div className={styles.spinner}></div>
              <p>{userLoading ? "Loading user information..." : "Checking membership status..."}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.transactionContainer}>
      <div className={styles.backgroundOverlay}>
        <div className={`${styles.bgBlur} ${styles.bgBlur1}`}></div>
        <div className={`${styles.bgBlur} ${styles.bgBlur2}`}></div>
        <div className={`${styles.bgBlur} ${styles.bgBlur3}`}></div>
      </div>

      <Navbar activeNav="MEMBERSHIP" onLogout={onLogout} />

      <div className={styles.contentSection}>
        <div className={styles.contentContainer}>
          <div className={styles.headerSection}>
            <h1 className={styles.title}>CHECKOUT</h1>
            <p className={styles.subtitle}>Complete your membership purchase</p>
          </div>

          {activeMembership && (
            <div className={styles.warningBanner}>
              <AlertCircle className={styles.bannerIcon} />
              <div>
                <h3 className={styles.bannerTitle}>Active Membership Detected</h3>
                <p className={styles.bannerText}>
                  You have an active {activeMembership.membershipType} membership that expires on{" "}
                  {formatExpiryDate(activeMembership.membershipExpiryDate)}
                </p>
              </div>
            </div>
          )}

          <div className={styles.checkoutGrid}>
            <div className={styles.summaryCard}>
              <h2 className={styles.summaryTitle}>Order Summary</h2>

              <div className={styles.planDetails}>
                <div className={styles.planHeader}>
                  <span className={styles.planIcon}>{plan.icon}</span>
                  <div>
                    <h3 className={styles.planName}>{plan.name}</h3>
                    <p className={styles.planType}>Monthly Membership</p>
                  </div>
                </div>

                <div className={styles.featuresList}>
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className={styles.featureItem}>
                      <Check className={styles.checkIcon} />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <div className={styles.priceBreakdown}>
                  <div className={styles.priceRow}>
                    <span>Subtotal</span>
                    <span>{plan.price}</span>
                  </div>
                  <div className={styles.priceRow}>
                    <span>VAT (12%)</span>
                    <span>₱{vat}</span>
                  </div>
                  <div className={styles.totalRow}>
                    <span>Total</span>
                    <span className={styles.totalPrice}>₱{total}</span>
                  </div>
                </div>

                <button 
                  onClick={handleBuyNow} 
                  className={styles.buyNowButton}
                  disabled={!currentUser || activeMembership}
                >
                  {activeMembership ? "Active Membership Exists" : currentUser ? "Buy Now" : "Loading..."}
                </button>
              </div>
            </div>

            <div className={styles.infoCard}>
              <h2 className={styles.formTitle}>Payment Information</h2>
              
              <div className={styles.paymentInfo}>
                <div className={styles.infoSection}>
                  <h3 className={styles.infoLabel}>Payment Method</h3>
                  <div className={styles.paymentMethod}>
                    <span className={styles.gcashLogo}>💳</span>
                    <span className={styles.gcashText}>GCash</span>
                  </div>
                </div>

                <div className={styles.infoSection}>
                  <h3 className={styles.infoLabel}>Membership Details</h3>
                  <div className={styles.infoItem}>
                    <span className={styles.infoKey}>Plan:</span>
                    <span className={styles.infoValue}>{plan.name} Membership</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoKey}>Duration:</span>
                    <span className={styles.infoValue}>1 Month</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoKey}>Price:</span>
                    <span className={styles.infoValue}>{plan.price}</span>
                  </div>
                </div>

                {currentUser && (
                  <div className={styles.infoSection}>
                    <h3 className={styles.infoLabel}>Account Information</h3>
                    <div className={styles.infoItem}>
                      <span className={styles.infoKey}>Name:</span>
                      <span className={styles.infoValue}>{currentUser.username}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoKey}>Email:</span>
                      <span className={styles.infoValue}>{currentUser.email}</span>
                    </div>
                  </div>
                )}

                <div className={styles.secureNotice}>
                  <span className={styles.lockIcon}>🔒</span>
                  <p>Secure payment powered by GCash</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Compact Warning Modal */}
      {showMembershipWarning && activeMembership && (
        <div className={styles.modalOverlay}>
          <div className={styles.compactWarningModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.warningIconWrapper}>
              <AlertCircle className={styles.warningIcon} />
            </div>
            
            <h2 className={styles.compactTitle}>Active Membership Found</h2>
            <p className={styles.compactSubtitle}>You already have an active membership</p>

            <div className={styles.compactDetails}>
              <div className={styles.compactInfoBox}>
                <div className={styles.compactRow}>
                  <span className={styles.compactLabel}>Plan:</span>
                  <span className={styles.compactHighlight}>{activeMembership.membershipType}</span>
                </div>
                
                {activeMembership.membershipActivatedDate && (
                  <div className={styles.compactRow}>
                    <span className={styles.compactLabel}>Activated:</span>
                    <span className={styles.compactValue}>
                      {formatExpiryDate(activeMembership.membershipActivatedDate)}
                    </span>
                  </div>
                )}
                
                {activeMembership.membershipExpiryDate && (
                  <div className={styles.compactRow}>
                    <span className={styles.compactLabel}>Expires:</span>
                    <span className={styles.compactValue}>
                      {formatExpiryDate(activeMembership.membershipExpiryDate)}
                    </span>
                  </div>
                )}
                
                <div className={styles.compactRow}>
                  <span className={styles.compactLabel}>Code:</span>
                  <span className={styles.compactCode}>{activeMembership.transactionCode}</span>
                </div>
              </div>

              <div className={styles.compactWarning}>
                <p>You can purchase a new membership after your current one expires.</p>
              </div>
            </div>

            <button onClick={handleCloseWarning} className={styles.compactButton}>
              Got it, take me back
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showSuccessModal && currentUser && !activeMembership && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={handleCloseModal}>×</button>
            
            <h2 className={styles.modalTitle}>Order Details</h2>
            <p className={styles.modalSubtitle}>Please confirm your information is correct</p>

            <div className={styles.modalDetails}>
              <div className={styles.modalSection}>
                <div className={styles.planDisplay}>
                  <span className={styles.planIconLarge}>{plan.icon}</span>
                  <div>
                    <h3 className={styles.modalPlanName}>{plan.name} Membership</h3>
                    <p className={styles.modalPlanType}>Monthly Subscription</p>
                  </div>
                </div>
              </div>

              <div className={styles.divider}></div>

              <div className={styles.modalSection}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Name:</span>
                  <span className={styles.detailValue}>{currentUser.username}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Email:</span>
                  <span className={styles.detailValue}>{currentUser.email}</span>
                </div>
              </div>

              <div className={styles.divider}></div>

              <div className={styles.modalSection}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Pay with:</span>
                  <span className={styles.detailValue}>
                    <span className={styles.gcashBadge}>💳 GCash</span>
                  </span>
                </div>
              </div>

              <div className={styles.divider}></div>

              <div className={styles.modalSection}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Price:</span>
                  <span className={styles.detailValue}>₱{subtotal}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>VAT (12%)</span>
                  <span className={styles.detailValue}>₱{vat}</span>
                </div>
                <div className={styles.totalDetailRow}>
                  <span className={styles.totalLabel}>Total Payment</span>
                  <span className={styles.totalValue}>₱{total}</span>
                </div>
              </div>
            </div>

            <button onClick={handleConfirmPayment} className={styles.confirmButton}>
              Confirm and go to payment
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionPage;
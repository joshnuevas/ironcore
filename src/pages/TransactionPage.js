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

  const navigate = useNavigate();
  const location = useLocation();

  const plan = location.state?.plan || {
    name: "GOLD",
    price: "₱1,699",
    icon: "🏆",
    features: [
      "Access to Gym Floor",
      "Nutrition & Fitness Plan",
      "1 Session Trainer",
      "5 Classes",
    ],
    isSession: false,
  };

  const subtotal = parseInt(plan.price.replace(/[₱,]/g, ""));
  const vat = Math.round(subtotal * 0.12);
  const total = subtotal + vat;

  // Fetch current user
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

  // Check active membership
  useEffect(() => {
    const checkActiveMembership = async () => {
      if (!currentUser || plan.isSession) return;

      try {
        const res = await axios.get(
          `http://localhost:8080/api/transactions/check-active-membership/${currentUser.id}`,
          { withCredentials: true }
        );

        if (res.data) {
          setActiveMembership(res.data);
          setShowMembershipWarning(true);
        }
      } catch (error) {
        console.error("Error checking membership:", error);
      }
    };

    checkActiveMembership();
  }, [currentUser, plan.isSession]);

  const handleBuyNow = () => {
    if (!currentUser) {
      alert("User information not loaded. Please try again.");
      return;
    }

    // Prevent buying if active membership exists
    if (activeMembership) {
      setShowMembershipWarning(true);
      return;
    }

    setShowSuccessModal(true);
  };

  const handleConfirmPayment = async () => {
    if (!currentUser) {
      alert("User information not loaded.");
      return;
    }

    // Prevent duplicate membership transaction
    if (activeMembership) {
      alert("You already have an active membership!");
      return;
    }

    try {
      // Get additional data from location.state if available
      const { classId, scheduleId, className, scheduleDay, scheduleTime, scheduleDate } = location.state || {};

      const payload = {
        userId: currentUser.id,
        classId: classId || null, // ADD THIS - get from location.state
        scheduleId: scheduleId || null, // This might already be there
        membershipType: plan.isSession ? "SESSION" : plan.name,
        processingFee: vat,
        totalAmount: total,
        paymentMethod: "GCash",
        paymentStatus: "PENDING",
      };

      console.log("Creating transaction with payload:", payload); // Debug log

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
            plan: plan.isSession
              ? `${plan.name} - 1 Day Pass`
              : `${plan.name} Membership`,
            amount: total,
            transactionId: response.data.id,
            transactionCode: response.data.transactionCode,
            // Pass along class/schedule info for reference
            classId: classId,
            className: className,
            scheduleId: scheduleId,
            scheduleDay: scheduleDay,
            scheduleTime: scheduleTime,
            scheduleDate: scheduleDate,
          },
        });
      }
    } catch (error) {
      console.error("Failed to create transaction:", error);
      alert(
        `Failed to create transaction.\nError: ${error.response?.data?.message || error.message}`
      );
    }
  };

  const handleCloseModal = () => setShowSuccessModal(false);
  const handleCloseWarning = () => {
    setShowMembershipWarning(false);
    navigate("/membership");
  };

  const formatExpiryDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (userLoading) {
    return (
      <div className={styles.transactionContainer}>
        <Navbar activeNav="MEMBERSHIP" onLogout={onLogout} />
        <div className={styles.contentSection}>
          <div className={styles.contentContainer}>
            <div className={styles.loadingState}>
              <div className={styles.spinner}></div>
              <p>Loading user information...</p>
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
            <p className={styles.subtitle}>
              {plan.isSession
                ? "Complete your session purchase"
                : "Complete your membership purchase"}
            </p>
          </div>

          <div className={styles.checkoutGrid}>
            {/* Order Summary */}
            <div className={styles.summaryCard}>
              <h2 className={styles.summaryTitle}>Order Summary</h2>
              <div className={styles.planDetails}>
                <div className={styles.planHeader}>
                  <span className={styles.planIcon}>{plan.icon}</span>
                  <div>
                    <h3 className={styles.planName}>{plan.name}</h3>
                    <p className={styles.planType}>
                      {plan.isSession ? "One-Time Session" : "Monthly Membership"}
                    </p>
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
                  disabled={!currentUser}
                >
                  {currentUser ? "Buy Now" : "Loading..."}
                </button>
              </div>
            </div>

            {/* Payment Info */}
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
                  <h3 className={styles.infoLabel}>
                    {plan.isSession ? "Session Details" : "Membership Details"}
                  </h3>
                  <div className={styles.infoItem}>
                    <span className={styles.infoKey}>Plan:</span>
                    <span className={styles.infoValue}>
                      {plan.isSession ? `${plan.name} - 1 Day Pass` : `${plan.name} Membership`}
                    </span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoKey}>Duration:</span>
                    <span className={styles.infoValue}>
                      {plan.isSession ? "1 Day" : "1 Month"}
                    </span>
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

      {/* Active Membership Warning Modal */}
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
      {showSuccessModal && currentUser && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.compactConfirmModal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.compactCloseButton} onClick={handleCloseModal}>×</button>

            <h2 className={styles.compactConfirmTitle}>Order Details</h2>
            <p className={styles.compactConfirmSubtitle}>Please confirm your information is correct</p>

            <div className={styles.compactConfirmDetails}>
              <div className={styles.compactPlanDisplay}>
                <span className={styles.compactPlanIcon}>{plan.icon}</span>
                <div>
                  <h3 className={styles.compactPlanName}>
                    {plan.isSession ? `${plan.name} - 1 Day Pass` : `${plan.name} Membership`}
                  </h3>
                  <p className={styles.compactPlanType}>
                    {plan.isSession ? "One-Time Session" : "Monthly Subscription"}
                  </p>
                </div>
              </div>

              <div className={styles.compactDivider}></div>

              <div className={styles.compactConfirmRow}>
                <span className={styles.compactConfirmLabel}>Name:</span>
                <span className={styles.compactConfirmValue}>{currentUser.username}</span>
              </div>
              <div className={styles.compactConfirmRow}>
                <span className={styles.compactConfirmLabel}>Email:</span>
                <span className={styles.compactConfirmValue}>{currentUser.email}</span>
              </div>

              <div className={styles.compactDivider}></div>

              <div className={styles.compactConfirmRow}>
                <span className={styles.compactConfirmLabel}>Pay with:</span>
                <span className={styles.compactGcashBadge}>💳 GCash</span>
              </div>

              <div className={styles.compactDivider}></div>

              <div className={styles.compactConfirmRow}>
                <span className={styles.compactConfirmLabel}>Price:</span>
                <span className={styles.compactConfirmValue}>₱{subtotal}</span>
              </div>
              <div className={styles.compactConfirmRow}>
                <span className={styles.compactConfirmLabel}>VAT (12%):</span>
                <span className={styles.compactConfirmValue}>₱{vat}</span>
              </div>
              <div className={styles.compactTotalRow}>
                <span className={styles.compactTotalLabel}>Total Payment</span>
                <span className={styles.compactTotalValue}>₱{total}</span>
              </div>
            </div>

            <button onClick={handleConfirmPayment} className={styles.compactButton}>
              Confirm and go to payment
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionPage;

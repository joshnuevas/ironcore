import React, { useState, useEffect } from "react";
import { Check, AlertCircle } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./TransactionPage.module.css";
import axios from "axios";
import Navbar from "../components/Navbar";

const TransactionPage = ({ onLogout }) => {
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);

  // Holds membership status returned from backend
  const [membershipStatus, setMembershipStatus] = useState(null);
  const [showMembershipWarning, setShowMembershipWarning] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Fallback plan if navigation state is missing
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

  // 🔹 Helper: decide if membership is pending
  const isPendingMembership = (m) => {
    if (!m) return false;
    return (
      m.hasPendingMembership ||
      m.membershipStatus === "PENDING" ||
      (!m.hasActiveMembership &&
        !m.membershipActivatedDate &&
        !!m.membershipType)
    );
  };

  // 🔹 Helper: decide if membership is active
  const isActiveMembership = (m) => {
    if (!m) return false;
    return !!m.hasActiveMembership;
  };

  const hasAnyBlockingMembership = (m) =>
    m && (m.hasActiveMembership || m.hasPendingMembership);

  // 🔹 Format date/time nicely
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

  // 1) Fetch current user
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

  // 2) Check membership status (active or pending) for this user
  useEffect(() => {
    const checkMembershipStatus = async () => {
      if (!currentUser) return;

      try {
        const res = await axios.get(
          "http://localhost:8080/api/memberships/status",
          {
            params: { userId: currentUser.id },
            withCredentials: true,
          }
        );

        const data = res.data || {};
        const statusObj = {
          hasActiveMembership: data.hasActiveMembership,
          hasPendingMembership: data.hasPendingMembership,
          membershipType: data.membershipType,
          membershipActivatedDate: data.membershipActivatedDate,
          membershipExpiryDate: data.membershipExpiryDate,
          transactionCode: data.transactionCode,
          membershipStatus: data.membershipStatus,
        };

        setMembershipStatus(statusObj);

        if (statusObj.hasActiveMembership || statusObj.hasPendingMembership) {
          setShowMembershipWarning(true);
          // 🔴 Hard redirect back
          navigate("/membership", { replace: true });
        }
      } catch (error) {
        console.error("Error checking membership status:", error);
      }
    };

    checkMembershipStatus();
  }, [currentUser, navigate]);

  // 🔹 When user clicks "Buy Now"
  const handleBuyNow = () => {
    if (!currentUser) {
      alert("User information not loaded. Please try again.");
      return;
    }

    // ❌ Block if user has active or pending membership
    if (hasAnyBlockingMembership(membershipStatus)) {
      setShowMembershipWarning(true);
      return;
    }

    // ✅ Otherwise show confirmation modal
    setShowSuccessModal(true);
  };

  // 🔹 Confirm payment (create transaction, then go to GCash page)
  const handleConfirmPayment = async () => {
    if (!currentUser) {
      alert("User information not loaded.");
      return;
    }

    // ❌ Extra safety: Block if membership exists
    if (hasAnyBlockingMembership(membershipStatus)) {
      alert(
        isPendingMembership(membershipStatus)
          ? "You already have a membership waiting for admin activation."
          : "You already have an active membership."
      );
      setShowMembershipWarning(true);
      return;
    }

    try {
      const {
        classId,
        scheduleId,
        className,
        scheduleDay,
        scheduleTime,
        scheduleDate,
      } = location.state || {};

      const payload = {
        userId: currentUser.id,
        classId: classId || null,
        scheduleId: scheduleId || null,
        membershipType: plan.isSession ? "SESSION" : plan.name,
        processingFee: vat,
        totalAmount: total,
        paymentMethod: "GCash",
        paymentStatus: "PENDING", // initial status
      };

      console.log("Creating transaction with payload:", payload);

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
            classId,
            className,
            scheduleId,
            scheduleDay,
            scheduleTime,
            scheduleDate,
          },
        });
      }
    } catch (error) {
      console.error("Failed to create transaction:", error);
      alert(
        `Failed to create transaction.\nError: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  const handleCloseModal = () => setShowSuccessModal(false);

  const handleCloseWarning = () => {
    setShowMembershipWarning(false);
    navigate("/membership");
  };

  if (userLoading) {
    return (
      <div className={styles.transactionContainer}>
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
                      {plan.isSession
                        ? "One-Time Session"
                        : "Monthly Membership"}
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

                
                {/* 🔸 No Refund Notice */}
                  <div className={styles.noRefundNotice}>
                    <AlertCircle size={16} className={styles.noRefundIcon} />
                    <span>Refunds may only be processed at the Front Desk.</span>
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
                      {plan.isSession
                        ? `${plan.name} - 1 Day Pass`
                        : `${plan.name} Membership`}
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
                      <span className={styles.infoValue}>
                        {currentUser.username}
                      </span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoKey}>Email:</span>
                      <span className={styles.infoValue}>
                        {currentUser.email}
                      </span>
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

      {/* Membership Warning Modal */}
      {showMembershipWarning && membershipStatus && (
        <div className={styles.modalOverlay} onClick={handleCloseWarning}>
          <div
            className={styles.compactWarningModal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.warningIconWrapper}>
              <AlertCircle className={styles.warningIcon} />
            </div>

            <h2 className={styles.compactTitle}>
              {isPendingMembership(membershipStatus)
                ? "Membership Pending Approval"
                : "Active Membership Found"}
            </h2>

            <p className={styles.compactSubtitle}>
              {isPendingMembership(membershipStatus)
                ? "You already have a membership waiting for admin activation."
                : "You already have an active membership."}
            </p>

            <div className={styles.compactDetails}>
              <div className={styles.compactInfoBox}>
                <div className={styles.compactRow}>
                  <span className={styles.compactLabel}>Plan:</span>
                  <span className={styles.compactHighlight}>
                    {membershipStatus.membershipType || "N/A"}
                  </span>
                </div>

                {membershipStatus.membershipActivatedDate && (
                  <div className={styles.compactRow}>
                    <span className={styles.compactLabel}>Activated:</span>
                    <span className={styles.compactValue}>
                      {formatExpiryDate(
                        membershipStatus.membershipActivatedDate
                      )}
                    </span>
                  </div>
                )}

                {membershipStatus.membershipExpiryDate && (
                  <div className={styles.compactRow}>
                    <span className={styles.compactLabel}>Expires:</span>
                    <span className={styles.compactValue}>
                      {formatExpiryDate(
                        membershipStatus.membershipExpiryDate
                      )}
                    </span>
                  </div>
                )}

                {membershipStatus.transactionCode && (
                  <div className={styles.compactRow}>
                    <span className={styles.compactLabel}>Code:</span>
                    <span className={styles.compactCode}>
                      {membershipStatus.transactionCode}
                    </span>
                  </div>
                )}
              </div>

              <div className={styles.compactWarning}>
                <p>
                  {isPendingMembership(membershipStatus)
                    ? "You can purchase another membership once this request is approved or cancelled."
                    : "You can purchase a new membership or session after your current one expires."}
                </p>
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
          <div
            className={styles.compactConfirmModal}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={styles.compactCloseButton}
              onClick={handleCloseModal}
            >
              ×
            </button>

            <h2 className={styles.compactConfirmTitle}>Order Details</h2>
            <p className={styles.compactConfirmSubtitle}>
              Please confirm your information is correct
            </p>

            <div className={styles.compactConfirmDetails}>
              <div className={styles.compactPlanDisplay}>
                <span className={styles.compactPlanIcon}>{plan.icon}</span>
                <div>
                  <h3 className={styles.compactPlanName}>
                    {plan.isSession
                      ? `${plan.name} - 1 Day Pass`
                      : `${plan.name} Membership`}
                  </h3>
                  <p className={styles.compactPlanType}>
                    {plan.isSession
                      ? "One-Time Session"
                      : "Monthly Subscription"}
                  </p>
                </div>
              </div>

              <div className={styles.compactDivider}></div>

              <div className={styles.compactConfirmRow}>
                <span className={styles.compactConfirmLabel}>Name:</span>
                <span className={styles.compactConfirmValue}>
                  {currentUser.username}
                </span>
              </div>
              <div className={styles.compactConfirmRow}>
                <span className={styles.compactConfirmLabel}>Email:</span>
                <span className={styles.compactConfirmValue}>
                  {currentUser.email}
                </span>
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
                <span className={styles.compactTotalLabel}>
                  Total Payment
                </span>
                <span className={styles.compactTotalValue}>₱{total}</span>
              </div>
            </div>

            <button
              onClick={handleConfirmPayment}
              className={styles.compactButton}
            >
              Confirm and go to payment
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionPage;

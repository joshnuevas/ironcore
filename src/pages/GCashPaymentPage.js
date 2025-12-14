import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, CheckCircle, Shield, Clock } from "lucide-react";
import styles from "./GCashPaymentPage.module.css";
import axios from "axios";

const GCashPaymentPage = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [pin, setPin] = useState("");
  const [completedTransaction, setCompletedTransaction] = useState(null);

  // Get payment details from previous page
  const paymentDetails = location.state || {
    plan: "GOLD",
    amount: 1650,
    transactionId: null,
    transactionCode: null,
    classId: null,
    className: null,
    scheduleId: null,
    scheduleDay: null,
    scheduleTime: null,
    scheduleDate: null,
  };

  const merchantDetails = {
    name: "IronCore Fitness Gym",
    type: "Fitness & Wellness",
  };

  // Handle MPIN input
  const handlePinChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 4);
    setPin(value);
  };

  // Simulate GCash payment
  const handlePayNow = async () => {
    if (pin.length !== 4) {
      alert("Please enter your 4-digit MPIN");
      return;
    }

    if (!paymentDetails.transactionId) {
      alert("Transaction ID not found. Please try again.");
      navigate("/landing");
      return;
    }

    setIsProcessing(true);

    try {
      // PATCH transaction status to COMPLETED
      const response = await axios.put(
        `http://localhost:8080/api/transactions/${paymentDetails.transactionId}/status?status=COMPLETED`,
        {},
        { withCredentials: true }
      );

      console.log("Transaction updated:", response.data);
      setCompletedTransaction(response.data);
      setShowSuccess(true);

    } catch (error) {
      console.error("Failed to update transaction:", error);
      alert("Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle success confirmation
  const handleConfirmSuccess = () => {
    if (!completedTransaction) {
      navigate("/landing");
      return;
    }

    const isSession = completedTransaction.membershipType === "SESSION";
    const isMembership = completedTransaction.membershipType && !isSession;
    const isClass = completedTransaction.classId;

    if (isSession) {
      // Session purchased
      navigate("/landing", {
        state: {
          fromPayment: true,
          sessionPurchased: true,
          transactionCode: completedTransaction.transactionCode,
        },
      });
    } else if (isMembership) {
      // Membership purchased
      navigate("/class-selection", {
        state: {
          membershipType: completedTransaction.membershipType,
          transactionId: completedTransaction.id,
        },
      });
    } else if (isClass) {
      // Class enrollment purchased
      navigate("/landing", {
        state: {
          fromPayment: true,
          classEnrolled: true,
          className: paymentDetails.className,
          scheduleDate: paymentDetails.scheduleDate,
          transactionCode: completedTransaction.transactionCode,
        },
      });
    } else {
      navigate("/landing");
    }
  };

  return (
    <div className={styles.paymentContainer}>
      <div className={styles.backgroundOverlay}>
        <div className={`${styles.bgBlur} ${styles.bgBlur1}`}></div>
        <div className={`${styles.bgBlur} ${styles.bgBlur2}`}></div>
        <div className={`${styles.bgBlur} ${styles.bgBlur3}`}></div>
      </div>

      <div className={styles.contentSection}>
        <div className={styles.contentContainer}>
          <button onClick={() => navigate(-1)} className={styles.backButton}>
            <ArrowLeft className={styles.backIcon} />
            Back
          </button>

          <div className={styles.paymentCard}>
            {/* Header */}
            <div className={styles.gcashHeader}>
              <div className={styles.gcashLogo}>
                <span className={styles.gcashIcon}>💳</span>
                <span className={styles.gcashText}>GCash</span>
              </div>
              <div className={styles.secureBadge}>
                <Shield size={16} />
                <span>Secure Payment</span>
              </div>
            </div>

            {/* Payment Details */}
            <div className={styles.paymentDetailsCard}>
              <div className={styles.merchantSection}>
                <div className={styles.merchantIcon}>🏋️</div>
                <div className={styles.merchantInfo}>
                  <h3 className={styles.merchantName}>{merchantDetails.name}</h3>
                  <p className={styles.merchantType}>{merchantDetails.type}</p>
                </div>
              </div>

              <div className={styles.amountSection}>
                <span className={styles.amountLabel}>Amount to Pay</span>
                <span className={styles.amountValue}>₱{paymentDetails.amount.toLocaleString()}</span>
              </div>

              <div className={styles.paymentInfo}>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Payment For:</span>
                  <span className={styles.infoValue}>{paymentDetails.plan}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Transaction ID:</span>
                  <span className={styles.infoValue}>#{paymentDetails.transactionId}</span>
                </div>
              </div>
            </div>

            {/* PIN input */}
            <div className={styles.pinSection}>
              <label className={styles.pinLabel}>
                <span>Enter your MPIN</span>
                <span className={styles.pinHint}>(Use any 4 digits for demo)</span>
              </label>
              <input
                type="password"
                maxLength="4"
                value={pin}
                onChange={handlePinChange}
                placeholder="••••"
                className={styles.pinInput}
                disabled={isProcessing}
              />
            </div>

            {/* Pay button */}
            <button
              onClick={handlePayNow}
              className={styles.payButton}
              disabled={isProcessing || pin.length !== 4}
            >
              {isProcessing ? (
                <span className={styles.processingText}>
                  <Clock size={20} className={styles.spinIcon} />
                  Processing Payment...
                </span>
              ) : (
                "Pay Now"
              )}
            </button>

            <div className={styles.securityNotice}>
              <Shield size={16} />
              <p>Your payment is secured with end-to-end encryption</p>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className={styles.successOverlay}>
          <div className={styles.successModal}>
            <div className={styles.successIcon}>
              <CheckCircle size={80} />
            </div>
            <h2 className={styles.successTitle}>Payment Successful!</h2>
            <p className={styles.successMessage}>
              {completedTransaction?.membershipType === "SESSION"
                ? "Your 1-day gym session is ready!"
                : paymentDetails.className
                ? `You're enrolled in ${paymentDetails.className}!`
                : "Your membership payment is complete!"}
            </p>
            <div className={styles.successAmount}>₱{paymentDetails.amount.toLocaleString()}</div>

            {(completedTransaction?.transactionCode || paymentDetails.transactionCode) && (
              <div className={styles.transactionCodeBox}>
                <span className={styles.codeLabel}>Transaction Code:</span>
                <span className={styles.codeValue}>
                  {completedTransaction?.transactionCode || paymentDetails.transactionCode}
                </span>
                <p className={styles.codeHint}>
                  {completedTransaction?.membershipType === "SESSION"
                    ? "Show this code at the gym for 1-day access"
                    : "Save this code for your records"}
                </p>
              </div>
            )}

            <button
              onClick={handleConfirmSuccess}
              className={styles.confirmButton}
            >
              {completedTransaction?.membershipType === "SESSION"
                ? "Go to Dashboard"
                : completedTransaction?.membershipType
                ? "Select Your Classes"
                : "Got it!"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GCashPaymentPage;

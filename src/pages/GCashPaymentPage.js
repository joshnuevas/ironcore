import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, CheckCircle, Shield, Clock } from "lucide-react";
import Navbar from "../components/Navbar";
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
  };

  const merchantDetails = {
    name: "IronCore Fitness Gym",
    type: "Fitness & Wellness",
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

    // Simulate payment processing delay
    setTimeout(async () => {
      try {
        // Update transaction status to COMPLETED
        const response = await axios.put(
          `http://localhost:8080/api/transactions/${paymentDetails.transactionId}/status?status=COMPLETED`,
          {},
          { withCredentials: true }
        );

        console.log("Transaction updated:", response.data);
        
        // Store the completed transaction data
        setCompletedTransaction(response.data);
        
        // Show success animation
        setShowSuccess(true);
        setIsProcessing(false);
      } catch (error) {
        console.error("Failed to update transaction:", error);
        alert("Payment failed. Please try again.");
        setIsProcessing(false);
      }
    }, 2000);
  };

  const handlePinChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 4);
    setPin(value);
  };

  // ⭐ UPDATED: Handle confirmation button click
  const handleConfirmSuccess = () => {
    // Check if it's a membership transaction
    if (completedTransaction?.membershipType) {
      // Redirect to class selection page
      navigate("/class-selection", {
        state: {
          membershipType: completedTransaction.membershipType,
          transactionId: completedTransaction.id,
        },
      });
    } else {
      // For class enrollments, go to landing page
      navigate("/landing");
    }
  };

  return (
    <div className={styles.paymentContainer}>
      {/* Background */}
      <div className={styles.backgroundOverlay}>
        <div className={`${styles.bgBlur} ${styles.bgBlur1}`}></div>
        <div className={`${styles.bgBlur} ${styles.bgBlur2}`}></div>
        <div className={`${styles.bgBlur} ${styles.bgBlur3}`}></div>
      </div>

      {/* Navbar */}
      <Navbar activeNav="CLASSES" onLogout={onLogout} />

      {/* Content */}
      <div className={styles.contentSection}>
        <div className={styles.contentContainer}>
          {/* Back Button */}
          <button onClick={() => navigate(-1)} className={styles.backButton}>
            <ArrowLeft className={styles.backIcon} />
            Back
          </button>

          {/* GCash Payment Interface */}
          <div className={styles.paymentCard}>
            {/* GCash Header */}
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

            {/* Payment Details Card */}
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

            {/* PIN Input Section */}
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

            {/* Payment Button */}
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

            {/* Security Notice */}
            <div className={styles.securityNotice}>
              <Shield size={16} />
              <p>Your payment is secured with end-to-end encryption</p>
            </div>
          </div>
        </div>
      </div>

      {/* ⭐ UPDATED: Success Modal with Confirmation Button */}
      {showSuccess && (
        <div className={styles.successOverlay}>
          <div className={styles.successModal}>
            <div className={styles.successIcon}>
              <CheckCircle size={80} />
            </div>
            <h2 className={styles.successTitle}>Payment Successful!</h2>
            <p className={styles.successMessage}>
              {paymentDetails.className 
                ? `You're enrolled in ${paymentDetails.className}!` 
                : "Your membership has been activated!"}
            </p>
            <div className={styles.successAmount}>₱{paymentDetails.amount.toLocaleString()}</div>
            
            {/* ⭐ UPDATED: Display transaction code from both sources */}
            {(completedTransaction?.transactionCode || paymentDetails.transactionCode) && (
              <div className={styles.transactionCodeBox}>
                <span className={styles.codeLabel}>Transaction Code:</span>
                <span className={styles.codeValue}>
                  {completedTransaction?.transactionCode || paymentDetails.transactionCode}
                </span>
                <p className={styles.codeHint}>Save this code for your records</p>
              </div>
            )}

            {/* ⭐ UPDATED: Additional details for class enrollment */}
            {paymentDetails.className && (
              <div className={styles.enrollmentDetails}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Class:</span>
                  <span className={styles.detailValue}>{paymentDetails.className}</span>
                </div>
                {paymentDetails.scheduleDay && (
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Day:</span>
                    <span className={styles.detailValue}>{paymentDetails.scheduleDay}</span>
                  </div>
                )}
                {paymentDetails.scheduleTime && (
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Time:</span>
                    <span className={styles.detailValue}>{paymentDetails.scheduleTime}</span>
                  </div>
                )}
                {paymentDetails.scheduleDate && (
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Date:</span>
                    <span className={styles.detailValue}>{paymentDetails.scheduleDate}</span>
                  </div>
                )}
              </div>
            )}

            {/* ⭐ NEW: Confirmation Button */}
            <button 
              onClick={handleConfirmSuccess} 
              className={styles.confirmButton}
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GCashPaymentPage;
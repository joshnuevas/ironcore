import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, CheckCircle, Copy } from "lucide-react";
import Navbar from "../components/Navbar";
import styles from "./GCashPaymentPage.module.css";

const GCashPaymentPage = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get payment details from previous page
  const paymentDetails = location.state || {
    plan: "GOLD",
    amount: 1650,
  };

  const [copied, setCopied] = React.useState(false);

  const accountDetails = {
    name: "LY*A N.",
    mobile: "0917 125 ****",
    userId: "**********Z4MGIK",
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePaymentComplete = () => {
    navigate("/membership");
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
      <Navbar activeNav="MEMBERSHIP" onLogout={onLogout} />

      {/* Content */}
      <div className={styles.contentSection}>
        <div className={styles.contentContainer}>
          {/* Back Button */}
          <button onClick={() => navigate(-1)} className={styles.backButton}>
            <ArrowLeft className={styles.backIcon} />
            Back
          </button>

          {/* Payment Card */}
          <div className={styles.paymentCard}>
            {/* Header */}
            <div className={styles.header}>
              <div className={styles.gcashBadge}>
                <span className={styles.gcashIcon}>💳</span>
                <span>GCash Payment</span>
              </div>
              <h1 className={styles.title}>Scan to Pay</h1>
              <p className={styles.subtitle}>
                Scan the QR code below using your GCash app to complete the payment
              </p>
            </div>

            {/* QR Code Section */}
            <div className={styles.qrSection}>
              <div className={styles.qrWrapper}>
                <img 
                  src="/Gcash.JPG" 
                  alt="GCash QR Code" 
                  className={styles.qrImage}
                />
              </div>

              <div className={styles.qrLabel}>
                <span className={styles.instapayBadge}>InstaPay QR Code</span>
              </div>
            </div>

            {/* Account Details */}
            <div className={styles.accountSection}>
              <h3 className={styles.sectionTitle}>Account Details</h3>
              
              <div className={styles.detailsGrid}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Account Name</span>
                  <div className={styles.detailValueRow}>
                    <span className={styles.detailValue}>{accountDetails.name}</span>
                  </div>
                </div>

                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Mobile Number</span>
                  <div className={styles.detailValueRow}>
                    <span className={styles.detailValue}>{accountDetails.mobile}</span>
                    <button 
                      onClick={() => handleCopy("09171256748")}
                      className={styles.copyButton}
                      title="Copy mobile number"
                    >
                      {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>

                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>User ID</span>
                  <div className={styles.detailValueRow}>
                    <span className={styles.detailValue}>{accountDetails.userId}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Amount */}
            <div className={styles.amountSection}>
              <div className={styles.amountRow}>
                <span className={styles.amountLabel}>Payment Amount</span>
                <span className={styles.amountValue}>₱{paymentDetails.amount}</span>
              </div>
              <div className={styles.planInfo}>
                <span>{paymentDetails.plan} Membership</span>
              </div>
            </div>

            {/* Instructions */}
            <div className={styles.instructionsSection}>
              <h3 className={styles.sectionTitle}>How to Pay</h3>
              <ol className={styles.instructionsList}>
                <li>Open your GCash app</li>
                <li>Tap "Scan QR" or "Pay QR"</li>
                <li>Scan the QR code above</li>
                <li>Verify the amount (₱{paymentDetails.amount})</li>
                <li>Complete the payment</li>
                <li>Take a screenshot of your receipt</li>
              </ol>
            </div>

            {/* Notice */}
            <div className={styles.noticeBox}>
              <span className={styles.noticeIcon}>⚠️</span>
              <p className={styles.noticeText}>
                Transfer fees may apply. Please take a screenshot of your payment receipt 
                and send it to our staff for verification.
              </p>
            </div>

            {/* Action Buttons */}
            <div className={styles.actionButtons}>
              <button onClick={handlePaymentComplete} className={styles.doneButton}>
                I've Completed Payment
              </button>
              <button onClick={() => navigate(-1)} className={styles.cancelButton}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GCashPaymentPage;
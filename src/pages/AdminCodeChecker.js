import React, { useState } from "react";
import { Search, CheckCircle, XCircle, Calendar, CreditCard, User, Mail, Package, ArrowLeft, Clock, AlertCircle } from "lucide-react";
import styles from "./AdminCodeChecker.module.css";
import Navbar from "../components/Navbar";
import axios from "axios";

const AdminCodeChecker = ({ onLogout }) => {
  const [transactionCode, setTransactionCode] = useState("");
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingCode, setPendingCode] = useState("");

  const handleCheckRequest = (e) => {
    e.preventDefault();
    
    if (!transactionCode.trim()) {
      setError("Please enter a transaction code");
      return;
    }

    // Show confirmation modal
    setPendingCode(transactionCode.trim());
    setShowConfirmModal(true);
  };

  const handleConfirmCheck = async () => {
    setShowConfirmModal(false);
    setIsLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await axios.get(
        `http://localhost:8080/api/transactions/check/${pendingCode}`,
        { withCredentials: true }
      );

      setResult(response.data);
    } catch (err) {
      console.error("Error checking transaction:", err);
      setError("Failed to check transaction code. Please try again.");
    } finally {
      setIsLoading(false);
      setPendingCode("");
    }
  };

  const handleCancelCheck = () => {
    setShowConfirmModal(false);
    setPendingCode("");
  };

  const handleReset = () => {
    setTransactionCode("");
    setResult(null);
    setError("");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getDaysRemaining = (expiryDate) => {
    if (!expiryDate) return null;
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const isNewlyActivated = (activatedDate) => {
    if (!activatedDate) return false;
    const activated = new Date(activatedDate);
    const now = new Date();
    const diffMinutes = (now - activated) / (1000 * 60);
    return diffMinutes < 5;
  };

  return (
    <div className={styles.pageContainer}>
      {/* Background */}
      <div className={styles.backgroundOverlay}>
        <div className={`${styles.bgBlur} ${styles.bgBlur1}`}></div>
        <div className={`${styles.bgBlur} ${styles.bgBlur2}`}></div>
        <div className={`${styles.bgBlur} ${styles.bgBlur3}`}></div>
      </div>

      <Navbar activeNav="ADMIN" onLogout={onLogout} />

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <AlertCircle className={styles.modalIcon} />
              <h2 className={styles.modalTitle}>Verify Transaction Code?</h2>
            </div>
            
            <div className={styles.modalBody}>
              <p className={styles.modalText}>
                Are you sure you want to verify this transaction code?
              </p>
              <div className={styles.modalCodeDisplay}>
                <code>{pendingCode}</code>
              </div>
              <p className={styles.modalWarning}>
                This will check the validity and display member information.
              </p>
            </div>
            
            <div className={styles.modalActions}>
              <button 
                onClick={handleCancelCheck}
                className={styles.modalCancelButton}
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmCheck}
                className={styles.modalConfirmButton}
              >
                Verify Code
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.contentSection}>
        <div className={styles.contentContainer}>
          {/* Back Button */}
          <button
            onClick={() => window.location.href = '/admin'}
            className={styles.backButton}
          >
            <ArrowLeft className={styles.backIcon} />
            <span>Back to Admin Dashboard</span>
          </button>

          {/* Header */}
          <div className={styles.headerSection}>
            <h1 className={styles.title}>CODE CHECKER</h1>
            <p className={styles.subtitle}>Verify member access by checking transaction codes</p>
          </div>

          {/* Search Card */}
          <div className={styles.searchCard}>
            <form onSubmit={handleCheckRequest} className={styles.searchForm}>
              <div className={styles.inputWrapper}>
                <Search className={styles.searchIcon} />
                <input
                  type="text"
                  value={transactionCode}
                  onChange={(e) => setTransactionCode(e.target.value.toUpperCase())}
                  placeholder="Enter transaction code (e.g., IRC-SIL-AB12C)"
                  className={styles.searchInput}
                  disabled={isLoading}
                />
              </div>
              
              <div className={styles.buttonGroup}>
                <button 
                  type="submit" 
                  className={styles.checkButton}
                  disabled={isLoading}
                >
                  {isLoading ? "Checking..." : "Check Code"}
                </button>
                
                {result && (
                  <button 
                    type="button" 
                    onClick={handleReset}
                    className={styles.resetButton}
                  >
                    Reset
                  </button>
                )}
              </div>
            </form>

            {error && (
              <div className={styles.errorMessage}>
                <XCircle className={styles.errorIcon} />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Result Card */}
          {result && (
            <div className={`${styles.resultCard} ${result.valid ? styles.validCard : styles.invalidCard}`}>
              {/* Status Header */}
              <div className={styles.statusHeader}>
                {result.valid ? (
                  <>
                    <CheckCircle className={styles.statusIcon} />
                    <div>
                      <h2 className={styles.statusTitle}>Access Granted</h2>
                      <p className={styles.statusMessage}>{result.message}</p>
                      
                      {result.type === "MEMBERSHIP" && 
                       result.membershipActivatedDate && 
                       isNewlyActivated(result.membershipActivatedDate) && (
                        <div className={styles.activationNotice}>
                          🎉 Membership just activated! Timer started.
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className={styles.statusIcon} />
                    <div>
                      <h2 className={styles.statusTitle}>Access Denied</h2>
                      <p className={styles.statusMessage}>{result.message}</p>
                    </div>
                  </>
                )}
              </div>

              {/* Transaction Details */}
              {result.transaction && (
                <div className={styles.detailsGrid}>
                  {/* User Info */}
                  <div className={styles.detailSection}>
                    <h3 className={styles.sectionTitle}>Member Information</h3>
                    <div className={styles.detailItem}>
                      <User className={styles.detailIcon} />
                      <div>
                        <span className={styles.detailLabel}>Name</span>
                        <span className={styles.detailValue}>{result.userName}</span>
                      </div>
                    </div>
                    <div className={styles.detailItem}>
                      <Mail className={styles.detailIcon} />
                      <div>
                        <span className={styles.detailLabel}>Email</span>
                        <span className={styles.detailValue}>{result.userEmail}</span>
                      </div>
                    </div>
                  </div>

                  {/* Purchase Info */}
                  <div className={styles.detailSection}>
                    <h3 className={styles.sectionTitle}>Purchase Details</h3>
                    
                    {result.type === "CLASS" && (
                      <>
                        <div className={styles.detailItem}>
                          <Package className={styles.detailIcon} />
                          <div>
                            <span className={styles.detailLabel}>Class</span>
                            <span className={styles.detailValue}>{result.className}</span>
                          </div>
                        </div>
                        <div className={styles.detailItem}>
                          <Calendar className={styles.detailIcon} />
                          <div>
                            <span className={styles.detailLabel}>Schedule</span>
                            <span className={styles.detailValue}>
                              {result.scheduleDay} - {result.scheduleTime}
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                    
                    {result.type === "MEMBERSHIP" && (
                      <>
                        <div className={styles.detailItem}>
                          <Package className={styles.detailIcon} />
                          <div>
                            <span className={styles.detailLabel}>Membership</span>
                            <span className={styles.detailValue}>{result.membershipType}</span>
                          </div>
                        </div>
                        
                        {result.membershipActivatedDate && (
                          <div className={styles.detailItem}>
                            <Clock className={styles.detailIcon} />
                            <div>
                              <span className={styles.detailLabel}>Activated On</span>
                              <span className={styles.detailValue}>
                                {formatDate(result.membershipActivatedDate)}
                              </span>
                            </div>
                          </div>
                        )}
                        
                        {result.membershipExpiryDate && (
                          <>
                            <div className={styles.detailItem}>
                              <Calendar className={styles.detailIcon} />
                              <div>
                                <span className={styles.detailLabel}>Expires On</span>
                                <span className={styles.detailValue}>
                                  {formatDate(result.membershipExpiryDate)}
                                </span>
                              </div>
                            </div>
                            
                            <div className={styles.detailItem}>
                              <div>
                                <span className={styles.detailLabel}>Time Remaining</span>
                                <span className={`${styles.badge} ${
                                  getDaysRemaining(result.membershipExpiryDate) > 7 
                                    ? styles.successBadge 
                                    : getDaysRemaining(result.membershipExpiryDate) > 0
                                    ? styles.warningBadge
                                    : styles.expiredBadge
                                }`}>
                                  {getDaysRemaining(result.membershipExpiryDate) > 0
                                    ? `${getDaysRemaining(result.membershipExpiryDate)} days left`
                                    : "EXPIRED"
                                  }
                                </span>
                              </div>
                            </div>
                          </>
                        )}
                      </>
                    )}
                    
                    <div className={styles.detailItem}>
                      <CreditCard className={styles.detailIcon} />
                      <div>
                        <span className={styles.detailLabel}>Amount Paid</span>
                        <span className={styles.detailValue}>₱{result.totalAmount}</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div className={styles.detailSection}>
                    <h3 className={styles.sectionTitle}>Payment Information</h3>
                    <div className={styles.detailItem}>
                      <div>
                        <span className={styles.detailLabel}>Transaction Code</span>
                        <span className={styles.detailValue}>{result.transaction.transactionCode}</span>
                      </div>
                    </div>
                    <div className={styles.detailItem}>
                      <div>
                        <span className={styles.detailLabel}>Status</span>
                        <span className={`${styles.badge} ${result.valid ? styles.successBadge : styles.pendingBadge}`}>
                          {result.paymentStatus}
                        </span>
                      </div>
                    </div>
                    <div className={styles.detailItem}>
                      <div>
                        <span className={styles.detailLabel}>Payment Date</span>
                        <span className={styles.detailValue}>{formatDate(result.paymentDate)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCodeChecker;
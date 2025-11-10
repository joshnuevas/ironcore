import React, { useState } from "react";
import { Search, CheckCircle, XCircle, Calendar, CreditCard, User, Mail, Package, ArrowLeft } from "lucide-react";
import styles from "./AdminCodeChecker.module.css";
import Navbar from "../components/Navbar";
import axios from "axios";

const AdminCodeChecker = ({ onLogout }) => {
  const [transactionCode, setTransactionCode] = useState("");
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCheck = async (e) => {
    e.preventDefault();
    
    if (!transactionCode.trim()) {
      setError("Please enter a transaction code");
      return;
    }

    setIsLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await axios.get(
        `http://localhost:8080/api/transactions/check/${transactionCode.trim()}`,
        { withCredentials: true }
      );

      setResult(response.data);
    } catch (err) {
      console.error("Error checking transaction:", err);
      setError("Failed to check transaction code. Please try again.");
    } finally {
      setIsLoading(false);
    }
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

  return (
    <div className={styles.pageContainer}>
      {/* Background */}
      <div className={styles.backgroundOverlay}>
        <div className={`${styles.bgBlur} ${styles.bgBlur1}`}></div>
        <div className={`${styles.bgBlur} ${styles.bgBlur2}`}></div>
        <div className={`${styles.bgBlur} ${styles.bgBlur3}`}></div>
      </div>

      <Navbar activeNav="ADMIN" onLogout={onLogout} />

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
            <form onSubmit={handleCheck} className={styles.searchForm}>
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
                      <div className={styles.detailItem}>
                        <Package className={styles.detailIcon} />
                        <div>
                          <span className={styles.detailLabel}>Membership</span>
                          <span className={styles.detailValue}>{result.membershipType}</span>
                        </div>
                      </div>
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
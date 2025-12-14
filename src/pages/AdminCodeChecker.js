import React, { useState } from "react";
import {
  Search,
  CheckCircle,
  XCircle,
  Calendar,
  CreditCard,
  User,
  Mail,
  Package,
  ArrowLeft,
  Clock,
  AlertCircle,
} from "lucide-react";
import styles from "./AdminCodeChecker.module.css";
import axios from "axios";

const AdminCodeChecker = ({ onLogout }) => {
  const [transactionCode, setTransactionCode] = useState("");
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingCode, setPendingCode] = useState("");

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // for closing animation of Verify modal
  const [isClosingConfirmModal, setIsClosingConfirmModal] = useState(false);

  const handleCheckRequest = (e) => {
    e.preventDefault();

    if (!transactionCode.trim()) {
      setError("Please enter a transaction code");
      return;
    }

    setIsClosingConfirmModal(false);
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
      setError(
        err.response?.data?.message ||
          "Failed to check transaction code. Please try again."
      );
    } finally {
      setIsLoading(false);
      setPendingCode("");
    }
  };

  const handleCancelCheck = () => {
    // trigger closing animation
    setIsClosingConfirmModal(true);

    setTimeout(() => {
      setShowConfirmModal(false);
      setPendingCode("");
      setIsClosingConfirmModal(false);
    }, 200); // must match .modalClosing animation duration
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
      minute: "2-digit",
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

  const openCancelModal = () => {
    setShowCancelModal(true);
  };

  const handleCancelMembershipClose = () => {
    setShowCancelModal(false);
  };

  const handleConfirmCancelMembership = async () => {
    if (!result || !result.transaction) return;

    setIsCancelling(true);
    setError("");

    try {
      const code = result.transaction.transactionCode;

      await axios.put(
        `http://localhost:8080/api/admin/memberships/${code}/cancel`,
        null,
        { withCredentials: true }
      );

      setResult((prev) => ({
        ...prev,
        valid: false,
        paymentStatus: "CANCELLED",
        message: "This membership has been cancelled and is no longer valid.",
      }));
    } catch (err) {
      console.error("Error cancelling membership:", err);
      setError(
        err.response?.data?.message ||
          "Failed to cancel membership. Please try again."
      );
    } finally {
      setIsCancelling(false);
      setShowCancelModal(false);
    }
  };

  const isMembershipResult =
    result && result.type && result.type === "MEMBERSHIP";
  const isCancelled =
    result && result.paymentStatus && result.paymentStatus === "CANCELLED";

  return (
    <div className={styles.pageContainer}>
      {/* Background */}
      <div className={styles.backgroundOverlay}>
        <div className={`${styles.bgBlur} ${styles.bgBlur1}`} />
        <div className={`${styles.bgBlur} ${styles.bgBlur2}`} />
        <div className={`${styles.bgBlur} ${styles.bgBlur3}`} />
      </div>

      {/* =========================
          Confirmation Modal (Check Code)
         ========================== */}
      {showConfirmModal && (
        <div className={styles.modalOverlay}>
          <div
            className={`${styles.modalContent} ${
              isClosingConfirmModal ? styles.modalClosing : ""
            }`}
          >
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

      {/* =========================
          Cancel Membership Modal
         ========================== */}
          {/* =========================
          Cancel Membership Modal
         ========================== */}
      {showCancelModal && result && result.transaction && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <AlertCircle className={styles.modalIcon} />
              <h2 className={styles.modalTitle}>Cancel Membership?</h2>
            </div>

            <div className={styles.modalBody}>
              <p className={styles.modalText}>
                Are you sure you want to cancel this member&apos;s active
                membership?
              </p>

              <div className={styles.modalCodeDisplay}>
                <code>{result.transaction.transactionCode}</code>
              </div>

              <p className={styles.cancelWarningText}>
                This will revoke their access associated with this membership.
                This action is irreversible.
              </p>
            </div>

            <div className={styles.modalActions}>
              <button
                type="button"
                onClick={handleCancelMembershipClose}
                className={styles.modalCancelButton}
                disabled={isCancelling}
              >
                Keep Membership
              </button>

              <button
                type="button"
                onClick={handleConfirmCancelMembership}
                className={`${styles.modalConfirmButton} ${styles.dangerConfirmButton}`}
                disabled={isCancelling}
              >
                {isCancelling ? "Cancelling..." : "Confirm Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================
          Main Content
         ========================== */}
      <div className={styles.contentSection}>
        <div className={styles.contentContainer}>
          {/* Back Button */}
          <button
            onClick={() => (window.location.href = "/admin")}
            className={styles.backButton}
          >
            <ArrowLeft className={styles.backIcon} />
            <span>Back to Admin Dashboard</span>
          </button>

          {/* Header */}
          <div className={styles.headerSection}>
            <h1 className={styles.title}>CODE CHECKER</h1>
            <p className={styles.subtitle}>
              Verify member access by checking transaction codes
            </p>
          </div>

          {/* Search Card */}
          <div className={styles.searchCard}>
            <form onSubmit={handleCheckRequest} className={styles.searchForm}>
              <div className={styles.inputWrapper}>
                <Search className={styles.searchIcon} />
                <input
                  type="text"
                  value={transactionCode}
                  onChange={(e) =>
                    setTransactionCode(e.target.value.toUpperCase())
                  }
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
            <div
              className={`${styles.resultCard} ${
                result.valid ? styles.validCard : styles.invalidCard
              }`}
            >
              {/* Status Header */}
              <div className={styles.statusHeader}>
                {result.valid ? (
                  <>
                    <CheckCircle className={styles.statusIcon} />
                    <div>
                      <h2 className={styles.statusTitle}>Access Granted</h2>
                      <p className={styles.statusMessage}>{result.message}</p>

                      {isMembershipResult &&
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
                      <p className={styles.statusMessage}>
                        {isMembershipResult && isCancelled
                          ? "This membership has been cancelled and is no longer valid."
                          : result.message}
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Transaction Details */}
              {result.transaction && (
                <div className={styles.detailsGrid}>
                  {/* Member Info */}
                  <div className={styles.detailSection}>
                    <h3 className={styles.sectionTitle}>Member Information</h3>
                    <div className={styles.detailItem}>
                      <User className={styles.detailIcon} />
                      <div>
                        <span className={styles.detailLabel}>Name</span>
                        <span className={styles.detailValue}>
                          {result.userName}
                        </span>
                      </div>
                    </div>
                    <div className={styles.detailItem}>
                      <Mail className={styles.detailIcon} />
                      <div>
                        <span className={styles.detailLabel}>Email</span>
                        <span className={styles.detailValue}>
                          {result.userEmail}
                        </span>
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

                        {/* If NOT cancelled → show Expires On + Time Remaining */}
                        {!isCancelled && result.membershipExpiryDate && (
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
                                <span
                                  className={`${styles.badge} ${
                                    getDaysRemaining(result.membershipExpiryDate) > 7
                                      ? styles.successBadge
                                      : getDaysRemaining(result.membershipExpiryDate) > 0
                                      ? styles.warningBadge
                                      : styles.expiredBadge
                                  }`}
                                >
                                  {getDaysRemaining(result.membershipExpiryDate) > 0
                                    ? `${getDaysRemaining(result.membershipExpiryDate)} days left`
                                    : "EXPIRED"}
                                </span>
                              </div>
                            </div>
                          </>
                        )}

                        {/* If CANCELLED → show Cancelled On instead of Expires On */}
                        {isCancelled && (
                          <div className={styles.detailItem}>
                            <Calendar className={styles.detailIcon} />
                            <div>
                              <span className={styles.detailLabel}>Cancelled On</span>
                              <span className={styles.detailValue}>
                                {formatDate(result.cancellationDate || result.paymentDate)}
                              </span>
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {/* Amount Paid – only when not cancelled */}
                    {!isCancelled && (
                      <div className={styles.detailItem}>
                        <CreditCard className={styles.detailIcon} />
                        <div>
                          <span className={styles.detailLabel}>Amount Paid</span>
                          <span className={styles.detailValue}>₱{result.totalAmount}</span>
                        </div>
                      </div>
                    )}
                  </div>


                  {/* Payment Info */}
                  {!(isMembershipResult && isCancelled) && (
                    <div className={styles.detailSection}>
                      <h3 className={styles.sectionTitle}>Payment Information</h3>
                      <div className={styles.detailItem}>
                        <div>
                          <span className={styles.detailLabel}>
                            Transaction Code
                          </span>
                          <span className={styles.detailValue}>
                            {result.transaction.transactionCode}
                          </span>
                        </div>
                      </div>
                      <div className={styles.detailItem}>
                        <div>
                          <span className={styles.detailLabel}>Status</span>
                          <span
                            className={`${styles.badge} ${
                              isCancelled
                                ? styles.expiredBadge
                                : result.valid
                                ? styles.successBadge
                                : styles.pendingBadge
                            }`}
                          >
                            {result.paymentStatus}
                          </span>
                        </div>
                      </div>
                      <div className={styles.detailItem}>
                        <div>
                          <span className={styles.detailLabel}>
                            Payment Date
                          </span>
                          <span className={styles.detailValue}>
                            {formatDate(result.paymentDate)}
                          </span>
                        </div>
                      </div>

                      {result.valid &&
                        result.type === "MEMBERSHIP" &&
                        result.paymentStatus === "COMPLETED" && (
                          <div className={styles.actionRow}>
                            <button
                              type="button"
                              onClick={openCancelModal}
                              className={styles.cancelMembershipButton}
                              disabled={isCancelling}
                            >
                              {isCancelling
                                ? "Cancelling..."
                                : "Cancel Membership"}
                            </button>
                          </div>
                        )}
                    </div>
                  )}
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

import React, { useState, useEffect } from "react";
import { Calendar, Clock, Users, AlertCircle } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import styles from "./ClassTransactionPage.module.css";
import axios from "axios";

const ClassTransactionPage = ({ onLogout }) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // 🔹 Existing: duplicate enrollment (same class)
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [duplicateEnrollmentInfo, setDuplicateEnrollmentInfo] = useState(null);

  // 🔹 NEW: schedule conflict (same date + time slot, any class)
  const [showScheduleConflictModal, setShowScheduleConflictModal] =
    useState(false);
  const [scheduleConflictInfo, setScheduleConflictInfo] = useState(null);

  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [userError, setUserError] = useState(null);
  const [loadingSchedules, setLoadingSchedules] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  // ⬇️ classData is passed from ClassDetailsPage via navigate state
  const classData = location.state?.classData;

  // ✅ Handle numeric or string price safely
  const rawPrice = classData?.price;
  const classPrice =
    typeof rawPrice === "number"
      ? rawPrice
      : parseInt(
          String(rawPrice || "0").replace(/[₱,]/g, ""),
          10
        );

  const processingFee = 20;
  const total = classPrice + processingFee;

  // Validate class data
  useEffect(() => {
    if (!classData?.id) {
      alert("Class information is missing. Redirecting to classes page.");
      navigate("/classes");
    }
  }, [classData, navigate]);

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
        setUserError("Failed to load user info. Please log in again.");
      } finally {
        setUserLoading(false);
      }
    };
    fetchCurrentUser();
  }, []);

  // Fetch schedules for this class
  useEffect(() => {
    const fetchSchedules = async () => {
      if (!classData?.id) return;
      try {
        setLoadingSchedules(true);
        const response = await axios.get(
          `http://localhost:8080/api/schedules/class/${classData.id}`
        );
        setSchedules(response.data);
      } catch (error) {
        console.error("Error fetching schedules:", error);
        setSchedules([]);
      } finally {
        setLoadingSchedules(false);
      }
    };
    fetchSchedules();
  }, [classData?.id]);

  // 🔍 Enroll button: check conflict → check active enrollment → confirm
  const handleEnrollNow = async () => {
    if (!selectedSchedule) {
      alert("Please select a schedule first");
      return;
    }

    if (!currentUser) {
      alert("User info not loaded");
      return;
    }

    try {
      // 1) Check schedule conflict (same date + time slot)
      const conflictRes = await axios.get(
        "http://localhost:8080/api/class-enrollments/check-conflict",
        {
          params: {
            userId: currentUser.id,
            scheduleId: selectedSchedule.id,
          },
          withCredentials: true,
        }
      );

      if (conflictRes.data?.hasConflict) {
        setScheduleConflictInfo(conflictRes.data);
        setShowScheduleConflictModal(true);
        return; // stop here, don't go to confirm modal
      }

      // 2) Check active enrollment in this class (your existing logic)
      const activeRes = await axios.get(
        "http://localhost:8080/api/transactions/check-active-enrollment",
        {
          params: {
            userId: currentUser.id,
            classId: classData.id,
          },
          withCredentials: true,
        }
      );

      if (activeRes.data.hasActiveEnrollment) {
        setDuplicateEnrollmentInfo(activeRes.data);
        setShowDuplicateModal(true);
      } else {
        setShowConfirmModal(true);
      }
    } catch (error) {
      console.error("Error checking schedule/enrollment:", error);
      alert("Failed to verify schedule. Please try again.");
    }
  };

  // Handle payment confirmation
  const handleConfirmPayment = async () => {
    if (!selectedSchedule || !currentUser) {
      alert("Missing required information");
      return;
    }

    try {
      const payload = {
        userId: currentUser.id,
        classId: classData.id,
        scheduleId: selectedSchedule.id,
        processingFee: processingFee,
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
        // Navigate to GCash payment with proper schedule details
        navigate("/gcash-payment", {
          state: {
            plan: `${classData.name} - ${selectedSchedule.day} ${selectedSchedule.timeSlot}`,
            amount: total,
            transactionId: response.data.id,
            transactionCode: response.data.transactionCode,
            className: classData.name,
            scheduleDay: selectedSchedule.day,
            scheduleTime: selectedSchedule.timeSlot,
            scheduleDate: selectedSchedule.date,
          },
        });
      }
    } catch (error) {
      console.error("Error saving transaction:", error);

      // Handle duplicate enrollment error from backend (if you ever return 409)
      if (
        error.response?.status === 409 &&
        error.response?.data?.error === "ACTIVE_ENROLLMENT_EXISTS"
      ) {
        setShowConfirmModal(false);
        setDuplicateEnrollmentInfo(error.response.data);
        setShowDuplicateModal(true);
      } else {
        alert(
          `Failed to save enrollment: ${
            error.response?.data?.message || error.message
          }`
        );
      }
    }
  };

  const handleCloseModal = () => setShowConfirmModal(false);

  const handleCloseDuplicateModal = () => {
    setShowDuplicateModal(false);
    setDuplicateEnrollmentInfo(null);
  };

  const handleCloseScheduleConflictModal = () => {
    setShowScheduleConflictModal(false);
    setScheduleConflictInfo(null);
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      return dateString;
    }
  };

  // Loading state
  if (userLoading) {
    return (
      <div className={styles.transactionContainer}>
        <Navbar activeNav="CLASSES" onLogout={onLogout} />
        <div className={styles.contentSection}>
          <div className={styles.contentContainer}>
            <div className={styles.loadingMessage}>
              Loading user information...
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (userError) {
    return (
      <div className={styles.transactionContainer}>
        <Navbar activeNav="CLASSES" onLogout={onLogout} />
        <div className={styles.contentSection}>
          <div className={styles.contentContainer}>
            <div className={styles.errorMessage}>{userError}</div>
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

      <Navbar activeNav="CLASSES" onLogout={onLogout} />

      <div className={styles.contentSection}>
        <div className={styles.contentContainer}>
          <div className={styles.headerSection}>
            <h1 className={styles.title}>ENROLL IN CLASS</h1>
            <p className={styles.subtitle}>
              Select your preferred schedule and complete enrollment
            </p>
          </div>

          <div className={styles.checkoutGrid}>
            {/* Class Summary Card */}
            <div className={styles.summaryCard}>
              <h2 className={styles.summaryTitle}>Class Summary</h2>
              <div className={styles.classDetails}>
                <div className={styles.classHeader}>
                  <span className={styles.classIcon}>{classData.icon}</span>
                  <div>
                    <h3 className={styles.className}>{classData.name}</h3>
                    <p className={styles.classDescription}>
                      {classData.description}
                    </p>
                  </div>
                </div>

                <div className={styles.classInfo}>
                  <div className={styles.infoItem}>
                    <Clock className={styles.infoIcon} />
                    <span>{classData.duration}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <Users className={styles.infoIcon} />
                    <span>Up to {classData.maxParticipants} people</span>
                  </div>
                </div>

                <div className={styles.priceBreakdown}>
                  <div className={styles.priceRow}>
                    <span>Class Fee</span>
                    <span>
                      ₱{classPrice.toLocaleString("en-PH")}
                    </span>
                  </div>
                  <div className={styles.priceRow}>
                    <span>Processing Fee</span>
                    <span>₱{processingFee.toLocaleString("en-PH")}</span>
                  </div>
                  <div className={styles.totalRow}>
                    <span>Total</span>
                    <span className={styles.totalPrice}>
                      ₱{total.toLocaleString("en-PH")}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleEnrollNow}
                  className={styles.enrollButton}
                  disabled={!selectedSchedule || !currentUser}
                >
                  {!currentUser
                    ? "Loading..."
                    : selectedSchedule
                    ? "Enroll Now"
                    : "Select Schedule First"}
                </button>
              </div>
            </div>

            {/* Schedule Selection Card */}
            <div className={styles.scheduleCard}>
              <h2 className={styles.formTitle}>Select Your Schedule</h2>

              {loadingSchedules ? (
                <p className={styles.loadingText}>Loading schedules...</p>
              ) : schedules.length === 0 ? (
                <p className={styles.noSchedules}>
                  No schedules available yet.
                </p>
              ) : (
                <div className={styles.scheduleList}>
                  {schedules.map((schedule) => {
                    const slotsLeft =
                      schedule.maxParticipants -
                      (schedule.enrolledCount || 0);
                    const isFull = slotsLeft <= 0;

                    return (
                      <div
                        key={schedule.id}
                        className={`${styles.scheduleOption} ${
                          selectedSchedule?.id === schedule.id
                            ? styles.scheduleSelected
                            : ""
                        } ${isFull ? styles.scheduleDisabled : ""}`}
                        onClick={() => !isFull && setSelectedSchedule(schedule)}
                      >
                        <div className={styles.scheduleRadio}>
                          {selectedSchedule?.id === schedule.id && (
                            <div className={styles.scheduleRadioSelected}></div>
                          )}
                        </div>
                        <div className={styles.scheduleInfo}>
                          <div className={styles.scheduleTop}>
                            <span className={styles.scheduleDay}>
                              {schedule.day}
                            </span>
                            <span
                              className={
                                isFull
                                  ? styles.scheduleSlotsFull
                                  : styles.scheduleSlots
                              }
                            >
                              {isFull ? "FULL" : `${slotsLeft} slots left`}
                            </span>
                          </div>
                          <div className={styles.scheduleTime}>
                            {schedule.timeSlot}
                          </div>
                          <div className={styles.scheduleDate}>
                            <Calendar size={14} /> {schedule.date}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {currentUser && (
                <div className={styles.userInfoCard}>
                  <h3 className={styles.userInfoTitle}>Your Information</h3>
                  <div className={styles.userInfoList}>
                    <div className={styles.userInfoItem}>
                      <span className={styles.userInfoLabel}>Name:</span>
                      <span className={styles.userInfoValue}>
                        {currentUser.username}
                      </span>
                    </div>
                    <div className={styles.userInfoItem}>
                      <span className={styles.userInfoLabel}>Email:</span>
                      <span className={styles.userInfoValue}>
                        {currentUser.email}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className={styles.paymentNote}>
                <span className={styles.lockIcon}>🔒</span>
                <p>Secure payment powered by GCash</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🟡 Schedule Conflict Modal (same date + time, any class) */}
      {showScheduleConflictModal && scheduleConflictInfo && (
        <div
          className={styles.modalOverlay}
          onClick={handleCloseScheduleConflictModal}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={styles.closeButton}
              onClick={handleCloseScheduleConflictModal}
            >
              ×
            </button>

            <div className={styles.warningHeader}>
              <AlertCircle className={styles.warningIcon} size={48} />
              <h2 className={styles.modalTitle}>Schedule Conflict Found</h2>
              <p className={styles.modalSubtitle}>
                You already have a class booked at this time.
              </p>
            </div>

            <div className={styles.modalDetails}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Class:</span>
                <span className={styles.detailValue}>
                  {scheduleConflictInfo.className}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Date:</span>
                <span className={styles.detailValue}>
                  {formatDate(scheduleConflictInfo.scheduleDate)}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Time:</span>
                <span className={styles.detailValue}>
                  {scheduleConflictInfo.scheduleDay},{" "}
                  {scheduleConflictInfo.scheduleTime}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Code:</span>
                <span className={styles.detailValue}>
                  {scheduleConflictInfo.transactionCode}
                </span>
              </div>
            </div>

            <div className={styles.warningNote}>
              <p>
                You can book another class once this time slot is free or choose
                a different schedule.
              </p>
            </div>

            <button
              onClick={handleCloseScheduleConflictModal}
              className={styles.okButton}
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* 🔁 Duplicate Enrollment Warning Modal (same class) */}
      {showDuplicateModal && duplicateEnrollmentInfo && (
        <div
          className={styles.modalOverlay}
          onClick={handleCloseDuplicateModal}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={styles.closeButton}
              onClick={handleCloseDuplicateModal}
            >
              ×
            </button>

            <div className={styles.warningHeader}>
              <AlertCircle className={styles.warningIcon} size={48} />
              <h2 className={styles.modalTitle}>
                {duplicateEnrollmentInfo.scheduleDay
                  ? "Class Session Still Active"
                  : "Membership Class Already Selected"}
              </h2>
            </div>

            {/* Regular class with schedule */}
            {duplicateEnrollmentInfo.scheduleDay ? (
              <>
                <p className={styles.warningMessage}>
                  You already have an active enrollment for{" "}
                  <strong>{duplicateEnrollmentInfo.className}</strong>. Please
                  complete your current session before enrolling in a new one.
                </p>

                <div className={styles.modalDetails}>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Scheduled:</span>
                    <span className={styles.detailValue}>
                      {duplicateEnrollmentInfo.scheduleDay},{" "}
                      {duplicateEnrollmentInfo.scheduleTime}
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Date:</span>
                    <span className={styles.detailValue}>
                      {duplicateEnrollmentInfo.scheduleDate}
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Access Code:</span>
                    <span className={styles.detailValue}>
                      {duplicateEnrollmentInfo.transactionCode}
                    </span>
                  </div>
                </div>

                <div className={styles.warningNote}>
                  <p>You can enroll in a new session after completing this one.</p>
                </div>
              </>
            ) : (
              // Membership-included class (no per-session schedule)
              <>
                <p className={styles.warningMessage}>
                  You've already selected{" "}
                  <strong>{duplicateEnrollmentInfo.className}</strong> as part of
                  your <strong>{duplicateEnrollmentInfo.membershipType}</strong>{" "}
                  membership.
                </p>

                <div className={styles.modalDetails}>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Membership:</span>
                    <span className={styles.detailValue}>
                      {duplicateEnrollmentInfo.membershipType}
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Valid Until:</span>
                    <span className={styles.detailValue}>
                      {formatDate(duplicateEnrollmentInfo.membershipExpiryDate)}
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Access Code:</span>
                    <span className={styles.detailValue}>
                      {duplicateEnrollmentInfo.transactionCode}
                    </span>
                  </div>
                </div>

                <div className={styles.warningNote}>
                  <p>
                    This class is already included in your active membership
                    until the expiry date.
                  </p>
                </div>
              </>
            )}

            <button
              onClick={handleCloseDuplicateModal}
              className={styles.okButton}
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && selectedSchedule && currentUser && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <button className={styles.closeButton} onClick={handleCloseModal}>
              ×
            </button>
            <h2 className={styles.modalTitle}>Confirm Enrollment</h2>
            <p className={styles.modalSubtitle}>
              Please verify your class details
            </p>

            <div className={styles.modalDetails}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Schedule:</span>
                <span className={styles.detailValue}>
                  {selectedSchedule.day}, {selectedSchedule.timeSlot}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Date:</span>
                <span className={styles.detailValue}>
                  {selectedSchedule.date}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Duration:</span>
                <span className={styles.detailValue}>{classData.duration}</span>
              </div>

              <div className={styles.divider}></div>

              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Total Payment:</span>
                <span className={styles.totalValue}>
                  ₱{total.toLocaleString("en-PH")}
                </span>
              </div>
            </div>

            <button
              onClick={handleConfirmPayment}
              className={styles.confirmButton}
            >
              Confirm and go to payment
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassTransactionPage;

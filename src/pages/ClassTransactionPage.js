import React, { useEffect, useState } from "react";
import { Calendar, Clock, Users, AlertCircle } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./ClassTransactionPage.module.css";
import axios from "axios";
import Navbar from "../components/Navbar";

const API_BASE = "http://localhost:8080";

const ClassTransactionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // ⬇️ classData is passed from ClassDetailsPage via navigate state
  const classData = location.state?.classData;

  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [loadingSchedules, setLoadingSchedules] = useState(true);

  const [currentUser, setCurrentUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [userError, setUserError] = useState(null);

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [showScheduleConflictModal, setShowScheduleConflictModal] =
    useState(false);
  const [scheduleConflictInfo, setScheduleConflictInfo] = useState(null);

  const [alreadyBooked, setAlreadyBooked] = useState(false);
  const [checkingDuplicate, setCheckingDuplicate] = useState(false);

  // ✅ Handle numeric or string price safely
  const rawPrice = classData?.price;
  const classPrice =
    typeof rawPrice === "number"
      ? rawPrice
      : parseInt(String(rawPrice || "0").replace(/[₱,]/g, ""), 10);

  const processingFee = 20;
  const total = classPrice + processingFee;

  // Validate class data
  useEffect(() => {
    if (!classData?.id) {
      alert("Class information is missing. Redirecting to classes page.");
      navigate("/classes");
    }
  }, [classData, navigate]);

  // ✅ Fetch current user (FIXED)
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        setUserLoading(true);
        const res = await axios.get(`${API_BASE}/api/users/me`, {
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
          `${API_BASE}/api/schedules/class/${classData.id}`
        );
        setSchedules(response.data || []);
      } catch (error) {
        console.error("Error fetching schedules:", error);
        setSchedules([]);
      } finally {
        setLoadingSchedules(false);
      }
    };
    fetchSchedules();
  }, [classData?.id]);

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const handleCloseScheduleConflictModal = () => {
    setShowScheduleConflictModal(false);
    setScheduleConflictInfo(null);
  };

  const handleCloseConfirmModal = () => {
    setShowConfirmModal(false);
  };

  // ✅ When a schedule is selected, immediately check duplicate & update button state
  const handleSelectSchedule = async (schedule) => {
    setSelectedSchedule(schedule);
    setAlreadyBooked(false);

    if (!currentUser?.id || !classData?.id || !schedule?.id) return;

    try {
      setCheckingDuplicate(true);
      const dupRes = await axios.get(
        `${API_BASE}/api/class-enrollments/check-duplicate`,
        {
          params: {
            userId: currentUser.id,
            classId: classData.id,
            scheduleId: schedule.id,
          },
          withCredentials: true,
        }
      );

      setAlreadyBooked(!!dupRes.data?.alreadyBooked);
    } catch (error) {
      console.error("Error checking duplicate:", error);
      // fail-open (don’t lock button if backend fails)
      setAlreadyBooked(false);
    } finally {
      setCheckingDuplicate(false);
    }
  };

  // ✅ Enroll button: now it should usually just open modal (since duplicate already checked)
  const handleEnrollNow = async () => {
    if (!selectedSchedule) return alert("Please select a schedule first");
    if (!currentUser?.id) return alert("User info not loaded");
    if (alreadyBooked) return; // extra safety

    try {
      // check time overlap conflicts
      const conflictRes = await axios.get(
        `${API_BASE}/api/class-enrollments/check-conflict`,
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
        return;
      }

      setShowConfirmModal(true);
    } catch (error) {
      console.error("Error checking booking:", error);
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

      const response = await axios.post(`${API_BASE}/api/transactions`, payload, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      if (response.status === 200 || response.status === 201) {
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
      alert(
        `Failed to save enrollment: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  // Loading state
  if (userLoading) {
    return (
      <div className={styles.transactionContainer}>
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

      <Navbar activeNav="CLASSES" />

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
                  <span className={styles.classIcon}>{classData?.icon}</span>
                  <div>
                    <h3 className={styles.className}>{classData?.name}</h3>
                    <p className={styles.classDescription}>
                      {classData?.description}
                    </p>
                  </div>
                </div>

                <div className={styles.classInfo}>
                  <div className={styles.infoItem}>
                    <Clock className={styles.infoIcon} />
                    <span>{classData?.duration}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <Users className={styles.infoIcon} />
                    <span>Up to {classData?.maxParticipants} people</span>
                  </div>
                </div>

                <div className={styles.priceBreakdown}>
                  <div className={styles.priceRow}>
                    <span>Class Fee</span>
                    <span>₱{classPrice.toLocaleString("en-PH")}</span>
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
                  disabled={
                    !selectedSchedule ||
                    !currentUser ||
                    checkingDuplicate ||
                    alreadyBooked
                  }
                  title={
                    alreadyBooked
                      ? "You already booked this schedule."
                      : undefined
                  }
                >
                  {!currentUser
                    ? "Loading..."
                    : !selectedSchedule
                    ? "Select Schedule First"
                    : checkingDuplicate
                    ? "Checking..."
                    : alreadyBooked
                    ? "Already Enrolled"
                    : "Enroll Now"}
                </button>
              </div>
            </div>

            {/* Schedule Selection Card */}
            <div className={styles.scheduleCard}>
              <h2 className={styles.formTitle}>Select Your Schedule</h2>

              {loadingSchedules ? (
                <p className={styles.loadingText}>Loading schedules...</p>
              ) : schedules.length === 0 ? (
                <p className={styles.noSchedules}>No schedules available yet.</p>
              ) : (
                <div className={styles.scheduleList}>
                  {schedules.map((schedule) => {
                    const slotsLeft =
                      schedule.maxParticipants - (schedule.enrolledCount || 0);
                    const isFull = slotsLeft <= 0;

                    return (
                      <div
                        key={schedule.id}
                        className={`${styles.scheduleOption} ${
                          selectedSchedule?.id === schedule.id
                            ? styles.scheduleSelected
                            : ""
                        } ${isFull ? styles.scheduleDisabled : ""}`}
                        onClick={() => !isFull && handleSelectSchedule(schedule)}
                      >
                        <div className={styles.scheduleRadio}>
                          {selectedSchedule?.id === schedule.id && (
                            <div className={styles.scheduleRadioSelected} />
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

      {/* 🟡 Schedule Conflict Modal */}
      {showScheduleConflictModal && scheduleConflictInfo && (
        <div
          className={styles.modalOverlay}
          onClick={handleCloseScheduleConflictModal}
        >
          <div
            className={styles.scheduleConflictModal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.conflictIconWrapper}>
              <AlertCircle className={styles.conflictIcon} />
            </div>

            <h2 className={styles.conflictTitle}>Schedule Conflict Found</h2>

            <p className={styles.conflictSubtitle}>
              You already have a class booking that conflicts with this schedule.
            </p>

            <div className={styles.conflictDetails}>
              <div className={styles.conflictInfoBox}>
                <div className={styles.conflictRow}>
                  <span className={styles.conflictLabel}>Class:</span>
                  <span className={styles.conflictValueHighlight}>
                    {scheduleConflictInfo.className || "N/A"}
                  </span>
                </div>

                <div className={styles.conflictRow}>
                  <span className={styles.conflictLabel}>Date:</span>
                  <span className={styles.conflictValue}>
                    {formatDate(scheduleConflictInfo.scheduleDate)}
                  </span>
                </div>

                <div className={styles.conflictRow}>
                  <span className={styles.conflictLabel}>Time:</span>
                  <span className={styles.conflictValue}>
                    {scheduleConflictInfo.scheduleDay
                      ? `${scheduleConflictInfo.scheduleDay}, `
                      : ""}
                    {scheduleConflictInfo.scheduleTime || "N/A"}
                  </span>
                </div>

                <div className={styles.conflictRow}>
                  <span className={styles.conflictLabel}>Code:</span>
                  <span className={styles.conflictCode}>
                    {scheduleConflictInfo.transactionCode || "N/A"}
                  </span>
                </div>
              </div>

              <div className={styles.conflictWarning}>
                <p>
                  Choose a different schedule. Only one class booking per day is
                  allowed and time slots must not conflict.
                </p>
              </div>
            </div>

            <button
              onClick={handleCloseScheduleConflictModal}
              className={styles.conflictButton}
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* ✅ Confirm Modal */}
      {showConfirmModal && selectedSchedule && currentUser && (
        <div className={styles.modalOverlay} onClick={handleCloseConfirmModal}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={styles.closeButton}
              onClick={handleCloseConfirmModal}
            >
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
                <span className={styles.detailValue}>{classData?.duration}</span>
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

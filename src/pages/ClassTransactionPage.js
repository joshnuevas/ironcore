import React, { useState, useEffect } from "react";
import { Calendar, Clock, Users, AlertCircle } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import styles from "./ClassTransactionPage.module.css";
import axios from "axios";

const ClassTransactionPage = ({ onLogout }) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [duplicateEnrollmentInfo, setDuplicateEnrollmentInfo] = useState(null);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [userError, setUserError] = useState(null);
  const [loadingSchedules, setLoadingSchedules] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Class data passed from previous page
  const classData = location.state?.classData;

  const classPrice = parseInt(classData.price.replace(/[₱,]/g, ""));
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

  // Check for active enrollment before proceeding
  const handleEnrollNow = async () => {
    if (!selectedSchedule) return alert("Please select a schedule first");
    if (!currentUser) return alert("User info not loaded");

    try {
      // Check if user already has an active enrollment for this class
      const response = await axios.get(
        "http://localhost:8080/api/transactions/check-active-enrollment",
        {
          params: {
            userId: currentUser.id,
            classId: classData.id,
          },
          withCredentials: true,
        }
      );

      if (response.data.hasActiveEnrollment) {
        // User already has an active enrollment
        setDuplicateEnrollmentInfo(response.data);
        setShowDuplicateModal(true);
      } else {
        // No active enrollment, proceed to confirmation
        setShowConfirmModal(true);
      }
    } catch (error) {
      console.error("Error checking enrollment:", error);
      alert("Failed to verify enrollment status. Please try again.");
    }
  };

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
        navigate("/gcash-payment", {
          state: {
            plan: `${classData.name} - ${selectedSchedule.day} ${selectedSchedule.time}`,
            amount: total,
            transactionId: response.data.id,
          },
        });
      }
    } catch (error) {
      console.error("Error saving transaction:", error);
      alert(`Failed to save enrollment: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleCloseModal = () => setShowConfirmModal(false);
  const handleCloseDuplicateModal = () => setShowDuplicateModal(false);

  if (userLoading) {
    return (
      <div className={styles.transactionContainer}>
        <Navbar activeNav="CLASSES" onLogout={onLogout} />
        <div className={styles.contentSection}>
          <div className={styles.loadingMessage}>Loading user information...</div>
        </div>
      </div>
    );
  }

  if (userError) {
    return (
      <div className={styles.transactionContainer}>
        <Navbar activeNav="CLASSES" onLogout={onLogout} />
        <div className={styles.contentSection}>
          <div className={styles.errorMessage}>{userError}</div>
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
            <p className={styles.subtitle}>Select your preferred schedule and complete enrollment</p>
          </div>

          <div className={styles.checkoutGrid}>
            {/* Class Summary */}
            <div className={styles.summaryCard}>
              <h2 className={styles.summaryTitle}>Class Summary</h2>
              <div className={styles.classDetails}>
                <div className={styles.classHeader}>
                  <span className={styles.classIcon}>{classData.icon}</span>
                  <div>
                    <h3 className={styles.className}>{classData.name}</h3>
                    <p className={styles.classDescription}>{classData.description}</p>
                  </div>
                </div>

                <div className={styles.classInfo}>
                  <div className={styles.infoItem}>
                    <Clock className={styles.infoIcon} />
                    <span>{classData.duration}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <Users className={styles.infoIcon} />
                    <span>Up to 15 people</span>
                  </div>
                </div>

                <div className={styles.priceBreakdown}>
                  <div className={styles.priceRow}>
                    <span>Class Fee</span>
                    <span>{classData.price}</span>
                  </div>
                  <div className={styles.priceRow}>
                    <span>Processing Fee</span>
                    <span>₱{processingFee}</span>
                  </div>
                  <div className={styles.totalRow}>
                    <span>Total</span>
                    <span className={styles.totalPrice}>₱{total}</span>
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

            {/* Schedule Selection */}
            <div className={styles.scheduleCard}>
              <h2 className={styles.formTitle}>Select Your Schedule</h2>

              {loadingSchedules ? (
                <p>Loading schedules...</p>
              ) : schedules.length === 0 ? (
                <p>No schedules available yet.</p>
              ) : (
                <div className={styles.scheduleList}>
                  {schedules.map((schedule) => (
                    <div
                      key={schedule.id}
                      className={`${styles.scheduleOption} ${
                        selectedSchedule?.id === schedule.id
                          ? styles.scheduleSelected
                          : ""
                      }`}
                      onClick={() => setSelectedSchedule(schedule)}
                    >
                      <div className={styles.scheduleRadio}>
                        {selectedSchedule?.id === schedule.id && (
                          <div className={styles.scheduleRadioSelected}></div>
                        )}
                      </div>
                      <div className={styles.scheduleInfo}>
                        <div className={styles.scheduleTop}>
                          <span className={styles.scheduleDay}>{schedule.day}</span>
                          <span className={styles.scheduleSlots}>
                            {schedule.maxParticipants - schedule.currentParticipants} slots left
                          </span>
                        </div>
                        <div className={styles.scheduleTime}>{schedule.time}</div>
                        <div className={styles.scheduleDate}>
                          <Calendar size={14} /> {schedule.date}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {currentUser && (
                <div className={styles.userInfoCard}>
                  <h3 className={styles.userInfoTitle}>Your Information</h3>
                  <div className={styles.userInfoList}>
                    <div className={styles.userInfoItem}>
                      <span className={styles.userInfoLabel}>Name:</span>
                      <span className={styles.userInfoValue}>{currentUser.username}</span>
                    </div>
                    <div className={styles.userInfoItem}>
                      <span className={styles.userInfoLabel}>Email:</span>
                      <span className={styles.userInfoValue}>{currentUser.email}</span>
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

      {/* Duplicate Enrollment Warning Modal */}
      {showDuplicateModal && duplicateEnrollmentInfo && (
        <div className={styles.modalOverlay} onClick={handleCloseDuplicateModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={handleCloseDuplicateModal}>
              ×
            </button>
            
            <div className={styles.warningHeader}>
              <AlertCircle className={styles.warningIcon} size={48} />
              <h2 className={styles.modalTitle}>Active Enrollment Found</h2>
            </div>
            
            <p className={styles.warningMessage}>
              You already have an upcoming or ongoing class enrollment for <strong>{duplicateEnrollmentInfo.className}</strong>.
            </p>

            <div className={styles.modalDetails}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Schedule:</span>
                <span className={styles.detailValue}>
                  {duplicateEnrollmentInfo.scheduleDay}, {duplicateEnrollmentInfo.scheduleTime}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Date:</span>
                <span className={styles.detailValue}>{duplicateEnrollmentInfo.scheduleDate}</span>
              </div>
            </div>

            <div className={styles.warningNote}>
              <p>Please complete your current session before enrolling in a new one.</p>
            </div>

            <button onClick={handleCloseDuplicateModal} className={styles.okButton}>
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && selectedSchedule && currentUser && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={handleCloseModal}>
              ×
            </button>
            <h2 className={styles.modalTitle}>Confirm Enrollment</h2>
            <p className={styles.modalSubtitle}>Please verify your class details</p>

            <div className={styles.modalDetails}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Schedule:</span>
                <span className={styles.detailValue}>
                  {selectedSchedule.day}, {selectedSchedule.time}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Date:</span>
                <span className={styles.detailValue}>{selectedSchedule.date}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Duration:</span>
                <span className={styles.detailValue}>{classData.duration}</span>
              </div>

              <div className={styles.divider}></div>

              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Total Payment:</span>
                <span className={styles.totalValue}>₱{total}</span>
              </div>
            </div>

            <button onClick={handleConfirmPayment} className={styles.confirmButton}>
              Confirm and go to payment
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassTransactionPage;
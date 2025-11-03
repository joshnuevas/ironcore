import React, { useState, useEffect } from "react";
import { Calendar, Clock, Users } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import styles from "./ClassTransactionPage.module.css";
import axios from "axios";

const ClassTransactionPage = ({ onLogout }) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [userError, setUserError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Get class data from navigation state
  const classData = location.state?.classData || {
    name: "HIIT Training",
    icon: "🔥",
    description: "High-Intensity Interval Training",
    price: "₱500",
    duration: "45 mins",
    maxParticipants: 15,
    id: 1,
  };

  const schedules = [
    { id: 1, day: "Monday", time: "6:00 AM - 6:45 AM", date: "Nov 04, 2025", slots: 12 },
    { id: 2, day: "Monday", time: "6:00 PM - 6:45 PM", date: "Nov 04, 2025", slots: 8 },
    { id: 3, day: "Wednesday", time: "6:00 AM - 6:45 AM", date: "Nov 06, 2025", slots: 10 },
    { id: 4, day: "Wednesday", time: "6:00 PM - 6:45 PM", date: "Nov 06, 2025", slots: 15 },
    { id: 5, day: "Friday", time: "6:00 AM - 6:45 AM", date: "Nov 08, 2025", slots: 7 },
    { id: 6, day: "Friday", time: "6:00 PM - 6:45 PM", date: "Nov 08, 2025", slots: 11 },
  ];

  const classPrice = parseInt(classData.price.replace(/[₱,]/g, ""));
  const processingFee = 20;
  const total = classPrice + processingFee;

  // Fetch the logged-in user dynamically
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        setUserLoading(true);
        const res = await axios.get("http://localhost:8080/api/users/me", {
          withCredentials: true, // Important for session/cookie auth
        });
        setCurrentUser(res.data);
        setUserError(null);
      } catch (error) {
        console.error("Failed to fetch current user:", error);
        setUserError("Failed to load user information. Please log in again.");
        // Optionally redirect to login if user is not authenticated
        // navigate("/login");
      } finally {
        setUserLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  const handleEnrollNow = () => {
    if (!selectedSchedule) {
      alert("Please select a schedule first");
      return;
    }
    if (!currentUser) {
      alert("User information not loaded. Please try again.");
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirmPayment = async () => {
    if (!selectedSchedule || !currentUser) {
      alert("Missing required information");
      return;
    }

    try {
      const payload = {
        userId: currentUser.id, // Dynamic user ID from logged-in user
        classId: 1,
        scheduleId: selectedSchedule.id,
        processingFee: processingFee,
        totalAmount: total,
        paymentMethod: "GCash",
        paymentStatus: "PENDING",
      };

      console.log("=== SENDING PAYLOAD ===", payload);

      const response = await axios.post(
        "http://localhost:8080/api/transactions",
        payload,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      console.log("=== RESPONSE ===", response);

      if (response.status === 200 || response.status === 201) {
        alert("Enrollment saved! Redirecting to payment...");
        navigate("/gcash-payment", {
          state: {
            plan: `${classData.name} - ${selectedSchedule.day} ${selectedSchedule.time}`,
            amount: total,
          },
        });
      }
    } catch (error) {
      console.error("=== FULL ERROR ===", error);
      alert(`Failed to save enrollment.\nError: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleCloseModal = () => setShowConfirmModal(false);

  // Show loading state
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

  // Show error state
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
                    <span>Max {classData.maxParticipants} people</span>
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
                      : "Select Schedule First"
                  }
                </button>
              </div>
            </div>

            {/* Schedule Selection */}
            <div className={styles.scheduleCard}>
              <h2 className={styles.formTitle}>Select Your Schedule</h2>
              <div className={styles.scheduleList}>
                {schedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className={`${styles.scheduleOption} ${
                      selectedSchedule?.id === schedule.id ? styles.scheduleSelected : ""
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
                        <span className={styles.scheduleSlots}>{schedule.slots} slots left</span>
                      </div>
                      <div className={styles.scheduleTime}>{schedule.time}</div>
                      <div className={styles.scheduleDate}>
                        <Calendar size={14} /> {schedule.date}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

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
              <div className={styles.modalSection}>
                <div className={styles.classDisplay}>
                  <span className={styles.classIconLarge}>{classData.icon}</span>
                  <div>
                    <h3 className={styles.modalClassName}>{classData.name}</h3>
                    <p className={styles.modalClassDescription}>{classData.description}</p>
                  </div>
                </div>
              </div>

              <div className={styles.divider}></div>

              <div className={styles.modalSection}>
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
              </div>

              <div className={styles.divider}></div>

              <div className={styles.modalSection}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Name:</span>
                  <span className={styles.detailValue}>{currentUser.name}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Email:</span>
                  <span className={styles.detailValue}>{currentUser.email}</span>
                </div>
              </div>

              <div className={styles.divider}></div>

              <div className={styles.modalSection}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Pay with:</span>
                  <span className={styles.detailValue}>
                    <span className={styles.gcashBadge}>💳 GCash</span>
                  </span>
                </div>
              </div>

              <div className={styles.divider}></div>

              <div className={styles.modalSection}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Class Fee:</span>
                  <span className={styles.detailValue}>₱{classPrice}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Processing Fee:</span>
                  <span className={styles.detailValue}>₱{processingFee}</span>
                </div>
                <div className={styles.totalDetailRow}>
                  <span className={styles.totalLabel}>Total Payment</span>
                  <span className={styles.totalValue}>₱{total}</span>
                </div>
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
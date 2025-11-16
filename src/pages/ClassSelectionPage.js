import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Calendar, CheckCircle, AlertCircle, X } from "lucide-react";
import Navbar from "../components/Navbar";
import styles from "./ClassSelectionPage.module.css";
import axios from "axios";

const ClassSelectionPage = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Get membership details from payment page
  const membershipData = location.state || {};
  const { membershipType, transactionId } = membershipData;

  // Define class limits based on membership
  const classLimits = {
    SILVER: 3,
    GOLD: 5,
    PLATINUM: Infinity,
  };

  const maxClasses = classLimits[membershipType] || 0;
  const isUnlimited = membershipType === "PLATINUM";

  // Available classes
  const availableClasses = [
    { id: 1, name: "HIIT", icon: "🔥", description: "High-Intensity Interval Training" },
    { id: 2, name: "ZUMBA", icon: "💃", description: "Dance-based cardio workout" },
    { id: 3, name: "SPIN", icon: "🚴", description: "High-energy cycling workout" },
    { id: 4, name: "YOGA", icon: "🧘", description: "Mindful movement and flexibility" },
    { id: 5, name: "PILATES", icon: "💪", description: "Core strengthening training" },
    { id: 6, name: "BOXING", icon: "🥊", description: "Cardio boxing and strength training" },
  ];

  useEffect(() => {
    // Validate that user came from payment page
    if (!membershipType || !transactionId) {
      alert("Invalid access. Redirecting to home.");
      navigate("/landing");
      return;
    }

    // Fetch current user
    const fetchUser = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/users/me", {
          withCredentials: true,
        });
        setCurrentUser(res.data);
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    };

    fetchUser();
  }, [membershipType, transactionId, navigate]);

  const handleClassToggle = (classItem) => {
    if (isUnlimited) {
      // For unlimited, just toggle
      if (selectedClasses.find((c) => c.id === classItem.id)) {
        setSelectedClasses(selectedClasses.filter((c) => c.id !== classItem.id));
      } else {
        setSelectedClasses([...selectedClasses, classItem]);
      }
    } else {
      // For limited, check limit
      if (selectedClasses.find((c) => c.id === classItem.id)) {
        setSelectedClasses(selectedClasses.filter((c) => c.id !== classItem.id));
      } else if (selectedClasses.length < maxClasses) {
        setSelectedClasses([...selectedClasses, classItem]);
      }
    }
  };

  const handleConfirm = () => {
    if (selectedClasses.length === 0) {
      alert("Please select at least one class");
      return;
    }

    if (!isUnlimited && selectedClasses.length < maxClasses) {
      alert(`Please select all ${maxClasses} classes for your ${membershipType} membership`);
      return;
    }

    setShowConfirmModal(true);
  };

  // ⭐ RESTORED: Original backend endpoint
  const handleFinalConfirm = async () => {
    setIsSubmitting(true);

    try {
      // Save selected classes to backend
      const payload = {
        userId: currentUser.id,
        membershipTransactionId: transactionId,
        classIds: selectedClasses.map((c) => c.id),
      };

      console.log("Sending payload:", payload); // Debug

      await axios.post(
        "http://localhost:8080/api/membership-classes/assign",
        payload,
        { withCredentials: true }
      );

      // Success - navigate to landing page
      navigate("/landing");
    } catch (error) {
      console.error("Failed to save class selections:", error);
      console.error("Error response:", error.response?.data);
      alert(`Failed to save your selections. ${error.response?.data?.message || "Please try again."}`);
      setIsSubmitting(false);
    }
  };

  const isSelected = (classId) => {
    return selectedClasses.find((c) => c.id === classId) !== undefined;
  };

  const canSelectMore = isUnlimited || selectedClasses.length < maxClasses;

  return (
    <div className={styles.selectionContainer}>
      {/* Background */}
      <div className={styles.backgroundOverlay}>
        <div className={`${styles.bgBlur} ${styles.bgBlur1}`}></div>
        <div className={`${styles.bgBlur} ${styles.bgBlur2}`}></div>
        <div className={`${styles.bgBlur} ${styles.bgBlur3}`}></div>
      </div>

      <Navbar activeNav="MEMBERSHIP" onLogout={onLogout} />

      <div className={styles.contentSection}>
        <div className={styles.contentContainer}>
          {/* Header */}
          <div className={styles.header}>
            <h1 className={styles.title}>SELECT YOUR CLASSES</h1>
            <p className={styles.subtitle}>
              {isUnlimited
                ? "You have unlimited access! Select all the classes you want."
                : `Choose ${maxClasses} classes included in your ${membershipType} membership`}
            </p>
            <div className={styles.selectionCounter}>
              <span className={styles.counterText}>
                {selectedClasses.length} / {isUnlimited ? "∞" : maxClasses} Selected
              </span>
            </div>
          </div>

          {/* Classes Grid */}
          <div className={styles.classesGrid}>
            {availableClasses.map((classItem, index) => {
              const selected = isSelected(classItem.id);
              const disabled = !selected && !canSelectMore;

              return (
                <div
                  key={classItem.id}
                  className={`${styles.classCard} ${selected ? styles.classCardSelected : ""} ${
                    disabled ? styles.classCardDisabled : ""
                  }`}
                  onClick={() => !disabled && handleClassToggle(classItem)}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={styles.classIcon}>{classItem.icon}</div>
                  <h3 className={styles.className}>{classItem.name}</h3>
                  <p className={styles.classDescription}>{classItem.description}</p>

                  {selected && (
                    <div className={styles.selectedBadge}>
                      <CheckCircle size={20} />
                      <span>Selected</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Confirm Button */}
          <div className={styles.confirmSection}>
            <button onClick={handleConfirm} className={styles.confirmButton}>
              Confirm Selection
            </button>
            <p className={styles.warningText}>
              <AlertCircle size={16} />
              You cannot change your selection later
            </p>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className={styles.modalOverlay} onClick={() => !isSubmitting && setShowConfirmModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button
              className={styles.closeButton}
              onClick={() => setShowConfirmModal(false)}
              disabled={isSubmitting}
            >
              <X size={24} />
            </button>

            <div className={styles.modalIcon}>
              <AlertCircle size={64} />
            </div>

            <h2 className={styles.modalTitle}>Confirm Your Selection?</h2>
            <p className={styles.modalMessage}>
              You have selected <strong>{selectedClasses.length} classes</strong>. Once confirmed, you
              cannot change your selection later.
            </p>

            <div className={styles.selectedList}>
              {selectedClasses.map((classItem) => (
                <div key={classItem.id} className={styles.selectedItem}>
                  <span className={styles.selectedIcon}>{classItem.icon}</span>
                  <span className={styles.selectedName}>{classItem.name}</span>
                </div>
              ))}
            </div>

            <div className={styles.modalButtons}>
              <button
                onClick={() => setShowConfirmModal(false)}
                className={styles.cancelButton}
                disabled={isSubmitting}
              >
                Go Back
              </button>
              <button
                onClick={handleFinalConfirm}
                className={styles.proceedButton}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassSelectionPage;
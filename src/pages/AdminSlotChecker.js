import React, { useState, useEffect } from "react";
import { Users, TrendingUp, AlertCircle, CheckCircle, Edit2, Eye, X, ArrowLeft } from "lucide-react";
import styles from "./AdminSlotChecker.module.css";
import Navbar from "../components/Navbar";
import axios from "axios";

const AdminSlotChecker = ({ onLogout }) => {
  const [schedules, setSchedules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [newMaxParticipants, setNewMaxParticipants] = useState("");
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(null);
  
  // Modal states
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [enrolledUsers, setEnrolledUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [removeError, setRemoveError] = useState(null);

  // ⭐ NEW: Confirmation modal states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [userToRemove, setUserToRemove] = useState(null);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("http://localhost:8080/api/schedules", {
        withCredentials: true,
      });
      setSchedules(response.data);
    } catch (error) {
      console.error("Failed to fetch schedules:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEnrolledUsers = async (scheduleId) => {
    try {
      setLoadingUsers(true);
      const response = await axios.get(
        `http://localhost:8080/api/admin/schedules/${scheduleId}/users`,
        { withCredentials: true }
      );
      setEnrolledUsers(response.data);
    } catch (error) {
      console.error("Failed to fetch enrolled users:", error);
      setRemoveError("Failed to load enrolled users");
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleViewUsers = async (schedule) => {
    setSelectedSchedule(schedule);
    setShowUsersModal(true);
    setRemoveError(null);
    await fetchEnrolledUsers(schedule.id);
  };

  // ⭐ NEW: Show confirmation modal
  const handleRemoveUser = (user) => {
    setUserToRemove(user);
    setShowConfirmModal(true);
    setRemoveError(null);
  };

  // ⭐ NEW: Confirm removal
  const handleConfirmRemoval = async () => {
    if (!userToRemove) return;

    try {
      setIsRemoving(true);
      setRemoveError(null);
      
      await axios.put(
        `http://localhost:8080/api/admin/schedules/${selectedSchedule.id}/users/${userToRemove.enrollmentId}/complete`,
        {},
        { withCredentials: true }
      );

      // Refresh data without page reload
      await fetchEnrolledUsers(selectedSchedule.id);
      await fetchSchedules();

      setSaveSuccess("Session marked as completed successfully");
      setTimeout(() => setSaveSuccess(null), 3000);

      // Close confirmation modal
      setShowConfirmModal(false);
      setUserToRemove(null);
    } catch (error) {
      console.error("Failed to complete session:", error);
      setRemoveError(error.response?.data?.message || "Failed to mark session as completed");
    } finally {
      setIsRemoving(false);
    }
  };

  // ⭐ NEW: Cancel removal
  const handleCancelRemoval = () => {
    setShowConfirmModal(false);
    setUserToRemove(null);
    setRemoveError(null);
  };

  const handleCloseModal = () => {
    setShowUsersModal(false);
    setSelectedSchedule(null);
    setEnrolledUsers([]);
    setRemoveError(null);
  };

  const handleEditSlots = (schedule) => {
    setEditingId(schedule.id);
    setNewMaxParticipants(schedule.maxParticipants);
    setSaveError(null);
    setSaveSuccess(null);
  };

  const handleSaveSlots = async (scheduleId) => {
    try {
      setSaveError(null);
      setSaveSuccess(null);

      const maxParticipants = parseInt(newMaxParticipants);
      
      if (!newMaxParticipants || isNaN(maxParticipants)) {
        setSaveError("Please enter a valid number");
        return;
      }

      if (maxParticipants < 1) {
        setSaveError("Max participants must be at least 1");
        return;
      }

      const currentSchedule = schedules.find(s => s.id === scheduleId);
      if (maxParticipants < currentSchedule.enrolledCount) {
        setSaveError(`Cannot set max participants below current enrollment (${currentSchedule.enrolledCount})`);
        return;
      }

      const scheduleToUpdate = schedules.find(s => s.id === scheduleId);

      await axios.put(
        `http://localhost:8080/api/schedules/${scheduleId}`,
        {
          day: scheduleToUpdate.day,
          timeSlot: scheduleToUpdate.timeSlot,
          date: scheduleToUpdate.date,
          maxParticipants: maxParticipants,
        },
        { withCredentials: true }
      );

      setSchedules(prevSchedules =>
        prevSchedules.map(schedule =>
          schedule.id === scheduleId
            ? { ...schedule, maxParticipants: maxParticipants }
            : schedule
        )
      );

      setSaveSuccess(`Successfully updated max participants to ${maxParticipants}`);
      setEditingId(null);
      setNewMaxParticipants("");

      setTimeout(() => setSaveSuccess(null), 3000);

    } catch (error) {
      console.error("Failed to save slots:", error);
      setSaveError(error.response?.data?.message || "Failed to update. Please try again.");
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNewMaxParticipants("");
    setSaveError(null);
  };

  const getUtilizationPercentage = (enrolled, max) => {
    return Math.round((enrolled / max) * 100);
  };

  const getUtilizationStatus = (percentage) => {
    if (percentage >= 90) return "critical";
    if (percentage >= 70) return "warning";
    return "good";
  };

  if (isLoading) {
    return (
      <div className={styles.pageContainer}>
        <Navbar activeNav="ADMIN" onLogout={onLogout} />
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading slot information...</p>
        </div>
      </div>
    );
  }

  const totalSlots = schedules.reduce((sum, s) => sum + s.maxParticipants, 0);
  const totalEnrolled = schedules.reduce((sum, s) => sum + s.enrolledCount, 0);
  const fullSchedules = schedules.filter(s => s.enrolledCount >= s.maxParticipants).length;
  const overallUtilization = totalSlots > 0 ? Math.round((totalEnrolled / totalSlots) * 100) : 0;

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
            <h1 className={styles.title}>SLOT CHECKER</h1>
            <p className={styles.subtitle}>Monitor and manage class capacity</p>
          </div>

          {/* Messages */}
          {saveSuccess && (
            <div className={styles.successMessage}>
              <CheckCircle size={20} />
              <span>{saveSuccess}</span>
            </div>
          )}
          {saveError && (
            <div className={styles.errorMessage}>
              <AlertCircle size={20} />
              <span>{saveError}</span>
            </div>
          )}

          {/* Statistics Grid */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <Users />
              </div>
              <div className={styles.statContent}>
                <h3 className={styles.statLabel}>Total Capacity</h3>
                <p className={styles.statValue}>{totalSlots}</p>
                <span className={styles.statSubtext}>slots available</span>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <CheckCircle />
              </div>
              <div className={styles.statContent}>
                <h3 className={styles.statLabel}>Total Enrolled</h3>
                <p className={styles.statValue}>{totalEnrolled}</p>
                <span className={styles.statSubtext}>members booked</span>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <TrendingUp />
              </div>
              <div className={styles.statContent}>
                <h3 className={styles.statLabel}>Utilization Rate</h3>
                <p className={styles.statValue}>{overallUtilization}%</p>
                <span className={styles.statSubtext}>overall capacity</span>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <AlertCircle />
              </div>
              <div className={styles.statContent}>
                <h3 className={styles.statLabel}>Full Classes</h3>
                <p className={styles.statValue}>{fullSchedules}</p>
                <span className={styles.statSubtext}>at max capacity</span>
              </div>
            </div>
          </div>

          {/* Table Card */}
          <div className={styles.tableCard}>
            <div className={styles.tableHeader}>
              <h2 className={styles.tableTitle}>Schedule Capacity</h2>
            </div>

            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.th}>Class</th>
                    <th className={styles.th}>Day</th>
                    <th className={styles.th}>Time</th>
                    <th className={styles.th}>Enrolled</th>
                    <th className={styles.th}>Max Slots</th>
                    <th className={styles.th}>Utilization</th>
                    <th className={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {schedules.map((schedule) => {
                    const utilizationPct = getUtilizationPercentage(
                      schedule.enrolledCount,
                      schedule.maxParticipants
                    );
                    const status = getUtilizationStatus(utilizationPct);
                    const isEditing = editingId === schedule.id;

                    return (
                      <tr key={schedule.id} className={styles.tr}>
                        <td className={styles.td}>
                          <span className={styles.classCell}>
                            {schedule.classEntity?.name || "Unnamed"}
                          </span>
                        </td>
                        <td className={styles.td}>{schedule.day}</td>
                        <td className={styles.td}>{schedule.timeSlot}</td>
                        <td className={styles.td}>
                          <span className={styles.enrolledCount}>
                            {schedule.enrolledCount}
                          </span>
                        </td>
                        <td className={styles.td}>
                          {isEditing ? (
                            <input
                              type="number"
                              value={newMaxParticipants}
                              onChange={(e) => setNewMaxParticipants(e.target.value)}
                              className={styles.slotInput}
                              min={schedule.enrolledCount}
                              placeholder="Enter max slots"
                            />
                          ) : (
                            <span className={styles.maxSlots}>
                              {schedule.maxParticipants}
                            </span>
                          )}
                        </td>
                        <td className={styles.td}>
                          <div className={styles.utilizationCell}>
                            <div className={styles.progressBar}>
                              <div
                                className={`${styles.progressFill} ${styles[status]}`}
                                style={{ width: `${utilizationPct}%` }}
                              ></div>
                            </div>
                            <span className={`${styles.percentageText} ${styles[status]}`}>
                              {utilizationPct}%
                            </span>
                          </div>
                        </td>
                        <td className={styles.td}>
                          <div className={styles.actionButtons}>
                            {isEditing ? (
                              <>
                                <button
                                  onClick={() => handleSaveSlots(schedule.id)}
                                  className={styles.saveBtn}
                                >
                                  Save
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className={styles.cancelBtn}
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleViewUsers(schedule)}
                                  className={styles.viewBtn}
                                  title="View enrolled users"
                                >
                                  <Eye size={16} />
                                </button>
                                <button
                                  onClick={() => handleEditSlots(schedule)}
                                  className={styles.editBtn}
                                  title="Edit max slots"
                                >
                                  <Edit2 size={16} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Legend */}
          <div className={styles.legend}>
            <h3 className={styles.legendTitle}>Utilization Status</h3>
            <div className={styles.legendItems}>
              <div className={styles.legendItem}>
                <div className={`${styles.legendDot} ${styles.good}`}></div>
                <span>Good (&lt; 70%)</span>
              </div>
              <div className={styles.legendItem}>
                <div className={`${styles.legendDot} ${styles.warning}`}></div>
                <span>Warning (70-89%)</span>
              </div>
              <div className={styles.legendItem}>
                <div className={`${styles.legendDot} ${styles.critical}`}></div>
                <span>Critical (≥ 90%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Users Modal */}
      {showUsersModal && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h2 className={styles.modalTitle}>Enrolled Users</h2>
                <p className={styles.modalSubtitle}>
                  {selectedSchedule?.classEntity?.name} - {selectedSchedule?.day} {selectedSchedule?.timeSlot}
                </p>
              </div>
              <button onClick={handleCloseModal} className={styles.closeBtn}>
                <X size={24} />
              </button>
            </div>

            {removeError && (
              <div className={styles.modalError}>
                <AlertCircle size={20} />
                <span>{removeError}</span>
              </div>
            )}

            <div className={styles.modalBody}>
              {loadingUsers ? (
                <div className={styles.loadingContainer}>
                  <div className={styles.spinner}></div>
                  <p>Loading users...</p>
                </div>
              ) : enrolledUsers.length === 0 ? (
                <div className={styles.emptyState}>
                  <Users size={48} className={styles.emptyIcon} />
                  <p>No users enrolled in this schedule yet</p>
                </div>
              ) : (
                <div className={styles.usersList}>
                  {enrolledUsers.map((user) => (
                    <div key={user.transactionId} className={styles.userCard}>
                      <div className={styles.userInfo}>
                        <div className={styles.userAvatar}>
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className={styles.userName}>{user.username}</h4>
                          <p className={styles.userEmail}>{user.email}</p>
                          <p className={styles.transactionCode}>
                            Transaction: {user.transactionCode}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveUser(user)}
                        className={styles.removeBtn}
                        title="Mark session as completed"
                      >
                        <CheckCircle size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ⭐ NEW: Confirmation Modal */}
      {showConfirmModal && userToRemove && (
        <div className={styles.confirmOverlay} onClick={handleCancelRemoval}>
          <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.confirmIcon}>
              <CheckCircle size={48} />
            </div>
            <h2 className={styles.confirmTitle}>Complete Session?</h2>
            <p className={styles.confirmMessage}>
              Mark <strong>{userToRemove.username}'s</strong> session as completed? 
              This will free up the slot for new enrollments.
            </p>
            <div className={styles.confirmDetails}>
              <p className={styles.confirmEmail}>{userToRemove.email}</p>
              <p className={styles.confirmTransaction}>Transaction: {userToRemove.transactionCode}</p>
            </div>
            <div className={styles.confirmButtons}>
              <button
                onClick={handleConfirmRemoval}
                className={styles.confirmBtn}
                disabled={isRemoving}
              >
                {isRemoving ? "Completing..." : "Yes, Complete Session"}
              </button>
              <button
                onClick={handleCancelRemoval}
                className={styles.confirmCancelBtn}
                disabled={isRemoving}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSlotChecker;
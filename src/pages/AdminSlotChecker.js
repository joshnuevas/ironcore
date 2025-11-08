import React, { useState, useEffect } from "react";
import { Users, TrendingUp, AlertCircle, CheckCircle, Edit2 } from "lucide-react";
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

      // Validation
      const maxParticipants = parseInt(newMaxParticipants);
      
      if (!newMaxParticipants || isNaN(maxParticipants)) {
        setSaveError("Please enter a valid number");
        return;
      }

      if (maxParticipants < 1) {
        setSaveError("Max participants must be at least 1");
        return;
      }

      // Find the current schedule to check enrolled count
      const currentSchedule = schedules.find(s => s.id === scheduleId);
      if (maxParticipants < currentSchedule.enrolledCount) {
        setSaveError(`Cannot set max participants below current enrollment (${currentSchedule.enrolledCount})`);
        return;
      }

      // Get the current schedule data
      const scheduleToUpdate = schedules.find(s => s.id === scheduleId);

      // Send update request
      const response = await axios.put(
        `http://localhost:8080/api/schedules/${scheduleId}`,
        {
          day: scheduleToUpdate.day,
          timeSlot: scheduleToUpdate.timeSlot,
          date: scheduleToUpdate.date,
          maxParticipants: maxParticipants,
        },
        { withCredentials: true }
      );

      // Update local state with the new data
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

      // Clear success message after 3 seconds
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

  // Calculate statistics
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
          {/* Header */}
          <div className={styles.headerSection}>
            <h1 className={styles.title}>SLOT CHECKER</h1>
            <p className={styles.subtitle}>Monitor and adjust class capacity</p>
          </div>

          {/* Success/Error Messages */}
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

          {/* Statistics Cards */}
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

          {/* Schedules Table */}
          <div className={styles.tableCard}>
            <div className={styles.tableHeader}>
              <h2 className={styles.tableTitle}>Schedule Capacity</h2>
            </div>

            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Class</th>
                    <th>Day</th>
                    <th>Time</th>
                    <th>Enrolled</th>
                    <th>Max Slots</th>
                    <th>Utilization</th>
                    <th>Action</th>
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
                      <tr key={schedule.id}>
                        <td className={styles.classCell}>
                          <span className={styles.classIcon}>
                            {schedule.classEntity?.icon || "📘"}
                          </span>
                          {schedule.classEntity?.name || "Unnamed"}
                        </td>
                        <td>{schedule.day}</td>
                        <td>{schedule.timeSlot}</td>
                        <td>
                          <span className={styles.enrolledCount}>
                            {schedule.enrolledCount}
                          </span>
                        </td>
                        <td>
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
                        <td>
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
                        <td>
                          {isEditing ? (
                            <div className={styles.editActions}>
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
                            </div>
                          ) : (
                            <button
                              onClick={() => handleEditSlots(schedule)}
                              className={styles.editBtn}
                            >
                              <Edit2 size={16} />
                            </button>
                          )}
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
    </div>
  );
};

export default AdminSlotChecker;
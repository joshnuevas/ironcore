import React, { useState, useEffect } from "react";
import { Calendar, Clock, Users, Edit, Save, X } from "lucide-react";
import styles from "./AdminScheduleViewer.module.css";
import Navbar from "../components/Navbar";
import axios from "axios";

const AdminScheduleViewer = ({ onLogout }) => {
  const [schedules, setSchedules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("http://localhost:8080/api/schedules", {
        withCredentials: true,
      });
      
      // Group by class
      const grouped = response.data.reduce((acc, schedule) => {
        const className = schedule.classEntity.name;
        if (!acc[className]) {
          acc[className] = [];
        }
        acc[className].push(schedule);
        return acc;
      }, {});
      
      setSchedules(grouped);
    } catch (error) {
      console.error("Failed to fetch schedules:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (schedule) => {
    setEditingId(schedule.id);
    setEditForm({
      day: schedule.day,
      timeSlot: schedule.timeSlot,
      date: schedule.date,
    });
    setSaveError(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
    setSaveError(null);
  };

  const handleSave = async (scheduleId) => {
    try {
      setSaveError(null);
      
      // Validate inputs (removed maxParticipants validation)
      if (!editForm.day || !editForm.timeSlot || !editForm.date) {
        setSaveError("All fields are required");
        return;
      }

      // Get the current schedule to preserve maxParticipants
      let currentMaxParticipants;
      Object.values(schedules).forEach(classSchedules => {
        const schedule = classSchedules.find(s => s.id === scheduleId);
        if (schedule) {
          currentMaxParticipants = schedule.maxParticipants;
        }
      });

      const response = await axios.put(
        `http://localhost:8080/api/schedules/${scheduleId}`,
        {
          day: editForm.day,
          timeSlot: editForm.timeSlot,
          date: editForm.date,
          maxParticipants: currentMaxParticipants, // Keep existing value
        },
        { withCredentials: true }
      );

      // Update local state with the saved schedule
      setSchedules(prevSchedules => {
        const newSchedules = { ...prevSchedules };
        
        // Find and update the schedule in the grouped structure
        Object.keys(newSchedules).forEach(className => {
          const scheduleIndex = newSchedules[className].findIndex(s => s.id === scheduleId);
          if (scheduleIndex !== -1) {
            newSchedules[className][scheduleIndex] = {
              ...newSchedules[className][scheduleIndex],
              ...response.data,
            };
          }
        });
        
        return newSchedules;
      });

      setEditingId(null);
      setEditForm({});
    } catch (error) {
      console.error("Failed to save schedule:", error);
      setSaveError(error.response?.data?.message || "Failed to save changes. Please try again.");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Format date for input field (YYYY-MM-DD)
  const formatDateForInput = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  if (isLoading) {
    return (
      <div className={styles.pageContainer}>
        <Navbar activeNav="ADMIN" onLogout={onLogout} />
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading schedules...</p>
        </div>
      </div>
    );
  }

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
            <h1 className={styles.title}>SCHEDULE VIEWER</h1>
            <p className={styles.subtitle}>View and manage all class schedules</p>
          </div>

          {/* Schedules by Class */}
          {Object.keys(schedules).length === 0 ? (
            <div className={styles.emptyState}>
              <Calendar className={styles.emptyIcon} />
              <p>No schedules available</p>
            </div>
          ) : (
            <div className={styles.classesGrid}>
              {Object.entries(schedules).map(([className, classSchedules]) => (
                <div key={className} className={styles.classCard}>
                  <div className={styles.classHeader}>
                    <h2 className={styles.className}>{className}</h2>
                    <span className={styles.scheduleCount}>
                      {classSchedules.length} schedule{classSchedules.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className={styles.schedulesList}>
                    {classSchedules.map((schedule) => (
                      <div key={schedule.id} className={`${styles.scheduleItem} ${editingId === schedule.id ? styles.editing : ''}`}>
                        {editingId === schedule.id ? (
                          // Edit Mode
                          <div className={styles.editFormContainer}>
                            <div className={styles.editForm}>
                              <div className={styles.editRow}>
                                <label>Day:</label>
                                <select
                                  value={editForm.day}
                                  onChange={(e) => setEditForm({...editForm, day: e.target.value})}
                                  className={styles.editSelect}
                                >
                                  <option value="Monday">Monday</option>
                                  <option value="Tuesday">Tuesday</option>
                                  <option value="Wednesday">Wednesday</option>
                                  <option value="Thursday">Thursday</option>
                                  <option value="Friday">Friday</option>
                                  <option value="Saturday">Saturday</option>
                                  <option value="Sunday">Sunday</option>
                                </select>
                              </div>
                              <div className={styles.editRow}>
                                <label>Time:</label>
                                <input
                                  type="text"
                                  value={editForm.timeSlot}
                                  onChange={(e) => setEditForm({...editForm, timeSlot: e.target.value})}
                                  className={styles.editInput}
                                  placeholder="e.g., 9:00 AM - 10:00 AM"
                                />
                              </div>
                              <div className={styles.editRow}>
                                <label>Date:</label>
                                <input
                                  type="date"
                                  value={formatDateForInput(editForm.date)}
                                  onChange={(e) => setEditForm({...editForm, date: e.target.value})}
                                  className={styles.editInput}
                                />
                              </div>
                              {saveError && (
                                <div className={styles.errorMessage}>
                                  {saveError}
                                </div>
                              )}
                              <div className={styles.editActions}>
                                <button onClick={() => handleSave(schedule.id)} className={styles.saveBtn}>
                                  <Save size={16} /> Save
                                </button>
                                <button onClick={handleCancelEdit} className={styles.cancelBtn}>
                                  <X size={16} /> Cancel
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          // View Mode
                          <>
                            <div className={styles.scheduleInfo}>
                              <div className={styles.infoRow}>
                                <Calendar className={styles.infoIcon} />
                                <span>{schedule.day}</span>
                              </div>
                              <div className={styles.infoRow}>
                                <Clock className={styles.infoIcon} />
                                <span>{schedule.timeSlot}</span>
                              </div>
                              <div className={styles.infoRow}>
                                <Users className={styles.infoIcon} />
                                <span>
                                  {schedule.enrolledCount} / {schedule.maxParticipants} enrolled
                                </span>
                              </div>
                              <div className={styles.dateInfo}>
                                Next: {formatDate(schedule.date)}
                              </div>
                            </div>
                            <button
                              onClick={() => handleEdit(schedule)}
                              className={styles.editButton}
                            >
                              <Edit size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminScheduleViewer;
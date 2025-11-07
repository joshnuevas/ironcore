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
      maxParticipants: schedule.maxParticipants,
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSave = async (scheduleId) => {
    // TODO: Implement save functionality
    console.log("Saving schedule:", scheduleId, editForm);
    setEditingId(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
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
                      <div key={schedule.id} className={styles.scheduleItem}>
                        {editingId === schedule.id ? (
                          // Edit Mode
                          <div className={styles.editForm}>
                            <div className={styles.editRow}>
                              <label>Day:</label>
                              <input
                                type="text"
                                value={editForm.day}
                                onChange={(e) => setEditForm({...editForm, day: e.target.value})}
                                className={styles.editInput}
                              />
                            </div>
                            <div className={styles.editRow}>
                              <label>Time:</label>
                              <input
                                type="text"
                                value={editForm.timeSlot}
                                onChange={(e) => setEditForm({...editForm, timeSlot: e.target.value})}
                                className={styles.editInput}
                              />
                            </div>
                            <div className={styles.editRow}>
                              <label>Max Participants:</label>
                              <input
                                type="number"
                                value={editForm.maxParticipants}
                                onChange={(e) => setEditForm({...editForm, maxParticipants: e.target.value})}
                                className={styles.editInput}
                              />
                            </div>
                            <div className={styles.editActions}>
                              <button onClick={() => handleSave(schedule.id)} className={styles.saveBtn}>
                                <Save size={16} /> Save
                              </button>
                              <button onClick={handleCancelEdit} className={styles.cancelBtn}>
                                <X size={16} /> Cancel
                              </button>
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
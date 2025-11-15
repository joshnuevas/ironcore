import React, { useState, useEffect } from "react";
import { Calendar, Clock, Users, Edit, Save, X, ArrowLeft, Plus, Trash2 } from "lucide-react";
import styles from "./AdminScheduleViewer.module.css";
import Navbar from "../components/Navbar";
import axios from "axios";

// Helper function to generate time options
const generateTimeOptions = () => {
  const times = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      const period = hour < 12 ? 'AM' : 'PM';
      const minuteStr = minute.toString().padStart(2, '0');
      times.push(`${hour12}:${minuteStr} ${period}`);
    }
  }
  return times;
};

// Helper function to parse time slot
const parseTimeSlot = (timeSlot) => {
  const parts = timeSlot.split(' - ');
  return {
    start: parts[0]?.trim() || '9:00 AM',
    end: parts[1]?.trim() || '10:00 AM'
  };
};

const AdminScheduleViewer = ({ onLogout }) => {
  const [schedules, setSchedules] = useState([]);
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saveError, setSaveError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addingToClass, setAddingToClass] = useState(null);
  const [newScheduleForm, setNewScheduleForm] = useState({
    day: "Monday",
    timeSlot: "",
    date: "",
    maxParticipants: 15,
  });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  
  // Time picker states
  const [startTime, setStartTime] = useState('9:00 AM');
  const [endTime, setEndTime] = useState('10:00 AM');
  const [editStartTime, setEditStartTime] = useState('');
  const [editEndTime, setEditEndTime] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const schedulesRes = await axios.get("http://localhost:8080/api/schedules", { withCredentials: true });
      
      console.log("Fetched schedules:", schedulesRes.data);
      
      // Group schedules by class
      const grouped = schedulesRes.data.reduce((acc, schedule) => {
        const className = schedule.classEntity.name;
        if (!acc[className]) {
          acc[className] = {
            classId: schedule.classEntity.id,
            schedules: [],
          };
        }
        acc[className].schedules.push(schedule);
        return acc;
      }, {});
      
      console.log("Grouped schedules:", grouped);
      setSchedules(grouped);
      
      // Fetch classes for the add functionality
      try {
        const classesRes = await axios.get("http://localhost:8080/api/classes", { withCredentials: true });
        setClasses(classesRes.data);
      } catch (classError) {
        console.error("Failed to fetch classes:", classError);
      }
    } catch (error) {
      console.error("Failed to fetch schedules:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (schedule) => {
    setEditingId(schedule.id);
    const times = parseTimeSlot(schedule.timeSlot);
    setEditStartTime(times.start);
    setEditEndTime(times.end);
    setEditForm({
      day: schedule.day,
      timeSlot: schedule.timeSlot,
      date: schedule.date,
      maxParticipants: schedule.maxParticipants,
    });
    setSaveError(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
    setEditStartTime('');
    setEditEndTime('');
    setSaveError(null);
  };

  const handleSave = async (scheduleId) => {
    try {
      setSaveError(null);
      
      const timeSlot = `${editStartTime} - ${editEndTime}`;
      
      if (!editForm.day || !editStartTime || !editEndTime || !editForm.date || !editForm.maxParticipants) {
        setSaveError("All fields are required");
        return;
      }

      const response = await axios.put(
        `http://localhost:8080/api/schedules/${scheduleId}`,
        {
          day: editForm.day,
          timeSlot: timeSlot,
          date: editForm.date,
          maxParticipants: editForm.maxParticipants,
        },
        { withCredentials: true }
      );

      setSchedules(prevSchedules => {
        const newSchedules = { ...prevSchedules };
        Object.keys(newSchedules).forEach(className => {
          const scheduleIndex = newSchedules[className].schedules.findIndex(s => s.id === scheduleId);
          if (scheduleIndex !== -1) {
            newSchedules[className].schedules[scheduleIndex] = response.data;
          }
        });
        return newSchedules;
      });

      setEditingId(null);
      setEditForm({});
      setEditStartTime('');
      setEditEndTime('');
    } catch (error) {
      console.error("Failed to save schedule:", error);
      setSaveError(error.response?.data?.message || "Failed to save changes. Please try again.");
    }
  };

  const handleOpenAddModal = (className, classId) => {
    setAddingToClass({ name: className, id: classId });
    setStartTime('9:00 AM');
    setEndTime('10:00 AM');
    setNewScheduleForm({
      day: "Monday",
      timeSlot: "",
      date: "",
      maxParticipants: 15,
    });
    setShowAddModal(true);
    setSaveError(null);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setAddingToClass(null);
    setStartTime('9:00 AM');
    setEndTime('10:00 AM');
    setNewScheduleForm({
      day: "Monday",
      timeSlot: "",
      date: "",
      maxParticipants: 15,
    });
    setSaveError(null);
  };

  const handleAddSchedule = async () => {
    try {
      setSaveError(null);

      const timeSlot = `${startTime} - ${endTime}`;

      if (!startTime || !endTime || !newScheduleForm.date) {
        setSaveError("Time and date are required");
        return;
      }

      console.log("Sending request with data:", {
        classId: addingToClass.id,
        day: newScheduleForm.day,
        timeSlot: timeSlot,
        date: newScheduleForm.date,
        maxParticipants: newScheduleForm.maxParticipants,
      });

      const response = await axios({
        method: 'post',
        url: "http://localhost:8080/api/schedules",
        data: {
          classId: addingToClass.id,
          day: newScheduleForm.day,
          timeSlot: timeSlot,
          date: newScheduleForm.date,
          maxParticipants: newScheduleForm.maxParticipants,
        },
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log("Response:", response.data);

      setSchedules(prevSchedules => {
        const newSchedules = { ...prevSchedules };
        const className = addingToClass.name;
        
        if (!newSchedules[className]) {
          newSchedules[className] = {
            classId: addingToClass.id,
            schedules: [],
          };
        }
        
        const exists = newSchedules[className].schedules.some(s => s.id === response.data.id);
        
        if (!exists) {
          newSchedules[className] = {
            ...newSchedules[className],
            schedules: [...newSchedules[className].schedules, response.data]
          };
        }
        
        return newSchedules;
      });

      handleCloseAddModal();
    } catch (error) {
      console.error("Failed to add schedule:", error);
      console.error("Error response:", error.response);
      if (error.response?.status === 403) {
        setSaveError("Permission denied. Please check if you're logged in as admin.");
      } else {
        setSaveError(error.response?.data?.message || error.response?.data || "Failed to add schedule. Please try again.");
      }
    }
  };

  const handleDeleteClick = (schedule) => {
    if (schedule.enrolledCount > 0) {
      setSaveError("Cannot delete schedule with existing enrollments");
      setTimeout(() => setSaveError(null), 3000);
      return;
    }
    setDeleteConfirm(schedule.id);
  };

  const handleConfirmDelete = async (scheduleId) => {
    try {
      await axios.delete(
        `http://localhost:8080/api/schedules/${scheduleId}`,
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      setSchedules(prevSchedules => {
        const newSchedules = { ...prevSchedules };
        Object.keys(newSchedules).forEach(className => {
          newSchedules[className].schedules = newSchedules[className].schedules.filter(
            s => s.id !== scheduleId
          );
          if (newSchedules[className].schedules.length === 0) {
            delete newSchedules[className];
          }
        });
        return newSchedules;
      });

      setDeleteConfirm(null);
    } catch (error) {
      console.error("Failed to delete schedule:", error);
      if (error.response?.status === 403) {
        setSaveError("Authentication error. Please refresh the page and try again.");
      } else {
        setSaveError(error.response?.data?.message || "Failed to delete schedule.");
      }
      setTimeout(() => setSaveError(null), 3000);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

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
      <div className={styles.backgroundOverlay}>
        <div className={`${styles.bgBlur} ${styles.bgBlur1}`}></div>
        <div className={`${styles.bgBlur} ${styles.bgBlur2}`}></div>
        <div className={`${styles.bgBlur} ${styles.bgBlur3}`}></div>
      </div>

      <Navbar activeNav="ADMIN" onLogout={onLogout} />

      <div className={styles.contentSection}>
        <div className={styles.contentContainer}>
          <button
            onClick={() => window.location.href = '/admin'}
            className={styles.backButton}
          >
            <ArrowLeft className={styles.backIcon} />
            <span>Back to Admin Dashboard</span>
          </button>

          <div className={styles.headerSection}>
            <h1 className={styles.title}>SCHEDULE VIEWER</h1>
            <p className={styles.subtitle}>View and manage all class schedules</p>
          </div>

          {saveError && (
            <div className={styles.globalError}>
              {saveError}
            </div>
          )}

          {Object.keys(schedules).length === 0 ? (
            <div className={styles.emptyState}>
              <Calendar className={styles.emptyIcon} />
              <p>No schedules available</p>
            </div>
          ) : (
            <div className={styles.classesGrid}>
              {Object.entries(schedules).map(([className, classData]) => (
                <div key={className} className={styles.classCard}>
                  <div className={styles.classHeader}>
                    <h2 className={styles.className}>{className}</h2>
                    <div className={styles.classHeaderActions}>
                      <span className={styles.scheduleCount}>
                        {classData.schedules.length} schedule{classData.schedules.length !== 1 ? "s" : ""}
                      </span>
                      <button
                        onClick={() => handleOpenAddModal(className, classData.classId)}
                        className={styles.addScheduleBtn}
                        title="Add new schedule"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>

                  <div className={styles.schedulesList}>
                    {classData.schedules.map((schedule) => (
                      <div key={schedule.id} className={`${styles.scheduleItem} ${editingId === schedule.id ? styles.editing : ''}`}>
                        {editingId === schedule.id ? (
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
                                <label>Start:</label>
                                <select
                                  value={editStartTime}
                                  onChange={(e) => setEditStartTime(e.target.value)}
                                  className={styles.editSelect}
                                >
                                  {generateTimeOptions().map(time => (
                                    <option key={time} value={time}>{time}</option>
                                  ))}
                                </select>
                              </div>
                              <div className={styles.editRow}>
                                <label>End:</label>
                                <select
                                  value={editEndTime}
                                  onChange={(e) => setEditEndTime(e.target.value)}
                                  className={styles.editSelect}
                                >
                                  {generateTimeOptions().map(time => (
                                    <option key={time} value={time}>{time}</option>
                                  ))}
                                </select>
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
                              <div className={styles.editRow}>
                                <label>Max:</label>
                                <input
                                  type="number"
                                  min="1"
                                  value={editForm.maxParticipants}
                                  onChange={(e) => setEditForm({...editForm, maxParticipants: parseInt(e.target.value)})}
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
                        ) : deleteConfirm === schedule.id ? (
                          <div className={styles.deleteConfirmContainer}>
                            <p className={styles.deleteConfirmText}>Delete this schedule?</p>
                            <div className={styles.deleteConfirmActions}>
                              <button
                                onClick={() => handleConfirmDelete(schedule.id)}
                                className={styles.confirmDeleteBtn}
                              >
                                Yes, Delete
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className={styles.cancelDeleteBtn}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
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
                            <div className={styles.scheduleActions}>
                              <button
                                onClick={() => handleEdit(schedule)}
                                className={styles.editButton}
                                title="Edit schedule"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(schedule)}
                                className={styles.deleteButton}
                                title="Delete schedule"
                                disabled={schedule.enrolledCount > 0}
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
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

      {/* Add Schedule Modal */}
      {showAddModal && (
        <div className={styles.modalOverlay} onClick={handleCloseAddModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Add Schedule to {addingToClass?.name}</h2>
              <button onClick={handleCloseAddModal} className={styles.modalCloseBtn}>
                <X size={24} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>Day</label>
                <select
                  value={newScheduleForm.day}
                  onChange={(e) => setNewScheduleForm({...newScheduleForm, day: e.target.value})}
                  className={styles.formSelect}
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
              <div className={styles.formGroup}>
                <label>Start Time</label>
                <select
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className={styles.formSelect}
                >
                  {generateTimeOptions().map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>End Time</label>
                <select
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className={styles.formSelect}
                >
                  {generateTimeOptions().map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Date</label>
                <input
                  type="date"
                  value={newScheduleForm.date}
                  onChange={(e) => setNewScheduleForm({...newScheduleForm, date: e.target.value})}
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Max Participants</label>
                <input
                  type="number"
                  min="1"
                  value={newScheduleForm.maxParticipants}
                  onChange={(e) => setNewScheduleForm({...newScheduleForm, maxParticipants: parseInt(e.target.value)})}
                  className={styles.formInput}
                />
              </div>
              {saveError && (
                <div className={styles.errorMessage}>
                  {saveError}
                </div>
              )}
            </div>
            <div className={styles.modalFooter}>
              <button onClick={handleAddSchedule} className={styles.modalAddBtn}>
                <Plus size={18} /> Add Schedule
              </button>
              <button onClick={handleCloseAddModal} className={styles.modalCancelBtn}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminScheduleViewer;
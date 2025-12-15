import React, { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  Clock,
  Users,
  Edit,
  Save,
  X,
  ArrowLeft,
  Plus,
  Trash2,
} from "lucide-react";
import styles from "./AdminScheduleViewer.module.css";
import axios from "axios";

/** ===== Helpers ===== */

// Generate time options every 30 minutes
const generateTimeOptions = () => {
  const times = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      const period = hour < 12 ? "AM" : "PM";
      const minuteStr = minute.toString().padStart(2, "0");
      times.push(`${hour12}:${minuteStr} ${period}`);
    }
  }
  return times;
};

// Parse "9:00 AM - 10:00 AM"
const parseTimeSlot = (timeSlot) => {
  const parts = timeSlot?.split(" - ") || [];
  return {
    start: parts[0]?.trim() || "9:00 AM",
    end: parts[1]?.trim() || "10:00 AM",
  };
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// Ensure yyyy-MM-dd for <input type="date" />
const formatDateForInput = (dateString) => {
  if (!dateString) return "";
  // already yyyy-MM-dd
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;

  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
};

// yyyy-MM-dd -> weekday name (timezone-safe)
const getDayFromDate = (yyyyMmDd) => {
  if (!yyyyMmDd) return "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(yyyyMmDd)) return "";
  const d = new Date(`${yyyyMmDd}T00:00:00`);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { weekday: "long" });
};

// "7:30 PM" -> minutes from midnight
const toMinutes = (timeStr) => {
  const m = timeStr?.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return null;

  let hour = parseInt(m[1], 10);
  const minute = parseInt(m[2], 10);
  const period = m[3].toUpperCase();

  if (hour === 12) hour = 0;
  if (period === "PM") hour += 12;

  return hour * 60 + minute;
};

const validateMaxDuration = (start, end, maxMinutes = 180) => {
  const s = toMinutes(start);
  const e = toMinutes(end);

  if (s == null || e == null) return { ok: false, msg: "Invalid time format." };

  const diff = e - s;

  if (diff <= 0) {
    return {
      ok: false,
      msg: "End time must be AFTER start time (same-day only).",
    };
  }

  if (diff > maxMinutes) {
    return {
      ok: false,
      msg: `Schedule duration cannot exceed ${maxMinutes / 60} hours.`,
    };
  }

  return { ok: true, msg: "" };
};

const filterEndOptions = (allTimes, startTime, maxMinutes = 180) => {
  const s = toMinutes(startTime);
  if (s == null) return allTimes;

  return allTimes.filter((t) => {
    const e = toMinutes(t);
    if (e == null) return false;
    const diff = e - s;
    return diff > 0 && diff <= maxMinutes;
  });
};

/** ===== Component ===== */

const AdminScheduleViewer = ({ onLogout }) => {
  const [schedules, setSchedules] = useState({});
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    date: "",
    maxParticipants: 15,
  });
  const [editStartTime, setEditStartTime] = useState("");
  const [editEndTime, setEditEndTime] = useState("");

  const [saveError, setSaveError] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [addingToClass, setAddingToClass] = useState(null);

  const [startTime, setStartTime] = useState("9:00 AM");
  const [endTime, setEndTime] = useState("10:00 AM");
  const [newScheduleForm, setNewScheduleForm] = useState({
    date: "",
    maxParticipants: 15,
  });

  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Today (min for date inputs)
  const today = new Date().toISOString().split("T")[0];

  const TIME_OPTIONS = useMemo(() => generateTimeOptions(), []);

  const endOptionsAdd = useMemo(
    () => filterEndOptions(TIME_OPTIONS, startTime, 180),
    [TIME_OPTIONS, startTime]
  );

  const endOptionsEdit = useMemo(
    () => filterEndOptions(TIME_OPTIONS, editStartTime, 180),
    [TIME_OPTIONS, editStartTime]
  );

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setSaveError(null);

      const schedulesRes = await axios.get("http://localhost:8080/api/schedules", {
        withCredentials: true,
      });

      const grouped = schedulesRes.data.reduce((acc, schedule) => {
        const className = schedule.classEntity.name;
        if (!acc[className]) {
          acc[className] = { classId: schedule.classEntity.id, schedules: [] };
        }
        acc[className].schedules.push(schedule);
        return acc;
      }, {});

      setSchedules(grouped);

      try {
        const classesRes = await axios.get("http://localhost:8080/api/classes", {
          withCredentials: true,
        });
        setClasses(classesRes.data);
      } catch (classError) {
        console.error("Failed to fetch classes:", classError);
      }
    } catch (error) {
      console.error("Failed to fetch schedules:", error);
      setSaveError("Failed to load schedules. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (schedule) => {
    setSaveError(null);
    setEditingId(schedule.id);

    const times = parseTimeSlot(schedule.timeSlot);
    const dateInput = formatDateForInput(schedule.date);

    setEditStartTime(times.start);
    setEditEndTime(times.end);

    setEditForm({
      date: dateInput || today,
      maxParticipants: schedule.maxParticipants ?? 15,
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({ date: "", maxParticipants: 15 });
    setEditStartTime("");
    setEditEndTime("");
    setSaveError(null);
  };

  // If start time changes, ensure end time stays valid (Edit)
  useEffect(() => {
    if (!editingId || !editStartTime) return;
    const v = validateMaxDuration(editStartTime, editEndTime, 180);
    if (!v.ok) {
      const validEnds = filterEndOptions(TIME_OPTIONS, editStartTime, 180);
      if (validEnds.length > 0) setEditEndTime(validEnds[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editStartTime, editingId]);

  // If start time changes, ensure end time stays valid (Add)
  useEffect(() => {
    const v = validateMaxDuration(startTime, endTime, 180);
    if (!v.ok) {
      const validEnds = filterEndOptions(TIME_OPTIONS, startTime, 180);
      if (validEnds.length > 0) setEndTime(validEnds[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startTime]);

  const handleSave = async (scheduleId) => {
    try {
      setSaveError(null);

      const dateInput = editForm.date;
      const computedDay = getDayFromDate(dateInput);

      if (!dateInput || !computedDay || !editStartTime || !editEndTime || !editForm.maxParticipants) {
        setSaveError("All fields are required.");
        return;
      }

      const timeCheck = validateMaxDuration(editStartTime, editEndTime, 180);
      if (!timeCheck.ok) {
        setSaveError(timeCheck.msg);
        return;
      }

      const timeSlot = `${editStartTime} - ${editEndTime}`;

      const response = await axios.put(
        `http://localhost:8080/api/schedules/${scheduleId}`,
        {
          day: computedDay, // ✅ auto from date
          timeSlot,
          date: dateInput,
          maxParticipants: editForm.maxParticipants,
        },
        { withCredentials: true }
      );

      setSchedules((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((className) => {
          const idx = next[className].schedules.findIndex((s) => s.id === scheduleId);
          if (idx !== -1) next[className].schedules[idx] = response.data;
        });
        return next;
      });

      handleCancelEdit();
    } catch (error) {
      console.error("Failed to save schedule:", error);
      setSaveError(error.response?.data?.message || "Failed to save changes. Please try again.");
    }
  };

  const handleOpenAddModal = (className, classId) => {
    setSaveError(null);
    setAddingToClass({ name: className, id: classId });

    setStartTime("9:00 AM");
    const validEnds = filterEndOptions(TIME_OPTIONS, "9:00 AM", 180);
    setEndTime(validEnds[0] || "10:00 AM");

    setNewScheduleForm({
      date: today,
      maxParticipants: 15,
    });

    setShowAddModal(true);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setAddingToClass(null);
    setStartTime("9:00 AM");
    setEndTime("10:00 AM");
    setNewScheduleForm({
      date: today,
      maxParticipants: 15,
    });
    setSaveError(null);
  };

  const handleAddSchedule = async () => {
    try {
      setSaveError(null);

      const dateInput = newScheduleForm.date;
      const computedDay = getDayFromDate(dateInput);

      if (!startTime || !endTime || !dateInput || !computedDay) {
        setSaveError("Time and date are required.");
        return;
      }

      const timeCheck = validateMaxDuration(startTime, endTime, 180);
      if (!timeCheck.ok) {
        setSaveError(timeCheck.msg);
        return;
      }

      const timeSlot = `${startTime} - ${endTime}`;

      const response = await axios.post(
        "http://localhost:8080/api/schedules",
        {
          classId: addingToClass.id,
          day: computedDay, // ✅ auto from date
          timeSlot,
          date: dateInput,
          maxParticipants: newScheduleForm.maxParticipants,
        },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );

      setSchedules((prev) => {
        const next = { ...prev };
        const className = addingToClass.name;

        if (!next[className]) {
          next[className] = { classId: addingToClass.id, schedules: [] };
        }

        const exists = next[className].schedules.some((s) => s.id === response.data.id);
        if (!exists) {
          next[className] = {
            ...next[className],
            schedules: [...next[className].schedules, response.data],
          };
        }

        return next;
      });

      handleCloseAddModal();
    } catch (error) {
      console.error("Failed to add schedule:", error);
      if (error.response?.status === 403) {
        setSaveError("Permission denied. Please check if you're logged in as admin.");
      } else {
        setSaveError(
          error.response?.data?.message ||
            error.response?.data ||
            "Failed to add schedule. Please try again."
        );
      }
    }
  };

  const handleDeleteClick = (schedule) => {
    if (schedule.enrolledCount > 0) {
      setSaveError("Cannot delete schedule with existing enrollments.");
      setTimeout(() => setSaveError(null), 3000);
      return;
    }
    setDeleteConfirm(schedule.id);
  };

  const handleConfirmDelete = async (scheduleId) => {
    try {
      await axios.delete(`http://localhost:8080/api/schedules/${scheduleId}`, {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      });

      setSchedules((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((className) => {
          next[className].schedules = next[className].schedules.filter((s) => s.id !== scheduleId);
          if (next[className].schedules.length === 0) delete next[className];
        });
        return next;
      });

      setDeleteConfirm(null);
    } catch (error) {
      console.error("Failed to delete schedule:", error);

      if (error.response?.status === 409 && error.response?.data?.error === "SCHEDULE_HAS_ENROLLMENTS") {
        setSaveError(
          error.response.data.message ||
            "Cannot delete this schedule because there are active enrollments."
        );
      } else if (error.response?.status === 403) {
        setSaveError("Authentication error. Please refresh the page and try again.");
      } else {
        setSaveError(error.response?.data?.message || "Failed to delete schedule.");
      }

      setTimeout(() => setSaveError(null), 3000);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.pageContainer}>
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

      <div className={styles.contentSection}>
        <div className={styles.contentContainer}>
          <button
            onClick={() => (window.location.href = "/admin")}
            className={styles.backButton}
          >
            <ArrowLeft className={styles.backIcon} />
            <span>Back to Admin Dashboard</span>
          </button>

          <div className={styles.headerSection}>
            <h1 className={styles.title}>SCHEDULE VIEWER</h1>
            <p className={styles.subtitle}>View and manage all class schedules</p>
          </div>

          {saveError && <div className={styles.globalError}>{saveError}</div>}

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
                        {classData.schedules.length} schedule
                        {classData.schedules.length !== 1 ? "s" : ""}
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
                      <div
                        key={schedule.id}
                        className={`${styles.scheduleItem} ${
                          editingId === schedule.id ? styles.editing : ""
                        }`}
                      >
                        {editingId === schedule.id ? (
                          <div className={styles.editFormContainer}>
                            <div className={styles.editForm}>
                              {/* Day (auto) */}
                              <div className={styles.editRow}>
                                <label>Day (auto):</label>
                                <input
                                  className={styles.editInput}
                                  value={getDayFromDate(editForm.date) || "Select a date"}
                                  readOnly
                                />
                              </div>

                              <div className={styles.editRow}>
                                <label>Start:</label>
                                <select
                                  value={editStartTime}
                                  onChange={(e) => setEditStartTime(e.target.value)}
                                  className={styles.editSelect}
                                >
                                  {TIME_OPTIONS.map((time) => (
                                    <option key={time} value={time}>
                                      {time}
                                    </option>
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
                                  {endOptionsEdit.map((time) => (
                                    <option key={time} value={time}>
                                      {time}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div className={styles.editRow}>
                                <label>Date:</label>
                                <input
                                  type="date"
                                  value={editForm.date}
                                  onChange={(e) =>
                                    setEditForm((prev) => ({
                                      ...prev,
                                      date: e.target.value,
                                    }))
                                  }
                                  min={today}
                                  className={styles.editInput}
                                />
                              </div>

                              <div className={styles.editRow}>
                                <label>Max:</label>
                                <input
                                  type="number"
                                  min="1"
                                  value={editForm.maxParticipants}
                                  onChange={(e) =>
                                    setEditForm((prev) => ({
                                      ...prev,
                                      maxParticipants: parseInt(e.target.value || "1", 10),
                                    }))
                                  }
                                  className={styles.editInput}
                                />
                              </div>

                              {saveError && (
                                <div className={styles.errorMessage}>{saveError}</div>
                              )}

                              <div className={styles.editActions}>
                                <button
                                  onClick={() => handleSave(schedule.id)}
                                  className={styles.saveBtn}
                                >
                                  <Save size={16} /> Save
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className={styles.cancelBtn}
                                >
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
              {/* Day (auto) */}
              <div className={styles.formGroup}>
                <label>Day (auto)</label>
                <input
                  className={styles.formInput}
                  value={getDayFromDate(newScheduleForm.date) || "Select a date"}
                  readOnly
                />
              </div>

              <div className={styles.formGroup}>
                <label>Start Time</label>
                <select
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className={styles.formSelect}
                >
                  {TIME_OPTIONS.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>End Time (max 3 hrs)</label>
                <select
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className={styles.formSelect}
                >
                  {endOptionsAdd.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Date</label>
                <input
                  type="date"
                  value={newScheduleForm.date}
                  onChange={(e) =>
                    setNewScheduleForm((prev) => ({
                      ...prev,
                      date: e.target.value,
                    }))
                  }
                  min={today}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Max Participants</label>
                <input
                  type="number"
                  min="1"
                  value={newScheduleForm.maxParticipants}
                  onChange={(e) =>
                    setNewScheduleForm((prev) => ({
                      ...prev,
                      maxParticipants: parseInt(e.target.value || "1", 10),
                    }))
                  }
                  className={styles.formInput}
                />
              </div>

              {saveError && <div className={styles.errorMessage}>{saveError}</div>}
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

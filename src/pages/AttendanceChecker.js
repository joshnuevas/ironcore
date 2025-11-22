import React, { useState, useEffect } from "react";
import { Calendar, UserCheck, Clock, Search, CheckCircle, XCircle, Plus, ArrowLeft, History, X, AlertTriangle } from "lucide-react";
import Navbar from "../components/Navbar";
import styles from "./AttendanceChecker.module.css";
import axios from "axios";

const AttendanceChecker = () => {
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [newAttendanceDate, setNewAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalAttendanceToday: 0
  });
  
  // Toast notification state
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
    title: ""
  });

  // Confirmation modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmModalConfig, setConfirmModalConfig] = useState({
    title: "",
    message: "",
    onConfirm: null,
    confirmText: "Confirm",
    cancelText: "Cancel"
  });

  useEffect(() => {
    fetchActiveMembers();
  }, []);

  useEffect(() => {
    filterMembers();
  }, [searchTerm, members]);

  // Auto-hide toast after 5 seconds
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast(prev => ({ ...prev, show: false }));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const showToast = (title, message, type = "success") => {
    setToast({
      show: true,
      title,
      message,
      type
    });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, show: false }));
  };

  const showConfirm = (title, message, onConfirm, confirmText = "Delete", cancelText = "Cancel") => {
    setConfirmModalConfig({
      title,
      message,
      onConfirm,
      confirmText,
      cancelText
    });
    setShowConfirmModal(true);
  };

  const hideConfirm = () => {
    setShowConfirmModal(false);
  };

  const fetchActiveMembers = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `http://localhost:8080/api/attendance/active-members`,
        { withCredentials: true }
      );
      
      setMembers(response.data);
      calculateStats(response.data);
    } catch (error) {
      console.error("Failed to fetch active members:", error);
      showToast(
        "Error", 
        "Failed to load active members. " + (error.response?.data?.message || ""), 
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (membersList) => {
    const total = membersList.length;
    const todayCount = membersList.filter(member => 
      member.checkedIn === true
    ).length;
    
    setStats({
      totalMembers: total,
      totalAttendanceToday: todayCount
    });
  };

  const filterMembers = () => {
    if (!searchTerm) {
      setFilteredMembers(members);
      return;
    }

    const filtered = members.filter(member =>
      member.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.membershipType.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredMembers(filtered);
  };

  // Check if attendance already exists for the selected date
  const checkExistingAttendance = async (userId, date) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/attendance/user/${userId}/date/${date}`,
        { withCredentials: true }
      );
      
      // If we get a successful response and data exists, return true
      return response.data && response.data.length > 0;
    } catch (error) {
      // If it's a 404, no attendance exists (which is good)
      if (error.response?.status === 404) {
        return false;
      }
      // For other errors, log and assume no duplicate for safety
      console.error("Error checking existing attendance:", error);
      return false;
    }
  };

  const handleAddAttendance = async (e) => {
  e?.preventDefault();
  
  if (!selectedMember || !newAttendanceDate) {
    showToast("Warning", "Please select a date", "error");
    return;
  }

  console.log("Attempting to add attendance for:", {
    userId: selectedMember.userId,
    date: newAttendanceDate,
    username: selectedMember.username
  });

  try {
    // Check if attendance already exists for this date
    const alreadyExists = await checkExistingAttendance(selectedMember.userId, newAttendanceDate);
    if (alreadyExists) {
      showToast(
        "Attendance Exists", 
        `${selectedMember.username} already has attendance recorded for ${formatDate(newAttendanceDate)}`,
        "error"
      );
      return; // Stop here if attendance already exists
    }

    console.log("No existing attendance found, proceeding to add...");

    const requestData = {
      userId: selectedMember.userId,
      date: newAttendanceDate,
      checkedIn: true,
      notes: null
    };
    
    console.log("Sending request:", requestData);
    
    const response = await axios.post(
      "http://localhost:8080/api/attendance/mark",
      requestData,
      { withCredentials: true }
    );

    console.log("Response:", response.data);

    if (response.data.success) {
      showToast(
        "Success!", 
        `Attendance recorded for ${selectedMember.username} on ${formatDate(newAttendanceDate)}`,
        "success"
      );
      setShowAddModal(false);
      setNewAttendanceDate(new Date().toISOString().split('T')[0]);
      fetchActiveMembers(); // Refresh the list
    }
  } catch (error) {
    console.error("Failed to add attendance:", error);
    console.error("Error response:", error.response?.data);
    
    // Handle duplicate error from backend as well
    if (error.response?.status === 409 || error.response?.data?.message?.includes('already exists')) {
      showToast(
        "Attendance Exists", 
        `${selectedMember.username} already has attendance recorded for ${formatDate(newAttendanceDate)}`,
        "error"
      );
      return;
    }
    
    const errorMsg = error.response?.data?.message || error.message || "Unknown error";
    showToast("Error", "Failed to add attendance. " + errorMsg, "error");
  }
};

  const handleViewHistory = async (member) => {
    console.log("Fetching history for member:", member);
    
    try {
      setSelectedMember(member);
      setIsLoading(true);
      
      const response = await axios.get(
        `http://localhost:8080/api/attendance/user/${member.userId}`,
        { withCredentials: true }
      );
      
      console.log("History response:", response.data);
      setAttendanceHistory(response.data);
      setShowHistoryModal(true);
    } catch (error) {
      console.error("Failed to fetch attendance history:", error);
      showToast(
        "Error", 
        "Failed to load attendance history. " + (error.response?.data?.message || error.message || ""), 
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAttendance = async (attendanceId) => {
    const recordToDelete = attendanceHistory.find(record => record.id === attendanceId);
    
    showConfirm(
      "Delete Attendance Record",
      `Are you sure you want to delete the attendance record for ${formatDate(recordToDelete?.date)}? This action cannot be undone.`,
      async () => {
        try {
          await axios.delete(
            `http://localhost:8080/api/attendance/${attendanceId}`,
            { withCredentials: true }
          );
          
          // Refresh history
          const response = await axios.get(
            `http://localhost:8080/api/attendance/user/${selectedMember.userId}`,
            { withCredentials: true }
          );
          setAttendanceHistory(response.data);
          fetchActiveMembers();
          
          showToast("Success", "Attendance record deleted successfully", "success");
        } catch (error) {
          console.error("Failed to delete attendance:", error);
          showToast("Error", "Failed to delete attendance. " + (error.response?.data?.message || ""), "error");
        }
      },
      "Delete Record",
      "Cancel"
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "N/A";
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-US', { 
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const openAddModal = (member) => {
    console.log("Opening add modal for:", member);
    setSelectedMember(member);
    setShowAddModal(true);
  };

  const openHistoryModal = (member) => {
    console.log("Opening history modal for:", member);
    handleViewHistory(member);
  };

  return (
    <div className={styles.attendanceContainer}>
      <Navbar activeNav="ADMIN" />

      <div className={styles.backgroundOverlay}>
        <div className={`${styles.bgBlur} ${styles.bgBlur1}`}></div>
        <div className={`${styles.bgBlur} ${styles.bgBlur2}`}></div>
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <div className={`${styles.toast} ${styles[toast.type]}`}>
          <div className={styles.toastIcon}>
            {toast.type === "success" ? (
              <CheckCircle size={24} />
            ) : (
              <XCircle size={24} />
            )}
          </div>
          <div className={styles.toastContent}>
            <h4 className={styles.toastTitle}>{toast.title}</h4>
            <p className={styles.toastMessage}>{toast.message}</p>
          </div>
          <button className={styles.toastClose} onClick={hideToast}>
            <X size={18} />
          </button>
          <div className={`${styles.toastProgress} ${styles[toast.type]}`}></div>
        </div>
      )}

      <div className={styles.contentWrapper}>
        {/* Back Button */}
        <button
          onClick={() => window.location.href = '/admin'}
          className={styles.backButton}
        >
          <ArrowLeft className={styles.backIcon} />
          <span>Back to Admin Dashboard</span>
        </button>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerBadge}>
            <UserCheck size={28} />
            <h1>ATTENDANCE CHECKER</h1>
          </div>
          <p className={styles.headerDescription}>
            Track and manage member attendance records
          </p>
        </div>

        {/* Stats */}
        <div className={styles.statsBar}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Active Members</span>
            <span className={styles.statValue}>{stats.totalMembers}</span>
          </div>
          <div className={`${styles.statItem} ${styles.statSuccess}`}>
            <span className={styles.statLabel}>Attended Today</span>
            <span className={styles.statValue}>{stats.totalAttendanceToday}</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className={styles.searchBar}>
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by name, email, or membership type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        {/* Members List */}
        <div className={styles.membersSection}>
          {isLoading ? (
            <div className={styles.loadingState}>
              <div className={styles.spinner}></div>
              <p>Loading active members...</p>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className={styles.emptyState}>
              <UserCheck size={48} />
              <h3>No Active Members Found</h3>
              <p>
                {searchTerm 
                  ? "No members match your search criteria"
                  : "No members have active memberships"
                }
              </p>
            </div>
          ) : (
            <div className={styles.membersList}>
              {filteredMembers.map((member) => (
                <div key={member.userId} className={styles.memberCard}>
                  <div className={styles.memberInfo}>
                    <div className={styles.memberHeader}>
                      <h3 className={styles.memberName}>{member.username}</h3>
                      <span className={`${styles.membershipBadge} ${styles[member.membershipType.toLowerCase()]}`}>
                        {member.membershipType}
                      </span>
                    </div>
                    <p className={styles.memberEmail}>{member.email}</p>
                    <div className={styles.memberDetails}>
                      <div className={styles.detailItem}>
                        <Calendar size={14} />
                        <span>Active: {formatDateTime(member.membershipActivatedDate)}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <Clock size={14} />
                        <span>Expires: {formatDateTime(member.membershipExpiryDate)}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.actionButtons}>
                    <button
                      onClick={() => openAddModal(member)}
                      className={styles.addButton}
                      type="button"
                    >
                      <Plus size={20} />
                      <span>Add Attendance</span>
                    </button>
                    <button
                      onClick={() => openHistoryModal(member)}
                      className={styles.historyButton}
                      type="button"
                    >
                      <History size={20} />
                      <span>View History</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Attendance Modal */}
      {showAddModal && selectedMember && (
        <div className={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Add Attendance</h2>
              <button 
                className={styles.closeButton}
                onClick={() => setShowAddModal(false)}
                type="button"
              >
                ×
              </button>
            </div>
            
            <div className={styles.modalContent}>
              <div className={styles.memberPreview}>
                <UserCheck size={24} />
                <div>
                  <h3>{selectedMember?.username}</h3>
                  <p>{selectedMember?.membershipType} Member</p>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Attendance Date</label>
                <input
                  type="date"
                  value={newAttendanceDate}
                  onChange={(e) => setNewAttendanceDate(e.target.value)}
                  min={selectedMember?.membershipActivatedDate ? new Date(selectedMember.membershipActivatedDate).toISOString().split('T')[0] : undefined}
                  max={selectedMember?.membershipExpiryDate ? new Date(selectedMember.membershipExpiryDate).toISOString().split('T')[0] : undefined}
                  className={styles.dateInput}
                />
                <p className={styles.hint}>
                  Select a date within the membership period
                </p>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button 
                className={styles.cancelButton}
                onClick={() => setShowAddModal(false)}
                type="button"
              >
                Cancel
              </button>
              <button 
                className={styles.confirmButton}
                onClick={handleAddAttendance}
                type="button"
              >
                <CheckCircle size={18} />
                Add Attendance
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && selectedMember && (
        <div className={styles.modalOverlay} onClick={() => setShowHistoryModal(false)}>
          <div className={styles.modalLarge} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Attendance History</h2>
              <button 
                className={styles.closeButton}
                onClick={() => setShowHistoryModal(false)}
                type="button"
              >
                ×
              </button>
            </div>
            
            <div className={styles.modalContent}>
              <div className={styles.memberPreview}>
                <UserCheck size={24} />
                <div>
                  <h3>{selectedMember?.username}</h3>
                  <p>{selectedMember?.membershipType} Member</p>
                </div>
              </div>

              {attendanceHistory.length === 0 ? (
                <div className={styles.emptyHistory}>
                  <History size={48} />
                  <p>No attendance records yet</p>
                </div>
              ) : (
                <div className={styles.historyList}>
                  {attendanceHistory.map((record) => (
                    <div key={record.id} className={styles.historyItem}>
                      <div className={styles.historyDate}>
                        <Calendar size={18} />
                        <span>{formatDate(record.date)}</span>
                      </div>
                      <div className={styles.historyDetails}>
                        {record.checkedIn && (
                          <>
                            <div className={styles.historyInfo}>
                              <Clock size={14} />
                              <span>Checked in: {formatDateTime(record.checkInTime)}</span>
                            </div>
                            {record.checkedByAdmin && (
                              <div className={styles.historyInfo}>
                                <UserCheck size={14} />
                                <span>By: {record.checkedByAdmin}</span>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteAttendance(record.id)}
                        className={styles.deleteButton}
                      >
                        <XCircle size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button 
                className={styles.cancelButton}
                onClick={() => setShowHistoryModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className={styles.modalOverlay} onClick={hideConfirm}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.confirmHeader}>
                <AlertTriangle size={24} className={styles.warningIcon} />
                <h2>{confirmModalConfig.title}</h2>
              </div>
              <button 
                className={styles.closeButton}
                onClick={hideConfirm}
                type="button"
              >
                ×
              </button>
            </div>
            
            <div className={styles.modalContent}>
              <p className={styles.confirmMessage}>{confirmModalConfig.message}</p>
            </div>

            <div className={styles.modalFooter}>
              <button 
                className={styles.cancelButton}
                onClick={hideConfirm}
                type="button"
              >
                {confirmModalConfig.cancelText}
              </button>
              <button 
                className={styles.deleteConfirmButton}
                onClick={() => {
                  confirmModalConfig.onConfirm();
                  hideConfirm();
                }}
                type="button"
              >
                <XCircle size={18} />
                {confirmModalConfig.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceChecker;
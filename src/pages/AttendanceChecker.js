import React, { useState, useEffect } from "react";
import { Calendar, UserCheck, Clock, Search, CheckCircle, XCircle, Plus, History } from "lucide-react";
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

  useEffect(() => {
    fetchActiveMembers();
  }, []);

  useEffect(() => {
    filterMembers();
  }, [searchTerm, members]);

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
      alert("Failed to load active members. " + (error.response?.data?.message || ""));
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (membersList) => {
    const total = membersList.length;
    const today = new Date().toISOString().split('T')[0];
    
    // Count how many members attended today
    let todayCount = 0;
    membersList.forEach(member => {
      if (member.recentAttendance && member.recentAttendance.some(a => 
        a.attendanceDate === today && a.checkedIn
      )) {
        todayCount++;
      }
    });
    
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

  const handleAddAttendance = async (e) => {
    e?.preventDefault();
    
    if (!selectedMember || !newAttendanceDate) {
      alert("Please select a date");
      return;
    }

    console.log("Adding attendance:", {
      userId: selectedMember.userId,
      date: newAttendanceDate,
      checkedIn: true,
      notes: null
    });

    try {
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
        alert("Attendance added successfully!");
        setShowAddModal(false);
        setNewAttendanceDate(new Date().toISOString().split('T')[0]);
        fetchActiveMembers(); // Refresh the list
      }
    } catch (error) {
      console.error("Failed to add attendance:", error);
      console.error("Error response:", error.response?.data);
      const errorMsg = error.response?.data?.message || error.message || "Unknown error";
      alert("Failed to add attendance. " + errorMsg);
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
      alert("Failed to load attendance history. " + (error.response?.data?.message || error.message || ""));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAttendance = async (attendanceId) => {
    if (!window.confirm("Are you sure you want to delete this attendance record?")) {
      return;
    }

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
    } catch (error) {
      console.error("Failed to delete attendance:", error);
      alert("Failed to delete attendance. " + (error.response?.data?.message || ""));
    }
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

      <div className={styles.contentWrapper}>
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
    </div>
  );
};

export default AttendanceChecker;
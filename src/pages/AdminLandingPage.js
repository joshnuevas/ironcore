import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, UserCheck, QrCode, BarChart3, Users, RefreshCw, AlertCircle } from "lucide-react";
import Navbar from "../components/Navbar";
import styles from "./AdminLandingPage.module.css";
import axios from "axios";

const AdminLandingPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    activeSchedules: 0,
    totalMembers: 0,
    availableSlots: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get("http://localhost:8080/api/admin/stats", {
        withCredentials: true,
      });
      setStats(response.data);
    } catch (error) {
      console.error("Failed to fetch admin stats:", error);
      setError("Failed to load dashboard statistics. Please try again.");
      setStats({
        activeSchedules: 0,
        totalMembers: 0,
        availableSlots: 0,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchStats();
  };

  const adminCards = [
    {
      id: 1,
      title: "Schedule Viewer",
      description: "View and manage all class schedules and trainer appointments",
      icon: Calendar,
      color: "blue",
      path: "/admin/schedule-viewer",
    },
    {
      id: 2,
      title: "Code Checker",
      description: "Verify membership codes and validate user access",
      icon: QrCode,
      color: "purple",
      path: "/admin/code-checker",
    },
    {
      id: 3,
      title: "Slot Checker",
      description: "Monitor class capacity and available slots in real-time",
      icon: UserCheck,
      color: "green",
      path: "/admin/slot-checker",
    },
    {
      id: 4,
      title: "Attendance Checker",
      description: "Track member attendance based on active memberships",
      icon: UserCheck,
      color: "orange",
      path: "/admin/attendance-checker",
    },
  ];

  const handleCardClick = (path) => {
    navigate(path);
  };

  const formatNumber = (num) => {
    return num?.toLocaleString() || "0";
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.backgroundOverlay}>
        <div className={`${styles.bgBlur} ${styles.bgBlur1}`}></div>
        <div className={`${styles.bgBlur} ${styles.bgBlur2}`}></div>
        <div className={`${styles.bgBlur} ${styles.bgBlur3}`}></div>
      </div>

      <Navbar activeNav="ADMIN" />

      <div className={styles.contentSection}>
        <div className={styles.contentContainer}>
          {/* Header Section */}
          <div className={styles.headerSection}>
            <h1 className={styles.title}>ADMIN DASHBOARD</h1>
            <p className={styles.subtitle}>Manage your gym operations with powerful administrative tools</p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className={styles.errorBanner}>
              <AlertCircle size={18} />
              <span>{error}</span>
              <button onClick={fetchStats} className={styles.retryBtn}>
                Try Again
              </button>
            </div>
          )}

          {/* Stats Grid */}
          <div className={styles.statsSection}>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statIconWrapper}>
                  <Calendar className={styles.statIcon} />
                </div>
                <div className={styles.statInfo}>
                  <div className={styles.statLabel}>Active Schedules</div>
                  <div className={styles.statValue}>
                    {isLoading ? "..." : formatNumber(stats.activeSchedules)}
                  </div>
                </div>
                <button 
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className={styles.statRefreshBtn}
                  title="Refresh stats"
                >
                  <RefreshCw className={`${styles.refreshIcon} ${isLoading ? styles.spinning : ''}`} />
                </button>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIconWrapper}>
                  <Users className={styles.statIcon} />
                </div>
                <div className={styles.statInfo}>
                  <div className={styles.statLabel}>Total Members</div>
                  <div className={styles.statValue}>
                    {isLoading ? "..." : formatNumber(stats.totalMembers)}
                  </div>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIconWrapper}>
                  <BarChart3 className={styles.statIcon} />
                </div>
                <div className={styles.statInfo}>
                  <div className={styles.statLabel}>Available Slots</div>
                  <div className={styles.statValue}>
                    {isLoading ? "..." : formatNumber(stats.availableSlots)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Admin Tools Grid */}
          <div className={styles.toolsSection}>
            <h2 className={styles.sectionTitle}>Administrative Tools</h2>
            <div className={styles.cardsGrid}>
              {adminCards.map((card) => {
                const IconComponent = card.icon;
                return (
                  <div
                    key={card.id}
                    className={`${styles.adminCard} ${styles[card.color]}`}
                    onClick={() => handleCardClick(card.path)}
                  >
                    <div className={styles.cardIconWrapper}>
                      <IconComponent className={styles.cardIcon} />
                    </div>
                    <h3 className={styles.cardTitle}>{card.title}</h3>
                    <p className={styles.cardDescription}>{card.description}</p>
                    <div className={styles.cardAction}>
                      <span>Access Tool</span>
                      <span className={styles.arrow}>→</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Info Box */}
          <div className={styles.infoSection}>
            <div className={styles.infoBox}>
              <div className={styles.infoIcon}>💡</div>
              <div className={styles.infoContent}>
                <strong>Pro Tip:</strong> All administrative actions are logged and monitored for security purposes. 
                If you need additional permissions, please contact the system administrator.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLandingPage;
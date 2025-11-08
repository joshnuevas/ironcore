import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, UserCheck, QrCode, Shield, BarChart3, Users } from "lucide-react";
import Navbar from "../components/Navbar";
import styles from "./AdminLandingPage.module.css";
import axios from "axios";

const AdminLandingPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    activeSchedules: 0,
    totalMembers: 0,
    availableSlots: 0,
    completedTransactions: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("http://localhost:8080/api/admin/stats", {
        withCredentials: true,
      });
      setStats(response.data);
    } catch (error) {
      console.error("Failed to fetch admin stats:", error);
    } finally {
      setIsLoading(false);
    }
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
  ];

  const handleCardClick = (path) => {
    navigate(path);
  };

  return (
    <div className={styles.adminContainer}>
      <Navbar activeNav="ADMIN" />

      {/* Animated background elements */}
      <div className={styles.backgroundOverlay}>
        <div className={`${styles.bgBlur} ${styles.bgBlur1}`}></div>
        <div className={`${styles.bgBlur} ${styles.bgBlur2}`}></div>
      </div>

      <div className={styles.contentWrapper}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerBadge}>
            <Shield size={28} />
            <h1>ADMIN DASHBOARD</h1>
          </div>
          <p className={styles.headerDescription}>
            Manage your gym operations with powerful administrative tools
          </p>
        </div>

        {/* Stats Overview */}
        <div className={styles.statsGrid}>
          <div className={`${styles.statCard} ${styles.statBlue}`}>
            <div className={styles.statContent}>
              <div className={styles.statIcon}>
                <Calendar size={24} />
              </div>
              <div className={styles.statInfo}>
                <p className={styles.statLabel}>Active Schedules</p>
                <h3 className={styles.statValue}>
                  {isLoading ? "..." : stats.activeSchedules}
                </h3>
              </div>
            </div>
          </div>

          <div className={`${styles.statCard} ${styles.statPurple}`}>
            <div className={styles.statContent}>
              <div className={styles.statIcon}>
                <Users size={24} />
              </div>
              <div className={styles.statInfo}>
                <p className={styles.statLabel}>Total Members</p>
                <h3 className={styles.statValue}>
                  {isLoading ? "..." : stats.totalMembers}
                </h3>
              </div>
            </div>
          </div>

          <div className={`${styles.statCard} ${styles.statGreen}`}>
            <div className={styles.statContent}>
              <div className={styles.statIcon}>
                <BarChart3 size={24} />
              </div>
              <div className={styles.statInfo}>
                <p className={styles.statLabel}>Available Slots</p>
                <h3 className={styles.statValue}>
                  {isLoading ? "..." : stats.availableSlots}
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Cards */}
        <div className={styles.cardsGrid}>
          {adminCards.map((card) => {
            const IconComponent = card.icon;
            return (
              <div
                key={card.id}
                className={`${styles.adminCard} ${styles[`card${card.color.charAt(0).toUpperCase() + card.color.slice(1)}`]}`}
                onClick={() => handleCardClick(card.path)}
              >
                <div className={styles.cardGradient}></div>
                
                <div className={styles.cardContent}>
                  <div className={styles.cardIcon}>
                    <IconComponent size={32} />
                  </div>

                  <h2 className={styles.cardTitle}>{card.title}</h2>
                  <p className={styles.cardDescription}>{card.description}</p>

                  <div className={styles.cardAction}>
                    <span>Access Tool</span>
                    <span className={styles.arrow}>→</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Info */}
        <div className={styles.infoBox}>
          <p>
            💡 <strong>Pro Tip:</strong> All administrative actions are logged and monitored for security purposes. 
            If you need additional permissions, please contact the system administrator.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLandingPage;
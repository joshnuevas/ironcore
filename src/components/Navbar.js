import React, { useState, useEffect } from "react";
import { Dumbbell, User, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./Navbar.module.css";

const Navbar = ({ activeNav = "HOME" }) => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const username = localStorage.getItem("username");

  useEffect(() => {
    // Check admin status on component mount
    const checkAdminStatus = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/users/me", {
          withCredentials: true,
        });
        console.log("User data from /me endpoint:", response.data);
        console.log("isAdmin value:", response.data.isAdmin);
        console.log("isAdmin type:", typeof response.data.isAdmin);
        setIsAdmin(response.data.isAdmin === true || response.data.isAdmin === 1);
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, []);

  const navItems = [
    "HOME",
    "ABOUT US",
    "OUR TRAINERS",
    "CLASSES",
    "MEMBERSHIP",
  ];

  const handleNavClick = (item) => {
    switch (item) {
      case "HOME":
        navigate("/landing");
        break;
      case "ABOUT US":
        navigate("/about");
        break;
      case "OUR TRAINERS":
        navigate("/trainers");
        break;
      case "CLASSES":
        navigate("/classes");
        break;
      case "MEMBERSHIP":
        navigate("/membership");
        break;
      default:
        break;
    }
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  // In your Navbar.jsx, update the handleAdminClick function:

const handleAdminClick = () => {
  navigate("/admin"); // Changed from "/admin/schedule-viewer" to "/admin"
};

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    setShowLogoutModal(false);
    navigate("/login");
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.navContainer}>
          <div className={styles.logoSection}>
            <div className={styles.logoIcon}>
              <Dumbbell className={styles.dumbbellIcon} />
            </div>
            <span className={styles.logoText}>
              Iron<span className={styles.logoAccent}>Core</span>
            </span>
          </div>

          <div className={styles.navLinks}>
            {navItems.map((item) => (
              <button
                key={item}
                onClick={() => handleNavClick(item)}
                className={`${styles.navLink} ${
                  activeNav === item ? styles.navLinkActive : ""
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            {/* Admin Dashboard Button - Only visible if isAdmin is true */}
            {isAdmin && (
              <button
                onClick={handleAdminClick}
                className={`${styles.adminButton} ${
                  activeNav === "ADMIN" ? styles.adminButtonActive : ""
                }`}
                title="Admin Dashboard"
              >
                <Shield size={18} />
                <span>ADMIN</span>
              </button>
            )}

            <button
              onClick={handleProfileClick}
              className={`${styles.profileButton} ${
                activeNav === "PROFILE" ? styles.profileButtonActive : ""
              }`}
              title="View Profile"
            >
              <User size={18} />
              <span>{username}</span>
            </button>

            <button onClick={handleLogout} className={styles.logoutButton}>
              LOGOUT
            </button>
          </div>
        </div>
      </nav>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>Confirm Logout</h2>
            <p>Are you sure you want to logout?</p>
            <div className={styles.modalButtons}>
              <button onClick={confirmLogout} className={styles.modalConfirm}>
                Logout
              </button>
              <button onClick={cancelLogout} className={styles.modalCancel}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
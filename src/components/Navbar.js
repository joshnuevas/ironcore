// src/components/Navbar.jsx
import React, { useState, useEffect } from "react";
import { Dumbbell, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./Navbar.module.css";

const Navbar = ({ activeNav = "HOME" }) => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [username, setUsername] = useState(""); // from backend, not localStorage
  const navigate = useNavigate();

  const loginRole = localStorage.getItem("loginRole");

  // Admin mode = user role is admin OR page explicitly says activeNav="ADMIN"
  const isAdminMode =
    (loginRole && loginRole.toLowerCase() === "admin") ||
    activeNav === "ADMIN";

  // Load current user for display
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await axios.get("http://localhost:8080/api/users/me", {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.data?.username) {
          setUsername(res.data.username);
        }
      } catch (err) {
        console.error("Failed to load user for navbar:", err);
      }
    };

    fetchCurrentUser();
  }, []);

  // For admins → no middle nav items
  const navItems = isAdminMode
    ? []
    : ["HOME", "ABOUT US", "OUR TRAINERS", "CLASSES", "MEMBERSHIP", "ATTENDANCE"];

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
      case "ATTENDANCE":
        navigate("/attendance");
        break;
      default:
        break;
    }
  };

  const handleProfileClick = () => {
    // You can route admins to a different profile page if needed
    navigate("/profile");
  };

  const handleLogoClick = () => {
    if (isAdminMode) {
      navigate("/admin");
    } else {
      navigate("/landing");
    }
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    localStorage.removeItem("loginRole");
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
          {/* Logo */}
          <div
            className={styles.logoSection}
            onClick={handleLogoClick}
            style={{ cursor: "pointer" }}
          >
            <div className={styles.logoIcon}>
              <Dumbbell className={styles.dumbbellIcon} />
            </div>
            <span className={styles.logoText}>
              Iron<span className={styles.logoAccent}>Core</span>
            </span>
          </div>

          {/* Center nav links (hidden for admins) */}
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

          {/* Right side: profile + logout (shown for everyone) */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <button
              onClick={handleProfileClick}
              className={`${styles.profileButton} ${
                activeNav === "PROFILE" ? styles.profileButtonActive : ""
              }`}
              title="View Profile"
            >
              <User size={18} />
              <span>{username || "Profile"}</span>
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

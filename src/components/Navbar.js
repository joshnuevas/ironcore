// src/components/Navbar.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Dumbbell, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import styles from "./Navbar.module.css";

const API_BASE = "http://localhost:8080";

const Navbar = ({ activeNav = "HOME" }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [username, setUsername] = useState("Profile");
  const [role, setRole] = useState(null); // "ADMIN" | "USER" | null
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // ✅ MODE = based on current route, not role
  const isAdminMode =
    location.pathname.startsWith("/admin") || activeNav === "ADMIN";

  useEffect(() => {
    let mounted = true;

    const loadMe = async () => {
      setIsLoadingUser(true);
      try {
        const res = await axios.get(`${API_BASE}/api/users/me`, {
          withCredentials: true, // cookie/session
        });

        if (!mounted) return;

        const displayName =
          res.data?.username ||
          res.data?.name ||
          res.data?.fullName ||
          res.data?.firstName ||
          "Profile";

        const isAdmin =
          res.data?.isAdmin === true ||
          String(res.data?.role || "").toUpperCase() === "ADMIN";

        setUsername(displayName);
        setRole(isAdmin ? "ADMIN" : "USER");
      } catch {
        if (!mounted) return;
        setUsername("Profile");
        setRole(null);
      } finally {
        if (mounted) setIsLoadingUser(false);
      }
    };

    loadMe();
    return () => {
      mounted = false;
    };
  }, [location.pathname]);

  const navItems = useMemo(
    () =>
      isAdminMode
        ? []
        : [
            "HOME",
            "ABOUT US",
            "OUR TRAINERS",
            "CLASSES",
            "MEMBERSHIP",
            "ATTENDANCE",
          ],
    [isAdminMode]
  );

  const go = (path) => navigate(path);

  const handleNavClick = (item) => {
    switch (item) {
      case "HOME":
        return go("/landing");
      case "ABOUT US":
        return go("/about");
      case "OUR TRAINERS":
        return go("/trainers");
      case "CLASSES":
        return go("/classes");
      case "MEMBERSHIP":
        return go("/membership");
      case "ATTENDANCE":
        return go("/attendance");
      default:
        return;
    }
  };

  // ✅ Profile follows current MODE (route), not role
  const handleProfileClick = () => {
    if (!role) return go("/login");
    return go(isAdminMode ? "/admin/profile" : "/profile");
  };

  const handleLogoClick = () => {
    if (!role) return go("/login");
    return go(isAdminMode ? "/admin" : "/landing");
  };

  const handleLogout = () => setShowLogoutModal(true);
  const cancelLogout = () => setShowLogoutModal(false);

  const confirmLogout = async () => {
    try {
      await axios.post(
        `${API_BASE}/api/auth/logout`,
        {},
        { withCredentials: true }
      );
    } catch (err) {
      console.warn("Logout failed or endpoint missing:", err);
    } finally {
      setShowLogoutModal(false);
      setUsername("Profile");
      setRole(null);
      go("/login");
    }
  };

  const profileLabel = isLoadingUser ? "Profile" : username || "Profile";

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.navContainer}>
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

          <div className={styles.navLinks}>
            {navItems.map((item) => (
              <button
                key={item}
                onClick={() => handleNavClick(item)}
                className={`${styles.navLink} ${
                  activeNav === item ? styles.navLinkActive : ""
                }`}
                type="button"
              >
                {item}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <button
              onClick={handleProfileClick}
              className={`${styles.profileButton} ${
                activeNav === "PROFILE" ? styles.profileButtonActive : ""
              }`}
              type="button"
              disabled={isLoadingUser}
            >
              <User size={18} />
              <span>{profileLabel}</span>
            </button>

            <button
              onClick={handleLogout}
              className={styles.logoutButton}
              type="button"
            >
              LOGOUT
            </button>
          </div>
        </div>
      </nav>

      {showLogoutModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>Confirm Logout</h2>
            <p>Are you sure you want to logout?</p>
            <div className={styles.modalButtons}>
              <button
                onClick={confirmLogout}
                className={styles.modalConfirm}
                type="button"
              >
                Logout
              </button>
              <button
                onClick={cancelLogout}
                className={styles.modalCancel}
                type="button"
              >
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

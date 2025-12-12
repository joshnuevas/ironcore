// src/components/Navbar.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Dumbbell, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./Navbar.module.css";

const Navbar = ({ activeNav = "HOME" }) => {
  const navigate = useNavigate();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [username, setUsername] = useState("");
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  const loginRole = localStorage.getItem("loginRole");

  // Admin mode = user role is admin OR page explicitly says activeNav="ADMIN"
  const isAdminMode =
    (loginRole && loginRole.toLowerCase() === "admin") ||
    activeNav === "ADMIN";

  // For admins → no middle nav items
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

  // Load current user for display (cookie/session-based auth, same as your Login page)
  useEffect(() => {
    let isMounted = true;

    const fetchCurrentUser = async () => {
      setIsLoadingUser(true);
      try {
        const res = await axios.get("http://localhost:8080/api/users/me", {
          withCredentials: true, // ✅ important for cookie-based auth
        });

        if (!isMounted) return;

        // Use whatever your backend returns; prefer username, then name/fullName as fallback
        const displayName =
          res.data?.username ||
          res.data?.name ||
          res.data?.fullName ||
          res.data?.firstName ||
          "";

        setUsername(displayName);
      } catch (err) {
        // If user isn't logged in (401), keep fallback label
        console.error("Failed to load user for navbar:", err);
        if (isMounted) setUsername("");
      } finally {
        if (isMounted) setIsLoadingUser(false);
      }
    };

    fetchCurrentUser();

    return () => {
      isMounted = false;
    };
  }, []);

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
    navigate("/profile");
  };

  const handleLogoClick = () => {
    navigate(isAdminMode ? "/admin" : "/landing");
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    try {
      // If you have a logout endpoint, call it so the cookie/session is cleared server-side too
      // (safe even if you haven't implemented it yet)
      await axios.post(
        "http://localhost:8080/api/auth/logout",
        {},
        { withCredentials: true }
      );
    } catch (err) {
      // ignore, still proceed with client cleanup
      console.warn("Logout endpoint failed or not implemented:", err);
    } finally {
      // Keep these if you still use them elsewhere
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("username");
      localStorage.removeItem("email");
      localStorage.removeItem("loginRole");

      setShowLogoutModal(false);
      navigate("/login");
    }
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const profileLabel = isLoadingUser ? "Profile" : username || "Profile";

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
                type="button"
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

      {/* Logout Confirmation Modal */}
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

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
  const [role, setRole] = useState(null); // "ADMIN" | "USER" | null
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // Fetch current user (cookie/session auth)
  useEffect(() => {
    let isMounted = true;

    const fetchCurrentUser = async () => {
      setIsLoadingUser(true);
      try {
        const res = await axios.get("http://localhost:8080/api/users/me", {
          withCredentials: true,
        });

        if (!isMounted) return;

        const displayName =
          res.data?.username ||
          res.data?.name ||
          res.data?.fullName ||
          res.data?.firstName ||
          "";

        setUsername(displayName);
        setRole(res.data?.role || "USER"); // adjust key if backend uses "userRole"
      } catch (err) {
        // not logged in / expired session
        if (!isMounted) return;
        setUsername("");
        setRole(null);
      } finally {
        if (isMounted) setIsLoadingUser(false);
      }
    };

    fetchCurrentUser();

    return () => {
      isMounted = false;
    };
  }, []);

  // Admin mode (trust backend role, or if page explicitly says ADMIN)
  const isAdminMode = role === "ADMIN" || activeNav === "ADMIN";

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
    // Optional: if not logged in, send to login
    if (!role) return navigate("/login");
    navigate("/profile");
  };

  const handleLogoClick = () => {
    // If admin, go admin dashboard. If not logged in, go landing/login as you prefer.
    if (isAdminMode) return navigate("/admin");
    navigate("/landing");
  };

  const handleLogout = () => setShowLogoutModal(true);
  const cancelLogout = () => setShowLogoutModal(false);

  const confirmLogout = async () => {
    try {
      // clear server session/cookie
      await axios.post(
        "http://localhost:8080/api/auth/logout",
        {},
        { withCredentials: true }
      );
    } catch (err) {
      // still proceed with navigation
      console.warn("Logout endpoint failed or not implemented:", err);
    } finally {
      setShowLogoutModal(false);
      setUsername("");
      setRole(null);
      navigate("/login");
    }
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

          {/* Right side: profile + logout */}
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

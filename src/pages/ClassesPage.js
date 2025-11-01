import React, { useState } from "react";
import { Dumbbell, Zap, Music, Bike, Flower2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import styles from "./ClassesPage.module.css";

const ClassesPage = ({ onLogout }) => {
  const [activeNav, setActiveNav] = useState("CLASSES");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    "HOME",
    "ABOUT US",
    "OUR TRAINERS",
    "CLASSES",
    "MEMBERSHIP",
  ];

  const classes = [
    {
      id: 1,
      title: "HIIT",
      description: "Short bursts of intense exercise followed by rest. Great for fat burning and endurance.",
      icon: Zap,
      gradientClass: styles.gradientHiit,
    },
    {
      id: 2,
      title: "ZUMBA",
      description: "Dance-based cardio workout set to music. Fun, energetic, and great for all fitness levels.",
      icon: Music,
      gradientClass: styles.gradientZumba,
    },
    {
      id: 3,
      title: "SPIN",
      description: "High-energy cardio workout on stationary bikes. Focuses on stamina, leg strength, and endurance.",
      icon: Bike,
      gradientClass: styles.gradientSpin,
    },
    {
      id: 4,
      title: "YOGA",
      description: "Build strength, flexibility, and balance. Relieve stress and improve core stability.",
      icon: Flower2,
      gradientClass: styles.gradientYoga,
    }
  ];

  const handleNavClick = (item) => {
    setActiveNav(item);
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

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    if (onLogout) onLogout();
    navigate("/login");
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <div className={styles.classesContainer}>
      {/* Animated background */}
      <div className={styles.backgroundOverlay}>
        <div className={`${styles.bgBlur} ${styles.bgBlur1}`}></div>
        <div className={`${styles.bgBlur} ${styles.bgBlur2}`}></div>
        <div className={`${styles.bgBlur} ${styles.bgBlur3}`}></div>
      </div>

      {/* Navbar */}
      <nav className={styles.navbar}>
        <div className={styles.navContainer}>
          <div className={styles.logoSection}>
            <div className={styles.logoIcon}>
              <Dumbbell className={styles.dumbbellIcon} />
            </div>
            <span className={styles.logoText}>
              IRON<span className={styles.logoAccent}>CORE</span>
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

          <button onClick={handleLogout} className={styles.logoutButton}>
            LOGOUT
          </button>
        </div>
      </nav>

      {/* Classes Content */}
      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>OUR CLASSES</h1>
          <p className={styles.subtitle}>
            Choose from our diverse range of fitness classes designed to challenge and inspire you
          </p>
        </div>

        <div className={styles.classesGrid}>
          {classes.map((classItem, index) => {
            const Icon = classItem.icon;
            return (
              <div 
                key={classItem.id} 
                className={styles.classCard}
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className={`${styles.classImageContainer} ${classItem.gradientClass}`}>
                  <div className={styles.iconWrapper}>
                    <Icon className={styles.classIcon} />
                  </div>
                </div>
                
                <div className={styles.classContent}>
                  <h3 className={styles.classTitle}>{classItem.title}</h3>
                  <p className={styles.classDescription}>{classItem.description}</p>
                  
                  <button className={`${styles.joinButton} ${classItem.gradientClass}`}>
                    JOIN NOW
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Logout Modal */}
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
    </div>
  );
};

export default ClassesPage;
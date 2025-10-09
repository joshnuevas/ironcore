import React, { useState } from "react";
import { Dumbbell } from "lucide-react";
import landingStyles from "./LandingPage.module.css"; // <-- navbar styles reused exactly
import styles from "./OurTrainers.module.css"; // <-- trainers-specific styles
import { useNavigate } from "react-router-dom";

const trainers = [
  {
    name: "The King",
    location: "Palo, Leyte",
    rating: 4,
    image: "/images/theking.jpg",
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. It has survived not only five centuries but also the leap into electronic typesetting.",
  },
  {
    name: "Pacman",
    location: "Palo, Leyte",
    rating: 5,
    image: "/images/pacman.jpg",
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. It has survived not only five centuries but also the leap into electronic typesetting.",
  },
  {
    name: "Ashton Hall",
    location: "Palo, Leyte",
    rating: 5,
    image: "/images/ashton.jpg",
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. It has survived not only five centuries but also the leap into electronic typesetting.",
  },
];

const OurTrainers = ({ onLogout }) => {
  const [activeNav, setActiveNav] = useState("OUR TRAINERS");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  const navItems = ["HOME", "ABOUT US", "OUR TRAINERS", "CLASSES", "MEMBERSHIP"];

  const handleNavClick = (item) => {
    setActiveNav(item);
    // keep nav visually identical and also navigate so "connected via nav"
    const map = {
      HOME: "/landing",
      "ABOUT US": "/about",
      "OUR TRAINERS": "/trainers",
      CLASSES: "/classes",
      MEMBERSHIP: "/membership",
    };
    if (map[item]) navigate(map[item]);
    console.log(`Navigating to ${item}`);
  };

  const handleLogout = () => setShowLogoutModal(true);
  const confirmLogout = () => {
    setShowLogoutModal(false);
    if (onLogout) onLogout();
    navigate("/login");
  };
  const cancelLogout = () => setShowLogoutModal(false);

  return (
    <div className={styles.pageWrapper}>
      {/* NAVBAR (copied exactly from LandingPage) */}
      <nav className={landingStyles.navbar}>
        <div className={landingStyles.navContainer}>
          <div className={landingStyles.logoSection}>
            <div className={landingStyles.logoIcon}>
              <Dumbbell className={landingStyles.dumbbellIcon} />
            </div>
            <span className={landingStyles.logoText}>
              IRON<span className={landingStyles.logoAccent}>CORE</span>
            </span>
          </div>

          <div className={landingStyles.navLinks}>
            {navItems.map((item) => (
              <button
                key={item}
                onClick={() => handleNavClick(item)}
                className={`${landingStyles.navLink} ${
                  activeNav === item ? landingStyles.navLinkActive : ""
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <button onClick={handleLogout} className={landingStyles.logoutButton}>
            LOGOUT
          </button>
        </div>
      </nav>

      {/* Main trainers content */}
      {/* add top padding so the fixed navbar doesn't cover content */}
      <div className={styles.trainersContainer} style={{ paddingTop: "6.5rem" }}>
        <div className={styles.headerSection}>
          <h1 className={styles.title}>OUR TRAINERS</h1>
          <p className={styles.subtitle}>Meet our elite team from Palo, Leyte</p>
        </div>

        <div className={styles.trainersGrid}>
          {trainers.map((trainer, index) => (
            <div key={index} className={styles.card}>
              <div
                className={styles.image}
                style={{ backgroundImage: `url(${trainer.image})` }}
                role="img"
                aria-label={trainer.name}
              />
              <div className={styles.cardContent}>
                <h2 className={styles.name}>
                  {trainer.name}{" "}
                  <span className={styles.stars}>
                    {"★".repeat(trainer.rating)}
                    {"☆".repeat(5 - trainer.rating)}
                  </span>
                </h2>
                <p className={styles.location}>{trainer.location}</p>
                <p className={styles.desc}>{trainer.description}</p>
                <button
                  className={styles.bookButton}
                  onClick={() => alert(`Booking ${trainer.name} — demo`)}
                >
                  BOOK NOW
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Logout Modal (re-uses LandingPage.module.css modal classes so it looks identical) */}
      {showLogoutModal && (
        <div className={landingStyles.modalOverlay}>
          <div className={landingStyles.modalContent}>
            <h2>Confirm Logout</h2>
            <p>Are you sure you want to logout?</p>
            <div className={landingStyles.modalButtons}>
              <button onClick={confirmLogout} className={landingStyles.modalConfirm}>
                Logout
              </button>
              <button onClick={cancelLogout} className={landingStyles.modalCancel}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OurTrainers;

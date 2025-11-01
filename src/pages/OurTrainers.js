import React, { useState } from "react";
import { Dumbbell } from "lucide-react";
import landingStyles from "./LandingPage.module.css"; // reuse landing animations and navbar
import styles from "./OurTrainers.module.css";
import { useNavigate } from "react-router-dom";

const trainers = [
  {
    name: "The King",
    location: "Palo, Leyte",
    rating: 4,
    image: "/images/theking.jpg",
    description:
      "Known for his no-nonsense training approach, The King has over 8 years of experience in strength and conditioning. He specializes in powerlifting, body recomposition, and helping athletes reach peak physical performance.",
  },
  {
    name: "Pacman",
    location: "Palo, Leyte",
    rating: 5,
    image: "/images/pacman.jpg",
    description:
      "A certified boxing and cardio instructor, Pacman brings unmatched energy to every session. With over a decade in fitness, he focuses on endurance training, fat loss, and building mental toughness through high-intensity workouts.",
  },
  {
    name: "Ashton Hall",
    location: "Palo, Leyte",
    rating: 5,
    image: "/images/ashton.jpg",
    description:
      "Ashton is a functional movement specialist and certified personal trainer with 6 years of experience. His calm yet focused coaching style emphasizes form, mobility, and balanced strength development tailored to every individual.",
  },
];

const OurTrainers = ({ onLogout }) => {
  const [activeNav, setActiveNav] = useState("OUR TRAINERS");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    "HOME",
    "ABOUT US",
    "OUR TRAINERS",
    "CLASSES",
    "MEMBERSHIP",
  ];

  const handleNavClick = (item) => {
    setActiveNav(item);
    const map = {
      HOME: "/landing",
      "ABOUT US": "/about",
      "OUR TRAINERS": "/trainers",
      CLASSES: "/classes",
      MEMBERSHIP: "/membership",
    };
    if (map[item]) navigate(map[item]);
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
      {/* 🔸 Background animation reused from LandingPage */}
      <div className={landingStyles.backgroundOverlay}>
        <div
          className={`${landingStyles.bgBlur} ${landingStyles.bgBlur1}`}
        ></div>
        <div
          className={`${landingStyles.bgBlur} ${landingStyles.bgBlur2}`}
        ></div>
        <div
          className={`${landingStyles.bgBlur} ${landingStyles.bgBlur3}`}
        ></div>
      </div>

      {/* 🔸 Navbar */}
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

      {/* 🔸 Main Trainers Content */}
      <div
        className={`${styles.trainersContainer} ${styles.fadeInSection}`}
        style={{ paddingTop: "6.5rem" }}
      >
        <div className={styles.headerSection}>
          <h1 className={styles.title}>OUR TRAINERS</h1>
          <p className={styles.subtitle}>
            Meet our elite team from Palo, Leyte
          </p>
        </div>

        <div className={styles.trainersGrid}>
          {trainers.map((trainer, index) => (
            <div
              key={index}
              className={`${styles.card} ${styles.fadeInCard}`}
              style={{ animationDelay: `${index * 0.2}s` }}
            >
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

      {/* 🔸 Logout Modal */}
      {showLogoutModal && (
        <div className={landingStyles.modalOverlay}>
          <div className={landingStyles.modalContent}>
            <h2>Confirm Logout</h2>
            <p>Are you sure you want to logout?</p>
            <div className={landingStyles.modalButtons}>
              <button
                onClick={confirmLogout}
                className={landingStyles.modalConfirm}
              >
                Logout
              </button>
              <button
                onClick={cancelLogout}
                className={landingStyles.modalCancel}
              >
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

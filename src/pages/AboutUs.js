import React, { useState } from "react";
import { Award, TrendingUp, Target, Users, Heart, Shield } from "lucide-react";
import Navbar from "../components/Navbar"; // ✅ Reuse shared Navbar
import styles from "./AboutUs.module.css";
import { useNavigate } from "react-router-dom";

const AboutUs = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem("username");
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => setShowLogoutModal(true);
  const confirmLogout = () => {
    setShowLogoutModal(false);
    localStorage.removeItem("username");
    navigate("/login");
  };
  const cancelLogout = () => setShowLogoutModal(false);

  // ✅ Values and Stats Data
  const values = [
    {
      icon: <Target size={32} />,
      title: "Excellence",
      description:
        "We push boundaries and strive for excellence in everything we do, from our training programs to our community culture.",
      color: "#f95616ff",
    },
    {
      icon: <Users size={32} />,
      title: "Community",
      description:
        "Building a supportive family where everyone motivates each other to reach their full potential and beyond.",
      color: "#FFEE8C",
    },
    {
      icon: <Heart size={32} />,
      title: "Passion",
      description:
        "Our dedication to fitness and wellness drives us to create transformative experiences for every member.",
      color: "#FF8C8C",
    },
    {
      icon: <Shield size={32} />,
      title: "Integrity",
      description:
        "We maintain the highest standards of professionalism, honesty, and accountability in all our interactions.",
      color: "#93C5FD",
    },
  ];

  const stats = [
    { number: "5000+", label: "Active Members" },
    { number: "6", label: "Expert Trainers" },
    { number: "10+", label: "Classes Weekly" },
    { number: "10+", label: "Years Strong" },
  ];

  // ✅ Main Return
  return (
    <div className={styles.aboutContainer}>
      {/* ✅ Reusable Navbar */}
      <Navbar activeNav="ABOUT US" username={username} onLogout={handleLogout} />

      {/* Animated background */}
      <div className={styles.backgroundOverlay}>
        <div className={`${styles.bgBlur} ${styles.bgBlur1}`}></div>
        <div className={`${styles.bgBlur} ${styles.bgBlur2}`}></div>
        <div className={`${styles.bgBlur} ${styles.bgBlur3}`}></div>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {/* Hero Section */}
        <section className={styles.heroSection}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              <span className={styles.titleMain}>ABOUT</span>
              <span className={styles.titleAccent}>IRONCORE</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Where strength meets community, and dedication becomes
              transformation
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className={styles.missionSection}>
          <div className={styles.missionContent}>
            <div className={styles.missionIcon}>
              <Award size={48} />
            </div>
            <h2 className={styles.sectionTitle}>OUR MISSION</h2>
            <p className={styles.missionText}>
              At IRONCORE, we believe fitness is more than just physical
              transformation. It's about building mental resilience, fostering
              genuine connections, and creating a lifestyle that empowers you to
              be your strongest self. We're committed to providing world-class
              facilities, expert guidance, and an inclusive environment where
              everyone from beginners to elite athletes can thrive and achieve
              their goals.
            </p>
          </div>
        </section>

        {/* Stats Section */}
        <section className={styles.statsSection}>
          <div className={styles.statsGrid}>
            {stats.map((stat, index) => (
              <div key={index} className={styles.statCard}>
                <div className={styles.statNumber}>{stat.number}</div>
                <div className={styles.statLabel}>{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ✅ Updated Values Section */}
        <section className={styles.valuesSection}>
          <h2 className={styles.sectionTitle}>OUR CORE VALUES</h2>
          <div className={styles.valuesGrid}>
            {values.map((value, index) => (
              <div key={index} className={styles.valueCard}>
                <div
                  className={styles.valueIcon}
                  style={{
                    background: `linear-gradient(135deg, ${
                      value.color || "#f97316"
                    }, #dc2626)`,
                    boxShadow: `0 8px 20px ${
                      value.color
                        ? `${value.color}66`
                        : "rgba(249,115,22,0.4)"
                    }`,
                    color: "#fff",
                  }}
                >
                  {React.cloneElement(value.icon, { color: "#fff" })}
                </div>
                <h3
                  className={styles.valueTitle}
                  style={{ color: value.color || "#fff" }}>
                  {value.title}
                </h3>
                <p className={styles.valueDescription}>{value.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Story Section */}
        <section className={styles.storySection}>
          <div className={styles.storyContent}>
            <div className={styles.storyIcon}>
              <TrendingUp size={48} />
            </div>
            <h2 className={styles.sectionTitle}>OUR STORY</h2>
            <p className={styles.storyText}>
              Founded in 2025, IRONCORE began with a simple vision: create a
              space where people could push their limits without judgment. What
              started as a single location with a handful of passionate trainers
              has grown into a thriving community of over 5,000 members. Through
              dedication, innovation, and an unwavering commitment to
              excellence, we've become more than just a gym—we're a movement.
            </p>
          </div>
        </section>

        {/* CTA Section */}
        <section className={styles.ctaSection}>
          <h2 className={styles.ctaTitle}>Ready to Start Your Journey?</h2>
          <p className={styles.ctaText}>
            Join the IRONCORE family and discover what you're truly capable of.
          </p>
          <button
            className={styles.ctaButton}
            onClick={() => navigate("/membership")}
          >
            GET STARTED TODAY
          </button>
        </section>
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

export default AboutUs;

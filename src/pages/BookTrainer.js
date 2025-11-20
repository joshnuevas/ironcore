// src/pages/BookTrainer.js
import React, { useEffect, useState } from "react";
import {
  Award,
  Calendar,
  MapPin,
  Star,
  Target,
  TrendingUp,
} from "lucide-react";
import Navbar from "../components/Navbar";
import landingStyles from "./LandingPage.module.css";
import styles from "./BookTrainer.module.css";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const BookTrainer = () => {
  const { trainerId } = useParams();
  const navigate = useNavigate();
  const username = localStorage.getItem("username");

  const [trainer, setTrainer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Fetch trainer from backend using ID from URL
  useEffect(() => {
    const fetchTrainer = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8080/api/trainers/${trainerId}`
        );

        if (!res.data) {
          setError("Trainer not found.");
          return;
        }

        setTrainer(res.data);
      } catch (err) {
        console.error("Failed to load trainer:", err);
        setError("Unable to load trainer profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchTrainer();
  }, [trainerId]);

  // ✅ Loading state with background + navbar
  if (loading) {
    return (
      <div className={styles.pageWrapper}>
        <Navbar activeNav="OUR TRAINERS" username={username} />

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

        <div className={styles.bookingContainer}>
          <p style={{ textAlign: "center", color: "#d1d5db" }}>
            Loading trainer profile...
          </p>
        </div>
      </div>
    );
  }

  // ✅ Error state
  if (error || !trainer) {
    return (
      <div className={styles.pageWrapper}>
        <Navbar activeNav="OUR TRAINERS" username={username} />

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

        <div className={styles.bookingContainer}>
          <button
            onClick={() => navigate("/trainers")}
            className={styles.backButton}
          >
            ← Back to Trainers
          </button>
          <p style={{ textAlign: "center", color: "salmon" }}>{error}</p>
        </div>
      </div>
    );
  }

  // ✅ Use data directly from backend Trainer entity
  const {
    name,
    specialty,
    location,
    rating,
    image,
    description,
    experience,
    successRate,
    sessionsTaught,
    availability,
    certifications,
    specializations,
  } = trainer;

  return (
    <div className={styles.pageWrapper}>
      {/* Navbar */}
      <Navbar activeNav="OUR TRAINERS" username={username} />

      {/* Background animation */}
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

      {/* Main Content */}
      <div className={`${styles.bookingContainer} ${styles.fadeInSection}`}>
        <button
          onClick={() => navigate("/trainers")}
          className={styles.backButton}
        >
          ← Back to Trainers
        </button>

        <div className={styles.contentGrid}>
          {/* 🔹 LEFT: Trainer Info Card (same design as before) */}
          <div className={`${styles.trainerCard} ${styles.fadeInLeft}`}>
            <div
              className={styles.trainerImage}
              style={{
                // If DB stores just "sarah-martinez.jpg"
                backgroundImage: `url(/images/${image})`,
                // If DB stores full path, change to:
                // backgroundImage: `url(${image})`,
              }}
            />
            <div className={styles.trainerInfo}>
              <h2 className={styles.trainerName}>{name}</h2>

              <div className={styles.trainerRating}>
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    fill={i < (rating || 0) ? "#fbbf24" : "none"}
                    color="#fbbf24"
                  />
                ))}
                <span className={styles.ratingText}>
                  ({rating || 0}/5)
                </span>
              </div>

              <div className={styles.trainerLocation}>
                <MapPin size={18} />
                {/* Show specialty or location; adjust as you like */}
                <span>{specialty || location}</span>
              </div>

              <p className={styles.trainerDesc}>{description}</p>

              {/* Stats Section */}
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <Calendar size={24} className={styles.statIcon} />
                  <div>
                    <div className={styles.statValue}>
                      {experience || "N/A"}
                    </div>
                    <div className={styles.statLabel}>Experience</div>
                  </div>
                </div>
                <div className={styles.statCard}>
                  <TrendingUp size={24} className={styles.statIcon} />
                  <div>
                    <div className={styles.statValue}>
                      {successRate || "N/A"}
                    </div>
                    <div className={styles.statLabel}>Success Rate</div>
                  </div>
                </div>
                <div className={styles.statCard}>
                  <Target size={24} className={styles.statIcon} />
                  <div>
                    <div className={styles.statValue}>
                      {sessionsTaught || "N/A"}
                    </div>
                    <div className={styles.statLabel}>Sessions Taught</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 🔹 RIGHT: Credentials Card (same design, but from DB) */}
          <div className={`${styles.bookingCard} ${styles.fadeInRight}`}>
            <h1 className={styles.bookingTitle}>Trainer Credentials</h1>

            {/* Certifications */}
            <div className={styles.credentialSection}>
              <div className={styles.sectionHeader}>
                <Award size={24} className={styles.sectionIcon} />
                <h3 className={styles.sectionTitle}>Certifications</h3>
              </div>
              <ul className={styles.credentialList}>
                {(certifications || []).map((cert, index) => (
                  <li key={index} className={styles.credentialItem}>
                    <span className={styles.bulletPoint}>✓</span>
                    {cert}
                  </li>
                ))}
                {(!certifications || certifications.length === 0) && (
                  <li className={styles.credentialItem}>
                    <span className={styles.bulletPoint}>•</span>
                    No certifications listed.
                  </li>
                )}
              </ul>
            </div>

            {/* Specializations */}
            <div className={styles.credentialSection}>
              <div className={styles.sectionHeader}>
                <Target size={24} className={styles.sectionIcon} />
                <h3 className={styles.sectionTitle}>Specializations</h3>
              </div>
              <ul className={styles.credentialList}>
                {(specializations || []).map((spec, index) => (
                  <li key={index} className={styles.credentialItem}>
                    <span className={styles.bulletPoint}>✓</span>
                    {spec}
                  </li>
                ))}
                {(!specializations || specializations.length === 0) && (
                  <li className={styles.credentialItem}>
                    <span className={styles.bulletPoint}>•</span>
                    No specializations listed.
                  </li>
                )}
              </ul>
            </div>

            {/* Availability / Contact */}
            <div className={styles.contactSection}>
              <h3 className={styles.contactTitle}>Training Schedule</h3>
              <p className={styles.contactText}>
                {availability || "Schedule not specified."}
              </p>
              <p className={styles.contactText}>
                For inquiries and session bookings, please contact the front
                desk.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookTrainer;

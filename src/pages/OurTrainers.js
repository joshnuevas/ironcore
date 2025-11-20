// src/pages/OurTrainers.js

import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar"; // ✅ Reuse Navbar component
import landingStyles from "./LandingPage.module.css"; // For animated background
import styles from "./OurTrainers.module.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const OurTrainers = () => {
  const navigate = useNavigate();
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Load trainers from backend
  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/trainers");
        setTrainers(res.data || []);
      } catch (err) {
        console.error("Failed to load trainers:", err);
        setError("Failed to load trainers. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchTrainers();
  }, []);

  const handleViewProfile = (trainer) => {
    // Uses :trainerId route (App.js has /book-trainer/:trainerId)
    navigate(`/book-trainer/${trainer.id}`);
  };

  if (loading) {
    return (
      <div className={styles.pageWrapper}>
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
        <Navbar activeNav="OUR TRAINERS" />
        <div
          className={styles.trainersContainer}
          style={{ paddingTop: "6.5rem" }}
        >
          <p style={{ color: "white", textAlign: "center" }}>
            Loading trainers...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.pageWrapper}>
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
        <Navbar activeNav="OUR TRAINERS" />
        <div
          className={styles.trainersContainer}
          style={{ paddingTop: "6.5rem" }}
        >
          <p style={{ color: "salmon", textAlign: "center" }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      {/* 🔹 Background animation reused from LandingPage */}
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

      {/* 🔹 Reused Navbar */}
      <Navbar activeNav="OUR TRAINERS" />

      {/* 🔹 Trainers Section */}
      <div
        className={`${styles.trainersContainer} ${styles.fadeInSection}`}
        style={{ paddingTop: "6.5rem" }}
      >
        <div className={styles.headerSection}>
          <h1 className={styles.title}>OUR TRAINERS</h1>
          <p className={styles.subtitle}>
            Meet our elite team of fitness experts
          </p>
        </div>

        {trainers.length === 0 ? (
          <p style={{ color: "white", textAlign: "center", marginTop: "2rem" }}>
            No trainers available.
          </p>
        ) : (
          <div className={styles.trainersGrid}>
            {trainers.map((trainer, index) => (
              <div
                key={trainer.id}
                className={`${styles.card} ${styles.fadeInCard}`}
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div
                  className={styles.image}
                  style={{
                    // ✅ If DB stores just "sarah_martinez.png"
                    backgroundImage: `url(/images/${trainer.image})`,
                    // If you later store full path ("/images/xxx.png") in DB, change to:
                    // backgroundImage: `url(${trainer.image})`,
                  }}
                  role="img"
                  aria-label={trainer.name}
                />
                <div className={styles.cardContent}>
                  <h2 className={styles.name}>
                    {trainer.name}{" "}
                    <span className={styles.stars}>
                      {"★".repeat(trainer.rating || 0)}
                      {"☆".repeat(5 - (trainer.rating || 0))}
                    </span>
                  </h2>
                  <p className={styles.location}>{trainer.specialty}</p>
                  <p className={styles.desc}>{trainer.description}</p>
                  <button
                    className={styles.bookButton}
                    onClick={() => handleViewProfile(trainer)}
                  >
                    VIEW PROFILE
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OurTrainers;

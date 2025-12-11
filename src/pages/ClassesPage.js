import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import styles from "./ClassesPage.module.css";
import landingStyles from "./LandingPage.module.css";

const ClassesPage = () => {
  const navigate = useNavigate();

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Optional: map class names to gradient CSS classes
  const GRADIENT_MAP = {
    HIIT: styles.gradientHiit,
    ZUMBA: styles.gradientZumba,
    SPIN: styles.gradientSpin,
    YOGA: styles.gradientYoga,
    PILATES: styles.gradientPilates,
    BOXING: styles.gradientBoxing,
  };

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:8080/api/classes");
        if (!response.ok) {
          throw new Error("Failed to fetch classes");
        }
        const data = await response.json();

        const mapped = data.map((cls) => {
          const key = cls.name ? cls.name.toUpperCase() : "";
          const gradientClass = GRADIENT_MAP[key] || styles.defaultGradient;

          return {
            id: cls.id,
            title: cls.name,
            description: cls.description,
            image: cls.imageUrl || "/images/default-class.png",
            gradientClass,
          };
        });

        setClasses(mapped);
      } catch (err) {
        console.error(err);
        setError(err.message || "Error loading classes");
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  const handleJoinNow = (classItem) => {
    navigate("/class-details", {
      state: {
        classId: classItem.id,
      },
    });
  };

  // 🔁 SAME LOADING PATTERN AS ATTENDANCE PAGE
  if (loading) {
    return (
      <div className={styles.classesContainer}>
        <Navbar activeNav="CLASSES" />
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading classes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.classesContainer}>
      {/* Background animation */}
      <div className={landingStyles.backgroundOverlay}>
        <div className={`${landingStyles.bgBlur} ${landingStyles.bgBlur1}`}></div>
        <div className={`${landingStyles.bgBlur} ${landingStyles.bgBlur2}`}></div>
        <div className={`${landingStyles.bgBlur} ${landingStyles.bgBlur3}`}></div>
      </div>

      <Navbar activeNav="CLASSES" />

      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>OUR CLASSES</h1>
          <p className={styles.subtitle}>
            Choose from our diverse range of fitness classes designed to challenge and inspire you
          </p>
        </div>

        {error && (
          <p className={styles.statusTextError}>Failed to load classes: {error}</p>
        )}

        {!error && (
          <div className={styles.classesGrid}>
            {classes.map((classItem, index) => (
              <div
                key={classItem.id}
                className={styles.classCard}
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div
                  className={`${styles.classImageContainer} ${classItem.gradientClass}`}
                >
                  <div className={styles.imageOverlay}></div>
                  <img
                    src={classItem.image}
                    alt={classItem.title}
                    className={styles.classImage}
                  />
                </div>

                <div className={styles.classContent}>
                  <h3 className={styles.classTitle}>{classItem.title}</h3>
                  <p className={styles.classDescription}>
                    {classItem.description}
                  </p>

                  <button
                    className={`${styles.joinButton} ${classItem.gradientClass}`}
                    onClick={() => handleJoinNow(classItem)}
                  >
                    JOIN NOW
                  </button>
                </div>
              </div>
            ))}

            {classes.length === 0 && (
              <p className={styles.statusText}>No classes available.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassesPage;

import React from "react";
import Navbar from "../components/Navbar"; // ✅ Reuse Navbar component
import landingStyles from "./LandingPage.module.css"; // For animated background
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

const OurTrainers = () => {
  const navigate = useNavigate();

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
                  onClick={() =>
                    navigate("/book-trainer", { state: { trainer } })
                  }
                >
                  BOOK NOW
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OurTrainers;

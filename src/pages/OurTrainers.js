import React from "react";
import Navbar from "../components/Navbar"; // ✅ Reuse Navbar component
import landingStyles from "./LandingPage.module.css"; // For animated background
import styles from "./OurTrainers.module.css";
import { useNavigate } from "react-router-dom";

const trainers = [
  {
    name: "Coach Sarah Martinez",
    location: "HIIT & Cardio Specialist",
    rating: 5,
    image: "/images/sarah_martinez.png",
    description:
      "With 8 years of experience, Coach Sarah specializes in high-intensity interval training and cardio workouts. Her energetic approach and focus on fat burning and endurance makes her classes challenging yet rewarding for all fitness levels.",
  },
  {
    name: "Coach Maria Santos",
    location: "Dance & Cardio",
    rating: 5,
    image: "/images/maria_santos.png",
    description:
      "Coach Maria brings 7 years of dance and fitness expertise to every Zumba session. Her infectious energy and passion for dance-based cardio creates a fun, welcoming environment where everyone feels confident moving to the beat.",
  },
  {
    name: "Coach Anna Lee",
    location: "Cardio & Endurance",
    rating: 5,
    image: "/images/anna_lee.png",
    description:
      "With 6 years of experience in cycling and endurance training, Coach Anna leads high-energy spin classes that build stamina and leg strength. Her motivating coaching style pushes you to reach new performance levels.",
  },
  {
    name: "Coach Linda Chen",
    location: "Yoga & Meditation",
    rating: 5,
    image: "/images/linda_chen.png",
    description:
      "A master yoga instructor with 10 years of experience, Coach Linda guides students through mindful movement practices that build strength, flexibility, and inner peace. Her calming presence and expert instruction create transformative yoga experiences.",
  },
  {
    name: "Coach Emily Rodriguez",
    location: "Pilates & Core Training",
    rating: 5,
    image: "/images/emily_rodriguez.png",
    description:
      "Coach Emily has dedicated 9 years to mastering Pilates and core strengthening techniques. Her precise instruction and focus on proper alignment helps clients develop a strong, stable core while improving overall flexibility and posture.",
  },
  {
    name: "Coach Mark Johnson",
    location: "Boxing & Combat Fitness",
    rating: 5,
    image: "/images/mark_johnson.png",
    description:
      "With 11 years in boxing and combat fitness, Coach Mark delivers powerful, high-energy workouts that combine cardio, strength training, and stress relief. His expertise makes boxing accessible and exciting for all experience levels.",
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
            Meet our elite team of fitness experts
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
                  VIEW PROFILE
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
import React from "react";
import { Zap, Music, Bike, Flower2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar"; // ✅ Reused global Navbar
import styles from "./ClassesPage.module.css";
import landingStyles from "./LandingPage.module.css"; // ✅ For animated background

const ClassesPage = () => {
  const navigate = useNavigate();

  const classes = [
    {
      id: 1,
      title: "HIIT",
      description:
        "Short bursts of intense exercise followed by rest. Great for fat burning and endurance.",
      icon: Zap,
      gradientClass: styles.gradientHiit,
      // ✅ Added detailed data for ClassDetailsPage
      detailedData: {
        name: "HIIT Training",
        icon: "🔥",
        description: "High-Intensity Interval Training",
        price: "₱500",
        duration: "45 mins",
        intensity: "High",
        maxParticipants: 15,
        trainer: {
          name: "Coach Sarah Martinez",
          image: "👩‍🏫",
          specialty: "HIIT & Cardio Specialist",
          experience: "8 years",
          rating: 4.9,
        },
      },
    },
    {
      id: 2,
      title: "ZUMBA",
      description:
        "Dance-based cardio workout set to music. Fun, energetic, and great for all fitness levels.",
      icon: Music,
      gradientClass: styles.gradientZumba,
      // ✅ Added detailed data for ClassDetailsPage
      detailedData: {
        name: "Zumba Dance",
        icon: "💃",
        description: "Dance-based cardio workout set to music",
        price: "₱400",
        duration: "60 mins",
        intensity: "Medium",
        maxParticipants: 20,
        trainer: {
          name: "Coach Maria Santos",
          image: "👩‍🏫",
          specialty: "Dance & Cardio",
          experience: "7 years",
          rating: 4.8,
        },
      },
    },
    {
      id: 3,
      title: "SPIN",
      description:
        "High-energy cardio workout on stationary bikes. Focuses on stamina, leg strength, and endurance.",
      icon: Bike,
      gradientClass: styles.gradientSpin,
      // ✅ Added detailed data for ClassDetailsPage
      detailedData: {
        name: "Spin Class",
        icon: "🚴",
        description: "High-energy cycling workout",
        price: "₱450",
        duration: "45 mins",
        intensity: "Medium",
        maxParticipants: 15,
        trainer: {
          name: "Coach Anna Lee",
          image: "👩‍🏫",
          specialty: "Cardio & Endurance",
          experience: "6 years",
          rating: 4.7,
        },
      },
    },
    {
      id: 4,
      title: "YOGA",
      description:
        "Build strength, flexibility, and balance. Relieve stress and improve core stability.",
      icon: Flower2,
      gradientClass: styles.gradientYoga,
      // ✅ Added detailed data for ClassDetailsPage
      detailedData: {
        name: "Yoga Flow",
        icon: "🧘",
        description: "Mindful movement and flexibility",
        price: "₱400",
        duration: "60 mins",
        intensity: "Low",
        maxParticipants: 20,
        trainer: {
          name: "Coach Linda Chen",
          image: "👩‍🏫",
          specialty: "Yoga & Meditation",
          experience: "10 years",
          rating: 5.0,
        },
      },
    },
  ];

  // ✅ Handler to navigate to class details page
  const handleJoinNow = (classItem) => {
    navigate("/class-details", {
      state: {
        classData: classItem.detailedData,
        classId: classItem.id, // ✅ add this
      },
    });
  };

  return (
    <div className={styles.classesContainer}>
      {/* ✅ Reuse background animation */}
      <div className={landingStyles.backgroundOverlay}>
        <div className={`${landingStyles.bgBlur} ${landingStyles.bgBlur1}`}></div>
        <div className={`${landingStyles.bgBlur} ${landingStyles.bgBlur2}`}></div>
        <div className={`${landingStyles.bgBlur} ${landingStyles.bgBlur3}`}></div>
      </div>

      {/* ✅ Reuse Navbar component */}
      <Navbar activeNav="CLASSES" />

      {/* ✅ Main Page Content */}
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

                  <button
                    className={`${styles.joinButton} ${classItem.gradientClass}`}
                    onClick={() => handleJoinNow(classItem)}
                  >
                    JOIN NOW
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ClassesPage;
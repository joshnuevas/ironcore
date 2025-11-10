import React from "react";
import { Award, Calendar, Clock, MapPin, Star, Target, TrendingUp } from "lucide-react";
import Navbar from "../components/Navbar"; // ✅ Reuse Navbar component
import landingStyles from "./LandingPage.module.css";
import styles from "./BookTrainer.module.css";
import { useNavigate, useLocation } from "react-router-dom";

const BookTrainer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const username = localStorage.getItem("username");

  // Get trainer data from navigation state or use default
  const trainer = location.state?.trainer || {
    name: "Coach Sarah Martinez",
    location: "HIIT & Cardio Specialist",
    rating: 5,
    image: "/images/sarah-martinez.jpg",
    description:
      "With 8 years of experience, Coach Sarah specializes in high-intensity interval training and cardio workouts.",
  };

  // Trainer credentials based on their specialty
  const getTrainerCredentials = (trainerName) => {
    const credentials = {
      "Coach Sarah Martinez": {
        certifications: [
          "NASM Certified Personal Trainer (CPT)",
          "HIIT Specialist Certification",
          "Nutrition Coach Level 1",
          "CPR & First Aid Certified",
        ],
        specializations: [
          "High-Intensity Interval Training",
          "Fat Loss & Body Composition",
          "Cardiovascular Endurance",
          "Metabolic Conditioning",
        ],
        experience: "8 years",
        clientsSuccessRate: "95%",
        sessionsTaught: "2,400+",
      },
      "Coach Maria Santos": {
        certifications: [
          "Zumba Instructor Certification",
          "Group Fitness Instructor (AFAA)",
          "Dance Movement Therapy",
          "CPR & First Aid Certified",
        ],
        specializations: [
          "Zumba & Dance Fitness",
          "Cardio Dance Workouts",
          "Group Exercise Leadership",
          "Rhythmic Movement Training",
        ],
        experience: "7 years",
        clientsSuccessRate: "98%",
        sessionsTaught: "3,200+",
      },
      "Coach Anna Lee": {
        certifications: [
          "Spinning Instructor Certification",
          "ACE Certified Personal Trainer",
          "Endurance Training Specialist",
          "CPR & First Aid Certified",
        ],
        specializations: [
          "Indoor Cycling",
          "Endurance & Stamina Building",
          "Lower Body Strength",
          "Power & Speed Training",
        ],
        experience: "6 years",
        clientsSuccessRate: "93%",
        sessionsTaught: "1,800+",
      },
      "Coach Linda Chen": {
        certifications: [
          "RYT-500 Yoga Alliance Certified",
          "Meditation Instructor Certification",
          "Ayurvedic Wellness Coach",
          "CPR & First Aid Certified",
        ],
        specializations: [
          "Vinyasa & Hatha Yoga",
          "Mindfulness & Meditation",
          "Flexibility & Mobility",
          "Stress Management",
        ],
        experience: "10 years",
        clientsSuccessRate: "99%",
        sessionsTaught: "4,500+",
      },
      "Coach Emily Rodriguez": {
        certifications: [
          "PMA Certified Pilates Instructor",
          "Mat & Reformer Pilates Specialist",
          "Posture Alignment Specialist",
          "CPR & First Aid Certified",
        ],
        specializations: [
          "Classical & Contemporary Pilates",
          "Core Strengthening",
          "Postural Correction",
          "Injury Rehabilitation",
        ],
        experience: "9 years",
        clientsSuccessRate: "96%",
        sessionsTaught: "3,600+",
      },
      "Coach Mark Johnson": {
        certifications: [
          "USA Boxing Coach Certification",
          "NASM Performance Enhancement Specialist",
          "Strength & Conditioning Coach (CSCS)",
          "CPR & First Aid Certified",
        ],
        specializations: [
          "Boxing Technique & Form",
          "Combat Fitness Training",
          "Explosive Power Development",
          "Agility & Coordination",
        ],
        experience: "11 years",
        clientsSuccessRate: "94%",
        sessionsTaught: "4,200+",
      },
    };

    return credentials[trainerName] || credentials["Coach Sarah Martinez"];
  };

  const credentials = getTrainerCredentials(trainer.name);

  return (
    <div className={styles.pageWrapper}>
      {/* ✅ Reusable Navbar */}
      <Navbar activeNav="OUR TRAINERS" username={username} />

      {/* Background animation */}
      <div className={landingStyles.backgroundOverlay}>
        <div className={`${landingStyles.bgBlur} ${landingStyles.bgBlur1}`}></div>
        <div className={`${landingStyles.bgBlur} ${landingStyles.bgBlur2}`}></div>
        <div className={`${landingStyles.bgBlur} ${landingStyles.bgBlur3}`}></div>
      </div>

      {/* Main Content */}
      <div className={`${styles.bookingContainer} ${styles.fadeInSection}`}>
        <button onClick={() => navigate("/trainers")} className={styles.backButton}>
          ← Back to Trainers
        </button>

        <div className={styles.contentGrid}>
          {/* Trainer Info Card */}
          <div className={`${styles.trainerCard} ${styles.fadeInLeft}`}>
            <div
              className={styles.trainerImage}
              style={{ backgroundImage: `url(${trainer.image})` }}
            />
            <div className={styles.trainerInfo}>
              <h2 className={styles.trainerName}>{trainer.name}</h2>
              <div className={styles.trainerRating}>
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    fill={i < trainer.rating ? "#fbbf24" : "none"}
                    color="#fbbf24"
                  />
                ))}
                <span className={styles.ratingText}>({trainer.rating}/5)</span>
              </div>
              <div className={styles.trainerLocation}>
                <MapPin size={18} />
                <span>{trainer.location}</span>
              </div>
              <p className={styles.trainerDesc}>{trainer.description}</p>

              {/* Stats Section */}
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <Calendar size={24} className={styles.statIcon} />
                  <div>
                    <div className={styles.statValue}>{credentials.experience}</div>
                    <div className={styles.statLabel}>Experience</div>
                  </div>
                </div>
                <div className={styles.statCard}>
                  <TrendingUp size={24} className={styles.statIcon} />
                  <div>
                    <div className={styles.statValue}>{credentials.clientsSuccessRate}</div>
                    <div className={styles.statLabel}>Success Rate</div>
                  </div>
                </div>
                <div className={styles.statCard}>
                  <Target size={24} className={styles.statIcon} />
                  <div>
                    <div className={styles.statValue}>{credentials.sessionsTaught}</div>
                    <div className={styles.statLabel}>Sessions Taught</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Credentials Card */}
          <div className={`${styles.bookingCard} ${styles.fadeInRight}`}>
            <h1 className={styles.bookingTitle}>Trainer Credentials</h1>

            {/* Certifications */}
            <div className={styles.credentialSection}>
              <div className={styles.sectionHeader}>
                <Award size={24} className={styles.sectionIcon} />
                <h3 className={styles.sectionTitle}>Certifications</h3>
              </div>
              <ul className={styles.credentialList}>
                {credentials.certifications.map((cert, index) => (
                  <li key={index} className={styles.credentialItem}>
                    <span className={styles.bulletPoint}>✓</span>
                    {cert}
                  </li>
                ))}
              </ul>
            </div>

            {/* Specializations */}
            <div className={styles.credentialSection}>
              <div className={styles.sectionHeader}>
                <Target size={24} className={styles.sectionIcon} />
                <h3 className={styles.sectionTitle}>Specializations</h3>
              </div>
              <ul className={styles.credentialList}>
                {credentials.specializations.map((spec, index) => (
                  <li key={index} className={styles.credentialItem}>
                    <span className={styles.bulletPoint}>✓</span>
                    {spec}
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div className={styles.contactSection}>
              <h3 className={styles.contactTitle}>Training Schedule</h3>
              <p className={styles.contactText}>
                Available Monday - Saturday, 6:00 AM - 8:00 PM
              </p>
              <p className={styles.contactText}>
                For inquiries and session bookings, please contact the front desk.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookTrainer;
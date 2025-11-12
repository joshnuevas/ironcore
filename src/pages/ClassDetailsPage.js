import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Clock, Users, Calendar, MapPin, Dumbbell, Star } from "lucide-react";
import Navbar from "../components/Navbar";
import styles from "./ClassDetailsPage.module.css";
import axios from "axios";

const ClassDetailsPage = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [schedules, setSchedules] = useState([]);
  const [schedulesLoading, setSchedulesLoading] = useState(true);

  // Get class data from navigation state or use default
  const classData = location.state?.classData || {
    id: 1,
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
  };

  // ⭐ Fetch live schedules from backend
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setSchedulesLoading(true);
        const res = await axios.get(
          `http://localhost:8080/api/schedules/class/${classData.id}`,
          { withCredentials: true }
        );
        setSchedules(res.data);
      } catch (error) {
        console.error("Failed to fetch schedules:", error);
      } finally {
        setSchedulesLoading(false);
      }
    };

    if (classData.id) {
      fetchSchedules();
    }
  }, [classData.id]);

  // What to expect
  const expectations = [
    "Warm-up and mobility exercises",
    "High-intensity interval circuits",
    "Strength and cardio combinations",
    "Cool-down and stretching",
    "Personalized intensity modifications",
    "Heart rate monitoring",
  ];

  // Benefits
  const benefits = [
    "Burn calories efficiently",
    "Improve cardiovascular health",
    "Build lean muscle",
    "Boost metabolism",
    "Increase endurance",
    "Time-efficient workout",
  ];

  // Requirements
  const requirements = [
    "Gym membership or day pass",
    "Athletic wear and shoes",
    "Water bottle",
    "Towel",
    "Basic fitness level recommended",
  ];

  const handleEnrollNow = () => {
    console.log("Navigating with classData:", classData);
    navigate("/class-transaction", {
      state: {
        classData: classData,
      },
    });
  };

  return (
    <div className={styles.detailsContainer}>
      {/* Background */}
      <div className={styles.backgroundOverlay}>
        <div className={`${styles.bgBlur} ${styles.bgBlur1}`}></div>
        <div className={`${styles.bgBlur} ${styles.bgBlur2}`}></div>
        <div className={`${styles.bgBlur} ${styles.bgBlur3}`}></div>
      </div>

      {/* Navbar */}
      <Navbar activeNav="CLASSES" onLogout={onLogout} />

      {/* Content */}
      <div className={styles.contentSection}>
        <div className={styles.contentContainer}>
          {/* Back Button */}
          <button onClick={() => navigate("/classes")} className={styles.backButton}>
            <ArrowLeft className={styles.backIcon} />
            Back to Classes
          </button>

          {/* Main Content Grid */}
          <div className={styles.mainGrid}>
            {/* Left Column - Details */}
            <div className={styles.leftColumn}>
              {/* Class Header */}
              <div className={styles.classHeader}>
                <div className={styles.classIconWrapper}>
                  <span className={styles.classIconLarge}>{classData.icon}</span>
                </div>
                <div className={styles.classHeaderInfo}>
                  <h1 className={styles.className}>{classData.name}</h1>
                  <p className={styles.classDescription}>{classData.description}</p>
                  <div className={styles.classMeta}>
                    <span className={styles.metaBadge}>
                      <Clock size={16} />
                      {classData.duration}
                    </span>
                    <span className={styles.metaBadge}>
                      <Users size={16} />
                      Class Size: Up to {classData.maxParticipants} Participants
                    </span>
                    <span className={`${styles.metaBadge} ${styles.intensityBadge}`}>
                      <Dumbbell size={16} />
                      {classData.intensity} Intensity
                    </span>
                  </div>
                </div>
              </div>

              {/* Trainer Info */}
              <div className={styles.sectionCard}>
                <h2 className={styles.sectionTitle}>Your Trainer</h2>
                <div className={styles.trainerCard}>
                  <div className={styles.trainerAvatar}>
                    {classData.trainer.image}
                  </div>
                  <div className={styles.trainerInfo}>
                    <h3 className={styles.trainerName}>{classData.trainer.name}</h3>
                    <p className={styles.trainerSpecialty}>{classData.trainer.specialty}</p>
                    <div className={styles.trainerMeta}>
                      <span className={styles.trainerExp}>
                        {classData.trainer.experience} experience
                      </span>
                      <span className={styles.trainerRating}>
                        <Star size={14} fill="#f97316" stroke="#f97316" />
                        {classData.trainer.rating}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Schedule - ⭐ UPDATED WITH LIVE DATA */}
              <div className={styles.sectionCard}>
                <h2 className={styles.sectionTitle}>
                  <Calendar size={20} />
                  Weekly Schedule
                </h2>
                {schedulesLoading ? (
                  <div className={styles.loadingText}>Loading schedules...</div>
                ) : schedules.length === 0 ? (
                  <div className={styles.noSchedules}>No schedules available yet</div>
                ) : (
                  <div className={styles.scheduleList}>
                    {schedules.map((session) => {
                      const slotsLeft = session.maxParticipants - session.enrolledCount;
                      const isFull = slotsLeft <= 0;
                      
                      return (
                        <div 
                          key={session.id} 
                          className={`${styles.scheduleItem} ${isFull ? styles.scheduleItemFull : ""}`}
                        >
                          <div className={styles.scheduleDay}>{session.day}</div>
                          <div className={styles.scheduleTime}>{session.timeSlot}</div>
                          <div className={styles.scheduleDate}>
                            <Calendar size={14} /> {session.date}
                          </div>
                          <div className={isFull ? styles.scheduleSlotsFull : styles.scheduleSlots}>
                            {isFull ? "FULL" : `${slotsLeft} slots available`}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* What to Expect */}
              <div className={styles.sectionCard}>
                <h2 className={styles.sectionTitle}>What to Expect</h2>
                <ul className={styles.bulletList}>
                  {expectations.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Benefits */}
              <div className={styles.sectionCard}>
                <h2 className={styles.sectionTitle}>Benefits</h2>
                <div className={styles.benefitsGrid}>
                  {benefits.map((benefit, idx) => (
                    <div key={idx} className={styles.benefitItem}>
                      <span className={styles.benefitIcon}>✓</span>
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Requirements */}
              <div className={styles.sectionCard}>
                <h2 className={styles.sectionTitle}>What to Bring</h2>
                <ul className={styles.bulletList}>
                  {requirements.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right Column - Enrollment Card */}
            <div className={styles.rightColumn}>
              <div className={styles.enrollmentCard}>
                <div className={styles.priceSection}>
                  <span className={styles.priceLabel}>Class Fee</span>
                  <span className={styles.priceValue}>{classData.price}</span>
                  <span className={styles.priceNote}>per session</span>
                </div>

                <div className={styles.enrollmentDetails}>
                  <div className={styles.detailItem}>
                    <MapPin size={18} className={styles.detailIcon} />
                    <div>
                      <p className={styles.detailLabel}>Location</p>
                      <p className={styles.detailValue}>Main Studio Floor</p>
                    </div>
                  </div>

                  <div className={styles.detailItem}>
                    <Clock size={18} className={styles.detailIcon} />
                    <div>
                      <p className={styles.detailLabel}>Duration</p>
                      <p className={styles.detailValue}>{classData.duration}</p>
                    </div>
                  </div>

                  <div className={styles.detailItem}>
                    <Users size={18} className={styles.detailIcon} />
                    <div>
                      <p className={styles.detailLabel}>Class Size</p>
                      <p className={styles.detailValue}>Max {classData.maxParticipants} participants</p>
                    </div>
                  </div>
                </div>

                <button onClick={handleEnrollNow} className={styles.enrollButton}>
                  Enroll Now
                </button>

                <div className={styles.enrollmentNote}>
                  <span className={styles.noteIcon}>ℹ️</span>
                  <p>You can cancel up to 2 hours before the class starts for a full refund.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassDetailsPage;
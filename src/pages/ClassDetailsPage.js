import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  Users,
  Calendar,
  MapPin,
  Dumbbell,
  Star,
} from "lucide-react";
import styles from "./ClassDetailsPage.module.css";
import axios from "axios";
import Navbar from "../components/Navbar";

const ClassDetailsPage = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const classId = location.state?.classId;

  const [classData, setClassData] = useState(null);
  const [loadingClass, setLoadingClass] = useState(true);
  const [classError, setClassError] = useState(null);

  const [schedules, setSchedules] = useState([]);
  const [schedulesLoading, setSchedulesLoading] = useState(true);

  // Redirect if no classId
  useEffect(() => {
    if (!classId) {
      navigate("/classes");
    }
  }, [classId, navigate]);

  // Fetch class details from backend
  useEffect(() => {
    if (!classId) return;

    const fetchClassDetails = async () => {
      try {
        setLoadingClass(true);
        const res = await axios.get(
          `http://localhost:8080/api/classes/${classId}/details`,
          { withCredentials: true }
        );
        setClassData(res.data);
      } catch (error) {
        console.error("Failed to fetch class details:", error);
        setClassError("Failed to load class details.");
      } finally {
        setLoadingClass(false);
      }
    };

    fetchClassDetails();
  }, [classId]);

  // Fetch schedules from backend
  useEffect(() => {
    if (!classId) return;

    const fetchSchedules = async () => {
      try {
        setSchedulesLoading(true);
        const res = await axios.get(
          `http://localhost:8080/api/schedules/class/${classId}`,
          { withCredentials: true }
        );
        setSchedules(res.data);
      } catch (error) {
        console.error("Failed to fetch schedules:", error);
      } finally {
        setSchedulesLoading(false);
      }
    };

    fetchSchedules();
  }, [classId]);

  const handleEnrollNow = () => {
    if (!classData) return;
    navigate("/class-transaction", {
      state: {
        classData: classData,
      },
    });
  };

  if (loadingClass) {
    return (
      <div className={styles.detailsContainer}>
        <div className={styles.contentSection}>
          <div className={styles.contentContainer}>
            <p className={styles.loadingText}>Loading class details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (classError || !classData) {
    return (
      <div className={styles.detailsContainer}>
        <div className={styles.contentSection}>
          <div className={styles.contentContainer}>
            <p className={styles.loadingText}>
              {classError || "Class not found."}
            </p>
            <button
              onClick={() => navigate("/classes")}
              className={styles.backButton}
            >
              <ArrowLeft className={styles.backIcon} />
              Back to Classes
            </button>
          </div>
        </div>
      </div>
    );
  }

  const trainer = classData.trainer || {};
  const expectations = classData.expectations || [];
  const benefits = classData.benefits || [];
  const requirements = classData.requirements || [];

  const renderTrainerAvatar = () => {
    const img = trainer.image;

    if (!img) {
      return "👤"; // default emoji
    }

    let src = img;

    // Case 1: already a full/relative URL (/images/... or http...)
    if (img.startsWith("/") || img.startsWith("http")) {
      src = img;
    }
    // Case 2: plain filename like "sarah_martinez2.png" -> assume /images/
    else if (img.match(/\.(png|jpe?g|gif|webp|svg)$/i)) {
      src = `/images/${img}`;
    } else {
      // Not a path or filename, probably an emoji or text
      return img;
    }

    return (
      <img
        src={src}
        alt={trainer.name}
        className={styles.trainerAvatarImage}
      />
    );
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
          <button
            onClick={() => navigate("/classes")}
            className={styles.backButton}
          >
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
                  <span className={styles.classIconLarge}>
                    {classData.icon || "🏋️"}
                  </span>
                </div>
                <div className={styles.classHeaderInfo}>
                  <h1 className={styles.className}>{classData.name}</h1>
                  <p className={styles.classDescription}>
                    {classData.description}
                  </p>
                  <div className={styles.classMeta}>
                    <span className={styles.metaBadge}>
                      <Clock size={16} />
                      {classData.duration}
                    </span>
                    <span className={styles.metaBadge}>
                      <Users size={16} />
                      Class Size: Up to{" "}
                      {classData.maxParticipants || "N/A"} Participants
                    </span>
                    <span
                      className={`${styles.metaBadge} ${styles.intensityBadge}`}
                    >
                      <Dumbbell size={16} />
                      {classData.intensity || "N/A"} Intensity
                    </span>
                  </div>
                </div>
              </div>

              {/* Trainer Info */}
              {trainer && trainer.name && (
                <div className={styles.sectionCard}>
                  <h2 className={styles.sectionTitle}>Your Trainer</h2>
                  <div className={styles.trainerCard}>
                    <div className={styles.trainerAvatar}>
                      {renderTrainerAvatar()}
                    </div>
                    <div className={styles.trainerInfo}>
                      <h3 className={styles.trainerName}>{trainer.name}</h3>
                      <p className={styles.trainerSpecialty}>
                        {trainer.specialty}
                      </p>
                      <div className={styles.trainerMeta}>
                        <span className={styles.trainerExp}>
                          {trainer.experience}
                        </span>
                        {trainer.rating != null && (
                          <span className={styles.trainerRating}>
                            <Star
                              size={14}
                              fill="#f97316"
                              stroke="#f97316"
                            />
                            {trainer.rating}
                          </span>
                        )}
                      </div>

                      {/* Specializations & Certifications */}
                      {(trainer.specializations &&
                        trainer.specializations.length > 0) && (
                        <div className={styles.trainerRow}>
                          <span className={styles.trainerRowLabel}>
                            Specializations:
                          </span>
                          <div className={styles.trainerTags}>
                            {trainer.specializations.map((spec, idx) => (
                              <span
                                key={`spec-${idx}`}
                                className={styles.trainerTag}
                              >
                                {spec}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {(trainer.certifications &&
                        trainer.certifications.length > 0) && (
                        <div className={styles.trainerRow}>
                          <span className={styles.trainerRowLabel}>
                            Certifications:
                          </span>
                          <div className={styles.trainerTags}>
                            {trainer.certifications.map((cert, idx) => (
                              <span
                                key={`cert-${idx}`}
                                className={styles.trainerTagSecondary}
                              >
                                {cert}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Weekly Schedule */}
              <div className={styles.sectionCard}>
                <h2 className={styles.sectionTitle}>
                  <Calendar size={20} />
                  Weekly Schedule
                </h2>
                {schedulesLoading ? (
                  <div className={styles.loadingText}>
                    Loading schedules...
                  </div>
                ) : schedules.length === 0 ? (
                  <div className={styles.noSchedules}>
                    No schedules available yet
                  </div>
                ) : (
                  <div className={styles.scheduleList}>
                    {schedules.map((session) => {
                      const slotsLeft =
                        session.maxParticipants - session.enrolledCount;
                      const isFull = slotsLeft <= 0;

                      return (
                        <div
                          key={session.id}
                          className={`${styles.scheduleItem} ${
                            isFull ? styles.scheduleItemFull : ""
                          }`}
                        >
                          <div className={styles.scheduleDay}>
                            {session.day}
                          </div>
                          <div className={styles.scheduleTime}>
                            {session.timeSlot}
                          </div>
                          <div className={styles.scheduleDate}>
                            <Calendar size={14} /> {session.date}
                          </div>
                          <div
                            className={
                              isFull
                                ? styles.scheduleSlotsFull
                                : styles.scheduleSlots
                            }
                          >
                            {isFull
                              ? "FULL"
                              : `${slotsLeft} slots available`}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* What to Expect */}
              {expectations.length > 0 && (
                <div className={styles.sectionCard}>
                  <h2 className={styles.sectionTitle}>What to Expect</h2>
                  <ul className={styles.bulletList}>
                    {expectations.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Benefits */}
              {benefits.length > 0 && (
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
              )}

              {/* Requirements */}
              {requirements.length > 0 && (
                <div className={styles.sectionCard}>
                  <h2 className={styles.sectionTitle}>What to Bring</h2>
                  <ul className={styles.bulletList}>
                    {requirements.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Right Column - Enrollment Card */}
            <div className={styles.rightColumn}>
              <div className={styles.enrollmentCard}>
                <div className={styles.priceSection}>
                  <span className={styles.priceLabel}>Class Fee</span>
                  <span className={styles.priceValue}>
                    {classData.price != null
                      ? `₱${classData.price.toFixed(0)}`
                      : "₱0"}
                  </span>
                  <span className={styles.priceNote}>per session</span>
                </div>

                <div className={styles.enrollmentDetails}>
                  <div className={styles.detailItem}>
                    <MapPin size={18} className={styles.detailIcon} />
                    <div>
                      <p className={styles.detailLabel}>Location</p>
                      <p className={styles.detailValue}>
                        {classData.location || "Studio"}
                      </p>
                    </div>
                  </div>

                  <div className={styles.detailItem}>
                    <Clock size={18} className={styles.detailIcon} />
                    <div>
                      <p className={styles.detailLabel}>Duration</p>
                      <p className={styles.detailValue}>
                        {classData.duration}
                      </p>
                    </div>
                  </div>

                  <div className={styles.detailItem}>
                    <Users size={18} className={styles.detailIcon} />
                    <div>
                      <p className={styles.detailLabel}>Class Size</p>
                      <p className={styles.detailValue}>
                        Max {classData.maxParticipants || "N/A"} participants
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleEnrollNow}
                  className={styles.enrollButton}
                >
                  Enroll Now
                </button>

                <div className={styles.enrollmentNote}>
                  <span className={styles.noteIcon}>ℹ️</span>
                  <p>
                    {classData.cancelPolicy ||
                      "You can cancel up to 2 hours before the class starts for a full refund."}
                  </p>
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

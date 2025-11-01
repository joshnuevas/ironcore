import React, { useState } from "react";
import { Dumbbell, Calendar, Clock, DollarSign, MapPin, Star } from "lucide-react";
import landingStyles from "./LandingPage.module.css";
import styles from "./BookTrainer.module.css";
import { useNavigate, useLocation } from "react-router-dom";

const BookTrainer = ({ onLogout }) => {
  const [activeNav, setActiveNav] = useState("OUR TRAINERS");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [sessionType, setSessionType] = useState("personal");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Get trainer data from navigation state or use default
  const trainer = location.state?.trainer || {
    name: "The King",
    location: "Palo, Leyte",
    rating: 4,
    image: "/images/theking.jpg",
    description:
      "Known for his no-nonsense training approach, The King has over 8 years of experience in strength and conditioning.",
  };

  const navItems = ["HOME", "ABOUT US", "OUR TRAINERS", "CLASSES", "MEMBERSHIP"];

  const timeSlots = [
    "06:00 AM", "07:00 AM", "08:00 AM", "09:00 AM", "10:00 AM",
    "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM",
    "06:00 PM", "07:00 PM"
  ];

  const sessionPrices = {
    personal: 500,
    group: 300,
    package: 4500
  };

  const handleNavClick = (item) => {
    setActiveNav(item);
    const map = {
      HOME: "/landing",
      "ABOUT US": "/about",
      "OUR TRAINERS": "/trainers",
      CLASSES: "/classes",
      MEMBERSHIP: "/membership",
    };
    if (map[item]) navigate(map[item]);
  };

  const handleLogout = () => setShowLogoutModal(true);
  const confirmLogout = () => {
    setShowLogoutModal(false);
    if (onLogout) onLogout();
    navigate("/login");
  };
  const cancelLogout = () => setShowLogoutModal(false);

  const handleBooking = (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) {
      alert("Please select both date and time");
      return;
    }
    setShowConfirmModal(true);
  };

  const confirmBooking = () => {
    setShowConfirmModal(false);
    navigate("/transaction", {
      state: {
        trainer: trainer.name,
        date: selectedDate,
        time: selectedTime,
        sessionType,
        price: sessionPrices[sessionType]
      }
    });
  };

  const cancelBooking = () => setShowConfirmModal(false);

  return (
    <div className={styles.pageWrapper}>
      {/* Background animation */}
      <div className={landingStyles.backgroundOverlay}>
        <div className={`${landingStyles.bgBlur} ${landingStyles.bgBlur1}`}></div>
        <div className={`${landingStyles.bgBlur} ${landingStyles.bgBlur2}`}></div>
        <div className={`${landingStyles.bgBlur} ${landingStyles.bgBlur3}`}></div>
      </div>

      {/* Navbar */}
      <nav className={landingStyles.navbar}>
        <div className={landingStyles.navContainer}>
          <div className={landingStyles.logoSection}>
            <div className={landingStyles.logoIcon}>
              <Dumbbell className={landingStyles.dumbbellIcon} />
            </div>
            <span className={landingStyles.logoText}>
              IRON<span className={landingStyles.logoAccent}>CORE</span>
            </span>
          </div>

          <div className={landingStyles.navLinks}>
            {navItems.map((item) => (
              <button
                key={item}
                onClick={() => handleNavClick(item)}
                className={`${landingStyles.navLink} ${
                  activeNav === item ? landingStyles.navLinkActive : ""
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <button onClick={handleLogout} className={landingStyles.logoutButton}>
            LOGOUT
          </button>
        </div>
      </nav>

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
            </div>
          </div>

          {/* Booking Form */}
          <div className={`${styles.bookingCard} ${styles.fadeInRight}`}>
            <h1 className={styles.bookingTitle}>Book a Session</h1>
            <form onSubmit={handleBooking} className={styles.bookingForm}>
              {/* Session Type */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Session Type</label>
                <div className={styles.sessionTypes}>
                  <button
                    type="button"
                    className={`${styles.sessionBtn} ${
                      sessionType === "personal" ? styles.sessionBtnActive : ""
                    }`}
                    onClick={() => setSessionType("personal")}
                  >
                    <div className={styles.sessionOption}>
                      <span className={styles.sessionName}>Personal</span>
                      <span className={styles.sessionPrice}>₱500/session</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    className={`${styles.sessionBtn} ${
                      sessionType === "group" ? styles.sessionBtnActive : ""
                    }`}
                    onClick={() => setSessionType("group")}
                  >
                    <div className={styles.sessionOption}>
                      <span className={styles.sessionName}>Group</span>
                      <span className={styles.sessionPrice}>₱300/session</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    className={`${styles.sessionBtn} ${
                      sessionType === "package" ? styles.sessionBtnActive : ""
                    }`}
                    onClick={() => setSessionType("package")}
                  >
                    <div className={styles.sessionOption}>
                      <span className={styles.sessionName}>10-Pack</span>
                      <span className={styles.sessionPrice}>₱4,500</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Date Selection */}
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <Calendar size={18} />
                  Select Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className={styles.dateInput}
                  required
                />
              </div>

              {/* Time Selection */}
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <Clock size={18} />
                  Select Time
                </label>
                <div className={styles.timeGrid}>
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      type="button"
                      className={`${styles.timeSlot} ${
                        selectedTime === time ? styles.timeSlotActive : ""
                      }`}
                      onClick={() => setSelectedTime(time)}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Summary */}
              <div className={styles.priceSummary}>
                <DollarSign size={20} />
                <span className={styles.priceLabel}>Total Price:</span>
                <span className={styles.priceAmount}>
                  ₱{sessionPrices[sessionType].toLocaleString()}
                </span>
              </div>

              {/* Submit Button */}
              <button type="submit" className={styles.submitButton}>
                CONFIRM BOOKING
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className={landingStyles.modalOverlay}>
          <div className={landingStyles.modalContent}>
            <h2>Confirm Logout</h2>
            <p>Are you sure you want to logout?</p>
            <div className={landingStyles.modalButtons}>
              <button onClick={confirmLogout} className={landingStyles.modalConfirm}>
                Logout
              </button>
              <button onClick={cancelLogout} className={landingStyles.modalCancel}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Confirmation Modal */}
      {showConfirmModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2 className={styles.modalTitle}>Confirm Your Booking</h2>
            <div className={styles.modalDetails}>
              <p><strong>Trainer:</strong> {trainer.name}</p>
              <p><strong>Date:</strong> {new Date(selectedDate).toLocaleDateString()}</p>
              <p><strong>Time:</strong> {selectedTime}</p>
              <p><strong>Session:</strong> {sessionType.charAt(0).toUpperCase() + sessionType.slice(1)}</p>
              <p><strong>Price:</strong> ₱{sessionPrices[sessionType].toLocaleString()}</p>
            </div>
            <div className={styles.modalButtons}>
              <button onClick={confirmBooking} className={styles.modalConfirm}>
                Proceed to Payment
              </button>
              <button onClick={cancelBooking} className={styles.modalCancel}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookTrainer;
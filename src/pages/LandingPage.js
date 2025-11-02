import React from "react";
import Navbar from "../components/Navbar";
import styles from "./LandingPage.module.css";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  const handleContact = () => {
    navigate("/contact");
  };

  return (
    <div className={styles.landingContainer}>
      {/* Use the Navbar component */}
      <Navbar activeNav="HOME" />

      {/* Animated background elements */}
      <div className={styles.backgroundOverlay}>
        <div className={`${styles.bgBlur} ${styles.bgBlur1}`}></div>
        <div className={`${styles.bgBlur} ${styles.bgBlur2}`}></div>
        <div className={`${styles.bgBlur} ${styles.bgBlur3}`}></div>
      </div>

      {/* Hero Section */}
      <div className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroQuote}>
            <span className={styles.quoteMain}>WORK HARD.</span>
            <span className={styles.quoteSub}>Stay Humble</span>
          </h1>
          <button onClick={handleContact} className={styles.contactButton}>
            CONTACT
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
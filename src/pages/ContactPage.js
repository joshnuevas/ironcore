import React from "react";
import { MapPin, Mail, Phone, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import styles from "./ContactPage.module.css";
import landingStyles from "./LandingPage.module.css";

const ContactPage = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.contactContainer}>
      {/* ✅ Background blur animations */}
      <div className={landingStyles.backgroundOverlay}>
        <div className={`${landingStyles.bgBlur} ${landingStyles.bgBlur1}`}></div>
        <div className={`${landingStyles.bgBlur} ${landingStyles.bgBlur2}`}></div>
        <div className={`${landingStyles.bgBlur} ${landingStyles.bgBlur3}`}></div>
      </div>

      {/* ✅ Reuse Navbar with logout + username built-in */}
      <Navbar activeNav="CONTACT" />

      {/* ✅ Page content */}
      <div className={styles.contentWrapper}>
        <div className={styles.contactCard}>
          <h1 className={styles.contactTitle}>GET IN TOUCH</h1>
          <p className={styles.contactSubtitle}>
            We're ready to help you hit your fitness goals.
          </p>

          {/* ✅ Contact Information */}
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <div className={styles.iconWrapper}>
                <MapPin size={32} className={styles.infoIcon} />
              </div>
              <h3 className={styles.infoLabel}>Location</h3>
              <p className={styles.infoText}>Cebu City, Philippines</p>
            </div>
            
            <div className={styles.infoItem}>
              <div className={styles.iconWrapper}>
                <Phone size={32} className={styles.infoIcon} />
              </div>
              <h3 className={styles.infoLabel}>Phone</h3>
              <p className={styles.infoText}>(032) 555-IRON</p>
            </div>
            
            <div className={styles.infoItem}>
              <div className={styles.iconWrapper}>
                <Mail size={32} className={styles.infoIcon} />
              </div>
              <h3 className={styles.infoLabel}>Email</h3>
              <p className={styles.infoText}>info@ironcorefitness.com</p>
            </div>
            
            <div className={styles.infoItem}>
              <div className={styles.iconWrapper}>
                <Clock size={32} className={styles.infoIcon} />
              </div>
              <h3 className={styles.infoLabel}>Hours</h3>
              <p className={styles.infoText}>Mon-Fri: 5AM - 10PM</p>
              <p className={styles.infoText}>Sat-Sun: 6AM - 8PM</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
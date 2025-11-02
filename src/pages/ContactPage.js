import React, { useState } from "react";
import { MapPin, Mail, Phone, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar"; // ✅ Reuse global Navbar
import styles from "./ContactPage.module.css";
import landingStyles from "./LandingPage.module.css"; // ✅ For animated background

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const navigate = useNavigate();

  // ✅ Handle form changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmissionStatus("submitting");

    setTimeout(() => {
      console.log("Form Submitted:", formData);
      setFormData({ name: "", email: "", message: "" });
      setSubmissionStatus("success");
      setTimeout(() => setSubmissionStatus(null), 3000);
    }, 1500);
  };

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
              <MapPin size={28} className={styles.infoIcon} />
              <p className={styles.infoText}>123 Muscle Ave, Metacity, CA 90210</p>
            </div>
            <div className={styles.infoItem}>
              <Phone size={28} className={styles.infoIcon} />
              <p className={styles.infoText}>(555) 555-CORE</p>
            </div>
            <div className={styles.infoItem}>
              <Mail size={28} className={styles.infoIcon} />
              <p className={styles.infoText}>sweat@ironcoregym.com</p>
            </div>
          </div>

          {/* ✅ Contact Form */}
          <form onSubmit={handleSubmit} className={styles.contactForm}>
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleChange}
              required
              className={styles.formInput}
            />
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              value={formData.email}
              onChange={handleChange}
              required
              className={styles.formInput}
            />
            <textarea
              name="message"
              placeholder="Your Message (Let us know your fitness goals!)"
              value={formData.message}
              onChange={handleChange}
              required
              rows="5"
              className={styles.formTextarea}
            />
            <button
              type="submit"
              className={styles.submitButton}
              disabled={submissionStatus === "submitting"}
            >
              {submissionStatus === "submitting" ? (
                "SENDING..."
              ) : (
                <>
                  <Send size={18} /> SEND MESSAGE
                </>
              )}
            </button>

            {submissionStatus === "success" && (
              <p className={styles.successMessage}>
                Message sent successfully! We will be in touch soon.
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;

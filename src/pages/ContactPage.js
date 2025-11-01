import React, { useState } from "react";
import { Dumbbell, MapPin, Mail, Phone, Send } from "lucide-react";
import styles from "./ContactPage.module.css";
import { useNavigate } from "react-router-dom";

const ContactPage = ({ onLogout }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [submissionStatus, setSubmissionStatus] = useState(null); // null, 'success', 'error'
  const navigate = useNavigate();

  // Mock navigation for the menu (needs to be implemented via App.js or context if this component were used in place of LandingPage)
  const navItems = [
    "HOME",
    "ABOUT US",
    "OUR TRAINERS",
    "CLASSES",
    "MEMBERSHIP",
  ];
  const handleNavClick = (item) => {
    // Navigate back to landing for HOME, otherwise just log a message
    if (item === "HOME") {
      navigate("/landing");
    } else {
      console.log(`Navigating to mock page: ${item}`);
    }
  };

  const handleLogout = () => {
    console.log("Logout attempted from Contact Page");
    if (onLogout) onLogout();
    navigate("/login");
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmissionStatus("submitting");

    // Simulate API call delay
    setTimeout(() => {
      console.log("Form Submitted:", formData);
      // Reset form and show success message
      setFormData({ name: "", email: "", message: "" });
      setSubmissionStatus("success");

      // Clear success message after 3 seconds
      setTimeout(() => setSubmissionStatus(null), 3000);
    }, 1500);
  };

  return (
    <div className={styles.contactContainer}>
      {/* Animated background elements (Reusing the LandingPage theme) */}
      <div className={styles.backgroundOverlay}>
        <div className={`${styles.bgBlur} ${styles.bgBlur1}`}></div>
        <div className={`${styles.bgBlur} ${styles.bgBlur2}`}></div>
        <div className={`${styles.bgBlur} ${styles.bgBlur3}`}></div>
      </div>

      {/* Navbar (Duplicated from LandingPage for visual consistency, should ideally be a shared component) */}
      <nav className={styles.navbar}>
        <div className={styles.navContainer}>
          <div
            className={styles.logoSection}
            onClick={() => navigate("/landing")}
          >
            <div className={styles.logoIcon}>
              <Dumbbell className={styles.dumbbellIcon} />
            </div>
            <span className={styles.logoText}>
              IRON<span className={styles.logoAccent}>CORE</span>
            </span>
          </div>

          <div className={styles.navLinks}>
            {navItems.map((item) => (
              <button
                key={item}
                onClick={() => handleNavClick(item)}
                // Highlight 'CONTACT' if it were in the menu, but for now, highlight HOME
                className={`${styles.navLink} ${
                  item === "HOME" ? styles.navLinkActive : ""
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <button onClick={handleLogout} className={styles.logoutButton}>
            LOGOUT
          </button>
        </div>
      </nav>

      {/* Contact Section */}
      <div className={styles.contentWrapper}>
        <div className={styles.contactCard}>
          <h1 className={styles.contactTitle}>GET IN TOUCH</h1>
          <p className={styles.contactSubtitle}>
            We're ready to help you hit your fitness goals.
          </p>

          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <MapPin size={28} className={styles.infoIcon} />
              <p className={styles.infoText}>
                123 Muscle Ave, Metacity, CA 90210
              </p>
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

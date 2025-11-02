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
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const navigate = useNavigate();

   const username = localStorage.getItem("username");
   
  const navItems = [
    { name: "HOME", path: "/landing" },
    { name: "ABOUT US", path: "/about" },
    { name: "OUR TRAINERS", path: "/trainers" },
    { name: "CLASSES", path: "/classes" },
    { name: "MEMBERSHIP", path: "/membership" },
  ];

  const handleNavClick = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    if (onLogout) onLogout();
    navigate("/login");
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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
      <div className={styles.backgroundOverlay}>
        <div className={`${styles.bgBlur} ${styles.bgBlur1}`}></div>
        <div className={`${styles.bgBlur} ${styles.bgBlur2}`}></div>
        <div className={`${styles.bgBlur} ${styles.bgBlur3}`}></div>
      </div>

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
                key={item.name}
                onClick={() => handleNavClick(item.path)}
                className={`${styles.navLink} ${
                  item.name === "HOME" ? styles.navLinkActive : ""
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>
{/* Welcome message with username */}
          <span className={styles.welcomeText}>Welcome, {username}!</span>
          <button onClick={handleLogout} className={styles.logoutButton}>
            LOGOUT
          </button>
        </div>
      </nav>

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

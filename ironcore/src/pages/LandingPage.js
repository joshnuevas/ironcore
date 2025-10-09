import React, { useState } from 'react';
import { Dumbbell } from 'lucide-react';
import styles from './LandingPage.module.css';
import { useNavigate } from 'react-router-dom';

const LandingPage = ({ onLogout }) => {
  const [activeNav, setActiveNav] = useState('HOME');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  const navItems = ['HOME', 'ABOUT US', 'OUR TRAINERS', 'CLASSES', 'MEMBERSHIP'];

  const handleNavClick = (item) => {
    setActiveNav(item);

    switch (item) {
      case 'HOME':
        navigate('/landing');
        break;
      case 'ABOUT US':
        navigate('/about');
        break;
      case 'OUR TRAINERS':
        navigate('/trainers');
        break;
      case 'CLASSES':
        alert('Classes page coming soon!');
        break;
      case 'MEMBERSHIP':
        alert('Membership info coming soon!');
        break;
      default:
        break;
    }

    console.log(`Navigating to ${item}`);
  };

  const handleContact = () => {
    console.log('Contact button clicked');
    alert('Contact form coming soon!');
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    if (onLogout) onLogout();
    navigate('/login');
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <div className={styles.landingContainer}>
      {/* Animated background elements */}
      <div className={styles.backgroundOverlay}>
        <div className={`${styles.bgBlur} ${styles.bgBlur1}`}></div>
        <div className={`${styles.bgBlur} ${styles.bgBlur2}`}></div>
        <div className={`${styles.bgBlur} ${styles.bgBlur3}`}></div>
      </div>

      {/* Navbar */}
      <nav className={styles.navbar}>
        <div className={styles.navContainer}>
          <div className={styles.logoSection}>
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
                className={`${styles.navLink} ${activeNav === item ? styles.navLinkActive : ''}`}
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

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>Confirm Logout</h2>
            <p>Are you sure you want to logout?</p>
            <div className={styles.modalButtons}>
              <button onClick={confirmLogout} className={styles.modalConfirm}>
                Logout
              </button>
              <button onClick={cancelLogout} className={styles.modalCancel}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
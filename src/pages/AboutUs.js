import React, { useState } from 'react';
import { Dumbbell, Target, Users, Award, TrendingUp, Heart, Shield } from 'lucide-react';
import styles from './AboutUs.module.css';

const AboutUs = ({ onLogout, onNavigate }) => {
  const [activeNav, setActiveNav] = useState('ABOUT US');
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const navItems = ['HOME', 'ABOUT US', 'OUR TRAINERS', 'CLASSES', 'MEMBERSHIP'];

  // ✅ Updated: Full navigation handling
  const handleNavClick = (item) => {
    setActiveNav(item);
    if (onNavigate) {
      switch (item) {
        case 'HOME':
          onNavigate('landing');
          break;
        case 'ABOUT US':
          onNavigate('about');
          break;
        case 'OUR TRAINERS':
          onNavigate('trainers');
          break;
        case 'CLASSES':
          onNavigate('classes');
          break;
        case 'MEMBERSHIP':
          onNavigate('membership');
          break;
        default:
          console.log(`Navigating to ${item}`);
      }
    }
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    if (onLogout) onLogout();
    if (onNavigate) onNavigate('login');
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const values = [
    {
      icon: <Target size={32} />,
      title: 'Excellence',
      description: 'We push boundaries and strive for excellence in everything we do, from our training programs to our community culture.'
    },
    {
      icon: <Users size={32} />,
      title: 'Community',
      description: 'Building a supportive family where everyone motivates each other to reach their full potential and beyond.'
    },
    {
      icon: <Heart size={32} />,
      title: 'Passion',
      description: 'Our dedication to fitness and wellness drives us to create transformative experiences for every member.'
    },
    {
      icon: <Shield size={32} />,
      title: 'Integrity',
      description: 'We maintain the highest standards of professionalism, honesty, and accountability in all our interactions.'
    }
  ];

  const stats = [
    { number: '5000+', label: 'Active Members' },
    { number: '50+', label: 'Expert Trainers' },
    { number: '100+', label: 'Classes Weekly' },
    { number: '10+', label: 'Years Strong' }
  ];

  return (
    <div className={styles.aboutContainer}>
      {/* Animated background */}
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

      {/* Content */}
      <div className={styles.content}>
        {/* Hero Section */}
        <section className={styles.heroSection}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              <span className={styles.titleMain}>ABOUT</span>
              <span className={styles.titleAccent}>IRONCORE</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Where strength meets community, and dedication becomes transformation
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className={styles.missionSection}>
          <div className={styles.missionContent}>
            <div className={styles.missionIcon}>
              <Award size={48} />
            </div>
            <h2 className={styles.sectionTitle}>OUR MISSION</h2>
            <p className={styles.missionText}>
              At IRONCORE, we believe fitness is more than just physical transformation. It's about building mental resilience,
              fostering genuine connections, and creating a lifestyle that empowers you to be your strongest self. We're committed
              to providing world-class facilities, expert guidance, and an inclusive environment where everyone from beginners to
              elite athletes can thrive and achieve their goals.
            </p>
          </div>
        </section>

        {/* Stats Section */}
        <section className={styles.statsSection}>
          <div className={styles.statsGrid}>
            {stats.map((stat, index) => (
              <div key={index} className={styles.statCard}>
                <div className={styles.statNumber}>{stat.number}</div>
                <div className={styles.statLabel}>{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Values Section */}
        <section className={styles.valuesSection}>
          <h2 className={styles.sectionTitle}>OUR CORE VALUES</h2>
          <div className={styles.valuesGrid}>
            {values.map((value, index) => (
              <div key={index} className={styles.valueCard}>
                <div className={styles.valueIcon}>{value.icon}</div>
                <h3 className={styles.valueTitle}>{value.title}</h3>
                <p className={styles.valueDescription}>{value.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Story Section */}
        <section className={styles.storySection}>
          <div className={styles.storyContent}>
            <div className={styles.storyIcon}>
              <TrendingUp size={48} />
            </div>
            <h2 className={styles.sectionTitle}>OUR STORY</h2>
            <p className={styles.storyText}>
              Founded in 2015, IRONCORE began with a simple vision: create a space where people could push their limits
              without judgment. What started as a single location with a handful of passionate trainers has grown into a
              thriving community of over 5,000 members. Through dedication, innovation, and an unwavering commitment to
              excellence, we've become more than just a gym—we're a movement. Every day, we witness incredible transformations,
              celebrate personal victories, and build lasting friendships. This is what drives us forward.
            </p>
          </div>
        </section>

        {/* CTA Section */}
        <section className={styles.ctaSection}>
          <h2 className={styles.ctaTitle}>Ready to Start Your Journey?</h2>
          <p className={styles.ctaText}>Join the IRONCORE family and discover what you're truly capable of.</p>
          <button className={styles.ctaButton}>GET STARTED TODAY</button>
        </section>
      </div>

      {/* Logout Modal */}
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

export default AboutUs;

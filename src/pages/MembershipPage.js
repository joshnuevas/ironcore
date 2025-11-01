import React, { useState } from "react";
import { Dumbbell, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import styles from "./MembershipPage.module.css";

const MembershipPage = () => {
  const [activeNav] = useState("MEMBERSHIP");
  const navigate = useNavigate();

  const navItems = [
    "HOME",
    "ABOUT US",
    "OUR TRAINERS",
    "CLASSES",
    "MEMBERSHIP",
  ];

  const handleNavClick = (item) => {
    switch (item) {
      case "HOME":
        navigate("/landing");
        break;
      case "ABOUT US":
        navigate("/about");
        break;
      case "OUR TRAINERS":
        navigate("/trainers");
        break;
      case "CLASSES":
        navigate("/classes");
        break;
      case "MEMBERSHIP":
        navigate("/membership");
        break;
      default:
        break;
    }
  };

  // ✅ Handle Logout
  const handleLogout = () => {
    // Optional: clear session data
    localStorage.removeItem("user");
    sessionStorage.removeItem("session");

    // Redirect to login page
    navigate("/login");
  };

  const plans = [
    {
      name: "SILVER",
      price: "₱1,600",
      period: "/Month",
      icon: "💪",
      features: [
        "Unlimited Classes",
        "Access to Gym Floor",
        "Nutrition Plan",
        "Locker Access",
        "3 Classes",
      ],
      popular: false,
    },
    {
      name: "GOLD",
      price: "₱1,600",
      period: "/Month",
      icon: "🏆",
      features: [
        "Unlimited Classes",
        "Access to Gym Floor",
        "Nutrition & Fitness Plan",
        "1 Session Trainer",
        "5 Classes",
      ],
      popular: true,
    },
    {
      name: "PLATINUM",
      price: "₱2,000",
      period: "/Month",
      icon: "👑",
      features: [
        "Unlimited Classes",
        "Access to Gym Floor",
        "Nutrition & Fitness Plan",
        "1 Session Trainer",
        "Unlimited Classes",
      ],
      popular: false,
    },
  ];

  return (
    <div className={styles.membershipContainer}>
      {/* Background */}
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
                className={`${styles.navLink} ${
                  activeNav === item ? styles.navLinkActive : ""
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          {/* 🔹 Replaced BACK with LOGOUT */}
          <button onClick={handleLogout} className={styles.logoutButton}>
            LOGOUT
          </button>
        </div>
      </nav>

      {/* Page Content */}
      <div className={styles.contentSection}>
        <div className={styles.contentContainer}>
          <div className={styles.headerSection}>
            <h1 className={styles.title}>MEMBERSHIP</h1>
            <p className={styles.subtitle}>
              Choose the perfect plan for your fitness journey
            </p>
          </div>

          <div className={styles.plansGrid}>
            {plans.map((plan, index) => (
              <div
                key={plan.name}
                className={`${styles.planCard} ${
                  plan.popular ? styles.planCardPopular : ""
                }`}
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                {plan.popular && (
                  <div className={styles.popularBadge}>MOST POPULAR</div>
                )}

                <div className={styles.planIcon}>
                  <span style={{ fontSize: "2rem" }}>{plan.icon}</span>
                </div>

                <h3 className={styles.planName}>{plan.name}</h3>
                <div className={styles.planPrice}>{plan.price}</div>
                <div className={styles.planPeriod}>{plan.period}</div>

                <ul className={styles.featuresList}>
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className={styles.featureItem}>
                      <Check className={styles.checkIcon} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`${styles.joinButton} ${
                    !plan.popular ? styles.joinButtonOutline : ""
                  }`}
                >
                  JOIN NOW
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MembershipPage;

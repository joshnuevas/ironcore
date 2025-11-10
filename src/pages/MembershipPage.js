import React from "react";
import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar"; // ✅ Reuse Navbar component
import styles from "./MembershipPage.module.css";
import landingStyles from "./LandingPage.module.css"; // ✅ For animated background

const MembershipPage = () => {
  const navigate = useNavigate();

  const plans = [
    {
      name: "SILVER",
      price: "₱1,199",
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
      price: "₱1,699",
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
      price: "₱2,299",
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
      {/* ✅ Animated background from LandingPage */}
      <div className={landingStyles.backgroundOverlay}>
        <div className={`${landingStyles.bgBlur} ${landingStyles.bgBlur1}`}></div>
        <div className={`${landingStyles.bgBlur} ${landingStyles.bgBlur2}`}></div>
        <div className={`${landingStyles.bgBlur} ${landingStyles.bgBlur3}`}></div>
      </div>

      {/* ✅ Reusable Navbar */}
      <Navbar activeNav="MEMBERSHIP" />

      {/* ✅ Page Content */}
      <div className={styles.contentSection}>
        <div className={styles.contentContainer}>
          <div className={styles.headerSection}>
            <h1 className={styles.title}>MEMBERSHIP</h1>
            <p className={styles.subtitle}>
              Choose the perfect plan for your fitness journey
            </p>
          </div>

          {/* ✅ Membership Plans */}
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
                  onClick={() => navigate("/transaction", { state: { plan } })}
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

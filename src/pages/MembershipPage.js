import React, { useState, useEffect } from "react";
import { Check, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import styles from "./MembershipPage.module.css";
import landingStyles from "./LandingPage.module.css";
import axios from "axios";

const MembershipPage = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [activeMembership, setActiveMembership] = useState(null);
  const [showWarningModal, setShowWarningModal] = useState(false);

  const plans = [
    {
      name: "SESSION",
      price: "₱200",
      period: "/Day",
      icon: "⚡",
      features: [
        "1 Day Gym Access",
        "All Equipment Available",
        "Locker & Shower Access",
        "Free Water Refill",
        
      ],
      popular: false,
      isSession: true,
    },
    {
      name: "SILVER",
      price: "₱1,199",
      period: "/Month",
      icon: "💪",
      features: [
        "Unlimited Gym Floor Access",
        "Locker & Shower Access",
        "Basic Nutrition Guide",
        "Monthly Fitness Assessment",
      ],
      popular: false,
      isSession: false,
    },
    {
      name: "GOLD",
      price: "₱1,699",
      period: "/Month",
      icon: "🏆",
      features: [
        "Unlimited Gym Floor Access",
        "Locker & Shower Access",
        "Personalized Nutrition Plan",
        "Body Composition Tracking",
        "Priority Customer Support",
      ],
      popular: true,
      isSession: false,
    },
    {
      name: "PLATINUM",
      price: "₱2,299",
      period: "/Month",
      icon: "👑",
      features: [
        "Unlimited Gym Floor Access",
        "Locker & Shower Access",
        "Personalized Nutrition Plan",
        "Body Composition Tracking",
        "Sauna or Massage Chair Access",
        "Priority Customer Support",
      ],
      popular: false,
      isSession: false,
    },
  ];

  // Fetch current user and active membership
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/users/me", {
          withCredentials: true,
        });
        setCurrentUser(res.data);
      } catch (error) {
        console.error("Failed to fetch current user:", error);
      }
    };
    fetchCurrentUser();
  }, []);

  // Handle Join Now click
  const handleJoinNow = async (plan) => {
    if (!currentUser) {
      alert("Please log in to continue.");
      navigate("/login");
      return;
    }

    try {
      const response = await axios.get(
        "http://localhost:8080/api/transactions/check-active-membership",
        {
          params: { userId: currentUser.id },
          withCredentials: true,
        }
      );

      const {
        hasActiveMembership,
        membershipType,
        membershipActivatedDate,
        membershipExpiryDate,
        transactionCode,
      } = response.data;

      if (hasActiveMembership) {
        // Build object for the modal
        setActiveMembership({
          membershipType,
          membershipActivatedDate,
          membershipExpiryDate,
          transactionCode,
        });

        setShowWarningModal(true);
        return;
      }

      // ✅ no active membership → allow purchase
      navigate("/transaction", { state: { plan } });
    } catch (error) {
      console.error("Error checking membership:", error);
      // If check fails, still allow navigation
      navigate("/transaction", { state: { plan } });
    }
  };


  const handleCloseWarning = () => {
    setShowWarningModal(false);
    setActiveMembership(null);
  };

  const formatExpiryDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className={styles.membershipContainer}>
      <div className={landingStyles.backgroundOverlay}>
        <div className={`${landingStyles.bgBlur} ${landingStyles.bgBlur1}`}></div>
        <div className={`${landingStyles.bgBlur} ${landingStyles.bgBlur2}`}></div>
        <div className={`${landingStyles.bgBlur} ${landingStyles.bgBlur3}`}></div>
      </div>

      <Navbar activeNav="MEMBERSHIP" />

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
                style={{ animationDelay: `${index * 0.15}s` }}
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
                  onClick={() => handleJoinNow(plan)}
                  className={`${styles.joinButton} ${
                    !plan.popular ? styles.joinButtonOutline : ""
                  }`}
                >
                  {plan.isSession ? "BUY NOW" : "JOIN NOW"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Warning Modal */}
      {showWarningModal && activeMembership && (
        <div className={styles.modalOverlay} onClick={handleCloseWarning}>
          <div className={styles.compactWarningModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.warningIconWrapper}>
              <AlertCircle className={styles.warningIcon} />
            </div>

            <h2 className={styles.compactTitle}>Active Membership Found</h2>
            <p className={styles.compactSubtitle}>You already have an active membership</p>

            <div className={styles.compactDetails}>
              <div className={styles.compactInfoBox}>
                <div className={styles.compactRow}>
                  <span className={styles.compactLabel}>Plan:</span>
                  <span className={styles.compactHighlight}>
                    {activeMembership.membershipType}
                  </span>
                </div>

                {activeMembership.membershipActivatedDate && (
                  <div className={styles.compactRow}>
                    <span className={styles.compactLabel}>Activated:</span>
                    <span className={styles.compactValue}>
                      {formatExpiryDate(activeMembership.membershipActivatedDate)}
                    </span>
                  </div>
                )}

                {activeMembership.membershipExpiryDate && (
                  <div className={styles.compactRow}>
                    <span className={styles.compactLabel}>Expires:</span>
                    <span className={styles.compactValue}>
                      {formatExpiryDate(activeMembership.membershipExpiryDate)}
                    </span>
                  </div>
                )}

                {activeMembership.transactionCode && (
                  <div className={styles.compactRow}>
                    <span className={styles.compactLabel}>Code:</span>
                    <span className={styles.compactCode}>
                      {activeMembership.transactionCode}
                    </span>
                  </div>
                )}
              </div>

              <div className={styles.compactWarning}>
                <p>
                  {activeMembership.membershipType === "SESSION"
                    ? "You can purchase a membership after your session expires."
                    : "You can purchase a new membership or session after your current one expires."}
                </p>
              </div>
            </div>

            <button onClick={handleCloseWarning} className={styles.compactButton}>
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MembershipPage;
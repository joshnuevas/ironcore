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

  // Fetch current logged-in user
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

  // Handle Join/Buy button click
  const handleJoinNow = async (plan) => {
    if (!currentUser) {
      alert("Please log in to continue.");
      navigate("/login");
      return;
    }

    try {
      // 🔁 NEW ENDPOINT
      const response = await axios.get(
        "http://localhost:8080/api/memberships/status",
        {
          params: { userId: currentUser.id },
          withCredentials: true,
        }
      );

      const {
        hasActiveMembership,
        hasPendingMembership,
        membershipType,
        membershipActivatedDate,
        membershipExpiryDate,
        transactionCode,
        membershipStatus,
      } = response.data;

      // 🛑 Block purchase if user has either active or pending membership
      if (hasActiveMembership || hasPendingMembership) {
        setActiveMembership({
          hasActiveMembership,
          hasPendingMembership,
          membershipType,
          membershipActivatedDate,
          membershipExpiryDate,
          transactionCode,
          membershipStatus, // e.g. "PENDING", "COMPLETED", "FAILED", "PAID"
        });
        setShowWarningModal(true);
        return;
      }

      // ✅ No active/pending membership → allow purchase
      navigate("/transaction", { state: { plan } });
    } catch (error) {
      console.error("Error checking membership:", error);
      alert(
        "Unable to verify your membership status at the moment. Please try again later."
      );
      // ❌ Do NOT navigate on error anymore
      return;
    }
  };

  const handleCloseWarning = () => {
    setShowWarningModal(false);
    setActiveMembership(null);
  };

  const formatExpiryDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isPending = (membership) => {
    if (!membership) return false;
    // Treat as pending if backend says so or flag is true
    return (
      membership.hasPendingMembership ||
      membership.membershipStatus === "PENDING"
    );
  };

  const getModalTitle = () => {
    if (!activeMembership) return "";
    if (isPending(activeMembership)) {
      return "Membership Pending Approval";
    }
    return "Active Membership Found";
  };

  const getModalSubtitle = () => {
    if (!activeMembership) return "";
    if (isPending(activeMembership)) {
      return "Your membership is currently awaiting admin approval.";
    }
    return "You already have an active membership.";
  };

  const getModalMessage = () => {
    if (!activeMembership) return "";

    if (isPending(activeMembership)) {
      return "You already have a membership request that is waiting for admin confirmation. You can buy another membership once this request is approved or cancelled.";
    }

    if (activeMembership.membershipType === "SESSION") {
      return "You can purchase another membership after your current session pass expires.";
    }

    return "You can purchase a new membership or session after your current plan expires.";
  };

  return (
    <div className={styles.membershipContainer}>
      {/* Background overlays from landing page */}
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
                } ${styles.planCardAnimated || ""}`}
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
          <div
            className={`${styles.compactWarningModal} ${
              styles.modalAnimated || ""
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.warningIconWrapper}>
              <AlertCircle className={styles.warningIcon} />
            </div>

            <h2 className={styles.compactTitle}>{getModalTitle()}</h2>
            <p className={styles.compactSubtitle}>{getModalSubtitle()}</p>

            <div className={styles.compactDetails}>
              <div className={styles.compactInfoBox}>
                <div className={styles.compactRow}>
                  <span className={styles.compactLabel}>Plan:</span>
                  <span className={styles.compactHighlight}>
                    {activeMembership.membershipType || "N/A"}
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
                <p>{getModalMessage()}</p>
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

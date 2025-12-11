import React, { useState, useEffect } from "react";
import {
  Calendar,
  TrendingUp,
  Award,
  Clock,
  Target,
  BarChart3,
  Users,
  Crown,
  AlertCircle,
  History as HistoryIcon,
  RefreshCw,
} from "lucide-react";
import Navbar from "../components/Navbar";
import styles from "./AttendancePage.module.css";
import axios from "axios";

const AttendancePage = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [insights, setInsights] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [membershipsHistory, setMembershipsHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // 🔍 Check if current membership is a one-time SESSION pass
  const isSessionOnlyMembership =
    insights?.subscriptionInfo?.membershipType === "SESSION";

  useEffect(() => {
    fetchSubscriptionInsights();
    fetchMembershipsHistory();
  }, []);

  const fetchSubscriptionInsights = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch current subscription insights
      const insightsResponse = await axios.get(
        "http://localhost:8080/api/attendance/my-subscription-insights",
        { withCredentials: true }
      );

      console.log("Current subscription insights:", insightsResponse.data);
      const currentInsights = insightsResponse.data;

      // Fetch attendance for CURRENT subscription only
      const attendanceResponse = await axios.get(
        "http://localhost:8080/api/attendance/my-attendance",
        { withCredentials: true }
      );

      console.log("Current subscription attendance:", attendanceResponse.data);

      const transformedData = attendanceResponse.data.map((record) => ({
        id: record.id,
        date: record.date,
        className: getClassNameFromMembership(record.membershipType),
        status: record.checkedIn ? "attended" : "absent",
        duration: calculateDuration(record.checkInTime),
        checkInTime: record.checkInTime,
        membershipType: record.membershipType,
        notes: record.notes,
      }));

      setAttendanceData(transformedData);
      setInsights(currentInsights);
    } catch (error) {
      console.error("Failed to fetch subscription insights:", error);

      if (error.response?.status === 401) {
        setError("Please log in to view your attendance.");
      } else if (error.response?.status === 404) {
        const hasExpired = error.response?.data?.hasExpiredMemberships;
        if (hasExpired) {
          setError(
            "Your membership has expired. Please renew to continue tracking your attendance."
          );
        } else {
          setError("No active membership found. Please subscribe to a membership plan.");
        }
      } else {
        setError("Failed to load attendance insights. Please try again.");
      }

      setAttendanceData([]);
      setInsights(null);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMembershipsHistory = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8080/api/attendance/my-memberships-history",
        { withCredentials: true }
      );

      console.log("Memberships history:", response.data);
      setMembershipsHistory(response.data.memberships || []);
    } catch (error) {
      console.error("Failed to fetch memberships history:", error);
      // history is optional, so no UI error
    }
  };

  const getClassNameFromMembership = (membershipType) => {
    const classMap = {
      BASIC: "Basic Training",
      PREMIUM: "Premium Workout",
      ELITE: "Elite Training",
      UNLIMITED: "Unlimited Session",
      SILVER: "Silver Membership",
      GOLD: "Gold Membership",
      PLATINUM: "Platinum Membership",
      SESSION: "Single Session",
      MONTHLY: "Monthly Session",
      QUARTERLY: "Quarterly Session",
      ANNUAL: "Annual Session",
    };
    return classMap[membershipType] || "Gym Session";
  };

  const calculateDuration = (checkInTime) => {
    if (!checkInTime) return "Not recorded";
    const durations = ["45 mins", "60 mins", "75 mins", "90 mins", "120 mins"];
    return durations[Math.floor(Math.random() * durations.length)];
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Invalid date";
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "attended":
        return <div className={styles.statusAttended}>✓</div>;
      case "absent":
        return <div className={styles.statusAbsent}>✗</div>;
      default:
        return null;
    }
  };

  const getMembershipBadgeColor = (membershipType) => {
    const colors = {
      BASIC: styles.badgeBasic,
      PREMIUM: styles.badgePremium,
      ELITE: styles.badgeElite,
      UNLIMITED: styles.badgeUnlimited,
      SILVER: styles.badgeSilver,
      GOLD: styles.badgeGold,
      PLATINUM: styles.badgePlatinum,
      MONTHLY: styles.badgePremium,
      QUARTERLY: styles.badgeElite,
      ANNUAL: styles.badgeUnlimited,
    };
    return colors[membershipType] || styles.badgeBasic;
  };

  // ✅ Proper singular/plural for "day(s) left"
  const formatDaysLeftText = (days) => {
    const safe = typeof days === "number" ? days : 0;
    if (safe === 1) return "1 day left";
    return `${safe} days left`;
  };

  // ✅ Proper singular/plural for "day(s) remaining"
  const formatDaysRemainingText = (days) => {
    const safe = typeof days === "number" ? days : 0;
    if (safe === 1) return "1 day remaining";
    return `${safe} days remaining`;
  };

  if (isLoading) {
    return (
      <div className={styles.pageContainer}>
        <Navbar activeNav="ATTENDANCE" />
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading your attendance insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.backgroundOverlay}>
        <div className={`${styles.bgBlur} ${styles.bgBlur1}`}></div>
        <div className={`${styles.bgBlur} ${styles.bgBlur2}`}></div>
        <div className={`${styles.bgBlur} ${styles.bgBlur3}`}></div>
      </div>

      <Navbar activeNav="ATTENDANCE" />

      <div className={styles.contentSection}>
        <div className={styles.contentContainer}>
          {/* Header Section */}
          <div className={styles.headerSection}>
            <h1 className={styles.title}>MY ATTENDANCE</h1>
            <p className={styles.subtitle}>Track your current subscription performance</p>

            {/* Membership Badge */}
            {insights?.subscriptionInfo && (
              <div className={styles.membershipHeader}>
                <div
                  className={`${styles.membershipBadge} ${getMembershipBadgeColor(
                    insights.subscriptionInfo.membershipType
                  )}`}
                >
                  <Crown size={16} />
                  <span>{insights.subscriptionInfo.membershipType} MEMBER</span>
                  <span className={styles.daysRemaining}>
                    {insights.subscriptionInfo.isExpired
                      ? "EXPIRED"
                      : insights.subscriptionInfo.isExpiringSoon
                      ? `⚠️ ${formatDaysLeftText(
                          insights.subscriptionInfo.daysRemaining
                        )}`
                      : formatDaysRemainingText(
                          insights.subscriptionInfo.daysRemaining
                        )}
                  </span>
                </div>

                {/* Show history button if user has multiple memberships */}
                {membershipsHistory.length > 1 && (
                  <button
                    className={styles.historyButton}
                    onClick={() => setShowHistory(!showHistory)}
                  >
                    <HistoryIcon size={16} />
                    <span>View All Memberships ({membershipsHistory.length})</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Global Error (except "No active membership found") */}
          {error && !error.includes("No active membership found") && (
            <div className={styles.errorBanner}>
              <AlertCircle size={20} />
              <div>
                <strong>{error}</strong>
                {error.includes("expired") && (
                  <button
                    className={styles.renewButton}
                    onClick={() => (window.location.href = "/membership")}
                  >
                    <RefreshCw size={16} />
                    Renew Membership
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Special note for SESSION-only memberships */}
          {isSessionOnlyMembership && !error && (
            <div className={`${styles.errorBanner} ${styles.noMembershipError}`}>
              <AlertCircle size={20} />
              <div>
                <strong>
                  Attendance analytics are only available for recurring memberships.
                </strong>
                <p style={{ marginTop: "4px", fontSize: "0.85rem" }}>
                  Your current plan is a one-time Session pass, so it won&apos;t appear
                  in detailed attendance insights on this page.
                </p>
              </div>
            </div>
          )}

          {/* Memberships History Modal */}
          {showHistory && membershipsHistory.length > 0 && (
            <div className={styles.historyModal}>
              <div className={styles.historyHeader}>
                <h3>Your Membership History</h3>
                <button onClick={() => setShowHistory(false)}>×</button>
              </div>
              <div className={styles.historyList}>
                {membershipsHistory.map((membership) => {
                  const isCurrent = membership.isActive && !membership.isExpired;
                  const isExpired = membership.isExpired && !membership.isActive;

                  return (
                    <div
                      key={membership.membershipId}
                      className={`${styles.historyItem} ${
                        isCurrent ? styles.historyItemCurrent : ""
                      } ${isExpired ? styles.historyItemExpired : ""}`}
                    >
                      <div className={styles.historyTopRow}>
                        <span
                          className={`${styles.statusChip} ${
                            isCurrent ? styles.statusChipCurrent : styles.statusChipExpired
                          }`}
                        >
                          {isCurrent ? "CURRENT" : "EXPIRED"}
                        </span>

                        <div className={styles.historyTitleGroup}>
                          <span className={styles.historyMembershipType}>
                            {membership.membershipType} Membership
                          </span>
                          <span className={styles.historyDates}>
                            {formatDate(membership.startDate)} • {formatDate(membership.endDate)}
                          </span>
                        </div>
                      </div>

                      <div className={styles.historyStatsRow}>
                        <div className={styles.historyStatPill}>
                          <span className={styles.historyStatLabel}>Total days</span>
                          <span className={styles.historyStatValue}>
                            {membership.totalDays}
                          </span>
                        </div>
                        <div className={styles.historyStatPill}>
                          <span className={styles.historyStatLabel}>Attended</span>
                          <span className={styles.historyStatValue}>
                            {membership.attendedDays}
                          </span>
                        </div>
                        <div className={styles.historyStatPill}>
                          <span className={styles.historyStatLabel}>Utilized</span>
                          <span className={styles.historyStatValue}>
                            {membership.utilizationRate}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Insights Section – hidden for SESSION memberships */}
          {insights &&
            insights.subscriptionInfo &&
            !isSessionOnlyMembership && (
              <div className={styles.insightsSection}>
                <div className={styles.insightsSectionHeader}>
                  <h2>Current Subscription Performance</h2>
                  <p className={styles.periodInfo}>
                    {formatDate(insights.subscriptionInfo.startDate)} -{" "}
                    {formatDate(insights.subscriptionInfo.endDate)}
                  </p>
                </div>

                <div className={styles.insightsGrid}>
                  {/* Attendance Rate */}
                  <div className={styles.insightCard}>
                    <div className={styles.insightIcon}>
                      <Calendar className={styles.icon} />
                    </div>
                    <div className={styles.insightContent}>
                      <h3>Attendance Rate</h3>
                      <div className={styles.insightValue}>
                        {insights.attendanceMetrics?.attendanceRate || 0}%
                      </div>
                      <p>
                        {insights.attendanceMetrics?.attendedDays || 0} attended of{" "}
                        {insights.subscriptionInfo.daysUsed || 0} days used
                      </p>
                    </div>
                  </div>

                  {/* Days Remaining */}
                  <div className={styles.insightCard}>
                    <div className={styles.insightIcon}>
                      <Clock className={styles.icon} />
                    </div>
                    <div className={styles.insightContent}>
                      <h3>Days Remaining</h3>
                      <div className={styles.insightValue}>
                        {insights.subscriptionInfo.daysRemaining || 0}
                      </div>
                      <p>
                        out of {insights.subscriptionInfo.totalDays || 0} total days
                      </p>
                    </div>
                  </div>

                  {/* Subscription Utilization */}
                  <div className={styles.insightCard}>
                    <div className={styles.insightIcon}>
                      <TrendingUp className={styles.icon} />
                    </div>
                    <div className={styles.insightContent}>
                      <h3>Subscription Utilization</h3>
                      <div className={styles.insightValue}>
                        {insights.attendanceMetrics?.subscriptionUtilizationRate || 0}%
                      </div>
                      <p>
                        {insights.attendanceMetrics?.attendedDays || 0} of{" "}
                        {insights.subscriptionInfo.totalDays || 0} total days
                      </p>
                    </div>
                  </div>
                </div>

                {/* Feedback Card */}
                <div
                  className={`${styles.feedbackCard} ${
                    styles[insights.feedbackType]
                  }`}
                >
                  <div className={styles.feedbackHeader}>
                    <Award className={styles.feedbackIcon} />
                    <h3>Subscription Performance Analysis</h3>
                  </div>
                  <p className={styles.feedbackText}>{insights.feedback}</p>

                  {/* Progress bars */}
                  <div className={styles.metricsGrid}>
                    <div className={styles.metric}>
                      <label>Attendance Rate (Days Used)</label>
                      <div className={styles.progressBar}>
                        <div
                          className={styles.progressFill}
                          style={{
                            width: `${Math.min(
                              insights.attendanceMetrics?.attendanceRate || 0,
                              100
                            )}%`,
                          }}
                        ></div>
                      </div>
                      <span>
                        {insights.attendanceMetrics?.attendanceRate || 0}%
                      </span>
                    </div>

                    <div className={styles.metric}>
                      <label>Subscription Utilization (Total Days)</label>
                      <div className={styles.progressBar}>
                        <div
                          className={styles.progressFill}
                          style={{
                            width: `${Math.min(
                              insights.attendanceMetrics
                                ?.subscriptionUtilizationRate || 0,
                              100
                            )}%`,
                          }}
                        ></div>
                      </div>
                      <span>
                        {insights.attendanceMetrics?.subscriptionUtilizationRate ||
                          0}
                        %
                      </span>
                    </div>
                  </div>

                  {/* Subscription Timeline */}
                  <div className={styles.subscriptionProgress}>
                    <div className={styles.progressLabels}>
                      <span>Subscription Timeline</span>
                      <span>
                        Day {insights.subscriptionInfo.daysUsed} of{" "}
                        {insights.subscriptionInfo.totalDays}
                      </span>
                    </div>
                    <div className={styles.progressBar}>
                      <div
                        className={styles.progressFill}
                        style={{
                          width: `${
                            insights.subscriptionInfo.totalDays > 0
                              ? Math.min(
                                  (insights.subscriptionInfo.daysUsed /
                                    insights.subscriptionInfo.totalDays) * 100,
                                  100
                                )
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                    <p className={styles.progressNote}>
                      {insights.subscriptionInfo.isExpired
                        ? "Your subscription has ended. Renew to continue!"
                        : `${formatDaysRemainingText(
                            insights.subscriptionInfo.daysRemaining
                          )} in your current subscription`}
                    </p>
                  </div>
                </div>
              </div>
            )}

          {/* Attendance History (Current Subscription Only) – hidden for SESSION */}
          {!isSessionOnlyMembership && (
            <div className={styles.historySection}>
              <h2 className={styles.sectionTitle}>
                Current Subscription Attendance
                {insights?.subscriptionInfo && (
                  <span className={styles.sectionSubtitle}>
                    ({formatDate(insights.subscriptionInfo.startDate)} -{" "}
                    {formatDate(insights.subscriptionInfo.endDate)})
                  </span>
                )}
              </h2>

              {/* If there is NO ACTIVE MEMBERSHIP → show special card here */}
              {error && error.includes("No active membership found") ? (
                <div className={styles.noMembershipCard}>
                  <div className={styles.noMembershipIconWrapper}>
                    <AlertCircle className={styles.noMembershipIcon} />
                  </div>
                  <div className={styles.noMembershipContent}>
                    <h3 className={styles.noMembershipTitle}>No Active Membership Found</h3>
                    <p className={styles.noMembershipText}>
                      There is currently no active membership linked to your account.
                      Purchase or renew a membership plan to start tracking your
                      attendance and unlock full subscription insights.
                    </p>
                    <button
                      className={styles.noMembershipButton}
                      onClick={() => (window.location.href = "/membership")}
                    >
                      Browse Membership Plans
                    </button>
                  </div>
                </div>
              ) : (
                <div className={styles.attendanceList}>
                  {attendanceData.length === 0 ? (
                    <div className={styles.emptyState}>
                      <Calendar className={styles.emptyIcon} />
                      <p>No attendance records for current subscription</p>
                      <p className={styles.emptySubtext}>
                        {error
                          ? "Please ensure you have an active membership."
                          : "Your attendance will appear here once the admin marks your check-ins."}
                      </p>
                    </div>
                  ) : (
                    attendanceData.map((session) => (
                      <div key={session.id} className={styles.attendanceItem}>
                        <div className={styles.sessionDate}>
                          <Calendar className={styles.dateIcon} />
                          <span>{formatDate(session.date)}</span>
                        </div>
                        <div className={styles.sessionInfo}>
                          <span className={styles.className}>{session.className}</span>
                          <span className={styles.duration}>{session.duration}</span>
                          {session.checkInTime && (
                            <span className={styles.checkInTime}>
                              Check-in:{" "}
                              {new Date(session.checkInTime).toLocaleTimeString(
                                "en-US",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </span>
                          )}
                          {session.notes && (
                            <span className={styles.notes}>Note: {session.notes}</span>
                          )}
                        </div>
                        <div className={styles.sessionStatus}>
                          {getStatusIcon(session.status)}
                          <span
                            className={`${styles.statusText} ${
                              styles[session.status]
                            }`}
                          >
                            {session.status === "attended" ? "Attended" : "Absent"}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* Tips Section – hidden for SESSION memberships and expired subs */}
          {insights?.subscriptionInfo &&
            !insights.subscriptionInfo.isExpired &&
            !isSessionOnlyMembership && (
              <div className={styles.tipsSection}>
                <h2 className={styles.sectionTitle}>
                  Maximize Your Current Subscription
                </h2>
                <div className={styles.tipsGrid}>
                  <div className={styles.tipCard}>
                    <BarChart3 className={styles.tipIcon} />
                    <h4>Current Performance</h4>
                    <p>
                      You're attending{" "}
                      {insights.attendanceMetrics?.attendanceRate || 0}% of
                      available days. Target:{" "}
                      {insights.subscriptionInfo.targetDaysPerWeek || 3} days/week.
                    </p>
                  </div>
                  <div className={styles.tipCard}>
                    <Clock className={styles.tipIcon} />
                    <h4>Time Remaining</h4>
                    <p>
                      {formatDaysLeftText(
                        insights.subscriptionInfo.daysRemaining || 0
                      )}{" "}
                      You can attend{" "}
                      {Math.round(insights.targets?.remainingDaysTarget || 0)} more
                      sessions to hit your target.
                    </p>
                  </div>
                  <div className={styles.tipCard}>
                    <Target className={styles.tipIcon} />
                    <h4>Utilization Rate</h4>
                    <p>
                      You're using{" "}
                      {insights.attendanceMetrics?.subscriptionUtilizationRate ||
                        0}
                      % of your subscription. Every session increases your ROI!
                    </p>
                  </div>
                  <div className={styles.tipCard}>
                    <Users className={styles.tipIcon} />
                    <h4>Keep Going!</h4>
                    <p>
                      {insights.attendanceMetrics?.attendedDays || 0} sessions
                      completed. You're{" "}
                      {Math.round(
                        insights.attendanceMetrics?.attendanceVsTarget || 0
                      )}
                      % towards your goal!
                    </p>
                  </div>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;

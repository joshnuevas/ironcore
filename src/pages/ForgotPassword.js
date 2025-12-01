// src/pages/ForgotPassword.jsx
import React, { useState, useEffect } from "react";
import {
  Dumbbell,
  Eye,
  EyeOff,
  Mail,
  Lock,
  HelpCircle,
  TrendingUp,
  Users,
  Award,
  Check,
  X,
} from "lucide-react";
import styles from "./Register.module.css"; // reuse same style for matching UI
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: "",
    color: "",
    checks: {
      length: false,
      uppercase: false,
      lowercase: false,
      number: false,
      special: false,
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  // ---- Password strength for NEW password ----
  useEffect(() => {
    if (!newPassword) {
      setPasswordStrength({
        score: 0,
        label: "",
        color: "",
        checks: {
          length: false,
          uppercase: false,
          lowercase: false,
          number: false,
          special: false,
        },
      });
      return;
    }

    const checks = {
      length: newPassword.length >= 8,
      uppercase: /[A-Z]/.test(newPassword),
      lowercase: /[a-z]/.test(newPassword),
      number: /[0-9]/.test(newPassword),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword),
    };

    const score = Object.values(checks).filter(Boolean).length;

    let label = "";
    let color = "";

    if (score <= 2) {
      label = "Weak";
      color = "#ef4444";
    } else if (score === 3) {
      label = "Fair";
      color = "#f97316";
    } else if (score === 4) {
      label = "Good";
      color = "#eab308";
    } else {
      label = "Strong";
      color = "#22c55e";
    }

    setPasswordStrength({ score, label, color, checks });
  }, [newPassword]);

  // ---- Step 1: email submit ----
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    if (!email.trim()) {
      setError("Please enter your email address.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:8080/api/auth/forgot-password/init",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      if (!response.ok) {
        let errorMessage = "Unable to find account with that email.";

        try {
          const data = await response.json();
          if (data && data.message) {
            errorMessage = data.message;
          }
        } catch {
          const text = await response.text();
          if (text) errorMessage = text;
        }

        setError(errorMessage);
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      setSecurityQuestion(data.securityQuestion || "");
      setStep(2);
      setSuccess("");
    } catch (err) {
      setError("Unable to connect to the server.");
    } finally {
      setIsLoading(false);
    }
  };

  // ---- Step 2: answer + new password submit ----
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    if (!securityAnswer.trim()) {
      setError("Please enter the answer to your security question.");
      setIsLoading(false);
      return;
    }

    if (!newPassword || !confirmPassword) {
      setError("Please fill in the new password fields.");
      setIsLoading(false);
      return;
    }

    if (passwordStrength.score < 3) {
      setError("New password is too weak. Please meet at least 3 requirements.");
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:8080/api/auth/forgot-password/reset",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            securityAnswer,
            newPassword,
          }),
        }
      );

      if (!response.ok) {
        let errorMessage = "Failed to reset password. Please try again.";

        try {
          const data = await response.json();
          if (data && data.message) {
            errorMessage = data.message;
          }
        } catch {
          const text = await response.text();
          if (text) errorMessage = text;
        }

        // Normalize "Incorrect security answer" from backend
        const normalized = errorMessage.toLowerCase().replace(/\.$/, "");
        if (normalized === "incorrect security answer") {
          errorMessage = "Incorrect Security Answer";
        }

        setError(errorMessage);
        setIsLoading(false);
        return;
      }

      setSuccess("Password reset successfully! Redirecting to login...");
      setNewPassword("");
      setConfirmPassword("");
      setSecurityAnswer("");

      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError("Unable to connect to the server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.registerContainer}>
      {/* Left Side - Branding (same as Register) */}
      <div className={styles.leftSection}>
        <div className={styles.brandingContent}>
          <div className={styles.logoHeader}>
            <div className={styles.logoContainer}>
              <Dumbbell className={styles.logoIcon} />
            </div>
            <h1 className={styles.brandTitle}>
              IRON<span className={styles.brandAccent}>CORE</span>
            </h1>
          </div>

          <div className={styles.heroContent}>
            <h2 className={styles.heroTitle}>Recover Your Account</h2>
            <p className={styles.heroDescription}>
              Securely reset your IronCore password using your security question and
              a strong new password to get back on track with your fitness journey.
            </p>
          </div>

          <div className={styles.features}>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <TrendingUp size={24} />
              </div>
              <div className={styles.featureText}>
                <h3>Stay on Track</h3>
                <p>Quickly restore access and continue your progress.</p>
              </div>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <Users size={24} />
              </div>
              <div className={styles.featureText}>
                <h3>Secure Recovery</h3>
                <p>Use your personal security question to verify your identity.</p>
              </div>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <Award size={24} />
              </div>
              <div className={styles.featureText}>
                <h3>Strong Protection</h3>
                <p>Set a strong new password to keep your account safe.</p>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.backgroundOverlay}>
          <div className={`${styles.bgBlur} ${styles.bgBlur1}`}></div>
          <div className={`${styles.bgBlur} ${styles.bgBlur2}`}></div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className={styles.rightSection}>
        <div className={styles.formContainer}>
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>
              {step === 1 ? "Forgot Password" : "Reset Password"}
            </h2>
            <p className={styles.formSubtitle}>
              {step === 1
                ? "Enter your email to find your account"
                : "Answer your security question and set a new password"}
            </p>
          </div>

          <form
            className={styles.registerForm}
            onSubmit={step === 1 ? handleEmailSubmit : handleResetSubmit}
          >
            {error && <div className={styles.errorMessage}>{error}</div>}
            {success && <div className={styles.successMessage}>{success}</div>}

            {step === 1 && (
              <>
                <div className={styles.formGroup}>
                  <label htmlFor="email" className={styles.formLabel}>
                    Email Address
                  </label>
                  <div className={styles.inputWrapper}>
                    <div className={styles.inputIcon}>
                      <Mail className={styles.icon} />
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={styles.formInput}
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={styles.submitButton}
                >
                  {isLoading ? "Checking..." : "Continue"}
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Security Question</label>
                  <div className={styles.inputWrapper}>
                    <div className={styles.inputIcon}>
                      <HelpCircle className={styles.icon} />
                    </div>
                    <input
                      type="text"
                      value={securityQuestion}
                      readOnly
                      className={styles.formInput}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Your Answer</label>
                  <div className={styles.inputWrapper}>
                    <div className={styles.inputIcon}>
                      <HelpCircle className={styles.icon} />
                    </div>
                    <input
                      type="text"
                      value={securityAnswer}
                      onChange={(e) => setSecurityAnswer(e.target.value)}
                      className={styles.formInput}
                      placeholder="Type your answer"
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="newPassword" className={styles.formLabel}>
                    New Password
                  </label>
                  <div className={styles.inputWrapper}>
                    <div className={styles.inputIcon}>
                      <Lock className={styles.icon} />
                    </div>
                    <input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={`${styles.formInput} ${styles.passwordInput}`}
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className={styles.passwordToggle}
                    >
                      {showNewPassword ? (
                        <EyeOff className={styles.icon} />
                      ) : (
                        <Eye className={styles.icon} />
                      )}
                    </button>
                  </div>

                  {/* Strength bar */}
                  {newPassword && (
                    <div className={styles.strengthContainer}>
                      <div className={styles.strengthBar}>
                        <div
                          className={styles.strengthBarFill}
                          style={{
                            width: `${(passwordStrength.score / 5) * 100}%`,
                            backgroundColor: passwordStrength.color,
                          }}
                        ></div>
                      </div>
                      <span
                        className={styles.strengthLabel}
                        style={{ color: passwordStrength.color }}
                      >
                        {passwordStrength.label}
                      </span>
                    </div>
                  )}

                  {/* Requirements checklist (same style as Register) */}
                  {newPassword && (
                    <div className={styles.requirementsContainer}>
                      <p className={styles.requirementsTitle}>
                        Password must contain:
                      </p>
                      <ul className={styles.requirementsList}>
                        <li className={styles.requirementItem}>
                          {passwordStrength.checks.length ? (
                            <Check
                              className={styles.checkIcon}
                              size={16}
                              style={{ color: "#22c55e" }}
                            />
                          ) : (
                            <X
                              className={styles.checkIcon}
                              size={16}
                              style={{ color: "#ef4444" }}
                            />
                          )}
                          <span
                            style={{
                              color: passwordStrength.checks.length
                                ? "#22c55e"
                                : "#6b7280",
                            }}
                          >
                            At least 8 characters
                          </span>
                        </li>
                        <li className={styles.requirementItem}>
                          {passwordStrength.checks.uppercase ? (
                            <Check
                              className={styles.checkIcon}
                              size={16}
                              style={{ color: "#22c55e" }}
                            />
                          ) : (
                            <X
                              className={styles.checkIcon}
                              size={16}
                              style={{ color: "#ef4444" }}
                            />
                          )}
                          <span
                            style={{
                              color: passwordStrength.checks.uppercase
                                ? "#22c55e"
                                : "#6b7280",
                            }}
                          >
                            One uppercase letter
                          </span>
                        </li>
                        <li className={styles.requirementItem}>
                          {passwordStrength.checks.lowercase ? (
                            <Check
                              className={styles.checkIcon}
                              size={16}
                              style={{ color: "#22c55e" }}
                            />
                          ) : (
                            <X
                              className={styles.checkIcon}
                              size={16}
                              style={{ color: "#ef4444" }}
                            />
                          )}
                          <span
                            style={{
                              color: passwordStrength.checks.lowercase
                                ? "#22c55e"
                                : "#6b7280",
                            }}
                          >
                            One lowercase letter
                          </span>
                        </li>
                        <li className={styles.requirementItem}>
                          {passwordStrength.checks.number ? (
                            <Check
                              className={styles.checkIcon}
                              size={16}
                              style={{ color: "#22c55e" }}
                            />
                          ) : (
                            <X
                              className={styles.checkIcon}
                              size={16}
                              style={{ color: "#ef4444" }}
                            />
                          )}
                          <span
                            style={{
                              color: passwordStrength.checks.number
                                ? "#22c55e"
                                : "#6b7280",
                            }}
                          >
                            One number
                          </span>
                        </li>
                        <li className={styles.requirementItem}>
                          {passwordStrength.checks.special ? (
                            <Check
                              className={styles.checkIcon}
                              size={16}
                              style={{ color: "#22c55e" }}
                            />
                          ) : (
                            <X
                              className={styles.checkIcon}
                              size={16}
                              style={{ color: "#ef4444" }}
                            />
                          )}
                          <span
                            style={{
                              color: passwordStrength.checks.special
                                ? "#22c55e"
                                : "#6b7280",
                            }}
                          >
                            One special character
                          </span>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label
                    htmlFor="confirmNewPassword"
                    className={styles.formLabel}
                  >
                    Confirm New Password
                  </label>
                  <div className={styles.inputWrapper}>
                    <div className={styles.inputIcon}>
                      <Lock className={styles.icon} />
                    </div>
                    <input
                      id="confirmNewPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`${styles.formInput} ${styles.passwordInput}`}
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className={styles.passwordToggle}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className={styles.icon} />
                      ) : (
                        <Eye className={styles.icon} />
                      )}
                    </button>
                  </div>
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className={styles.passwordMismatch}>
                      Passwords do not match
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={styles.submitButton}
                >
                  {isLoading ? "Resetting..." : "Reset Password"}
                </button>
              </>
            )}
          </form>

          <div className={styles.divider}>
            <div className={styles.dividerLine}></div>
            <span className={styles.dividerText}>OR</span>
            <div className={styles.dividerLine}></div>
          </div>

          <div className={styles.loginSection}>
            <p className={styles.loginText}>
              Remember your password?{" "}
              <button
                type="button"
                className={styles.loginLink}
                onClick={() => navigate("/login")}
              >
                Back to login
              </button>
            </p>
          </div>

          <div className={styles.footer}>
            <p>© 2025 IronCore. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

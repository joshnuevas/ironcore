import React, { useState, useEffect } from "react";
import {
  Dumbbell,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Check,
  X,
  TrendingUp,
  Users,
  Award,
  HelpCircle,
} from "lucide-react";
import styles from "./Register.module.css";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [failedAttempts, setFailedAttempts] = useState(0);
  const MAX_ATTEMPTS = 5;

  const navigate = useNavigate();

  const validateEmail = (email) => {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return emailRegex.test(email);
  };

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

  const [securityQuestion, setSecurityQuestion] = useState(
    "What is your mother's maiden name?"
  );
  const [customQuestion, setCustomQuestion] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");

  useEffect(() => {
    if (!password) {
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
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
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
  }, [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Soft rate-limit on front-end
    if (failedAttempts >= MAX_ATTEMPTS) {
      setError(
        "Too many failed attempts. Please wait a few minutes and try again."
      );
      return;
    }

    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim();
    const trimmedAnswer = securityAnswer.trim();
    const trimmedCustomQuestion = customQuestion.trim();

    if (!validateEmail(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!trimmedUsername || !trimmedEmail || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (trimmedUsername.length < 3) {
      setError("Username must be at least 3 characters long.");
      return;
    }

    const finalQuestion =
      securityQuestion === "custom" ? trimmedCustomQuestion : securityQuestion;

    if (!finalQuestion) {
      setError("Please provide a security question.");
      return;
    }

    if (!trimmedAnswer) {
      setError("Please provide an answer to your security question.");
      return;
    }

    if (passwordStrength.score < 3) {
      setError("Password is too weak. Please meet at least 3 requirements.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: trimmedUsername,
          email: trimmedEmail,
          password,
          securityQuestion: finalQuestion,
          securityAnswer: trimmedAnswer,
        }),
      });

      const rawMessage = await response.text().catch(() => "");

      if (response.ok) {
        setFailedAttempts(0);
        setSuccess("Account created successfully!");
        setUsername("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setSecurityQuestion("What is your mother's maiden name?");
        setCustomQuestion("");
        setSecurityAnswer("");

        // Short delay then redirect to login
        setTimeout(() => navigate("/login"), 1500);
      } else {
        console.warn("Registration error from server:", rawMessage);
        // Generic error to avoid leaking if email already exists or other internals
        setFailedAttempts((prev) => prev + 1);
        setError("Registration failed. Please check your details and try again.");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError("Unable to connect to the server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.registerContainer}>
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
            <h2 className={styles.heroTitle}>
              Start Your Transformation Today
            </h2>
            <p className={styles.heroDescription}>
              Create your account and unlock access to premium fitness classes,
              expert trainers, and personalized workout plans designed to help
              you reach your goals.
            </p>
          </div>

          <div className={styles.features}>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <TrendingUp size={24} />
              </div>
              <div className={styles.featureText}>
                <h3>Track Progress</h3>
                <p>Monitor your fitness journey with detailed analytics</p>
              </div>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <Users size={24} />
              </div>
              <div className={styles.featureText}>
                <h3>Expert Trainers</h3>
                <p>
                  Work with certified professionals dedicated to your success
                </p>
              </div>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <Award size={24} />
              </div>
              <div className={styles.featureText}>
                <h3>Premium Classes</h3>
                <p>Access exclusive fitness classes and training programs</p>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.backgroundOverlay}>
          <div className={`${styles.bgBlur} ${styles.bgBlur1}`}></div>
          <div className={`${styles.bgBlur} ${styles.bgBlur2}`}></div>
        </div>
      </div>

      <div className={styles.rightSection}>
        <div className={styles.formContainer}>
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>Create Account</h2>
            <p className={styles.formSubtitle}>
              Join IronCore and start your fitness journey
            </p>
          </div>

          <form className={styles.registerForm} onSubmit={handleSubmit}>
            {error && <div className={styles.errorMessage}>{error}</div>}
            {success && <div className={styles.successMessage}>{success}</div>}

            <div className={styles.formGroup}>
              <label htmlFor="username" className={styles.formLabel}>
                Username
              </label>
              <div className={styles.inputWrapper}>
                <div className={styles.inputIcon}>
                  <User className={styles.icon} />
                </div>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={styles.formInput}
                  placeholder="Your name"
                  required
                />
              </div>
            </div>

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

            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.formLabel}>
                Password
              </label>
              <div className={styles.inputWrapper}>
                <div className={styles.inputIcon}>
                  <Lock className={styles.icon} />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${styles.formInput} ${styles.passwordInput}`}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={styles.passwordToggle}
                >
                  {showPassword ? (
                    <EyeOff className={styles.icon} />
                  ) : (
                    <Eye className={styles.icon} />
                  )}
                </button>
              </div>

              {password && (
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

              {password && (
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
              <label htmlFor="confirmPassword" className={styles.formLabel}>
                Confirm Password
              </label>
              <div className={styles.inputWrapper}>
                <div className={styles.inputIcon}>
                  <Lock className={styles.icon} />
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`${styles.formInput} ${styles.passwordInput}`}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className={styles.passwordToggle}
                >
                  {showConfirmPassword ? (
                    <EyeOff className={styles.icon} />
                  ) : (
                    <Eye className={styles.icon} />
                  )}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className={styles.passwordMismatch}>
                  Passwords do not match
                </p>
              )}
            </div>

            {/* Security Question + Answer */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Security Question (for password recovery)
              </label>
              <div className={styles.inputWrapper}>
                <div className={styles.inputIcon}>
                  <HelpCircle className={styles.icon} />
                </div>
                <select
                  value={securityQuestion}
                  onChange={(e) => setSecurityQuestion(e.target.value)}
                  className={styles.formInput}
                >
                  <option value="What is your mother's maiden name?">
                    What is your mother's maiden name?
                  </option>
                  <option value="What is the name of your first pet?">
                    What is the name of your first pet?
                  </option>
                  <option value="What city were you born in?">
                    What city were you born in?
                  </option>
                  <option value="What is your favorite teacher's name?">
                    What is your favorite teacher's name?
                  </option>
                  <option value="custom">Custom question...</option>
                </select>
              </div>

              {securityQuestion === "custom" && (
                <div
                  className={styles.inputWrapper}
                  style={{ marginTop: "0.5rem" }}
                >
                  <div className={styles.inputIcon}>
                    <HelpCircle className={styles.icon} />
                  </div>
                  <input
                    type="text"
                    value={customQuestion}
                    onChange={(e) => setCustomQuestion(e.target.value)}
                    className={styles.formInput}
                    placeholder="Enter your custom security question"
                  />
                </div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Answer to Security Question
              </label>
              <div className={styles.inputWrapper}>
                <div className={styles.inputIcon}>
                  <User className={styles.icon} />
                </div>
                <input
                  type="text"
                  value={securityAnswer}
                  onChange={(e) => setSecurityAnswer(e.target.value)}
                  className={styles.formInput}
                  placeholder="Your answer (remember this)"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={styles.submitButton}
            >
              {isLoading ? (
                <span className={styles.loadingContent}>
                  <svg className={styles.spinner} viewBox="0 0 24 24">
                    <circle
                      className={styles.spinnerCircle}
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    ></circle>
                    <path
                      className={styles.spinnerPath}
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0
                      c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating account...
                </span>
              ) : (
                "Sign Up"
              )}
            </button>
          </form>

          <div className={styles.divider}>
            <div className={styles.dividerLine}></div>
            <span className={styles.dividerText}>OR</span>
            <div className={styles.dividerLine}></div>
          </div>

          <div className={styles.loginSection}>
            <p className={styles.loginText}>
              Already have an account?{" "}
              <button
                type="button"
                className={styles.loginLink}
                onClick={() => navigate("/login")}
              >
                Log in
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

export default Register;

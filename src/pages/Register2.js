import React, { useState, useEffect } from "react";
import { Dumbbell, Eye, EyeOff, Mail, Lock, User, Check, X } from "lucide-react";
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
  const navigate = useNavigate();

  // Password strength state
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: "",
    color: "",
    checks: {
      length: false,
      uppercase: false,
      lowercase: false,
      number: false,
      special: false
    }
  });

  // Calculate password strength whenever password changes
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
          special: false
        }
      });
      return;
    }

    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };

    const score = Object.values(checks).filter(Boolean).length;
    
    let label = "";
    let color = "";
    
    if (score <= 2) {
      label = "Weak";
      color = "#ef4444"; // red
    } else if (score === 3) {
      label = "Fair";
      color = "#f97316"; // orange
    } else if (score === 4) {
      label = "Good";
      color = "#eab308"; // yellow
    } else {
      label = "Strong";
      color = "#22c55e"; // green
    }

    setPasswordStrength({ score, label, color, checks });
  }, [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    // --- Validation ---
    if (!username || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      setIsLoading(false);
      return;
    }

    // Check password strength
    if (passwordStrength.score < 3) {
      setError("Password is too weak. Please meet at least 3 requirements.");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    try {
      // --- Send to backend ---
      const response = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const message = await response.text();

      if (response.ok) {
        setSuccess("Account created successfully!");
        setUsername("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");

        // Optional: redirect to login after delay
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setError(message || "Registration failed. Please try again.");
      }
    } catch (err) {
      setError("Unable to connect to the server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.registerContainer}>
      {/* Background animation */}
      <div className={styles.backgroundOverlay}>
        <div className={`${styles.bgBlur} ${styles.bgBlur1}`}></div>
        <div className={`${styles.bgBlur} ${styles.bgBlur2}`}></div>
      </div>

      <div className={styles.registerCardWrapper}>
        <div className={styles.registerCard}>
          {/* Header */}
          <div className={styles.registerHeader}>
            <div className={styles.logoContainer}>
              <Dumbbell className={styles.logoIcon} />
            </div>
            <h1 className={styles.brandTitle}>
              IRON<span className={styles.brandAccent}>CORE</span>
            </h1>
            <p className={styles.welcomeText}>
              Create your account and start your fitness journey
            </p>
          </div>

          {/* Form */}
          <form className={styles.registerForm} onSubmit={handleSubmit}>
            {error && <div className={styles.errorMessage}>{error}</div>}
            {success && <div className={styles.successMessage}>{success}</div>}

            {/* Username */}
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

            {/* Email */}
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

            {/* Password */}
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

              {/* Password Strength Indicator */}
              {password && (
                <div className={styles.strengthContainer}>
                  <div className={styles.strengthBar}>
                    <div 
                      className={styles.strengthBarFill}
                      style={{
                        width: `${(passwordStrength.score / 5) * 100}%`,
                        backgroundColor: passwordStrength.color
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

              {/* Password Requirements */}
              {password && (
                <div className={styles.requirementsContainer}>
                  <p className={styles.requirementsTitle}>Password must contain:</p>
                  <ul className={styles.requirementsList}>
                    <li className={styles.requirementItem}>
                      {passwordStrength.checks.length ? (
                        <Check className={styles.checkIcon} size={16} style={{ color: '#22c55e' }} />
                      ) : (
                        <X className={styles.checkIcon} size={16} style={{ color: '#ef4444' }} />
                      )}
                      <span style={{ color: passwordStrength.checks.length ? '#22c55e' : '#6b7280' }}>
                        At least 8 characters
                      </span>
                    </li>
                    <li className={styles.requirementItem}>
                      {passwordStrength.checks.uppercase ? (
                        <Check className={styles.checkIcon} size={16} style={{ color: '#22c55e' }} />
                      ) : (
                        <X className={styles.checkIcon} size={16} style={{ color: '#ef4444' }} />
                      )}
                      <span style={{ color: passwordStrength.checks.uppercase ? '#22c55e' : '#6b7280' }}>
                        One uppercase letter
                      </span>
                    </li>
                    <li className={styles.requirementItem}>
                      {passwordStrength.checks.lowercase ? (
                        <Check className={styles.checkIcon} size={16} style={{ color: '#22c55e' }} />
                      ) : (
                        <X className={styles.checkIcon} size={16} style={{ color: '#ef4444' }} />
                      )}
                      <span style={{ color: passwordStrength.checks.lowercase ? '#22c55e' : '#6b7280' }}>
                        One lowercase letter
                      </span>
                    </li>
                    <li className={styles.requirementItem}>
                      {passwordStrength.checks.number ? (
                        <Check className={styles.checkIcon} size={16} style={{ color: '#22c55e' }} />
                      ) : (
                        <X className={styles.checkIcon} size={16} style={{ color: '#ef4444' }} />
                      )}
                      <span style={{ color: passwordStrength.checks.number ? '#22c55e' : '#6b7280' }}>
                        One number
                      </span>
                    </li>
                    <li className={styles.requirementItem}>
                      {passwordStrength.checks.special ? (
                        <Check className={styles.checkIcon} size={16} style={{ color: '#22c55e' }} />
                      ) : (
                        <X className={styles.checkIcon} size={16} style={{ color: '#ef4444' }} />
                      )}
                      <span style={{ color: passwordStrength.checks.special ? '#22c55e' : '#6b7280' }}>
                        One special character
                      </span>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Confirm Password */}
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
                <p className={styles.passwordMismatch}>Passwords do not match</p>
              )}
            </div>

            {/* Submit */}
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

          {/* Divider */}
          <div className={styles.divider}>
            <div className={styles.dividerLine}></div>
            <span className={styles.dividerText}>OR</span>
            <div className={styles.dividerLine}></div>
          </div>

          {/* Login Link */}
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
        </div>

        <div className={styles.footer}>
          <p>© 2025 IronCore. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Register;
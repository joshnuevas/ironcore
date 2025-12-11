import React, { useState } from "react";
import {
  Dumbbell,
  Eye,
  EyeOff,
  Mail,
  Lock,
  Shield,
  User,
  TrendingUp,
  Users,
  Award,
} from "lucide-react";
import styles from "./Login.module.css";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        let message;
        try {
          const text = await response.text();
          console.warn("Login error from server:", text);
          message = text || "Invalid email or password.";
        } catch {
          message = "Login failed. Please try again.";
        }
        setError(message);
        setIsLoading(false);
        return;
      }

      // ✅ Parse login response and store values used by your app
      const data = await response.json().catch(() => ({}));

      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      if (data.userId) {
        localStorage.setItem("userId", data.userId);
      }
      if (data.username) {
        localStorage.setItem("username", data.username);
      }
      if (data.email) {
        localStorage.setItem("email", data.email);
      }

      // ✅ Now get the current user profile to check role
      const userResponse = await fetch("http://localhost:8080/api/users/me", {
        credentials: "include",
      });

      if (!userResponse.ok) {
        console.warn("Failed to fetch user profile after login");
        setError("Login succeeded, but user profile could not be loaded.");
        setIsLoading(false);
        return;
      }

      const user = await userResponse.json();
      setUserData(user);

      // ✅ If admin → show role selection modal
      if (user.isAdmin === true || user.isAdmin === 1) {
        setShowRoleSelection(true);
        setIsLoading(false);
      } else {
        // ✅ Normal user → set role + go to landing
        localStorage.setItem("loginRole", "user");
        setIsLoading(false);
        navigate("/landing");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Unable to connect to the server.");
      setIsLoading(false);
    }
  };

  const handleRoleSelection = (role) => {
    localStorage.setItem("loginRole", role);
    setShowRoleSelection(false);

    if (role === "admin") {
      navigate("/admin");
    } else {
      navigate("/landing");
    }
  };

  return (
    <div className={styles.loginContainer}>
      {/* Left Side - Branding */}
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
            <h2 className={styles.heroTitle}>Transform Your Fitness Journey</h2>
            <p className={styles.heroDescription}>
              Join thousands of members achieving their fitness goals with
              professional trainers, state-of-the-art equipment, and
              personalized workout plans.
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
                <p>Work with certified professionals dedicated to your success</p>
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

      {/* Right Side - Form */}
      <div className={styles.rightSection}>
        <div className={styles.formContainer}>
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>Welcome Back</h2>
            <p className={styles.formSubtitle}>
              Sign in to your account to continue
            </p>
          </div>

          <form className={styles.loginForm} onSubmit={handleSubmit}>
            {error && <div className={styles.errorMessage}>{error}</div>}

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
            </div>

            <div className={styles.formOptions}>
              <div className={styles.rememberMe}>
                <input
                  id="remember"
                  type="checkbox"
                  className={styles.checkbox}
                />
                <label htmlFor="remember" className={styles.checkboxLabel}>
                  Remember me
                </label>
              </div>
              <button
                type="button"
                className={styles.forgotPassword}
                onClick={() => navigate("/forgot-password")}
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={styles.submitButton}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className={styles.divider}>
            <div className={styles.dividerLine}></div>
            <span className={styles.dividerText}>OR</span>
            <div className={styles.dividerLine}></div>
          </div>

          <div className={styles.signupSection}>
            <p className={styles.signupText}>
              Don't have an account?{" "}
              <button
                type="button"
                className={styles.signupLink}
                onClick={() => navigate("/register")}
              >
                Sign up
              </button>
            </p>
          </div>

          <div className={styles.footer}>
            <p>© 2025 IronCore. All rights reserved.</p>
          </div>
        </div>
      </div>

      {showRoleSelection && (
        <div className={styles.modalOverlay}>
          <div className={styles.roleModalContent}>
            <h2 className={styles.roleModalTitle}>Choose Your Role</h2>
            <p className={styles.roleModalDescription}>
              You have admin privileges. How would you like to continue?
            </p>

            <div className={styles.roleButtonsContainer}>
              <button
                onClick={() => handleRoleSelection("admin")}
                className={`${styles.roleButton} ${styles.adminRoleButton}`}
              >
                <Shield className={styles.roleIcon} />
                <div className={styles.roleButtonText}>
                  <div className={styles.roleButtonTitle}>
                    Admin Dashboard
                  </div>
                  <div className={styles.roleButtonDesc}>
                    Manage schedules, codes, and slots
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleRoleSelection("user")}
                className={`${styles.roleButton} ${styles.userRoleButton}`}
              >
                <User className={styles.roleIcon} />
                <div className={styles.roleButtonText}>
                  <div className={styles.roleButtonTitle}>Member Access</div>
                  <div className={styles.roleButtonDesc}>
                    Browse classes, trainers, and membership
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;

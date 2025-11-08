import React, { useState } from "react";
import { Dumbbell, Eye, EyeOff, Mail, Lock, Shield, User } from "lucide-react";
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
    setIsLoading(true);

    if (!email || !password) {
      setError("Please fill in all fields.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Store basic info
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.userId);
        localStorage.setItem("username", data.username);
        localStorage.setItem("email", data.email);

        // Check if user is admin
        const userResponse = await fetch("http://localhost:8080/api/users/me", {
          credentials: 'include',
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          
          // If user is admin, show role selection
          if (userData.isAdmin === true || userData.isAdmin === 1) {
            setUserData(userData);
            setShowRoleSelection(true);
            setIsLoading(false);
          } else {
            // Regular user, go directly to landing
            localStorage.setItem("loginRole", "user");
            navigate("/landing");
          }
        }
      } else {
        const message = await response.text();
        setError(message || "Login failed. Please try again.");
        setIsLoading(false);
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
      {/* Background animation */}
      <div className={styles.backgroundOverlay}>
        <div className={`${styles.bgBlur} ${styles.bgBlur1}`}></div>
        <div className={`${styles.bgBlur} ${styles.bgBlur2}`}></div>
      </div>

      <div className={styles.loginCardWrapper}>
        <div className={styles.loginCard}>
          <div className={styles.loginHeader}>
            <div className={styles.logoContainer}>
              <Dumbbell className={styles.logoIcon} />
            </div>
            <h1 className={styles.brandTitle}>
              IRON<span className={styles.brandAccent}>CORE</span>
            </h1>
            <p className={styles.welcomeText}>
              Welcome back! Sign in to continue
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
              <button type="button" className={styles.forgotPassword}>
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
        </div>

        <div className={styles.footer}>
          <p>© 2025 IronCore. All rights reserved.</p>
        </div>
      </div>

      {/* Role Selection Modal */}
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
                  <div className={styles.roleButtonTitle}>Admin Dashboard</div>
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
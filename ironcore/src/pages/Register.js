import React, { useState } from 'react';
import { Dumbbell, Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import styles from './Register.module.css';
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    // Simulate registration
    setTimeout(() => {
      if (!username || !email || !password || !confirmPassword) {
        setError('Please fill in all fields.');
      } else if (password !== confirmPassword) {
        setError('Passwords do not match.');
      } else {
        setSuccess('Account created successfully! You can now log in.');
        setUsername('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
      }
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className={styles.registerContainer}>
      {/* Animated background */}
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
                  type={showPassword ? 'text' : 'password'}
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
                  type={showConfirmPassword ? 'text' : 'password'}
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
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating account...
                </span>
              ) : (
                'Sign Up'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className={styles.divider}>
            <div className={styles.dividerLine}></div>
            <span className={styles.dividerText}>OR</span>
            <div className={styles.dividerLine}></div>
          </div>

          {/* Link to login */}
          <div className={styles.loginSection}>
            <p className={styles.loginText}>
              Already have an account?{' '}
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
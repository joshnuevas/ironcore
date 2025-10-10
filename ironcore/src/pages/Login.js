import React, { useState } from 'react';
import { Dumbbell, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import styles from './Login.module.css';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const validUser = { email: "admin@ironcore.com", password: "password123" };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    setSuccess(false);

    // Simulate API call
    setTimeout(() => {
      if (email === validUser.email && password === validUser.password) {
        setIsLoading(false);
        setSuccess(true); // show success popup
      } else {
        setError('Invalid email or password. Please try again.');
        setIsLoading(false);
      }
    }, 1500);
  };

  const handleContinue = () => {
    navigate('/landing');
  };

  return (
    <div className={styles.loginContainer}>
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
            <p className={styles.welcomeText}>Welcome back! Sign in to continue</p>
          </div>

          <form className={styles.loginForm} onSubmit={handleSubmit}>
            {error && <div className={styles.errorMessage}>{error}</div>}

            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.formLabel}>Email Address</label>
              <div className={styles.inputWrapper}>
                <div className={styles.inputIcon}><Mail className={styles.icon} /></div>
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
              <label htmlFor="password" className={styles.formLabel}>Password</label>
              <div className={styles.inputWrapper}>
                <div className={styles.inputIcon}><Lock className={styles.icon} /></div>
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
                  {showPassword ? <EyeOff className={styles.icon} /> : <Eye className={styles.icon} />}
                </button>
              </div>
            </div>

            <div className={styles.formOptions}>
              <div className={styles.rememberMe}>
                <input id="remember" type="checkbox" className={styles.checkbox} />
                <label htmlFor="remember" className={styles.checkboxLabel}>Remember me</label>
              </div>
              <button type="button" className={styles.forgotPassword}>Forgot password?</button>
            </div>

            <button type="submit" disabled={isLoading} className={styles.submitButton}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className={styles.divider}>
            <div className={styles.dividerLine}></div>
            <span className={styles.dividerText}>OR</span>
            <div className={styles.dividerLine}></div>
          </div>

          <div className={styles.signupSection}>
            <p className={styles.signupText}>
              Don't have an account?{' '}
              <button type="button" className={styles.signupLink} onClick={() => navigate('/register')}>Sign up</button>
            </p>
          </div>
        </div>

        <div className={styles.footer}>
          <p>© 2025 IronCore. All rights reserved.</p>
        </div>
      </div>

      {/* Success Modal */}
      {success && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>🎉 Login Successful!</h2>
            <p>Welcome to IronCore.</p>
            <button className={styles.continueButton} onClick={handleContinue}>Continue</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
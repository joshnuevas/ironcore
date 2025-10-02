import React from "react";
import { Link } from "react-router-dom";
import "./Login.css";

function Login() {
  return (
    <div className="container">
      <div className="page-label">LOGIN PAGE</div>

      <div className="left-section">
        <div className="logo-container">
          <div className="logo-text">IRONCORE</div>
        </div>
      </div>

      <div className="right-section">
        <div className="login-box">
          <form>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input type="text" id="username" name="username" />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input type="password" id="password" name="password" />
            </div>

            <button type="submit" className="login-btn">Log In</button>

            <div className="forgot-password">
              <a href="#">Forgot Password?</a>
            </div>

            {/* ✅ Styled Link as button */}
            <Link to="/register" className="create-account-btn">
              Create New Account
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
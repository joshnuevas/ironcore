import React from "react";
import { Link } from "react-router-dom";  // ✅ Import Link
import "./Register.css";

function Register() {
  return (
    <div className="container">
      <div className="page-label">REGISTER PAGE</div>

      <div className="left-section">
        <div className="logo-container">
          <div className="logo-text">IRONCORE</div>
        </div>
      </div>

      <div className="right-section">
        <div className="register-box">
          <h2 className="form-title">CREATE NEW ACCOUNT</h2>
          <form>
            <div className="form-row">
              <div className="form-group half">
                <label htmlFor="firstname">First Name</label>
                <input type="text" id="firstname" name="firstname" />
              </div>
              <div className="form-group half">
                <label htmlFor="lastname">Last Name</label>
                <input type="text" id="lastname" name="lastname" />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input type="email" id="email" name="email" />
            </div>

            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input type="text" id="username" name="username" />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input type="password" id="password" name="password" />
            </div>

            <div className="form-group">
              <label htmlFor="confirm-password">Confirm Password</label>
              <input type="password" id="confirm-password" name="confirm-password" />
            </div>

            <button type="submit" className="signup-btn">Sign Up</button>

            <div className="already-account">
              {/* ✅ Use Link instead of <a> */}
              <Link to="/login">Already have an Account?</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;
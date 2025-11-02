import React, { useState } from "react";
import { CreditCard, Calendar, User, Mail, Phone, Check } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar"; // ✅ Reuse navbar component
import styles from "./TransactionPage.module.css";

const TransactionPage = ({ onLogout }) => {
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Get selected plan or use default
  const plan = location.state?.plan || {
    name: "GOLD",
    price: "₱1,600",
    icon: "🏆",
    features: [
      "5 Classes per Week",
      "Access to Gym Floor",
      "Nutrition & Fitness Plan",
      "1 Personal Training Session",
      "Premium Equipment Access",
    ],
  };

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowSuccessModal(true);
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    navigate("/membership");
  };

  return (
    <div className={styles.transactionContainer}>
      {/* 🔹 Background */}
      <div className={styles.backgroundOverlay}>
        <div className={`${styles.bgBlur} ${styles.bgBlur1}`}></div>
        <div className={`${styles.bgBlur} ${styles.bgBlur2}`}></div>
        <div className={`${styles.bgBlur} ${styles.bgBlur3}`}></div>
      </div>

      {/* 🔹 Navbar reuse */}
      <Navbar activeNav="MEMBERSHIP" onLogout={onLogout} />

      {/* 🔹 Content Section */}
      <div className={styles.contentSection}>
        <div className={styles.contentContainer}>
          <div className={styles.headerSection}>
            <h1 className={styles.title}>CHECKOUT</h1>
            <p className={styles.subtitle}>Complete your membership purchase</p>
          </div>

          <div className={styles.checkoutGrid}>
            {/* 🔸 Order Summary */}
            <div className={styles.summaryCard}>
              <h2 className={styles.summaryTitle}>Order Summary</h2>

              <div className={styles.planDetails}>
                <div className={styles.planHeader}>
                  <span className={styles.planIcon}>{plan.icon}</span>
                  <div>
                    <h3 className={styles.planName}>{plan.name}</h3>
                    <p className={styles.planType}>Monthly Membership</p>
                  </div>
                </div>

                <div className={styles.featuresList}>
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className={styles.featureItem}>
                      <Check className={styles.checkIcon} />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <div className={styles.priceBreakdown}>
                  <div className={styles.priceRow}>
                    <span>Subtotal</span>
                    <span>{plan.price}</span>
                  </div>
                  <div className={styles.priceRow}>
                    <span>Processing Fee</span>
                    <span>₱50</span>
                  </div>
                  <div className={styles.totalRow}>
                    <span>Total</span>
                    <span className={styles.totalPrice}>
                      ₱{parseInt(plan.price.replace(/[₱,]/g, "")) + 50}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 🔸 Payment Form */}
            <div className={styles.formCard}>
              <h2 className={styles.formTitle}>Payment Details</h2>

              <form onSubmit={handleSubmit} className={styles.form}>
                {/* Personal Info */}
                <div className={styles.formSection}>
                  <h3 className={styles.sectionTitle}>Personal Information</h3>

                  <div className={styles.inputGroup}>
                    <label className={styles.label}>
                      <User className={styles.inputIcon} />
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className={styles.input}
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.label}>
                      <Mail className={styles.inputIcon} />
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={styles.input}
                      placeholder="john.doe@example.com"
                      required
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.label}>
                      <Phone className={styles.inputIcon} />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={styles.input}
                      placeholder="+63 XXX XXX XXXX"
                      required
                    />
                  </div>
                </div>

                {/* Payment Info */}
                <div className={styles.formSection}>
                  <h3 className={styles.sectionTitle}>Payment Method</h3>

                  <div className={styles.inputGroup}>
                    <label className={styles.label}>
                      <CreditCard className={styles.inputIcon} />
                      Card Number
                    </label>
                    <input
                      type="text"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      className={styles.input}
                      placeholder="1234 5678 9012 3456"
                      maxLength="19"
                      required
                    />
                  </div>

                  <div className={styles.inputRow}>
                    <div className={styles.inputGroup}>
                      <label className={styles.label}>
                        <Calendar className={styles.inputIcon} />
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        name="expiryDate"
                        value={formData.expiryDate}
                        onChange={handleInputChange}
                        className={styles.input}
                        placeholder="MM/YY"
                        maxLength="5"
                        required
                      />
                    </div>

                    <div className={styles.inputGroup}>
                      <label className={styles.label}>CVV</label>
                      <input
                        type="text"
                        name="cvv"
                        value={formData.cvv}
                        onChange={handleInputChange}
                        className={styles.input}
                        placeholder="123"
                        maxLength="3"
                        required
                      />
                    </div>
                  </div>
                </div>

                <button type="submit" className={styles.submitButton}>
                  Complete Payment
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* 🔹 Success Modal */}
      {showSuccessModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.successIcon}>✓</div>
            <h2>Payment Successful!</h2>
            <p>Your {plan.name} membership has been activated.</p>
            <button onClick={handleSuccessClose} className={styles.modalConfirm}>
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionPage;

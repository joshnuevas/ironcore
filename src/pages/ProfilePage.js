import React, { useState, useEffect, useRef } from "react";
import {
  User,
  Mail,
  Edit2,
  Save,
  X,
  Camera,
  ArrowLeft,
  Lock,
  Eye,
  EyeOff,
  Check,
  X as XIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import styles from "./ProfilePage.module.css";

const ProfilePage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [userId, setUserId] = useState(null); // ✅ store id in state, not localStorage

  const [userData, setUserData] = useState({
    username: "",
    email: "",
    profilePicture: "",
    isAdmin: false,
  });

  const [editMode, setEditMode] = useState({
    username: false,
    email: false,
  });

  const [editValues, setEditValues] = useState({
    username: "",
    email: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const [passwordValues, setPasswordValues] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
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

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    const pwd = passwordValues.newPassword;

    if (!pwd) {
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
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      number: /[0-9]/.test(pwd),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd),
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
  }, [passwordValues.newPassword]);

  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    if (text) {
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    }
  };

  // ✅ Use /api/users/me instead of userId from localStorage
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:8080/api/users/me", {
        credentials: "include",
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {},
      });

      if (!response.ok) {
        showMessage("Failed to load profile data", "error");
        setLoading(false);
        return;
      }

      const data = await response.json();

      setUserId(data.id); // keep id only in state

      setUserData({
        username: data.username,
        email: data.email,
        profilePicture: data.profilePicture || "",
        isAdmin: data.isAdmin || false,
      });

      setEditValues({
        username: data.username,
        email: data.email,
      });
    } catch (error) {
      console.error("Error loading profile:", error);
      showMessage("Error loading profile", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (field) => {
    setEditMode((prev) => ({ ...prev, [field]: true }));
    setEditValues((prev) => ({ ...prev, [field]: userData[field] }));
  };

  const handleCancel = (field) => {
    setEditMode((prev) => ({ ...prev, [field]: false }));
    setEditValues((prev) => ({ ...prev, [field]: userData[field] }));
  };

  const handleSave = async (field) => {
    if (!userId) {
      showMessage("User not loaded yet.", "error");
      return;
    }

    setSaving(true);
    showMessage("");

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:8080/api/users/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ [field]: editValues[field] }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        showMessage(data.message || "Failed to update profile", "error");
        return;
      }

      setUserData((prev) => ({ ...prev, [field]: editValues[field] }));
      setEditMode((prev) => ({ ...prev, [field]: false }));

      // Optional: if other parts of app still read username from localStorage
      if (field === "username") {
        localStorage.setItem("username", editValues[field]);
      }

      showMessage(
        `${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully!`,
        "success"
      );
    } catch (error) {
      console.error("Error updating profile:", error);
      showMessage("Error updating profile", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showMessage("Please select an image file", "error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showMessage("Image size should be less than 5MB", "error");
      return;
    }

    if (!userId) {
      showMessage("User not loaded yet.", "error");
      return;
    }

    setUploadingImage(true);
    showMessage("");

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("profilePicture", file);

      const response = await fetch(
        `http://localhost:8080/api/users/${userId}/profile-picture`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        showMessage(data.message || "Failed to upload image", "error");
        return;
      }

      setUserData((prev) => ({
        ...prev,
        profilePicture: data.profilePictureUrl,
      }));
      showMessage("Profile picture updated successfully!", "success");
    } catch (error) {
      console.error("Error uploading image:", error);
      showMessage("Error uploading image", "error");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    showMessage("");

    const { currentPassword, newPassword, confirmPassword } = passwordValues;

    if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      showMessage("Please fill out all password fields.", "error");
      return;
    }

    if (newPassword !== confirmPassword) {
      showMessage("New password and confirmation do not match.", "error");
      return;
    }

    if (passwordStrength.score < 3) {
      showMessage(
        "New password is too weak. Please meet at least 3 password requirements.",
        "error"
      );
      return;
    }

    if (!userId) {
      showMessage("User not loaded yet.", "error");
      return;
    }

    try {
      setChangingPassword(true);
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:8080/api/users/${userId}/change-password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(passwordValues),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        showMessage(data.message || "Failed to update password.", "error");
        return;
      }

      showMessage(data.message || "Password updated successfully!", "success");

      setPasswordValues({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error updating password:", error);
      showMessage("Error updating password. Please try again.", "error");
    } finally {
      setChangingPassword(false);
    }
  };

  const isAdmin = userData.isAdmin === true;

  if (loading) {
    return (
      <div className={styles.container}>
        <Navbar activeNav="PROFILE" />
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p className={styles.loadingText}>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Navbar activeNav="PROFILE" />

      <div className={styles.backgroundOverlay}>
        <div className={`${styles.bgBlur} ${styles.bgBlur1}`}></div>
        <div className={`${styles.bgBlur} ${styles.bgBlur2}`}></div>
      </div>

      <div className={styles.content}>
        {isAdmin && (
          <button className={styles.backButton} onClick={handleBack}>
            <ArrowLeft className={styles.backIcon} />
            <span>Back</span>
          </button>
        )}

        <div className={styles.profileCard}>
          <div className={styles.header}>
            <div className={styles.avatarContainer}>
              <div className={styles.avatarWrapper}>
                {userData.profilePicture ? (
                  <img
                    src={userData.profilePicture}
                    alt="Profile"
                    className={styles.avatarImage}
                  />
                ) : (
                  <div className={styles.avatar}>
                    {userData.username.charAt(0).toUpperCase()}
                  </div>
                )}
                <button
                  className={styles.cameraButton}
                  onClick={handleImageClick}
                  disabled={uploadingImage}
                  title="Change profile picture"
                >
                  <Camera size={20} />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: "none" }}
                />
              </div>
              {uploadingImage && (
                <p className={styles.uploadingText}>Uploading...</p>
              )}
            </div>
            <h1 className={styles.title}>My Profile</h1>
            <p className={styles.subtitle}>Manage your account information</p>
          </div>

          {message.text && (
            <div
              className={`${styles.message} ${
                message.type === "success"
                  ? styles.messageSuccess
                  : styles.messageError
              }`}
            >
              {message.text}
            </div>
          )}

          <div className={styles.fieldsContainer}>
            <div className={styles.field}>
              <div className={styles.fieldHeader}>
                <User size={20} className={styles.fieldIcon} />
                <label className={styles.label}>Username</label>
              </div>

              {editMode.username ? (
                <div className={styles.editContainer}>
                  <input
                    type="text"
                    value={editValues.username}
                    onChange={(e) =>
                      setEditValues((prev) => ({
                        ...prev,
                        username: e.target.value,
                      }))
                    }
                    className={styles.input}
                    autoFocus
                  />
                  <div className={styles.buttonGroup}>
                    <button
                      onClick={() => handleSave("username")}
                      disabled={saving || !editValues.username.trim()}
                      className={styles.saveButton}
                      style={{
                        opacity: saving || !editValues.username.trim() ? 0.5 : 1,
                      }}
                    >
                      <Save size={16} />
                    </button>
                    <button
                      onClick={() => handleCancel("username")}
                      disabled={saving}
                      className={styles.cancelButton}
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className={styles.displayContainer}>
                  <span className={styles.value}>{userData.username}</span>
                  <button
                    onClick={() => handleEdit("username")}
                    className={styles.editButton}
                  >
                    <Edit2 size={16} />
                    <span>Edit</span>
                  </button>
                </div>
              )}
            </div>

            <div className={styles.field}>
              <div className={styles.fieldHeader}>
                <Mail size={20} className={styles.fieldIcon} />
                <label className={styles.label}>Email</label>
              </div>

              {editMode.email ? (
                <div className={styles.editContainer}>
                  <input
                    type="email"
                    value={editValues.email}
                    onChange={(e) =>
                      setEditValues((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className={styles.input}
                    autoFocus
                  />
                  <div className={styles.buttonGroup}>
                    <button
                      onClick={() => handleSave("email")}
                      disabled={saving || !editValues.email.trim()}
                      className={styles.saveButton}
                      style={{
                        opacity: saving || !editValues.email.trim() ? 0.5 : 1,
                      }}
                    >
                      <Save size={16} />
                    </button>
                    <button
                      onClick={() => handleCancel("email")}
                      disabled={saving}
                      className={styles.cancelButton}
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className={styles.displayContainer}>
                  <span className={styles.value}>{userData.email}</span>
                  <button
                    onClick={() => handleEdit("email")}
                    className={styles.editButton}
                  >
                    <Edit2 size={16} />
                    <span>Edit</span>
                  </button>
                </div>
              )}
            </div>

            <div className={styles.field}>
              <div className={styles.fieldHeader}>
                <Lock size={20} className={styles.fieldIcon} />
                <label className={styles.label}>Change Password</label>
              </div>

              <div className={styles.passwordFormContainer}>
                <form className={styles.passwordForm} onSubmit={handlePasswordSubmit}>
                  <div className={styles.passwordRow}>
                    <label className={styles.passwordLabel}>Current Password</label>
                    <div className={styles.passwordInputWrapper}>
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        name="currentPassword"
                        value={passwordValues.currentPassword}
                        onChange={handlePasswordInputChange}
                        className={styles.input}
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        className={styles.passwordToggle}
                        onClick={() => setShowCurrentPassword((prev) => !prev)}
                      >
                        {showCurrentPassword ? (
                          <EyeOff className={styles.passwordToggleIcon} size={18} />
                        ) : (
                          <Eye className={styles.passwordToggleIcon} size={18} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className={styles.passwordRow}>
                    <label className={styles.passwordLabel}>New Password</label>
                    <div className={styles.passwordInputWrapper}>
                      <input
                        type={showNewPassword ? "text" : "password"}
                        name="newPassword"
                        value={passwordValues.newPassword}
                        onChange={handlePasswordInputChange}
                        className={styles.input}
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        className={styles.passwordToggle}
                        onClick={() => setShowNewPassword((prev) => !prev)}
                      >
                        {showNewPassword ? (
                          <EyeOff className={styles.passwordToggleIcon} size={18} />
                        ) : (
                          <Eye className={styles.passwordToggleIcon} size={18} />
                        )}
                      </button>
                    </div>

                    {passwordValues.newPassword && (
                      <>
                        <div className={styles.passwordStrengthContainer}>
                          <div className={styles.passwordStrengthBar}>
                            <div
                              className={styles.passwordStrengthBarFill}
                              style={{
                                width: `${(passwordStrength.score / 5) * 100}%`,
                                backgroundColor: passwordStrength.color,
                              }}
                            ></div>
                          </div>
                          <span
                            className={styles.passwordStrengthLabel}
                            style={{ color: passwordStrength.color }}
                          >
                            {passwordStrength.label}
                          </span>
                        </div>

                        <div className={styles.passwordRequirementsContainer}>
                          <p className={styles.passwordRequirementsTitle}>
                            New password must contain:
                          </p>
                          <ul className={styles.passwordRequirementsList}>
                            <li className={styles.passwordRequirementItem}>
                              {passwordStrength.checks.length ? (
                                <Check
                                  className={styles.checkIcon}
                                  size={16}
                                  style={{ color: "#22c55e" }}
                                />
                              ) : (
                                <XIcon
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
                            <li className={styles.passwordRequirementItem}>
                              {passwordStrength.checks.uppercase ? (
                                <Check
                                  className={styles.checkIcon}
                                  size={16}
                                  style={{ color: "#22c55e" }}
                                />
                              ) : (
                                <XIcon
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
                            <li className={styles.passwordRequirementItem}>
                              {passwordStrength.checks.lowercase ? (
                                <Check
                                  className={styles.checkIcon}
                                  size={16}
                                  style={{ color: "#22c55e" }}
                                />
                              ) : (
                                <XIcon
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
                            <li className={styles.passwordRequirementItem}>
                              {passwordStrength.checks.number ? (
                                <Check
                                  className={styles.checkIcon}
                                  size={16}
                                  style={{ color: "#22c55e" }}
                                />
                              ) : (
                                <XIcon
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
                            <li className={styles.passwordRequirementItem}>
                              {passwordStrength.checks.special ? (
                                <Check
                                  className={styles.checkIcon}
                                  size={16}
                                  style={{ color: "#22c55e" }}
                                />
                              ) : (
                                <XIcon
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
                      </>
                    )}
                  </div>

                  <div className={styles.passwordRow}>
                    <label className={styles.passwordLabel}>
                      Confirm New Password
                    </label>
                    <div className={styles.passwordInputWrapper}>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={passwordValues.confirmPassword}
                        onChange={handlePasswordInputChange}
                        className={styles.input}
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        className={styles.passwordToggle}
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className={styles.passwordToggleIcon} size={18} />
                        ) : (
                          <Eye className={styles.passwordToggleIcon} size={18} />
                        )}
                      </button>
                    </div>
                    {passwordValues.confirmPassword &&
                      passwordValues.newPassword !==
                        passwordValues.confirmPassword && (
                        <p className={styles.passwordMismatch}>
                          Passwords do not match
                        </p>
                      )}
                  </div>

                  <div className={styles.buttonGroup}>
                    <button
                      type="submit"
                      className={styles.saveButton}
                      disabled={changingPassword}
                    >
                      {changingPassword ? "Updating..." : "Update Password"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

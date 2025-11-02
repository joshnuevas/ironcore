import React, { useState, useEffect } from "react";
import { User, Mail, Edit2, Save, X } from "lucide-react";
import Navbar from "../components/Navbar";
import styles from "./ProfilePage.module.css";

const ProfilePage = () => {
  const [userData, setUserData] = useState({
    username: "",
    email: "",
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
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      const response = await fetch(`http://localhost:8080/api/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserData({
          username: data.username,
          email: data.email,
        });
        setEditValues({
          username: data.username,
          email: data.email,
        });
      } else {
        setMessage({ text: "Failed to load profile data", type: "error" });
      }
    } catch (error) {
      setMessage({ text: "Error loading profile", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (field) => {
    setEditMode({ ...editMode, [field]: true });
    setEditValues({ ...editValues, [field]: userData[field] });
  };

  const handleCancel = (field) => {
    setEditMode({ ...editMode, [field]: false });
    setEditValues({ ...editValues, [field]: userData[field] });
  };

  const handleSave = async (field) => {
    setSaving(true);
    setMessage({ text: "", type: "" });

    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      const response = await fetch(`http://localhost:8080/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ [field]: editValues[field] }),
      });

      if (response.ok) {
        await response.json();
        setUserData({ ...userData, [field]: editValues[field] });
        setEditMode({ ...editMode, [field]: false });
        
        if (field === "username") {
          localStorage.setItem("username", editValues[field]);
        }
        
        setMessage({ 
          text: `${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully!`, 
          type: "success" 
        });
        
        setTimeout(() => setMessage({ text: "", type: "" }), 3000);
      } else {
        const error = await response.json();
        setMessage({ text: error.message || "Failed to update profile", type: "error" });
      }
    } catch (error) {
      setMessage({ text: "Error updating profile", type: "error" });
    } finally {
      setSaving(false);
    }
  };

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
        <div className={styles.profileCard}>
          <div className={styles.header}>
            <div className={styles.avatarContainer}>
              <div className={styles.avatar}>
                {userData.username.charAt(0).toUpperCase()}
              </div>
            </div>
            <h1 className={styles.title}>My Profile</h1>
            <p className={styles.subtitle}>Manage your account information</p>
          </div>

          {message.text && (
            <div className={`${styles.message} ${
              message.type === "success" ? styles.messageSuccess : styles.messageError
            }`}>
              {message.text}
            </div>
          )}

          <div className={styles.fieldsContainer}>
            {/* Username Field */}
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
                    onChange={(e) => setEditValues({ ...editValues, username: e.target.value })}
                    className={styles.input}
                    autoFocus
                  />
                  <div className={styles.buttonGroup}>
                    <button
                      onClick={() => handleSave("username")}
                      disabled={saving || !editValues.username.trim()}
                      className={styles.saveButton}
                      style={{ opacity: (saving || !editValues.username.trim()) ? 0.5 : 1 }}
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

            {/* Email Field */}
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
                    onChange={(e) => setEditValues({ ...editValues, email: e.target.value })}
                    className={styles.input}
                    autoFocus
                  />
                  <div className={styles.buttonGroup}>
                    <button
                      onClick={() => handleSave("email")}
                      disabled={saving || !editValues.email.trim()}
                      className={styles.saveButton}
                      style={{ opacity: (saving || !editValues.email.trim()) ? 0.5 : 1 }}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
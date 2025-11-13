import React, { useState, useEffect, useRef } from "react";
import { User, Mail, Edit2, Save, X, Camera, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import styles from "./ProfilePage.module.css";

const ProfilePage = () => {
  const navigate = useNavigate();
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
  const fileInputRef = useRef(null);

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
        console.log("User data from API:", data);
        console.log("Is admin from API:", data.isAdmin);
        
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

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage({ text: "Please select an image file", type: "error" });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ text: "Image size should be less than 5MB", type: "error" });
      return;
    }

    setUploadingImage(true);
    setMessage({ text: "", type: "" });

    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      const formData = new FormData();
      formData.append("profilePicture", file);

      const response = await fetch(`http://localhost:8080/api/users/${userId}/profile-picture`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setUserData({ ...userData, profilePicture: data.profilePictureUrl });
        setMessage({ text: "Profile picture updated successfully!", type: "success" });
        setTimeout(() => setMessage({ text: "", type: "" }), 3000);
      } else {
        const error = await response.json();
        setMessage({ text: error.message || "Failed to upload image", type: "error" });
      }
    } catch (error) {
      setMessage({ text: "Error uploading image", type: "error" });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  // Check if user is admin from API response
  const isAdmin = userData.isAdmin === true;
  console.log("Is admin?", isAdmin);

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
          <button 
            className={styles.backButton}
            onClick={handleBack}
          >
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
                  style={{ display: 'none' }}
                />
              </div>
              {uploadingImage && (
                <p className={styles.uploadingText}>Uploading...</p>
              )}
            </div>
            <h1 className={styles.title}>My Profile</h1>
            <p className={styles.subtitle}>Manage your account information</p>
            {/* Debug info - remove this after fixing */}
            <p style={{ color: '#9ca3af', fontSize: '0.8rem', marginTop: '0.5rem' }}>
              Is Admin: {userData.isAdmin ? 'Yes (true)' : 'No (false)'} | Back button visible: {isAdmin ? 'Yes' : 'No'}
            </p>
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
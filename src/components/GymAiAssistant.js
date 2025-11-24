// src/components/GymAiAssistant.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { chatWithGymAi } from "../api/aiClient";
import { MessageCircle, Send, Loader2 } from "lucide-react";
import styles from "./GymAiAssistant.module.css";

const GymAiAssistant = () => {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  // Fetch current user so backend can check this user's membership
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/users/me", {
          withCredentials: true,
        });
        setCurrentUser(res.data);
      } catch (err) {
        console.error("Failed to fetch current user for AI assistant:", err);
        // It's okay if this fails; AI just won't be able to see user-specific membership
      }
    };

    fetchUser();
  }, []);

  const handleAsk = async () => {
    if (!message.trim()) return;

    setLoading(true);
    setError("");
    setReply("");

    try {
      const userId = currentUser ? currentUser.id : null;
      const data = await chatWithGymAi(message, userId);
      setReply(data.reply);
    } catch (err) {
      console.error(err);
      setError("Something went wrong talking to the AI assistant.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      handleAsk();
    }
  };

  return (
    <div className={styles.assistantCard}>
      {/* Header */}
      <div className={styles.cardHeader}>
        <div className={styles.iconCircle}>
          <MessageCircle size={22} />
        </div>
        <div>
          <h2 className={styles.title}>IronCore AI Assistant</h2>
          <p className={styles.subtitle}>
            Ask about your membership, classes, schedules, or trainers.
          </p>
        </div>
      </div>

      {/* Input Section */}
      <div className={styles.inputSection}>
        <textarea
          rows={4}
          placeholder="Example: Do I have an active membership? When does it expire?"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          className={styles.textarea}
        />
        <div className={styles.inputHints}>
          <span>Press Ctrl+Enter to send</span>
          <span>AI answers are suggestions only. Always listen to your coach.</span>
        </div>
      </div>

      {/* Ask Button */}
      <button
        onClick={handleAsk}
        disabled={loading}
        className={`${styles.askButton} ${loading ? styles.loading : ""}`}
      >
        {loading ? (
          <>
            <Loader2 className={styles.spinner} size={16} />
            Thinking...
          </>
        ) : (
          <>
            <Send size={16} />
            Ask AI
          </>
        )}
      </button>

      {/* Error Message */}
      {error && <p className={styles.errorMessage}>{error}</p>}

      {/* AI Reply */}
      {reply && (
        <div className={styles.replyBox}>
          <div className={styles.replyLabel}>AI Reply</div>
          <div className={styles.replyContent}>{reply}</div>
        </div>
      )}
    </div>
  );
};

export default GymAiAssistant;

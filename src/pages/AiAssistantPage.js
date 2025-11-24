// src/pages/AiAssistantPage.js
import React from "react";
import Navbar from "../components/Navbar";
import GymAiAssistant from "../components/GymAiAssistant";
import styles from "./AiAssistantPage.module.css";
import { Bot, Sparkles } from "lucide-react";

const AiAssistantPage = () => {
  return (
    <div className={styles.aiAssistantContainer}>
      <Navbar activeNav="AI" />

      {/* Animated background elements */}
      <div className={styles.backgroundOverlay}>
        <div className={`${styles.bgBlur} ${styles.bgBlur1}`}></div>
        <div className={`${styles.bgBlur} ${styles.bgBlur2}`}></div>
        <div className={`${styles.bgBlur} ${styles.bgBlur3}`}></div>
      </div>

      {/* Header Section */}
      <div className={styles.headerSection}>
        <div className={styles.headerContent}>
          <div className={styles.iconWrapper}>
            <Bot size={48} className={styles.botIcon} />
            <Sparkles size={24} className={styles.sparkleIcon} />
          </div>
          <h1 className={styles.pageTitle}>
            <span className={styles.titleMain}>IronCore AI</span>
            <span className={styles.titleSub}>Your Personal Fitness Assistant</span>
          </h1>
          <p className={styles.pageDescription}>
            Get instant answers about workouts, classes, nutrition, and everything fitness
          </p>
        </div>
      </div>

      {/* AI Assistant Component */}
      <div className={styles.assistantSection}>
        <div className={styles.assistantContainer}>
          <GymAiAssistant />
        </div>
      </div>
    </div>
  );
};

export default AiAssistantPage;
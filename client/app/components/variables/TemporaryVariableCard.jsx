import React from "react";
import styles from "../../styles/variable-semantics.module.css";
import { motion } from "framer-motion";

export default function TemporaryVariableCard({ name, value, isActive }) {
  if (value === null || value === undefined) return null;
  
  return (
    <motion.div 
      className={`${styles.semanticCard} ${isActive ? styles.tempActive : ""}`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ 
        opacity: isActive ? 1 : 0.5,
        y: 0,
        scale: isActive ? 1.05 : 1
      }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      layout
    >
      <span className={styles.varName}>{name}</span>
      <span className={styles.varOperator}>=</span>
      <span className={styles.varValue}>
        {typeof value === "object" ? JSON.stringify(value) : String(value)}
      </span>
    </motion.div>
  );
}

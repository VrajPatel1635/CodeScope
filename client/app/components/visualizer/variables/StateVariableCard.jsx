import React from "react";
import styles from "@/app/styles/variable-semantics.module.css";
import { motion } from "framer-motion";

export default function StateVariableCard({ name, value, runtimeType, category }) {
  if (value === null || value === undefined) return null;
  
  const isScalar = !category || category === "scalar";

  if (isScalar) {
    return (
      <motion.div 
        className={styles.semanticCard}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
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

  // Structural rendering
  const displayValue = typeof value === "object" ? JSON.stringify(value) : String(value);
  const truncatedValue = displayValue.length > 50 ? displayValue.substring(0, 50) + "..." : displayValue;

  return (
    <motion.div 
      className={styles.semanticCard}
      style={{ flexDirection: "column", alignItems: "flex-start", gap: "4px" }}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      layout
    >
      <div style={{ fontWeight: 600, color: "var(--accent-primary)" }}>{name}</div>
      {runtimeType && (
        <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
          Runtime Type: <span style={{ color: "var(--text-primary)" }}>{runtimeType}</span>
        </div>
      )}
      <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Preview:</div>
      <div className={styles.varValue} style={{ fontSize: "0.85rem", wordBreak: "break-all" }}>
        {truncatedValue}
      </div>
    </motion.div>
  );
}


import React from "react";
import styles from "@/app/styles/variable-semantics.module.css";
import { motion } from "framer-motion";

export default function StateVariableCard({ name, value }) {
  if (value === null || value === undefined) return null;
  
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


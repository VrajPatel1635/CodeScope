import React from "react";
import styles from "../../styles/variable-semantics.module.css";
import { motion, AnimatePresence } from "framer-motion";

export default function AccumulatorCard({ name, value, prevValue }) {
  if (value === null || value === undefined) return null;
  
  const hasTransition = prevValue !== undefined && prevValue !== value && prevValue !== null;

  return (
    <motion.div 
      className={styles.semanticCard}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      layout
    >
      <span className={styles.varName}>{name}</span>
      <span className={styles.varOperator}>:</span>
      
      <AnimatePresence mode="popLayout">
        <motion.div
          key={value}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          style={{ display: "flex", alignItems: "center" }}
        >
          {hasTransition && (
            <>
              <span className={styles.varOldValue}>{String(prevValue)}</span>
              <span className={styles.varArrow}>→</span>
              <span className={styles.varNewValue}>{String(value)}</span>
            </>
          )}
          {!hasTransition && (
            <span className={styles.varValue}>{String(value)}</span>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

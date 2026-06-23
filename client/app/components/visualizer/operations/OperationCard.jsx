import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function OperationCard({ children, title, icon }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="bg-(--bg-elevated) border border-(--border-color) rounded-lg shadow-xl overflow-hidden min-w-[250px]"
    >
      {/* Header */}
      <div className="bg-(--bg-surface) px-3 py-1.5 flex items-center gap-2 border-b border-(--border-color)">
        <span className="text-(--text-muted) text-xs font-mono">{icon}</span>
        <span className="text-(--text-secondary) text-[10px] uppercase tracking-wider font-semibold font-mono">
          {title}
        </span>
      </div>

      {/* Body */}
      <div className="px-4 py-3 flex items-center justify-center font-mono text-sm">
        {children}
      </div>
    </motion.div>
  );
}

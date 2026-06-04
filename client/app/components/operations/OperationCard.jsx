import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function OperationCard({ children, title, icon }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="bg-[#1A1A1A] border border-[#333333] rounded-lg shadow-xl overflow-hidden min-w-[250px]"
    >
      {/* Header */}
      <div className="bg-[#222222] px-3 py-1.5 flex items-center gap-2 border-b border-[#333333]">
        <span className="text-[#888888] text-xs font-mono">{icon}</span>
        <span className="text-[#CCCCCC] text-[10px] uppercase tracking-wider font-semibold font-mono">
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

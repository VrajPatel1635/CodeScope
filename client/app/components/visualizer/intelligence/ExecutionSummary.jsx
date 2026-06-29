"use client";

import React from "react";
import { motion } from "framer-motion";

export default function ExecutionSummary({ intelligence }) {
  if (!intelligence) return null;

  const { costDistribution, hotspots, characteristics } = intelligence;
  
  const dominantCost = intelligence.timeComplexity || "O(1)";

  let mostActiveStructure = "Variables";
  if (characteristics?.includes("Array Mutation Heavy")) mostActiveStructure = "Array";
  else if (characteristics?.includes("Collection Heavy")) mostActiveStructure = "Collection";
  else if (characteristics?.includes("Tree Traversal")) mostActiveStructure = "Tree";
  else if (characteristics?.includes("Graph Traversal")) mostActiveStructure = "Graph";

  const primaryHotspot = hotspots && hotspots.length > 0 ? `L${hotspots[0].line}` : "--";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-8 w-full border-t pt-8" 
      style={{ borderColor: "var(--border-color)" }}
    >
      <div className="text-[10px] font-mono uppercase tracking-[0.2em] flex items-center gap-3" style={{ color: "var(--text-muted)" }}>
        <div className="w-8 h-px bg-current opacity-50" />
        Execution Profile
      </div>
      
      {/* Massive Big-O Typographic Moment */}
      <div className="flex flex-col gap-2">
        <div className="text-[10px] font-mono uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>Dominant Time Complexity</div>
        <div className="text-7xl font-display leading-none tracking-tighter" style={{ color: "var(--accent-primary)" }}>
          {dominantCost}
        </div>
        {intelligence.complexityExplanation && (
          <div className="text-sm font-mono mt-2 p-3 rounded-md bg-white/5 border" style={{ borderColor: "var(--border-color)", color: "var(--text-secondary)" }}>
            <span className="text-xs uppercase tracking-widest block mb-1" style={{ color: "var(--accent-secondary)" }}>Reasoning</span>
            {intelligence.complexityExplanation}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-6 mt-4">
        <div className="flex flex-col gap-1">
          <div className="text-[10px] font-mono uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>{intelligence.patterns ? "Detected Pattern" : "Primary Structure"}</div>
          <div className="text-lg font-mono" style={{ color: "var(--text-primary)" }}>
            {intelligence.patterns ? intelligence.patterns.pattern : mostActiveStructure}
          </div>
          {intelligence.patterns?.reason && (
             <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{intelligence.patterns.reason}</div>
          )}
        </div>
        
        <div className="flex flex-col gap-1">
          <div className="text-[10px] font-mono uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>Primary Hotspot</div>
          <div className="text-lg font-mono flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: "var(--exec-error)" }} />
            {primaryHotspot}
          </div>
          {hotspots && hotspots.length > 0 && hotspots[0].explanation && (
            <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{hotspots[0].explanation}</div>
          )}
        </div>
      </div>

    </motion.div>
  );
}

"use client";

import React from "react";

export default function MemorySummary({ memory }) {
  if (!memory) return null;

  const { peakStackDepth, characteristic } = memory;

  const isWarning = characteristic === "Deep Recursion" || characteristic === "Heavy Allocation";

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Memory Profile</h3>
      
      <div className="flex flex-col gap-2 mt-1">
        <div className="flex justify-between items-center text-xs">
          <span style={{ color: "var(--text-secondary)" }}>Peak Stack Depth</span>
          <span className="font-mono font-semibold" style={{ color: "var(--text-primary)" }}>{peakStackDepth}</span>
        </div>
        
        <div className="flex justify-between items-center text-xs">
          <span style={{ color: "var(--text-secondary)" }}>Characteristic</span>
          <span 
            className="px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide"
            style={{ 
              backgroundColor: isWarning ? "rgba(245,158,11,0.1)" : "rgba(16,185,129,0.1)",
              color: isWarning ? "var(--exec-mutation)" : "var(--exec-node-active)",
              border: `1px solid ${isWarning ? "rgba(245,158,11,0.2)" : "rgba(16,185,129,0.2)"}`
            }}
          >
            {characteristic}
          </span>
        </div>
      </div>
    </div>
  );
}

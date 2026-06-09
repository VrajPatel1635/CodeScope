"use client";

import React from "react";

export default function CharacteristicsList({ characteristics }) {
  if (!characteristics || characteristics.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Observed Behavior</h3>
      <div className="flex flex-wrap gap-2 mt-1">
        {characteristics.map((char, idx) => {
          const isNegative = char.startsWith("✗");
          const displayChar = char.startsWith("✓") || char.startsWith("✗") ? char : `✓ ${char}`;
          
          return (
            <span 
              key={idx} 
              className="px-2 py-1 rounded text-[11px] font-medium border"
              style={{ 
                backgroundColor: isNegative ? "rgba(255,0,0,0.1)" : "var(--bg-elevated)", 
                borderColor: isNegative ? "rgba(255,0,0,0.2)" : "var(--border-color)",
                color: isNegative ? "#ff6b6b" : "var(--text-secondary)"
              }}
            >
              {displayChar}
            </span>
          );
        })}
      </div>
    </div>
  );
}

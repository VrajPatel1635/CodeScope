"use client";

import React from "react";

export default function ExecutionTimelineBar({ timeline }) {
  if (!timeline || timeline.length === 0) return null;

  const getPhaseColor = (phase) => {
      switch(phase) {
          case "Initialization": return "#6b7280";
          case "Main Processing": return "#3b82f6";
          case "Recursive Expansion": return "#8b5cf6";
          case "Backtracking": return "#f59e0b";
          case "Cleanup": return "#10b981";
          default: return "#3b82f6";
      }
  };

  return (
    <div className="flex flex-col gap-2 mt-2 pt-4 border-t border-opacity-10 w-full" style={{ borderColor: "var(--border-color)" }}>
      <h3 className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Execution Timeline</h3>
      
      <div className="relative w-full h-3 rounded-full overflow-hidden flex bg-opacity-20 mt-1" style={{ backgroundColor: "var(--bg-elevated)" }}>
          {timeline.map((segment, idx) => (
              <div 
                  key={idx}
                  title={`${segment.phase}`}
                  className="h-full transition-all duration-300 hover:opacity-80 border-r border-opacity-20 last:border-r-0 cursor-default"
                  style={{ 
                      width: `${segment.widthPercentage}%`, 
                      backgroundColor: getPhaseColor(segment.phase),
                      borderColor: "var(--bg-surface)"
                  }}
              />
          ))}
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5">
          {timeline.map((segment, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-[10px]">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getPhaseColor(segment.phase) }} />
                  <span style={{ color: "var(--text-secondary)" }}>{segment.phase}</span>
              </div>
          ))}
      </div>
    </div>
  );
}

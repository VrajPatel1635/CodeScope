"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ExecutionTimelineBar({ timeline }) {
  const [hoveredPhase, setHoveredPhase] = useState(null);

  if (!timeline || timeline.length === 0) return null;

  const getPhaseTheme = (phase) => {
      switch(phase) {
          case "Initialization": return { bg: "var(--text-muted)", color: "var(--bg-primary)" };
          case "Processing":
          case "Traversal":
          case "Collection Processing": return { bg: "var(--accent-primary)", color: "var(--bg-primary)" };
          case "Recursive Expansion": return { bg: "var(--accent-secondary)", color: "var(--bg-primary)" };
          case "Backtracking": return { bg: "var(--accent-highlight)", color: "var(--bg-primary)" };
          case "Cleanup": return { bg: "transparent", border: "1px solid var(--border-color)", color: "var(--text-secondary)" };
          default: return { bg: "var(--text-muted)", color: "var(--bg-primary)" };
      }
  };

  return (
    <div className="flex flex-col gap-5 w-full">
      <div className="text-[10px] font-mono uppercase tracking-[0.2em] flex items-center gap-3" style={{ color: "var(--text-muted)" }}>
        <div className="w-8 h-px bg-current opacity-50" />
        Phase Telemetry
      </div>
      
      <div className="flex flex-col w-full relative">
        {/* Calibration Ruler */}
        <div className="w-full flex justify-between items-end mb-1 px-px">
          {[0, 25, 50, 75, 100].map(mark => (
            <div key={mark} className="flex flex-col items-center gap-1">
              <span className="text-[8px] font-mono" style={{ color: "var(--text-muted)" }}>{mark}</span>
              <div className="w-px h-1.5" style={{ backgroundColor: "var(--border-color)" }} />
            </div>
          ))}
        </div>

        {/* The Horizontal Timeline Block */}
        <div className="relative w-full h-8 flex border p-[2px]" style={{ borderColor: "var(--border-color)", backgroundColor: "var(--bg-surface)" }}>
            {timeline.map((segment, idx) => {
                const theme = getPhaseTheme(segment.phase);
                
                return (
                  <motion.div 
                      key={idx}
                      onMouseEnter={() => setHoveredPhase(idx)}
                      onMouseLeave={() => setHoveredPhase(null)}
                      initial={{ width: 0 }}
                      animate={{ width: `${segment.widthPercentage}%` }}
                      transition={{ duration: 1.2, delay: idx * 0.15, ease: [0.16, 1, 0.3, 1] }}
                      className="relative h-full border-r border-transparent last:border-r-0 flex items-center justify-center overflow-hidden cursor-crosshair group"
                      style={{ 
                          backgroundColor: theme.bg,
                          borderRightColor: "var(--bg-surface)",
                          border: theme.border || "none"
                      }}
                  >
                     {/* Hover Overlay */}
                     <motion.div 
                        className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity"
                        style={{ backgroundColor: "#ffffff" }}
                     />

                     {/* Diagonal hash overlay for mechanical styling */}
                     <div className="absolute inset-0 opacity-[0.05]" style={{ 
                        backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 4px, #000 4px, #000 8px)`
                      }} />
                  </motion.div>
                );
            })}
        </div>
      </div>

      {/* Legend & Details */}
      <div className="flex flex-wrap items-start justify-between gap-4">
          {/* Detailed Legend */}
          <div className="flex flex-wrap gap-x-6 gap-y-3 flex-1">
              {timeline.map((segment, idx) => {
                  const theme = getPhaseTheme(segment.phase);
                  const isHovered = hoveredPhase === idx || hoveredPhase === null;
                  
                  return (
                      <div 
                        key={idx} 
                        className={`flex items-center gap-2 text-[10px] font-mono tracking-widest transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-30'}`}
                        onMouseEnter={() => setHoveredPhase(idx)}
                        onMouseLeave={() => setHoveredPhase(null)}
                      >
                          <div 
                            className="w-2 h-2" 
                            style={{ 
                              backgroundColor: theme.bg !== "transparent" ? theme.bg : "transparent",
                              border: theme.border ? theme.border : "none"
                            }} 
                          />
                          <span style={{ color: "var(--text-secondary)", cursor: "default" }}>{segment.phase}</span>
                          <span className="opacity-50" style={{ color: "var(--text-muted)", cursor: "default" }}>{Math.round(segment.widthPercentage)}%</span>
                      </div>
                  );
              })}
          </div>

          {/* Active Hover Detail */}
          <div className="w-48 shrink-0 flex flex-col items-end text-right min-h-[40px]">
             <AnimatePresence mode="wait">
                {hoveredPhase !== null && (
                  <motion.div
                    key="hover-detail"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col"
                  >
                    <span className="text-xs font-mono" style={{ color: "var(--text-primary)" }}>{timeline[hoveredPhase].phase}</span>
                    <span className="text-[10px] font-mono tracking-widest" style={{ color: "var(--text-secondary)" }}>
                       Phase Dominance: {Math.round(timeline[hoveredPhase].widthPercentage)}%
                    </span>
                  </motion.div>
                )}
             </AnimatePresence>
          </div>
      </div>
    </div>
  );
}

"use client";

import React from "react";

export default function CostDistributionBar({ costDistribution }) {
  if (!costDistribution) return null;

  const { comparisons, assignments, mutations, overhead } = costDistribution;
  
  const segments = [
    { label: "Comparisons", value: comparisons || 0, color: "#3b82f6" },
    { label: "Assignments", value: assignments || 0, color: "#10b981" },
    { label: "Mutations", value: mutations || 0, color: "#f59e0b" },
    { label: "Overhead", value: overhead || 0, color: "#6b7280" }
  ].filter(s => s.value > 0);

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Cost Distribution</h3>
      
      <div className="w-full h-2.5 rounded-full flex overflow-hidden mt-1 bg-opacity-20" style={{ backgroundColor: "var(--bg-elevated)" }}>
        {segments.map((s, idx) => (
          <div 
            key={idx}
            title={`${s.label}: ${s.value}%`}
            style={{ width: `${s.value}%`, backgroundColor: s.color }}
            className="h-full transition-all duration-300 hover:opacity-80 cursor-default"
          />
        ))}
      </div>

      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5">
        {segments.map((s, idx) => (
          <div key={idx} className="flex items-center gap-1.5 text-[10px]">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
            <span style={{ color: "var(--text-secondary)" }}>{s.label} <span className="font-mono opacity-80">{s.value}%</span></span>
          </div>
        ))}
      </div>
    </div>
  );
}

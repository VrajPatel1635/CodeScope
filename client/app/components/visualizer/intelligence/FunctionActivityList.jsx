"use client";

import React from "react";

export default function FunctionActivityList({ functions }) {
  if (!functions || functions.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Function Activity</h3>
      <div className="flex flex-col gap-1.5 mt-1">
        {functions.map((f, idx) => (
          <div key={idx} className="flex justify-between items-center py-0.5 border-b border-opacity-10 last:border-0" style={{ borderColor: "var(--border-color)" }}>
            <div className="flex items-center gap-2">
              <span className="text-[10px] w-4 h-4 flex items-center justify-center rounded bg-opacity-20" style={{ backgroundColor: "var(--bg-elevated)", color: "var(--text-muted)" }}>{idx + 1}</span>
              <span className="text-xs font-mono transition-colors hover:text-blue-400 cursor-pointer" style={{ color: "var(--text-primary)" }}>{f.name}()</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono" style={{ color: "var(--text-secondary)" }}>{f.count} calls</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

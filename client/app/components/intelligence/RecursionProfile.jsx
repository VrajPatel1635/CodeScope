"use client";

import React from "react";

export default function RecursionProfile({ recursion }) {
  if (!recursion || recursion.totalCalls === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Recursion Profile</h3>
      <div className="flex flex-col gap-2 mt-1">
        <div className="flex justify-between items-center text-xs">
          <span style={{ color: "var(--text-secondary)" }}>Total Recursive Calls</span>
          <span className="font-mono font-semibold" style={{ color: "var(--text-primary)" }}>{recursion.totalCalls}</span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span style={{ color: "var(--text-secondary)" }}>Max Depth</span>
          <span className="font-mono font-semibold" style={{ color: "var(--text-primary)" }}>{recursion.maxDepth}</span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span style={{ color: "var(--text-secondary)" }}>Average Depth</span>
          <span className="font-mono font-semibold" style={{ color: "var(--text-primary)" }}>{recursion.averageDepth}</span>
        </div>
        
        {recursion.deepestChain && recursion.deepestChain.length > 0 && (
            <div className="flex flex-col gap-1 mt-1 border-t border-opacity-10 pt-2" style={{ borderColor: "var(--border-color)" }}>
              <span className="text-[10px] uppercase" style={{ color: "var(--text-muted)" }}>Deepest Chain</span>
              <div className="text-[10px] font-mono whitespace-nowrap overflow-x-auto pb-1 flex items-center gap-1.5" style={{ color: "var(--text-secondary)" }}>
                  {recursion.deepestChain.map((fn, idx) => (
                      <React.Fragment key={idx}>
                          <span className="px-1.5 py-0.5 rounded bg-opacity-20" style={{ backgroundColor: "var(--bg-elevated)", color: "var(--text-primary)" }}>{fn}</span>
                          {idx < recursion.deepestChain.length - 1 && <span className="opacity-40 text-[8px]">▼</span>}
                      </React.Fragment>
                  ))}
              </div>
            </div>
        )}
      </div>
    </div>
  );
}

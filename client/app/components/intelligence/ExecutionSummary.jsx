"use client";

import React from "react";

export default function ExecutionSummary({ intelligence }) {
  if (!intelligence) return null;

  const { costDistribution, hotspots, characteristics } = intelligence;
  
  let dominantCost = "None";
  let maxCost = -1;
  for (const [key, val] of Object.entries(costDistribution || {})) {
    if (val > maxCost) {
      maxCost = val;
      dominantCost = key.charAt(0).toUpperCase() + key.slice(1);
    }
  }

  let mostActiveStructure = "Variables";
  if (characteristics?.includes("Array Mutation Heavy")) mostActiveStructure = "Array";
  else if (characteristics?.includes("Collection Heavy")) mostActiveStructure = "Collection";
  else if (characteristics?.includes("Tree Traversal")) mostActiveStructure = "Tree";
  else if (characteristics?.includes("Graph Traversal")) mostActiveStructure = "Graph";

  const primaryHotspot = hotspots && hotspots.length > 0 ? `Line ${hotspots[0].line}` : "N/A";

  return (
    <div className="flex flex-col h-full justify-center gap-2 border-r border-opacity-10 pr-4" style={{ borderColor: "var(--border-color)" }}>
      <h3 className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Execution Summary</h3>
      
      <div className="flex flex-col gap-2 mt-1">
        <div>
          <div className="text-[10px] uppercase" style={{ color: "var(--text-secondary)" }}>Dominant Cost</div>
          <div className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{dominantCost}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase" style={{ color: "var(--text-secondary)" }}>Active Structure</div>
          <div className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{mostActiveStructure}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase" style={{ color: "var(--text-secondary)" }}>Primary Hotspot</div>
          <div className="text-sm font-mono font-semibold" style={{ color: "var(--text-primary)" }}>{primaryHotspot}</div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useMemo } from "react";
import { buildExecutionMetrics } from "./executionMetricsBuilder";
import { motion } from "framer-motion";

export default function ExecutionMetricsPanel({ states }) {
  const metrics = useMemo(() => buildExecutionMetrics(states), [states]);

  if (!states || states.length === 0) {
    return null;
  }

  const MetricBox = ({ label, value }) => (
    <div className="flex flex-col gap-1 p-4 border rounded-md" style={{ borderColor: "var(--border-color)", backgroundColor: "var(--bg-elevated)" }}>
      <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>{label}</span>
      <span className="text-2xl font-mono" style={{ color: "var(--text-primary)" }}>{value}</span>
    </div>
  );

  return (
    <div className="flex flex-col gap-10 w-full">
      
      {/* Massive Typographic Moment */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col"
      >
        <div className="text-[10px] font-mono uppercase tracking-[0.2em] flex items-center gap-3 mb-2" style={{ color: "var(--text-muted)" }}>
          <div className="w-8 h-px bg-current opacity-50" />
          Execution Scale
        </div>
        <div className="text-[120px] leading-[0.85] tracking-tighter" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
          {metrics.totalSteps}
        </div>
        <div className="text-xs font-mono mt-6 flex items-center gap-3" style={{ color: "var(--accent-primary)" }}>
          <span className="w-2 h-2 bg-current rounded-sm animate-pulse" />
          TOTAL OPERATIONS
        </div>
      </motion.div>

      {/* Asymmetric Core Metrics Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="grid grid-cols-2 gap-4"
      >
        <MetricBox label="Assignments" value={metrics.assignments} />
        <MetricBox label="Comparisons" value={metrics.comparisons} />
        <MetricBox label="Fn Calls" value={metrics.functionCalls} />
        <MetricBox label="Max Depth" value={metrics.maxRecursionDepth} />
      </motion.div>

      {/* Structural Mutations (Horizontal List) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col gap-3"
      >
        <div className="text-[10px] font-mono uppercase tracking-widest mb-1" style={{ color: "var(--text-secondary)" }}>Mutation Profile</div>
        <div className="flex flex-wrap gap-2">
          {Object.entries({
            "Array": metrics.arrayMutations,
            "Matrix": metrics.matrixMutations,
            "Collection": metrics.collectionMutations,
            "List": metrics.linkedListMutations,
            "Tree": metrics.treeMutations,
            "Graph": metrics.graphMutations
          }).filter(([_, val]) => val > 0).map(([key, val]) => (
            <div key={key} className="px-3 py-1.5 rounded border text-[11px] font-mono flex items-center gap-2" style={{ borderColor: "var(--border-color)", backgroundColor: "var(--bg-elevated)" }}>
              <span style={{ color: "var(--text-secondary)" }}>{key}</span>
              <span style={{ color: "var(--text-primary)" }}>{val}</span>
            </div>
          ))}
          {/* Fallback if no mutations */}
          {metrics.arrayMutations === 0 && metrics.matrixMutations === 0 && metrics.collectionMutations === 0 && metrics.linkedListMutations === 0 && metrics.treeMutations === 0 && metrics.graphMutations === 0 && (
             <div className="px-3 py-1.5 rounded border text-[11px] font-mono italic opacity-50" style={{ borderColor: "var(--border-color)", color: "var(--text-secondary)" }}>
               Immutable Execution
             </div>
          )}
        </div>
      </motion.div>

    </div>
  );
}

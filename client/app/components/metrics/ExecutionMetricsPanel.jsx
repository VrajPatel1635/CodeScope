"use client";

import React, { useMemo } from "react";
import { buildExecutionMetrics } from "./executionMetricsBuilder";

export default function ExecutionMetricsPanel({ states }) {
  const metrics = useMemo(() => buildExecutionMetrics(states), [states]);

  if (!states || states.length === 0) {
    return (
      <div className="text-sm opacity-50" style={{ color: "var(--text-muted)" }}>
        No execution metrics available.
      </div>
    );
  }

  const MetricItem = ({ label, value }) => (
    <div className="flex justify-between items-center py-1 border-b border-opacity-10 last:border-0" style={{ borderColor: "var(--border-color)" }}>
      <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>{label}</span>
      <span className="text-sm font-mono" style={{ color: "var(--text-primary)" }}>{value}</span>
    </div>
  );

  return (
    <div className="flex flex-col gap-4 mt-2">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Core Execution Metrics */}
        <div className="p-3 rounded" style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border-color)" }}>
          <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>Core Execution</h3>
          <MetricItem label="Total Steps" value={metrics.totalSteps} />
          <MetricItem label="Assignments" value={metrics.assignments} />
          <MetricItem label="Comparisons" value={metrics.comparisons} />
        </div>

        {/* Data Structure Mutations */}
        <div className="p-3 rounded" style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border-color)" }}>
          <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>Data Structures</h3>
          <MetricItem label="Array Mutations" value={metrics.arrayMutations} />
          <MetricItem label="Matrix Mutations" value={metrics.matrixMutations} />
          <MetricItem label="Collection Mutations" value={metrics.collectionMutations} />
          <MetricItem label="List Mutations" value={metrics.linkedListMutations} />
          <MetricItem label="Tree Mutations" value={metrics.treeMutations} />
          <MetricItem label="Graph Mutations" value={metrics.graphMutations} />
        </div>

        {/* Call Stack & Recursion */}
        <div className="p-3 rounded" style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border-color)" }}>
          <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>Call Stack</h3>
          <MetricItem label="Function Calls" value={metrics.functionCalls} />
          <MetricItem label="Recursive Calls" value={metrics.recursiveCalls} />
          <MetricItem label="Max Recursion Depth" value={metrics.maxRecursionDepth} />
          <MetricItem label="Max Call Stack Size" value={metrics.maxCallStackSize} />
        </div>
      </div>
    </div>
  );
}

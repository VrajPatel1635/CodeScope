import React from "react";

export default function ConditionInsightPanel({ insight }) {
  if (!insight) return null;

  return (
    <div className={`p-4 border rounded font-mono text-sm shadow-sm space-y-1 ${insight.result ? "bg-green-50 border-green-200 text-green-900" : "bg-red-50 border-red-200 text-red-900"}`}>
      <div className={`font-bold text-xs uppercase mb-2 ${insight.result ? "text-green-600" : "text-red-600"}`}>
        Condition Evaluation
      </div>
      <div>
        if ({insight.expression})
      </div>
      <div className="mt-2 text-md">
        → {insight.evaluated} → {insight.result ? <strong className="text-green-800">TRUE ✅</strong> : <strong className="text-red-800">FALSE ❌</strong>}
      </div>
    </div>
  );
}

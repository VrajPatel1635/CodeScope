import React from "react";
import OperationCard from "../OperationCard";

export default function ComparisonOperation({ evaluatedExpr, result }) {
  // result is boolean
  const isTrue = result === true || result === "true";

  return (
    <OperationCard title="Comparison" icon="?">
      <div className="flex items-center gap-3 text-[15px]">
        <span className="text-[#AAAAAA]">{evaluatedExpr}</span>
        <span className="text-[#666666]">=</span>
        <span
          className={`px-2 py-0.5 rounded font-semibold text-sm ${
            isTrue
              ? "bg-green-500/10 text-green-400"
              : "bg-red-500/10 text-red-400"
          }`}
        >
          {isTrue ? "true" : "false"}
        </span>
      </div>
    </OperationCard>
  );
}

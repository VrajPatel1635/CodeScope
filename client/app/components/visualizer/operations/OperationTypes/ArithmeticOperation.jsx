import React from "react";
import OperationCard from "../OperationCard";

export default function ArithmeticOperation({ evaluatedExpr, result }) {
  return (
    <OperationCard title="Arithmetic" icon="+">
      <div className="flex items-center gap-3 text-[15px]">
        <span className="text-(--text-secondary)">{evaluatedExpr}</span>
        <span className="text-(--text-muted)">=</span>
        <span className="text-copper-400 bg-(--bg-elevated) px-2 py-0.5 rounded font-semibold">
          {result?.toString()}
        </span>
      </div>
    </OperationCard>
  );
}

import React from "react";
import OperationCard from "../OperationCard";

export default function AssignmentOperation({ varName, newValue }) {
  return (
    <OperationCard title="Assignment" icon="=">
      <div className="flex items-center gap-3 text-[15px]">
        <span className="text-copper-400 font-semibold">{varName}</span>
        <span className="text-[#666666]">←</span>
        <span className="text-white bg-[#333333] px-2 py-0.5 rounded">
          {newValue?.toString()}
        </span>
      </div>
    </OperationCard>
  );
}

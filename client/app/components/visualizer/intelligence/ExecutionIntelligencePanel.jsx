"use client";

import React, { useMemo } from "react";
import ExecutionSummary from "./ExecutionSummary";
import CharacteristicsList from "./CharacteristicsList";
import CostDistributionBar from "./CostDistributionBar";
import HotspotMiniList from "./HotspotMiniList";
import MemorySummary from "./MemorySummary";
import StructureActivityList from "./StructureActivityList";
import FunctionActivityList from "./FunctionActivityList";
import RecursionProfile from "./RecursionProfile";
import ExecutionTimelineBar from "./ExecutionTimelineBar";
import { deriveIntelligence } from "./intelligenceDeriver";

export default function ExecutionIntelligencePanel({ states, intelligence: serverIntelligence }) {
  const intelligence = useMemo(() => {
    return serverIntelligence || deriveIntelligence(states);
  }, [states, serverIntelligence]);

  if (!intelligence) {
    return (
      <div className="text-sm opacity-50" style={{ color: "var(--text-muted)" }}>
        No execution intelligence available.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 pt-2">
      {/* Row 1: Core V1 Profile */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/4 shrink-0">
          <ExecutionSummary intelligence={intelligence} />
        </div>
        
        <div className="w-full md:w-[40%] flex flex-col justify-center gap-5 md:border-r border-opacity-10 md:pr-6" style={{ borderColor: "var(--border-color)" }}>
          <CharacteristicsList characteristics={intelligence.characteristics} />
          <CostDistributionBar costDistribution={intelligence.costDistribution} />
        </div>
        
        <div className="w-full md:w-[35%] flex flex-col justify-center gap-5">
          <HotspotMiniList hotspots={intelligence.hotspots} />
          <MemorySummary memory={intelligence.memory} />
        </div>
      </div>

      {/* Row 2: V2 Activity Profiles */}
      {(intelligence.structures?.length > 0 || intelligence.functions?.length > 0 || intelligence.recursion?.totalCalls > 0) && (
        <div className="flex flex-col md:flex-row gap-6 border-t border-opacity-10 pt-4" style={{ borderColor: "var(--border-color)" }}>
          <div className="w-full md:w-1/3 md:border-r border-opacity-10 md:pr-4" style={{ borderColor: "var(--border-color)" }}>
            <StructureActivityList structures={intelligence.structures} />
          </div>
          <div className="w-full md:w-1/3 md:border-r border-opacity-10 md:pr-4" style={{ borderColor: "var(--border-color)" }}>
            <FunctionActivityList functions={intelligence.functions} />
          </div>
          <div className="w-full md:w-1/3">
            <RecursionProfile recursion={intelligence.recursion} />
          </div>
        </div>
      )}

      {/* Row 3: V2 Timeline */}
      <div className="w-full">
         <ExecutionTimelineBar timeline={intelligence.timeline} />
      </div>
    </div>
  );
}

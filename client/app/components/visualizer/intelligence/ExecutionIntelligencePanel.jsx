"use client";

import React, { useMemo } from "react";
import CharacteristicsList from "./CharacteristicsList";
import CostDistributionBar from "./CostDistributionBar";
import HotspotMiniList from "./HotspotMiniList";
import MemorySummary from "./MemorySummary";
import StructureActivityList from "./StructureActivityList";
import FunctionActivityList from "./FunctionActivityList";
import RecursionProfile from "./RecursionProfile";
import ExecutionTimelineBar from "./ExecutionTimelineBar";
import { deriveIntelligence } from "./intelligenceDeriver";
import { motion } from "framer-motion";

export default function ExecutionIntelligencePanel({ states, intelligence: serverIntelligence }) {
  const intelligence = useMemo(() => {
    return serverIntelligence || deriveIntelligence(states);
  }, [states, serverIntelligence]);

  if (!intelligence) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-8 w-full"
    >
      <div className="text-[10px] font-mono uppercase tracking-[0.2em] flex items-center gap-3 mb-2" style={{ color: "var(--text-muted)" }}>
        <div className="w-8 h-px bg-current opacity-50" />
        Deep Intelligence Telemetry
      </div>

      {/* Row 1: Structural Traits & Resource Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="col-span-1 lg:col-span-1 border rounded-md p-6 flex flex-col gap-6" style={{ borderColor: "var(--border-color)", backgroundColor: "var(--bg-elevated)" }}>
          <CharacteristicsList characteristics={intelligence.characteristics} />
        </div>
        
        <div className="col-span-1 lg:col-span-2 border rounded-md p-6 flex flex-col gap-6" style={{ borderColor: "var(--border-color)", backgroundColor: "var(--bg-elevated)" }}>
          <CostDistributionBar costDistribution={intelligence.costDistribution} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
            <HotspotMiniList hotspots={intelligence.hotspots} />
            <MemorySummary memory={intelligence.memory} />
          </div>
        </div>
      </div>

      {/* Row 2: V2 Activity Profiles (Only render if data exists) */}
      {(intelligence.structures?.length > 0 || intelligence.functions?.length > 0 || intelligence.recursion?.totalCalls > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border rounded-md p-6" style={{ borderColor: "var(--border-color)", backgroundColor: "var(--bg-elevated)" }}>
            <StructureActivityList structures={intelligence.structures} />
          </div>
          <div className="border rounded-md p-6" style={{ borderColor: "var(--border-color)", backgroundColor: "var(--bg-elevated)" }}>
            <FunctionActivityList functions={intelligence.functions} />
          </div>
          <div className="border rounded-md p-6" style={{ borderColor: "var(--border-color)", backgroundColor: "var(--bg-elevated)" }}>
            <RecursionProfile recursion={intelligence.recursion} />
          </div>
        </div>
      )}

      {/* Row 3: V2 Timeline */}
      <div className="w-full border rounded-md p-6" style={{ borderColor: "var(--border-color)", backgroundColor: "var(--bg-elevated)" }}>
         <ExecutionTimelineBar timeline={intelligence.timeline} />
      </div>
      
    </motion.div>
  );
}

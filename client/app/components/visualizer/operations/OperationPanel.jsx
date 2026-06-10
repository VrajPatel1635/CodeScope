import React, { useMemo } from "react";
import OperationRenderer from "./OperationRenderer";
import { AnimatePresence } from "framer-motion";

export default function OperationPanel({ activeMicroSteps, variables, collections, array }) {
  // Extract the most relevant trace event from active steps
  const activeTraceEvent = useMemo(() => {
    if (!activeMicroSteps || activeMicroSteps.length === 0) return null;

    // Prefer COND or ASSIGN events (wrapped in VAR for ASSIGN)
    for (const step of activeMicroSteps) {
      if (step.traceEvent) {
        if (step.traceEvent.type === "COND" || step.traceEvent.type === "ASSIGN") {
          return step.traceEvent;
        }
      }
    }
    return null;
  }, [activeMicroSteps]);

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-100 pointer-events-none">
      <AnimatePresence mode="wait">
        {activeTraceEvent && (
          <div className="pointer-events-auto">
            <OperationRenderer
              key={activeTraceEvent.type + "-" + (activeTraceEvent.line || activeTraceEvent.name)}
              traceEvent={activeTraceEvent}
              variables={variables}
              collections={collections}
              array={array}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ExecutionDiagnosticsPanel({
  diagnostic,
  currentStep,
  setCurrentStep,
  setTimelineMode,
  totalSteps
}) {
  const [showRaw, setShowRaw] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  // Auto-expand when a new diagnostic arrives
  useEffect(() => {
    if (diagnostic) setIsExpanded(true);
  }, [diagnostic]);

  if (!diagnostic) return null;

  const isError = diagnostic.severity === "error";
  const borderAccent = isError ? "border-red-900/40" : "border-[var(--accent-primary)]/30";
  const bgAccent = "bg-[var(--bg-surface)]";
  
  // Custom font families matched to globals.css tokens
  const cabinetFont = { fontFamily: "'Cabinet Grotesk', system-ui, sans-serif" };
  const instrumentFont = { fontFamily: "'Instrument Serif', Georgia, serif" };
  const monoFont = { fontFamily: "'JetBrains Mono', monospace" };

  const handleJumpToFailure = () => {
    if (!setCurrentStep) return;
    setTimelineMode && setTimelineMode("micro");
    
    // failingStep is 1-based index (e.g., states.length)
    if (diagnostic.failingStep !== null && diagnostic.failingStep !== undefined) {
      setCurrentStep(Math.max(0, diagnostic.failingStep - 1));
    } else if (totalSteps) {
      setCurrentStep(totalSteps - 1);
    }
  };

  const isAtFailureStep = () => {
    if (diagnostic.failingStep !== null && diagnostic.failingStep !== undefined) {
      return currentStep === diagnostic.failingStep - 1;
    }
    return totalSteps ? currentStep === totalSteps - 1 : false;
  };

  return (
    <div 
      className={`border rounded-lg p-5 shadow-2xl transition-all duration-300 ${borderAccent} ${bgAccent} w-full flex flex-col gap-6 relative`}
      style={{ backgroundColor: "var(--bg-surface)", borderColor: isError ? "#3f1a1a" : "var(--border-color)" }}
    >
      {/* Decorative side accent bar */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-md" 
        style={{ backgroundColor: isError ? "var(--exec-error)" : "var(--accent-primary)" }} 
      />

      {/* Header Info */}
      <div 
        className="flex flex-wrap items-start justify-between gap-4 pl-2 cursor-pointer group"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex flex-col gap-1 flex-1">
          <div className="flex items-center gap-2">
            <motion.svg 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth={2} 
              className="w-4 h-4 text-(--text-muted) group-hover:text-foreground transition-colors"
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </motion.svg>
            <span 
              className="text-[10px] font-mono uppercase tracking-[0.25em] font-semibold"
              style={{ color: isError ? "var(--exec-error)" : "var(--accent-primary)", ...monoFont }}
            >
              {diagnostic.category || "runtime"} exception detected
            </span>
          </div>
          <h2 
            className="text-2xl font-bold tracking-tight text-foreground"
            style={cabinetFont}
          >
            {diagnostic.title}
          </h2>
        </div>

        {/* Action Button: Jump to Failure Step */}
        {(diagnostic.failingStep !== null || totalSteps > 0) && (
          <button
            onClick={(e) => { e.stopPropagation(); handleJumpToFailure(); }}
            className={`px-4 py-2 text-xs font-mono uppercase tracking-widest border rounded transition-all duration-300 flex items-center gap-2 cursor-pointer ${
              isAtFailureStep() 
                ? "bg-(--accent-primary)/10 text-(--accent-primary) border-(--accent-primary)/30 cursor-default" 
                : "bg-(--bg-elevated) text-foreground border-(--border-color) hover:border-(--accent-primary)/40 hover:bg-(--accent-primary)/5"
            }`}
            style={monoFont}
            disabled={isAtFailureStep()}
          >
            <span className={`w-2 h-2 rounded-full ${isAtFailureStep() ? "bg-(--accent-primary) animate-pulse" : "bg-(--text-secondary)"}`} />
            {isAtFailureStep() ? "Viewing Crash State" : "Jump to Failure State"}
          </button>
        )}
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="flex flex-col gap-6 overflow-hidden"
          >
      {/* Explanation & Cause Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pl-2">
        <div className="flex flex-col gap-2">
          <h3 
            className="text-xs uppercase tracking-widest font-mono text-(--text-muted)"
            style={monoFont}
          >
            Error Context
          </h3>
          <p 
            className="text-(--text-secondary) text-[14px] leading-relaxed italic font-serif"
            style={instrumentFont}
          >
            "{diagnostic.explanation}"
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <h3 
            className="text-xs uppercase tracking-widest font-mono text-(--text-muted)"
            style={monoFont}
          >
            {diagnostic.suggestedFix ? "Suggested Fix" : "Probable Cause"}
          </h3>
          <div 
            className={`text-foreground text-[14px] leading-relaxed whitespace-pre-wrap ${diagnostic.suggestedFix ? "font-mono" : ""}`}
            style={diagnostic.suggestedFix ? monoFont : cabinetFont}
          >
            {diagnostic.suggestedFix || diagnostic.probableCause || "Unknown cause."}
          </div>
        </div>
      </div>

      {/* Error Details and Telemetry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pl-2 py-2 border-y border-(--border-color)">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-(--text-muted) font-mono block" style={monoFont}>Failing Line</span>
          <span className="text-lg font-bold text-foreground font-mono" style={monoFont}>
            Line {diagnostic.failingLine || "Unknown"}
          </span>
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-wider text-(--text-muted) font-mono block" style={monoFont}>Crash Step</span>
          <span className="text-lg font-bold text-foreground font-mono" style={monoFont}>
            Step {diagnostic.failingStep || "Unknown"}
          </span>
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-wider text-(--text-muted) font-mono block" style={monoFont}>Total Steps Reconstructed</span>
          <span className="text-lg font-bold text-foreground font-mono" style={monoFont}>
            {totalSteps || "None"}
          </span>
        </div>
      </div>

      {/* Variable Snapshot Panel */}
      {diagnostic.variableSnapshot && Object.keys(diagnostic.variableSnapshot).length > 0 && (
        <div className="pl-2 flex flex-col gap-3">
          <h3 
            className="text-xs uppercase tracking-widest font-mono text-(--text-muted) flex items-center gap-2"
            style={monoFont}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            Variables at Crash Point
          </h3>
          <div className="overflow-x-auto rounded border border-(--border-color) bg-background">
            <table className="min-w-full divide-y divide-(--border-color) text-xs font-mono" style={monoFont}>
              <thead>
                <tr className="bg-(--bg-surface)">
                  <th scope="col" className="px-4 py-2.5 text-left text-(--text-muted) font-semibold uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-4 py-2.5 text-left text-(--text-muted) font-semibold uppercase tracking-wider">Value</th>
                  <th scope="col" className="px-4 py-2.5 text-left text-(--text-muted) font-semibold uppercase tracking-wider">State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-(--border-color)">
                {Object.entries(diagnostic.variableSnapshot).map(([name, value]) => {
                  const isFailing = diagnostic.failingVariable === name || value === null || value === "null";
                  return (
                    <tr 
                      key={name} 
                      className={`hover:bg-(--bg-elevated)/50 transition-colors ${
                        isFailing ? "bg-red-950/10" : ""
                      }`}
                    >
                      <td className={`px-4 py-2.5 font-bold ${isFailing ? "text-red-400" : "text-(--text-secondary)"}`}>{name}</td>
                      <td className="px-4 py-2.5 text-foreground">
                        {value === null || value === "null" ? (
                          <span className="text-red-500 font-semibold italic">null</span>
                        ) : typeof value === "object" ? (
                          JSON.stringify(value)
                        ) : (
                          String(value)
                        )}
                      </td>
                      <td className="px-4 py-2.5">
                        {isFailing ? (
                          <span className="text-[10px] uppercase font-bold text-red-500 bg-red-950/40 px-1.5 py-0.5 rounded border border-red-900/30">
                            Failing Reference
                          </span>
                        ) : (
                          <span className="text-[10px] uppercase text-(--text-muted)">Active</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Structured Suggestions / Action Items */}
      {diagnostic.suggestions && diagnostic.suggestions.length > 0 && (
        <div className="pl-2 flex flex-col gap-3">
          <h3 
            className="text-xs uppercase tracking-widest font-mono text-(--text-muted)"
            style={monoFont}
          >
            Recommended Resolutions
          </h3>
          <ul className="flex flex-col gap-2.5 m-0 p-0 list-none">
            {diagnostic.suggestions.map((suggestion, idx) => (
              <li 
                key={idx} 
                className="flex items-start gap-3 text-sm text-(--text-secondary)"
                style={cabinetFont}
              >
                <span 
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold font-mono text-(--accent-primary) bg-(--accent-primary)/10 border border-(--accent-primary)/20 shrink-0 mt-0.5"
                  style={monoFont}
                >
                  {idx + 1}
                </span>
                <span className="pt-0.5">{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Raw Trace Toggle */}
      {diagnostic.rawMessage && (
        <div className="pl-2 pt-2 border-t border-(--border-color)">
          <button 
            onClick={() => setShowRaw(!showRaw)}
            className="text-[11px] font-mono text-(--text-secondary) hover:text-foreground transition-colors flex items-center gap-1.5 cursor-pointer bg-transparent border-none p-0 outline-none"
            style={monoFont}
          >
            <svg 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth={1.5} 
              className={`w-3.5 h-3.5 transition-transform duration-300 ${showRaw ? "rotate-90" : ""}`}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
            {showRaw ? "Hide compiler/runtime trace logs" : "View raw Java traceback logs"}
          </button>
          
          {showRaw && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-3 p-4 rounded bg-background border border-(--border-color) overflow-x-auto text-[11px] font-mono text-red-300 leading-relaxed custom-scrollbar"
              style={monoFont}
            >
              <pre className="m-0 whitespace-pre-wrap">{diagnostic.rawMessage}</pre>
            </motion.div>
          )}
        </div>
      )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

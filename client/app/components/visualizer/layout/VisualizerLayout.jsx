"use client";

import { useState, useEffect, useMemo } from "react";
import { deriveIntelligence } from "@/app/components/visualizer/intelligence/intelligenceDeriver";
import { motion, AnimatePresence } from "framer-motion";
import { Group, Panel, Separator } from "react-resizable-panels";
import CodeInput from "@/app/components/visualizer/layout/CodeInput";
import Controls from "@/app/components/visualizer/controls/Controls";
import VisualizationWorkspace from "@/app/components/visualizer/layout/VisualizationWorkspace";
import CallStackPanel from "@/app/components/visualizer/stack/CallStackPanel";
import ExecutionMetricsPanel from "@/app/components/visualizer/metrics/ExecutionMetricsPanel";
import ExecutionIntelligencePanel from "@/app/components/visualizer/intelligence/ExecutionIntelligencePanel";
import ExecutionSummary from "@/app/components/visualizer/intelligence/ExecutionSummary";
import ExecutionDiagnosticsPanel from "@/app/components/visualizer/diagnostics/ExecutionDiagnosticsPanel";
import DesktopRequiredOverlay from "@/app/components/visualizer/layout/DesktopRequiredOverlay";
import VisualizerNavbar from "@/app/components/visualizer/layout/VisualizerNavbar";

import useExecutionStore from "@/app/store/useExecutionStore";

// Motion variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
  }
};

export default function VisualizerLayout() {
  const { result, input, code, activeLine, setExecutionData, setActiveLine } = useExecutionStore();
  const [activeView, setActiveView] = useState("workspace"); // "workspace" | "analytics"
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile devices (excluding iPads which are >= 768px)
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile(); // Check immediately on mount
    
    // Add resize listener to handle dynamic resizing
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // --- HOISTED PLAYBACK STATE ---
  const [currentStep, setCurrentStep] = useState(0);
  const [sourceStepIndex, setSourceStepIndex] = useState(0);
  const [timelineMode, setTimelineMode] = useState("micro"); // "micro" | "source"
  const [isPlaying, setIsPlaying] = useState(false);

  const states = result?.states || [];
  const sourceSteps = result?.sourceSteps || [];

  // Reset playback when new data arrives
  useEffect(() => {
    setCurrentStep(0);
    setSourceStepIndex(0);
    setIsPlaying(false);
    if (!result?.states || result.states.length === 0) {
      setActiveView("workspace");
    }
  }, [states, sourceSteps, result]);

  // Interval for auto-playback
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      if (timelineMode === "micro") {
        setCurrentStep(prev => {
          if (prev >= states.length - 1) {
            clearInterval(interval);
            return prev;
          }
          return prev + 1;
        });
      } else {
        setSourceStepIndex(prev => {
          if (prev >= sourceSteps.length - 1) {
            clearInterval(interval);
            return prev;
          }
          return prev + 1;
        });
      }
    }, 500);

    return () => clearInterval(interval);
  }, [isPlaying, states, sourceSteps, timelineMode]);

  // Auto-pause at end
  useEffect(() => {
    if (timelineMode === "micro") {
      if (currentStep >= states.length - 1 && isPlaying) setIsPlaying(false);
    } else {
      if (sourceStepIndex >= sourceSteps.length - 1 && isPlaying) setIsPlaying(false);
    }
  }, [currentStep, sourceStepIndex, states.length, sourceSteps.length, isPlaying, timelineMode]);

  // DERIVE ACTIVE MICRO STEP
  let activeMicroStepIndex = currentStep;
  let activeSourceStep = null;
  if (timelineMode === "source" && sourceSteps.length > 0) {
    activeSourceStep = sourceSteps[sourceStepIndex];
    if (activeSourceStep) {
      const idx = states.findIndex(s => s.stepId === activeSourceStep.resolvedMicroStepId);
      if (idx !== -1) {
        activeMicroStepIndex = idx;
      } else {
        activeMicroStepIndex = Math.min(activeSourceStep.lastMicroStep - 1, states.length - 1);
      }
    }
  }

  const currentState = states[activeMicroStepIndex];

  // Update editor's active line
  useEffect(() => {
    if (currentState) {
      setActiveLine(currentState.line || null);
    } else {
      setActiveLine(null);
    }
  }, [currentState]);

  // Extract loop events to draw iteration markers on the timeline
  const loopMarkers = useMemo(() => {
    return states
      .map((s, idx) => (s.loopEvent ? { stepIndex: idx, iteration: s.loopEvent.iteration, loopId: s.loopEvent.loopId } : null))
      .filter(Boolean);
  }, [states]);

  const loopContext = currentState?.loopContext ?? {};

  const derivedIntelligence = useMemo(() => {
    return result?.intelligence || deriveIntelligence(states);
  }, [states, result?.intelligence]);

  // Extract call stack data
  const callStack = currentState?.stack ?? [];
  const returnFlow = currentState?.returnFlow ?? null;
  const stepReturn = currentState?.return;
  const linkedList = currentState?.linkedList;
  const tree = currentState?.tree;
  const graph = currentState?.graph;

  // Build CallStack semantics map
  const callStackSemanticFrames = result?.callStackSemanticFrames ?? [];
  const callStackSemanticMap = useMemo(() => {
    const m = new Map();
    for (const frame of callStackSemanticFrames) {
      m.set(frame.step, frame.callStackSemantics);
    }
    return m;
  }, [callStackSemanticFrames]);

  const currentCallStackSemantics = currentState ? callStackSemanticMap.get(currentState.step) ?? [] : [];

  if (isMobile) {
    return <DesktopRequiredOverlay />;
  }

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden w-full" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* NAVBAR */}
      <VisualizerNavbar>
        {states.length > 0 && (
          <Controls
            currentStep={currentStep}
            totalSteps={states.length}
            setCurrentStep={setCurrentStep}
            sourceStepIndex={sourceStepIndex}
            totalSourceSteps={sourceSteps.length}
            setSourceStepIndex={setSourceStepIndex}
            timelineMode={timelineMode}
            setTimelineMode={setTimelineMode}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            loopContext={loopContext}
            loopMarkers={loopMarkers}
          />
        )}
      </VisualizerNavbar>

      {/* VIEW SWITCHER */}
      <div className="w-full flex justify-center py-3 border-b z-40 relative" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-primary)' }}>
        <div className="flex items-center rounded-md p-1 border shadow-sm" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
          {/* Workspace Tab */}
          <button
            onClick={() => setActiveView("workspace")}
            className="relative px-6 py-2 text-xs font-mono uppercase tracking-[0.2em] outline-none z-10 transition-colors"
            style={{ color: activeView === "workspace" ? 'var(--bg-primary)' : 'var(--text-secondary)' }}
          >
            {activeView === "workspace" && (
              <motion.div
                layoutId="main-view-indicator"
                className="absolute inset-0 rounded-sm shadow-sm"
                style={{ backgroundColor: 'var(--text-primary)' }}
                transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
              />
            )}
            <span className="relative z-20 flex items-center gap-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              Workspace
            </span>
          </button>

          {/* Analytics Tab */}
          <button
            onClick={() => states.length > 0 && setActiveView("analytics")}
            disabled={states.length === 0}
            className={`relative px-6 py-2 text-xs font-mono uppercase tracking-[0.2em] outline-none z-10 transition-colors ${states.length === 0 ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer hover:bg-white/5'}`}
            style={{ color: activeView === "analytics" ? 'var(--bg-primary)' : 'var(--text-secondary)' }}
            title={states.length === 0 ? "Run code successfully to unlock execution metrics" : ""}
          >
            {activeView === "analytics" && (
              <motion.div
                layoutId="main-view-indicator"
                className="absolute inset-0 rounded-sm shadow-sm"
                style={{ backgroundColor: 'var(--text-primary)' }}
                transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
              />
            )}
            <span className="relative z-20 flex items-center gap-2">
              {states.length === 0 ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              )}
              Analytics
            </span>
          </button>
        </div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 flex flex-col p-4 md:p-6 gap-6"
      >


        {result?.diagnostic ? (
          <motion.div variants={itemVariants}>
            <ExecutionDiagnosticsPanel 
              diagnostic={result.diagnostic} 
              currentStep={currentStep}
              setCurrentStep={setCurrentStep}
              setTimelineMode={setTimelineMode}
              totalSteps={states.length}
            />
          </motion.div>
        ) : result?.error ? (
          <motion.div variants={itemVariants} style={{ color: 'var(--exec-error)' }} className="p-3 bg-red-950/20 rounded border border-red-900/50 backdrop-blur-sm">
            {result.error}
          </motion.div>
        ) : null}

        {/* RESIZABLE WORKSPACE (LEFT/RIGHT) */}
        {activeView === "workspace" && (
          <>
            <motion.div variants={itemVariants} className="flex-1 min-h-[600px] border rounded-lg overflow-hidden relative" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-surface)' }}>
              <Group direction="horizontal" className="absolute inset-0">
                {/* LEFT SIDE: Editor & Controls */}
                <Panel defaultSize={40} minSize={25}>
                  <div className="h-full w-full flex flex-col min-h-0">
                    <div className="flex-1 flex flex-col relative min-h-0 overflow-hidden pt-4 px-4 pb-0">
                      <CodeInput
                        onRun={(data, inputValue, codeValue) => {
                          setExecutionData(data, inputValue, codeValue);
                        }}
                        activeLine={activeLine}
                      />
                    </div>
                  </div>
                </Panel>

                {/* DRAG HANDLE */}
                <Separator className="w-1 flex flex-col justify-center items-center cursor-col-resize hover:bg-white/5 transition-colors relative group" style={{ backgroundColor: 'var(--border-color)' }}>
                  <div className="w-1 h-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: "var(--accent-secondary)" }} />
                </Separator>

                {/* RIGHT SIDE: Visualizer & Call Stack */}
                <Panel defaultSize={60} minSize={30}>
                  <div className="h-full w-full flex flex-col relative min-w-0">
                    <div className="p-4 flex-1 overflow-auto relative">
                      {states.length > 0 ? (
                        <VisualizationWorkspace
                          currentState={currentState}
                          result={result}
                          activeSourceStep={activeSourceStep}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          {/* Architectural Empty State */}
                          <div className="absolute inset-0 opacity-[0.03]" style={{
                            backgroundImage: `linear-gradient(var(--border-color) 1px, transparent 1px), linear-gradient(90deg, var(--border-color) 1px, transparent 1px)`,
                            backgroundSize: '40px 40px'
                          }} />
                          <div className="flex flex-col items-center gap-4 text-center z-10">
                            <div className="w-16 h-16 border rounded-full flex items-center justify-center relative overflow-hidden" style={{ borderColor: "var(--border-color)" }}>
                              <div className="absolute inset-0 border-t border-r rounded-full animate-spin" style={{ borderColor: "var(--accent-secondary)", animationDuration: "3s" }} />
                              <svg className="w-6 h-6 opacity-30" style={{ color: "var(--text-secondary)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                              </svg>
                            </div>
                            <div className="uppercase tracking-[0.2em] text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                              Awaiting Execution Data
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Floating Call Stack Widget (Overlay) */}
                    <AnimatePresence>
                      {states.length > 0 && callStack.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, x: 20, scale: 0.95 }}
                          animate={{ opacity: 1, x: 0, scale: 1 }}
                          exit={{ opacity: 0, x: 20, scale: 0.95 }}
                          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                          className="absolute top-4 right-4 w-72 max-h-[calc(100%-2rem)] flex flex-col gap-4 rounded-lg border shadow-2xl p-4 overflow-hidden z-50"
                          style={{
                            borderColor: 'var(--border-color)',
                            backgroundColor: 'var(--bg-elevated)',
                          }}
                        >
                          <div className="flex items-center justify-between mb-2 pb-2 border-b" style={{ borderColor: "var(--border-color)" }}>
                            <h2 className="text-xs uppercase tracking-widest font-mono" style={{ color: 'var(--text-secondary)' }}>Call Stack</h2>
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "var(--accent-primary)" }} />
                          </div>
                          <div className="flex-1 overflow-auto pr-2 custom-scrollbar">
                            <CallStackPanel
                              stack={callStack}
                              returnFlow={returnFlow}
                              stepReturn={stepReturn}
                              linkedList={linkedList}
                              tree={tree}
                              graph={graph}
                              callStackSemantics={currentCallStackSemantics}
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </Panel>
              </Group>
            </motion.div>

            {/* Separate Output Terminal Container */}
            {result?.states?.length > 0 && (
              <motion.div variants={itemVariants} className="shrink-0 border rounded-lg overflow-hidden flex flex-col h-48 shadow-sm mt-2" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-elevated)' }}>
                <div className="px-4 py-3 text-[10px] font-mono uppercase tracking-widest border-b flex items-center justify-between" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-surface)', color: 'var(--text-secondary)' }}>
                  <div className="flex items-center gap-2">
                    <span className="w-1 h-3 bg-current opacity-50" />
                    <span>Program Output</span>
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: result.error ? 'var(--exec-error)' : 'var(--accent-secondary)' }} />
                </div>
                <div className="flex-1 p-4 overflow-auto font-mono text-[13px] custom-scrollbar" style={{ color: 'var(--text-primary)' }}>
                  {result?.output ? (
                    <pre className="m-0 whitespace-pre-wrap">{result.output}</pre>
                  ) : (
                    <span className="opacity-30 italic">No output generated.</span>
                  )}
                </div>
              </motion.div>
            )}
          </>
        )}

        {/* BOTTOM SECTION: Execution Metrics & Output */}
        {activeView === "analytics" && (
          <motion.div variants={itemVariants} className="flex flex-col gap-6 rounded-lg p-6 flex-1 min-h-[600px] overflow-auto" style={{ backgroundColor: 'var(--bg-primary)' }}>
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 max-w-[1600px] mx-auto w-full">

              {/* LEFT COLUMN: Massive Telemetry (Col 1-4) */}
              <div className="xl:col-span-4 flex flex-col gap-12">
                <ExecutionMetricsPanel states={states} />
                <ExecutionSummary intelligence={derivedIntelligence} />
              </div>

              {/* RIGHT COLUMN: Deep Intelligence (Col 5-12) */}
              <div className="xl:col-span-8 flex flex-col gap-8">
                <ExecutionIntelligencePanel states={states} intelligence={derivedIntelligence} />
              </div>

            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

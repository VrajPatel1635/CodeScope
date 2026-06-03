"use client";

import { useState, useEffect, useMemo } from "react";
import CodeInput from "@/app/components/layout/CodeInput";
import Controls from "@/app/components/controls/Controls";
import VisualizationWorkspace from "@/app/components/layout/VisualizationWorkspace";
import CallStackPanel from "@/app/components/stack/CallStackPanel";

export default function VisualizerLayout() {
  const [result, setResult] = useState(null);
  const [input, setInput] = useState("");
  const [code, setCode] = useState("");
  const [activeLine, setActiveLine] = useState(null);

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
  }, [states, sourceSteps]);

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

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-6 gap-6" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* HEADER */}
      <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
        DSA Visualizer
      </h1>

      {result?.error && (
        <div style={{ color: 'var(--exec-error)' }} className="p-3 bg-red-950 rounded border border-red-900">
          {result.error}
        </div>
      )}

      {/* MAIN CONTENT AREA: LEFT / RIGHT */}
      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* LEFT SIDE: Editor & Controls */}
        <div className="flex flex-col gap-4 lg:w-[45%] xl:w-[40%] shrink-0">
          <div className="flex-1 rounded-lg overflow-hidden border shadow-sm flex flex-col" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-surface)' }}>
            <CodeInput
              onRun={(data, inputValue, codeValue) => {
                setResult(data);
                setInput(inputValue);
                setCode(codeValue);
                setActiveLine(null);
              }}
              activeLine={activeLine}
            />
          </div>

          {states.length > 0 && (
            <div className="p-4 rounded-lg border shadow-sm" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-elevated)' }}>
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
            </div>
          )}
        </div>

        {/* RIGHT SIDE: Visualizer & Call Stack */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Visualizations (Array/LinkedList/Tree/Graph) */}
          <div className="flex-1 flex flex-col gap-4 rounded-lg border shadow-sm overflow-hidden relative" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-surface)' }}>
            <div className="p-4 flex-1 overflow-auto">
              {states.length > 0 ? (
                <VisualizationWorkspace 
                  currentState={currentState} 
                  result={result} 
                  activeSourceStep={activeSourceStep}
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center opacity-50" style={{ color: 'var(--text-muted)' }}>
                  Awaiting Execution...
                </div>
              )}
            </div>

            {/* Floating Call Stack Widget (Overlay) */}
            {states.length > 0 && callStack.length > 0 && (
              <div 
                className="absolute top-4 right-4 w-72 max-h-[calc(100%-2rem)] flex flex-col gap-4 rounded-lg border shadow-lg p-4 overflow-hidden backdrop-blur-md bg-opacity-95 z-50 transition-all duration-300" 
                style={{ 
                  borderColor: 'var(--border-color)', 
                  backgroundColor: 'var(--bg-surface)', 
                }}
              >
                <h2 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Call Stack</h2>
                <div className="flex-1 overflow-auto pr-2">
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
              </div>
            )}
          </div>
        </div>

      </div>

      {/* BOTTOM SECTION: Complexity Analysis */}
      <div className="rounded-lg border shadow-sm p-4" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-surface)' }}>
        <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Complexity Analysis</h2>
        <div style={{ color: 'var(--text-muted)' }}>
          {/* Output text here if applicable, or placeholder */}
          {result?.output ? (
            <div className="font-mono text-sm mt-2 p-2 rounded" style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)' }}>
              <strong>Program Output:</strong> {result.output}
            </div>
          ) : (
            <p className="text-sm">Run code to analyze complexity and view output.</p>
          )}
        </div>
      </div>
    </div>
  );
}

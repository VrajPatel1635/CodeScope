"use client";

import React, { useState, useMemo, useEffect } from "react";
import Controls from "./Controls";
import ArrayVisualizer from "./ArrayVisualizer";
import LinkedListVisualizer from "./LinkedListVisualizer";
import VariablePanel from "./VariablePanel";
import CallStackPanel from "./CallStackPanel";
import ExpressionPanel from "./ExpressionPanel";
import ConditionInsightPanel from "./ConditionInsightPanel";
import LoopInsightPanel from "./LoopInsightPanel";

const POINTER_NAMES = ["i", "j", "k", "left", "right", "start", "end"];
const ACCUMULATOR_NAMES = ["sum", "count", "total", "ans"];
const RESULT_NAMES = ["result", "res", "output"];

function extractMethodBody(userCode) {
  if (!userCode) return [];
  const lines = userCode.split("\n");
  let bodyLines = [];
  let phase = "BEFORE";
  let braceCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (phase === "BEFORE") {
      const methodMatch = line.match(/\b(\w+)\s*\(/);
      if (line.includes("solve(") || (methodMatch && line.match(/^\s*(public|private|protected)/))) {
        phase = "METHOD_SIGNATURE";
        const open = (line.match(/{/g) || []).length;
        const close = (line.match(/}/g) || []).length;
        braceCount += open - close;
        if (braceCount > 0) phase = "BODY";
      }
    } else if (phase === "METHOD_SIGNATURE") {
      const open = (line.match(/{/g) || []).length;
      const close = (line.match(/}/g) || []).length;
      braceCount += open - close;
      if (braceCount > 0) phase = "BODY";
    } else if (phase === "BODY") {
      const open = (line.match(/{/g) || []).length;
      const close = (line.match(/}/g) || []).length;
      braceCount += open - close;
      if (braceCount === 0) break;
      bodyLines.push(line);
    }
  }
  return bodyLines;
}

function resolveValue(str, vars, array) {
  str = str.trim();
  if (!str) return null;
  if (!isNaN(Number(str))) return Number(str);
  if (str.includes(".length") && array) return array.length;
  const arrMatch = str.match(/(\w+)\[(.*?)\]/);
  if (arrMatch) {
    const idxVar = arrMatch[2].trim();
    const idx = typeof vars[idxVar] === "number" ? vars[idxVar] : Number(idxVar);
    if (array && !isNaN(idx) && idx >= 0 && idx < array.length) {
      return array[idx];
    }
  }
  return vars[str] !== undefined ? vars[str] : null;
}

function evaluateConditionExpr(expr, vars, array) {
  const ops = ["<=", ">=", "==", "!=", "<", ">"];
  let matchedOp = null;
  for (const op of ops) {
    if (expr.includes(op)) {
      matchedOp = op;
      break;
    }
  }
  if (!matchedOp) return null;
  
  const [leftStr, rightStr] = expr.split(matchedOp);
  const leftVal = resolveValue(leftStr, vars, array);
  const rightVal = resolveValue(rightStr, vars, array);
  
  if (leftVal === null || rightVal === null) return null;
  
  let result = false;
  switch (matchedOp) {
    case "<": result = leftVal < rightVal; break;
    case ">": result = leftVal > rightVal; break;
    case "<=": result = leftVal <= rightVal; break;
    case ">=": result = leftVal >= rightVal; break;
    case "==": 
    case "===": result = leftVal === rightVal; break;
    case "!=": 
    case "!==": result = leftVal !== rightVal; break;
  }
  
  return {
    evaluated: `${leftVal} ${matchedOp} ${rightVal}`,
    result
  };
}

function classifyVariables(currentStep, previousStep) {
  const classified = {};
  const vars = currentStep?.currentFrameVariables || {};
  const prevVars = previousStep?.currentFrameVariables || {};
  const arrLength = currentStep?.array?.length ?? 0;
  const returnValue = currentStep?.return;

  for (const [key, value] of Object.entries(vars)) {
    if (key === "__return__") continue;

    let type = "normal";

    if (typeof value === "number") {
      // Pointer: defined in POINTER_NAMES AND valid array index
      if (POINTER_NAMES.includes(key.toLowerCase()) && value >= 0 && value <= arrLength) {
        type = "pointer";
      }
      // Accumulator: name keyword OR value increased
      else if (
        ACCUMULATOR_NAMES.some((n) => key.toLowerCase().includes(n)) ||
        (previousStep && typeof prevVars[key] === "number" && value > prevVars[key])
      ) {
        type = "accumulator";
      }
      // Result: name keyword OR matches return value
      else if (
        RESULT_NAMES.some((n) => key.toLowerCase().includes(n)) ||
        (returnValue !== undefined && value === returnValue)
      ) {
        type = "result";
      }
    } else {
      // Non-number: still check name-based result/accumulator
      if (RESULT_NAMES.some((n) => key.toLowerCase().includes(n))) {
        type = "result";
      } else if (ACCUMULATOR_NAMES.some((n) => key.toLowerCase().includes(n))) {
        type = "accumulator";
      }
    }

    classified[key] = { value, type };
  }

  return classified;
}

export default function StepViewer({ states, input, code, semanticFrames = [], loopSemanticFrames = [], callStackSemanticFrames = [] }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Build a fast step→semantics lookup (step numbers are not guaranteed
  // to be sequential indices, so we key by step number).
  const semanticMap = useMemo(() => {
    const m = new Map();
    for (const frame of semanticFrames) {
      m.set(frame.step, frame.semantics);
    }
    return m;
  }, [semanticFrames]);

  const loopSemanticMap = useMemo(() => {
    const m = new Map();
    for (const frame of loopSemanticFrames) {
      m.set(frame.step, frame.loopSemantics);
    }
    return m;
  }, [loopSemanticFrames]);

  const callStackSemanticMap = useMemo(() => {
    const m = new Map();
    for (const frame of callStackSemanticFrames) {
      m.set(frame.step, frame.callStackSemantics);
    }
    return m;
  }, [callStackSemanticFrames]);

  // Memoize extracted method lines from the original Java code
  const bodyLines = useMemo(() => extractMethodBody(code), [code]);

  // Reset when new states arrive
  useEffect(() => {
    setCurrentStep(0);
    setIsPlaying(false);
  }, [states]);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= states.length - 1) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [isPlaying, states]);

  // Automatically pause when the last step is reached
  useEffect(() => {
    if (currentStep >= states.length - 1 && isPlaying) {
      setIsPlaying(false);
    }
  }, [currentStep, states.length, isPlaying]);

  if (!states || states.length === 0) return null;

  const currentState = states[currentStep];
  const previousState = currentStep > 0 ? states[currentStep - 1] : null;

  // Variables Diff
  const changedVariables = [];
  if (previousState && currentState) {
    const prevVars = previousState.currentFrameVariables || {};
    const currVars = currentState.currentFrameVariables || {};
    for (const key in currVars) {
      if (prevVars[key] !== currVars[key]) {
        changedVariables.push(key);
      }
    }
  }

  // Array Diff
  const changedIndex = currentState?.arrayEvent?.index != null ? Number(currentState.arrayEvent.index) : -1;

  // Pointers Detection
  const pointers = [];
  if (currentState?.currentFrameVariables && (currentState?.array || currentState?.matrix || currentState?.linkedList)) {
    const rawVars = currentState.currentFrameVariables;
    for (const [key, value] of Object.entries(rawVars)) {
      if (
        (typeof value === "number" && value >= 0 && POINTER_NAMES.includes(key.toLowerCase()))
      ) {
        pointers.push({ name: key, index: value });
      } else if (currentState?.linkedList && typeof value === "string" && value.startsWith("node_")) {
        pointers.push({ name: key, target: value, isMoving: false });
      }
    }
    
    // Debug log to trace literal execution path order
    if (currentState.step) {
      console.log("Pointer:", rawVars.i, rawVars.j, "Step:", currentState.step);
    }
  }

  // Apply ptrMoveEvent anticipation
  if (currentState?.ptrMoveEvent) {
    const { variable, nodeId } = currentState.ptrMoveEvent;
    const movingPtr = pointers.find(p => p.name === variable);
    if (movingPtr) {
      movingPtr.target = nodeId;
      movingPtr.isMoving = true;
    } else {
      // If the pointer didn't exist in the old state (e.g. first initialization), add it
      pointers.push({ name: variable, target: nodeId, isMoving: true });
    }
  }

  const classifiedVars = classifyVariables(currentState, previousState);

  // The backend now provides a real call stack on every step.
  // Fall back to an empty array so CallStackPanel shows "Execution complete"
  // if the step predates call-stack support.
  const callStack = currentState?.stack ?? [];
  const returnFlow = currentState?.returnFlow ?? null;
  const stepReturn = currentState?.return;
  const expressionEval = currentState?.expressionEvaluation ?? null;
  const loopContext = currentState?.loopContext ?? {};

  // Extract loop events to draw iteration markers on the timeline
  const loopMarkers = states
    .map((s, idx) => (s.loopEvent ? { stepIndex: idx, iteration: s.loopEvent.iteration, loopId: s.loopEvent.loopId } : null))
    .filter(Boolean);

  let conditionInsight = null;
  if (currentState && bodyLines.length > 0) {
    const currentLineText = bodyLines[currentState.line - 1] || "";
    const conditionMatch = currentLineText.match(/\b(?:if|while)\s*\((.*)\)/);
    
    if (conditionMatch) {
      const expr = conditionMatch[1];
      const parsed = evaluateConditionExpr(expr, currentState.currentFrameVariables || {}, currentState.array);
      if (parsed) {
        conditionInsight = {
          expression: expr.trim(),
          evaluated: parsed.evaluated,
          result: parsed.result
        };
      }
    }
  }

  return (
    <div className="border p-4 rounded space-y-4">
      <Controls
        currentStep={currentStep}
        totalSteps={states.length}
        setCurrentStep={setCurrentStep}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        loopContext={loopContext}
        loopMarkers={loopMarkers}
      />

      <ArrayVisualizer
        currentStep={currentState}
        changedIndex={changedIndex}
        pointers={pointers}
      />

      <LinkedListVisualizer
        currentStep={currentState}
        pointers={pointers}
        currentSemantics={semanticMap.get(currentState?.step) ?? []}
        loopSemantics={loopSemanticMap.get(currentState?.step) ?? []}
      />

      {/* Expression breakdown — visible only on return steps with binary exprs */}
      {expressionEval && (
        <ExpressionPanel expressionEvaluation={expressionEval} />
      )}

      {/* Condition Insight Layer */}
      {conditionInsight && (
        <ConditionInsightPanel insight={conditionInsight} />
      )}

      {/* Loop Insight Panel */}
      {Object.keys(loopContext).length > 0 && (
        <LoopInsightPanel loopContext={loopContext} />
      )}

      {/* Variable info + Call Stack side-by-side */}
      <div className="flex flex-col md:flex-row gap-4 items-start">
        <div className="flex-1 min-w-0">
          <VariablePanel
            state={currentState}
            changedVariables={changedVariables}
            classifiedVariables={classifiedVars}
          />
        </div>

        <div className="w-full md:w-72 shrink-0 flex flex-col gap-4">
          <CallStackPanel
            stack={callStack}
            returnFlow={returnFlow}
            stepReturn={stepReturn}
            linkedList={currentState?.linkedList}
            callStackSemantics={callStackSemanticMap.get(currentState?.step) ?? []}
          />
        </div>
      </div>
    </div>
  );
}
"use client";

import React, { useMemo } from "react";
import ArrayVisualizer from "./ArrayVisualizer";
import LinkedListVisualizer from "./LinkedListVisualizer";

const POINTER_NAMES = ["i", "j", "k", "left", "right", "start", "end"];

export default function StepViewer({ currentState, result }) {
  if (!currentState) return null;

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
  }

  // Apply ptrMoveEvent anticipation
  if (currentState?.ptrMoveEvent) {
    const { variable, nodeId } = currentState.ptrMoveEvent;
    const movingPtr = pointers.find(p => p.name === variable);
    if (movingPtr) {
      movingPtr.target = nodeId;
      movingPtr.isMoving = true;
    } else {
      pointers.push({ name: variable, target: nodeId, isMoving: true });
    }
  }

  // Build semantic maps for LinkedListVisualizer
  const semanticFrames = result?.semanticFrames ?? [];
  const semanticMap = useMemo(() => {
    const m = new Map();
    for (const frame of semanticFrames) {
      m.set(frame.step, frame.semantics);
    }
    return m;
  }, [semanticFrames]);

  const loopSemanticFrames = result?.loopSemanticFrames ?? [];
  const loopSemanticMap = useMemo(() => {
    const m = new Map();
    for (const frame of loopSemanticFrames) {
      m.set(frame.step, frame.loopSemantics);
    }
    return m;
  }, [loopSemanticFrames]);

  return (
    <div className="flex flex-col gap-6">
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
    </div>
  );
}
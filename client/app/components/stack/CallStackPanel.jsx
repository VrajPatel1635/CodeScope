"use client";

import { useEffect, useRef, useState } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// CallStackPanel
//
// Props:
//   stack       – Array<{ function: string, variables: Record<string,any> }>
//                 Backend gives index 0 = bottom, last = top (active call).
//   returnFlow  – { fromFunction, toFunction, value } | null
//                 Present only on RETURN steps.
//   stepReturn  – number | undefined   (step.return value, same as returnFlow.value)
// ─────────────────────────────────────────────────────────────────────────────

const SKIP_VARS = new Set(["__return__"]);

// ── Return bubble (floats upward on a RETURN step) ───────────────────────────
function ReturnBubble({ value, toFunction, resolveNodeValue }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 900);
    return () => clearTimeout(t);
  }, [value, toFunction]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 20,
        pointerEvents: "none",
        animation: "returnBubbleFloat 0.9s ease-out forwards",
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "5px",
          background: "linear-gradient(135deg, #f97316, #fb923c)",
          color: "#fff",
          fontFamily: "monospace",
          fontWeight: 700,
          fontSize: "0.8rem",
          padding: "3px 10px",
          borderRadius: "9999px",
          boxShadow: "0 2px 10px rgba(249,115,22,0.5)",
          whiteSpace: "nowrap",
        }}
      >
        ↑ {resolveNodeValue ? resolveNodeValue(value) : value}
        {toFunction && (
          <span style={{ fontWeight: 400, fontSize: "0.7rem", opacity: 0.85 }}>
            → {toFunction}()
          </span>
        )}
      </div>
    </div>
  );
}

// ── Single stack frame card ───────────────────────────────────────────────────
function StackFrame({ frame, isTop, depth, returnFlow, stepReturn, resolveNodeValue, frameSemantics = [] }) {
  const { function: fnName, variables = {} } = frame;
  const entries = Object.entries(variables).filter(([k]) => !SKIP_VARS.has(k));

  const hasSemantic = (type) => frameSemantics.some((s) => s.type === type);
  const isRecursiveDescent = hasSemantic("RECURSIVE_DESCENT");
  const isBaseCase = hasSemantic("BASE_CASE_REACHED");
  const isUnwinding = hasSemantic("UNWIND_PHASE");
  const isSuspended = hasSemantic("FRAME_SUSPENSION");
  const isResuming = hasSemantic("FRAME_RESUMPTION");
  const isReturnPropagating = hasSemantic("RETURN_PROPAGATION");

  // Show return bubble on the frame that is RETURNING (the child that just ran)
  const isReturning =
    returnFlow && returnFlow.fromFunction === fnName && isTop;

  // Dimming: top = full opacity, deeper = progressively faded
  const opacity = isTop ? 1 : Math.max(0.45, 1 - depth * 0.15);

  return (
    <div
      className="stack-frame-enter"
      style={{ opacity, transition: "opacity 0.25s ease", position: "relative" }}
    >
      {/* Return bubble floats up from this frame */}
      {isReturning && (
        <ReturnBubble
          key={`${returnFlow.value}-${returnFlow.toFunction}`}
          value={returnFlow.value}
          toFunction={returnFlow.toFunction !== fnName ? returnFlow.toFunction : null}
          resolveNodeValue={resolveNodeValue}
        />
      )}

      <div
        style={{
          borderRadius: "0.5rem",
          border: `1.5px solid ${
            isBaseCase ? "#10b981" : isReturning ? "#f97316" : isTop ? "#3b82f6" : isSuspended ? "#8b5cf6" : "#e5e7eb"
          }`,
          background: isSuspended ? "#f8fafc" : "#fff",
          opacity: isSuspended ? 0.8 : 1,
          boxShadow: isBaseCase
            ? "0 0 0 3px rgba(16, 185, 129, 0.15), 0 1px 4px rgba(0,0,0,0.06)"
            : isReturning
            ? "0 0 0 3px rgba(249,115,22,0.15), 0 1px 4px rgba(0,0,0,0.06)"
            : isTop
            ? "0 0 0 3px rgba(59,130,246,0.12), 0 1px 4px rgba(0,0,0,0.06)"
            : "0 1px 3px rgba(0,0,0,0.05)",
          overflow: "hidden",
          transition: "border-color 0.2s, box-shadow 0.2s, background 0.2s, opacity 0.2s",
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 12px",
            background: isBaseCase
              ? "#ecfdf5"
              : isReturning
              ? "#fff7ed"
              : isTop
              ? "#eff6ff"
              : isSuspended
              ? "#f5f3ff"
              : "#f9fafb",
            borderBottom: "1px solid",
            borderColor: isBaseCase
              ? "#a7f3d0"
              : isReturning
              ? "#fed7aa"
              : isTop
              ? "#bfdbfe"
              : isSuspended
              ? "#ede9fe"
              : "#f3f4f6",
          }}
        >
          {/* Indicator dot */}
          <span
            style={{
              display: "inline-block",
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: isBaseCase
                ? "#10b981"
                : isReturning
                ? "#f97316"
                : isTop
                ? "#3b82f6"
                : isSuspended
                ? "#8b5cf6"
                : "#9ca3af",
              flexShrink: 0,
              transition: "background 0.2s",
            }}
          />

          {/* Function name */}
          <span
            style={{
              fontFamily: "monospace",
              fontWeight: 600,
              fontSize: "0.8125rem",
              color: isBaseCase
                ? "#047857"
                : isReturning
                ? "#c2410c"
                : isTop
                ? "#1e40af"
                : isSuspended
                ? "#6d28d9"
                : "#374151",
              flex: 1,
            }}
          >
            {fnName}()
          </span>

          {/* Status badge */}
          <span
            style={{
              fontSize: "0.6875rem",
              padding: "1px 7px",
              borderRadius: "9999px",
              background: isBaseCase
                ? "#d1fae5"
                : isReturning
                ? "#ffedd5"
                : isUnwinding
                ? "#fce7f3"
                : isSuspended
                ? "#ede9fe"
                : isTop
                ? "#dbeafe"
                : "#f3f4f6",
              color: isBaseCase
                ? "#047857"
                : isReturning
                ? "#c2410c"
                : isUnwinding
                ? "#be185d"
                : isSuspended
                ? "#6d28d9"
                : isTop
                ? "#1d4ed8"
                : "#6b7280",
              border: `1px solid ${
                isBaseCase ? "#a7f3d0" : isReturning ? "#fed7aa" : isUnwinding ? "#fbcfe8" : isSuspended ? "#ddd6fe" : isTop ? "#bfdbfe" : "#e5e7eb"
              }`,
              fontWeight: 500,
              whiteSpace: "nowrap",
            }}
          >
            {isRecursiveDescent && !isBaseCase && <span style={{ marginRight: '4px' }}>↓</span>}
            {isReturning
              ? `↩ ${resolveNodeValue(returnFlow.value)}`
              : isBaseCase
              ? "base case"
              : isUnwinding
              ? "unwinding"
              : isSuspended
              ? "suspended"
              : isTop
              ? "active"
              : `depth −${depth}`}
          </span>
        </div>

        {/* ── Variables ── */}
        <div style={{ padding: "8px 12px" }}>
          {entries.length === 0 ? (
            <p style={{ fontSize: "0.75rem", color: "#9ca3af", fontStyle: "italic" }}>
              No variables
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {entries.map(([key, value]) => (
                <div
                  key={key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "3px 6px",
                    borderRadius: "4px",
                    background: "#f8fafc",
                    fontSize: "0.8125rem",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontWeight: 600,
                      color: "#1e40af",
                      background: "#dbeafe",
                      border: "1px solid #bfdbfe",
                      borderRadius: "3px",
                      padding: "0 4px",
                      fontSize: "0.75rem",
                    }}
                  >
                    {key}
                  </span>
                  <span style={{ color: "#9ca3af", fontFamily: "monospace" }}>=</span>
                  <span
                    style={{
                      fontFamily: "monospace",
                      color: "#111827",
                      fontWeight: 500,
                    }}
                  >
                    {JSON.stringify(value)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Return value banner (shown right on the returning frame) ── */}
        {isReturning && (
          <div
            style={{
              padding: "5px 12px",
              borderTop: "1px solid #fed7aa",
              background: "#fff7ed",
              fontSize: "0.75rem",
              color: "#9a3412",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontFamily: "monospace",
            }}
          >
            <span>returning</span>
            <span
              style={{
                fontWeight: 700,
                background: "#f97316",
                color: "#fff",
                padding: "0 6px",
                borderRadius: "4px",
              }}
            >
              {resolveNodeValue(returnFlow.value)}
            </span>
            {returnFlow.toFunction && (
              <span style={{ color: "#c2410c" }}>
                to {returnFlow.toFunction}()
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── CallStackPanel ────────────────────────────────────────────────────────────
export default function CallStackPanel({ stack = [], returnFlow = null, stepReturn, linkedList, tree, callStackSemantics = [] }) {
  // Backend: index 0 = bottom, last = top. Reverse so active call is first visually.
  const displayFrames = [...stack].reverse();
  const isEmpty = displayFrames.length === 0;

  const resolveNodeValue = (val) => {
    if (typeof val === "string" && val.startsWith("node_")) {
      const nodeLabel = linkedList?.nodes?.[val]?.val;
      if (nodeLabel !== undefined) {
        return `${val} → ${nodeLabel}`;
      }
    }
    if (typeof val === "string" && val.startsWith("treeNode_")) {
      const nodeLabel = tree?.nodes?.[val]?.val;
      if (nodeLabel !== undefined) {
        return `${val} → ${nodeLabel}`;
      }
    }
    return val;
  };

  return (
    <div style={{ width: "100%" }}>
      {/* ── Header ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "10px",
        }}
      >
        <h3
          style={{
            fontSize: "0.6875rem",
            fontWeight: 700,
            color: "#6b7280",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            margin: 0,
          }}
        >
          Call Stack
        </h3>
        <span
          style={{
            fontSize: "0.6875rem",
            fontFamily: "monospace",
            color: "#9ca3af",
            background: "#f3f4f6",
            padding: "1px 6px",
            borderRadius: "9999px",
          }}
        >
          {stack.length} frame{stack.length !== 1 ? "s" : ""}
        </span>

        {/* Return flow summary in header */}
        {returnFlow && (
          <span
            style={{
              marginLeft: "auto",
              fontSize: "0.6875rem",
              color: "#c2410c",
              background: "#fff7ed",
              border: "1px solid #fed7aa",
              borderRadius: "9999px",
              padding: "1px 8px",
              fontFamily: "monospace",
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            ↩ {returnFlow.fromFunction}() → {resolveNodeValue(returnFlow.value)}
          </span>
        )}
      </div>

      {/* ── Empty state ── */}
      {isEmpty ? (
        <div
          style={{
            padding: "16px 12px",
            borderRadius: "8px",
            border: "1px dashed #e5e7eb",
            textAlign: "center",
            fontSize: "0.8125rem",
            color: "#9ca3af",
          }}
        >
          ✓ Execution complete
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            borderLeft: "2px solid #e5e7eb",
            paddingLeft: "10px",
          }}
        >
          {displayFrames.map((frame, idx) => (
            <StackFrame
              key={`${frame.function}-${stack.length - 1 - idx}`}
              frame={frame}
              isTop={idx === 0}
              depth={idx}
              returnFlow={returnFlow}
              stepReturn={stepReturn}
              resolveNodeValue={resolveNodeValue}
              frameSemantics={callStackSemantics.filter(s => (s.frameId === frame.function && s.depth === (stack.length - 1 - idx)))}
            />
          ))}
        </div>
      )}

      {/* ── CSS animations ── */}
      <style>{`
        .stack-frame-enter {
          animation: stackFrameSlideIn 0.22s ease-out both;
        }
        @keyframes stackFrameSlideIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        @keyframes returnBubbleFloat {
          0%   { opacity: 1; transform: translateX(-50%) translateY(0)   scale(1);    }
          60%  { opacity: 1; transform: translateX(-50%) translateY(-40px) scale(1.05); }
          100% { opacity: 0; transform: translateX(-50%) translateY(-64px) scale(0.9);  }
        }
      `}</style>
    </div>
  );
}

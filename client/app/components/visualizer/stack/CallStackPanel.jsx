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
          background: "var(--exec-return)",
          color: "var(--bg-primary)",
          fontFamily: "var(--font-mono)",
          fontWeight: 700,
          fontSize: "0.8rem",
          padding: "3px 10px",
          borderRadius: "9999px",
          boxShadow: "0 2px 10px color-mix(in srgb, var(--exec-return) 50%, transparent)",
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
            isBaseCase ? "var(--exec-node-active)" : isReturning ? "var(--exec-return)" : isTop ? "var(--exec-active)" : isSuspended ? "var(--exec-frontier)" : "var(--border-color)"
          }`,
          background: "var(--bg-surface)",
          opacity: isSuspended ? 0.8 : 1,
          boxShadow: isBaseCase
            ? "0 0 0 3px color-mix(in srgb, var(--exec-node-active) 15%, transparent)"
            : isReturning
            ? "0 0 0 3px color-mix(in srgb, var(--exec-return) 15%, transparent)"
            : isTop
            ? "0 0 0 3px color-mix(in srgb, var(--exec-active) 15%, transparent)"
            : "var(--shadow-sm)",
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
              ? "color-mix(in srgb, var(--exec-node-active) 10%, var(--bg-surface))"
              : isReturning
              ? "color-mix(in srgb, var(--exec-return) 10%, var(--bg-surface))"
              : isTop
              ? "color-mix(in srgb, var(--exec-active) 10%, var(--bg-surface))"
              : isSuspended
              ? "color-mix(in srgb, var(--exec-frontier) 10%, var(--bg-surface))"
              : "var(--bg-elevated)",
            borderBottom: "1px solid",
            borderColor: isBaseCase
              ? "color-mix(in srgb, var(--exec-node-active) 30%, transparent)"
              : isReturning
              ? "color-mix(in srgb, var(--exec-return) 30%, transparent)"
              : isTop
              ? "color-mix(in srgb, var(--exec-active) 30%, transparent)"
              : isSuspended
              ? "color-mix(in srgb, var(--exec-frontier) 30%, transparent)"
              : "var(--border-color)",
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
                ? "var(--exec-node-active)"
                : isReturning
                ? "var(--exec-return)"
                : isTop
                ? "var(--exec-active)"
                : isSuspended
                ? "var(--exec-frontier)"
                : "var(--text-muted)",
              flexShrink: 0,
              transition: "background 0.2s",
            }}
          />

          {/* Function name */}
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontWeight: 600,
              fontSize: "0.8125rem",
              color: isBaseCase
                ? "var(--exec-node-active)"
                : isReturning
                ? "var(--exec-return)"
                : isTop
                ? "var(--exec-active)"
                : isSuspended
                ? "var(--exec-frontier)"
                : "var(--text-primary)",
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
                ? "color-mix(in srgb, var(--exec-node-active) 15%, transparent)"
                : isReturning
                ? "color-mix(in srgb, var(--exec-return) 15%, transparent)"
                : isUnwinding
                ? "color-mix(in srgb, var(--exec-error) 15%, transparent)"
                : isSuspended
                ? "color-mix(in srgb, var(--exec-frontier) 15%, transparent)"
                : isTop
                ? "color-mix(in srgb, var(--exec-active) 15%, transparent)"
                : "var(--bg-primary)",
              color: isBaseCase
                ? "var(--exec-node-active)"
                : isReturning
                ? "var(--exec-return)"
                : isUnwinding
                ? "var(--exec-error)"
                : isSuspended
                ? "var(--exec-frontier)"
                : isTop
                ? "var(--exec-active)"
                : "var(--text-muted)",
              border: `1px solid ${
                isBaseCase ? "color-mix(in srgb, var(--exec-node-active) 40%, transparent)" : isReturning ? "color-mix(in srgb, var(--exec-return) 40%, transparent)" : isUnwinding ? "color-mix(in srgb, var(--exec-error) 40%, transparent)" : isSuspended ? "color-mix(in srgb, var(--exec-frontier) 40%, transparent)" : isTop ? "color-mix(in srgb, var(--exec-active) 40%, transparent)" : "var(--border-color)"
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
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontStyle: "italic" }}>
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
                    background: "var(--bg-elevated)",
                    fontSize: "0.8125rem",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontWeight: 600,
                      color: "var(--exec-active)",
                      background: "color-mix(in srgb, var(--exec-active) 15%, transparent)",
                      border: "1px solid color-mix(in srgb, var(--exec-active) 30%, transparent)",
                      borderRadius: "3px",
                      padding: "0 4px",
                      fontSize: "0.75rem",
                    }}
                  >
                    {key}
                  </span>
                  <span style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>=</span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      color: "var(--text-primary)",
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
              borderTop: "1px solid color-mix(in srgb, var(--exec-return) 40%, transparent)",
              background: "color-mix(in srgb, var(--exec-return) 10%, transparent)",
              fontSize: "0.75rem",
              color: "var(--exec-return)",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontFamily: "var(--font-mono)",
            }}
          >
            <span>returning</span>
            <span
              style={{
                fontWeight: 700,
                background: "var(--exec-return)",
                color: "var(--bg-primary)",
                padding: "0 6px",
                borderRadius: "4px",
              }}
            >
              {resolveNodeValue(returnFlow.value)}
            </span>
            {returnFlow.toFunction && (
              <span style={{ color: "var(--exec-return)" }}>
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
export default function CallStackPanel({ stack = [], returnFlow = null, stepReturn, linkedList, tree, graph, callStackSemantics = [] }) {
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
    if (typeof val === "string" && val.startsWith("graphNode_")) {
      // Graph nodes use their numeric suffix as the label
      const numLabel = val.replace("graphNode_", "");
      return `node ${numLabel}`;
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
            color: "var(--text-muted)",
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
            fontFamily: "var(--font-mono)",
            color: "var(--text-secondary)",
            background: "var(--bg-elevated)",
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
              color: "var(--exec-return)",
              background: "color-mix(in srgb, var(--exec-return) 10%, transparent)",
              border: "1px solid color-mix(in srgb, var(--exec-return) 30%, transparent)",
              borderRadius: "9999px",
              padding: "1px 8px",
              fontFamily: "var(--font-mono)",
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
            border: "1px dashed var(--border-color)",
            textAlign: "center",
            fontSize: "0.8125rem",
            color: "var(--text-muted)",
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
            borderLeft: "2px solid var(--border-color)",
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

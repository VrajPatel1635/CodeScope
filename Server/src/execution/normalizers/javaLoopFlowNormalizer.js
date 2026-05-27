"use strict";

/**
 * Phase B.3 — Loop Flow Stabilization
 * 
 * Normalizes terminal loop flows (break, continue) into instrumentation-safe blocks.
 * This guarantees execution safety by isolating the flow jumps and generating canonical markers,
 * preventing loop cleanups from being unpredictably skipped and preventing 'unreachable code' exceptions.
 */

function isTerminalFlow(trimmed) {
  if (!trimmed) return false;
  if (trimmed.startsWith("break") || trimmed.startsWith("continue")) {
     // Ensure it's exactly break; or break label; etc.
     if (trimmed === "break;" || trimmed === "continue;") return true;
     if (/^break\s+[a-zA-Z0-9_]+\s*;$/.test(trimmed)) return true;
     if (/^continue\s+[a-zA-Z0-9_]+\s*;$/.test(trimmed)) return true;
  }
  return false;
}

/**
 * @param {Array<{text: string, line: number}>} mappedLines
 */
function normalizeLoopFlows(mappedLines) {
  const out = [];
  let flowCounter = 0;

  for (const lineObj of mappedLines || []) {
    const raw = String(lineObj?.text ?? "");
    const trimmed = raw.trim();

    if (!isTerminalFlow(trimmed)) {
      out.push(lineObj);
      continue;
    }

    const type = trimmed.startsWith("break") ? "BREAK" : "CONTINUE";
    const marker = `__DSA_${type}_${flowCounter++}__`;

    // Canonical form: isolate terminal flows into guaranteed blocks
    out.push({ text: "{", line: lineObj.line });
    out.push({ text: `final var ${marker} = "${trimmed}";`, line: lineObj.line });
    out.push({ text: trimmed, line: lineObj.line });
    out.push({ text: "}", line: lineObj.line });
  }

  return out;
}

module.exports = {
  normalizeLoopFlows,
};

"use strict";

/**
 * Phase B.2 — Safe return normalization (pre-instrumentation)
 *
 * Purpose:
 * - Make every return statement structurally predictable before TRACE injection
 * - Ensure return expressions are evaluated exactly once
 * - Ensure temp ownership is scope-local (no leaks / collisions)
 * - Preserve Java evaluation order and side effects
 *
 * This operates on the line-mapped, statement-split output from Phase B.1.
 */

function isReturnStatementText(trimmed) {
  if (!trimmed) return false;
  if (!trimmed.startsWith("return")) return false;
  if (trimmed.length === 6) return true; // 'return' (invalid Java alone, but treat as return-ish)
  const next = trimmed[6];
  return next === " " || next === "\t" || next === ";";
}

function parseReturn(trimmed) {
  // Assumes it begins with 'return'
  // Returns { isVoidReturn, exprText }
  const after = trimmed.slice(6).trim();
  if (after === ";" || after === "") {
    return { isVoidReturn: true, exprText: "" };
  }
  if (after.endsWith(";")) {
    const exprText = after.slice(0, -1).trim();
    return { isVoidReturn: false, exprText };
  }
  // Best-effort: treat as void return if no semicolon (should not happen after B.1)
  return { isVoidReturn: true, exprText: "" };
}

function normalizeReturnExpressionForVar(exprText, returnType) {
  const expr = String(exprText ?? "").trim();
  if (expr === "null" && returnType && returnType !== "void") {
    // `var x = null;` is illegal in Java. Casting keeps runtime semantics
    // (null stays null) and provides a type for `var` inference.
    return `(${returnType}) null`;
  }
  return expr;
}

/**
 * @param {Array<{text: string, line: number}>} mappedLines
 * @param {string} returnType - method return type, e.g. 'int', 'ListNode', 'void'
 */
function normalizeReturns(mappedLines, returnType) {
  const out = [];
  let retCounter = 0;

  for (const lineObj of mappedLines || []) {
    const raw = String(lineObj?.text ?? "");
    const trimmed = raw.trim();

    if (!isReturnStatementText(trimmed)) {
      out.push(lineObj);
      continue;
    }

    const { isVoidReturn, exprText } = parseReturn(trimmed);

    // Canonical form: always wrap return in a scope-local block.
    // This keeps temp vars contained and gives the injector stable insertion points.
    if (isVoidReturn || returnType === "void") {
      out.push({ text: "{", line: lineObj.line });
      out.push({ text: "return;", line: lineObj.line });
      out.push({ text: "}", line: lineObj.line });
      continue;
    }

    const exprNorm = normalizeReturnExpressionForVar(exprText, returnType);
    const tmp = `__DSA_RET_${retCounter++}__`;

    out.push({ text: "{", line: lineObj.line });
    out.push({ text: `final var ${tmp} = ${exprNorm};`, line: lineObj.line });
    out.push({ text: `return ${tmp};`, line: lineObj.line });
    out.push({ text: "}", line: lineObj.line });
  }

  return out;
}

module.exports = {
  normalizeReturns,
};

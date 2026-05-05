const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const { buildState } = require("../utils/stateEngine");
const { buildJavaInputsFromSignature, splitJavaPreamble, normalizeType } = require("../utils/inputBuilders");

const EXECUTIONS_DIR = path.join(__dirname, "../../executions");

function generateExecutionId() {
  return `exec_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

function createExecutionFolder(executionId) {
  const dirPath = path.join(EXECUTIONS_DIR, executionId);
  fs.mkdirSync(dirPath, { recursive: true });
  return dirPath;
}

function wrapJavaCode(userCode, input, methodName = "solve", methodParams = []) {
  const { preamble, rest } = splitJavaPreamble(userCode);

  const normalizedParams = (methodParams || []).map((p) => ({
    name: p.name,
    type: normalizeType(p.type),
  }));

  const built = buildJavaInputsFromSignature({
    userCode: rest,
    methodName,
    methodParams: normalizedParams,
    inputRaw: input,
  });

  const invocation = `${built.declarations}
        int result = sol.${methodName}(${built.argsList});`;

  const helperBlock = built.helperCode ? `\n${built.helperCode}\n` : "";

  return {
    javaCode: `
${preamble}
${helperBlock}
${rest}

public class Main {
    public static void main(String[] args) {
        Solution sol = new Solution();
        
        ${invocation}
        System.out.println(result);
    }
}
`,
    initialValueForState: built.initialValueForState,
  };
}

function writeJavaFile(dirPath, code) {
  const filePath = path.join(dirPath, "Main.java");
  fs.writeFileSync(filePath, code);
  return filePath;
}

function runProcess(command, args, cwd, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, { cwd });

    let stdout = "";
    let stderr = "";

    const timer = setTimeout(() => {
      process.kill("SIGKILL");
      reject(new Error("Execution timed out"));
    }, timeout);

    process.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    process.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    process.on("close", (code) => {
      clearTimeout(timer);
      resolve({ code, stdout, stderr });
    });

    process.on("error", (err) => {
      clearTimeout(timer);
      reject(err);
    });
  });
}

async function compileJava(dirPath) {
  return await runProcess("javac", ["Main.java"], dirPath);
}

async function runJava(dirPath) {
  return await runProcess("java", ["Main"], dirPath);
}

function cleanup(dirPath) {
  fs.rmSync(dirPath, { recursive: true, force: true });
}

async function executeJavaCode(userCode, input) {
  const executionId = generateExecutionId();
  const dirPath = createExecutionFolder(executionId);

  try {
    // 🔥 STEP 1: Extract method parts
    const { before, body, after, methodName, methodParams } = extractMethodParts(userCode);

    console.log("===== BEFORE =====");
    console.log(before);

    console.log("===== BODY =====");
    console.log(body);

    console.log("===== AFTER =====");
    console.log(after);

    console.log("===== METHOD NAME =====");
    console.log(methodName);

    console.log("===== METHOD PARAMS =====");
    console.log(methodParams);

    // 🔥 STEP 2: Inject TRACE into body (including CALL trace at entry)
    const tracedBody = injectTraceIntoBody(body, methodName, methodParams);

    // 🔥 STEP 3: Rebuild full user code
    const finalUserCode = before + "\n" + tracedBody + "\n" + after;

    console.log("===== FINAL USER CODE =====");
    console.log(finalUserCode);

    // 🔥 STEP 4: Wrap and execute
    const wrapped = wrapJavaCode(finalUserCode, input, methodName, methodParams);

    writeJavaFile(dirPath, wrapped.javaCode);

    const compileResult = await compileJava(dirPath);

    if (compileResult.code !== 0) {
      return {
        success: false,
        output: null,
        error: compileResult.stderr,
      };
    }

    const runResult = await runJava(dirPath);

    if (runResult.code !== 0) {
      return {
        success: false,
        output: runResult.stdout,
        error: runResult.stderr,
      };
    }

    const { trace, output } = parseExecutionOutput(runResult.stdout);

    // For now, only int[] / int[][] populate the array/matrix visualizer.
    const initialArray = wrapped.initialValueForState ?? null;

    const states = buildState(trace, initialArray);

    return {
      success: true,
      states,
      output,
      error: null,
    };
  } catch (err) {
    return {
      success: false,
      output: null,
      error: err.message,
    };
  } finally {
    cleanup(dirPath);
  }
}

function parseExecutionOutput(rawOutput) {
  const trace = [];
  let output = "";

  if (typeof rawOutput !== "string" || rawOutput.length === 0) {
    return { trace, output };
  }

  const lines = rawOutput.split(/\r?\n/);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (!line.startsWith("TRACE|")) {
      output += line + "\n";
      continue;
    }

    const parts = line.split("|");
    if (parts.length < 2) continue;

    const type = parts[1];

    if (type === "LINE") {
      trace.push({ type: "LINE", line: Number(parts[2]) });
    } else if (type === "VAR") {
      const varName = parts[2];
      const validIdentifierRegex = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
      if (validIdentifierRegex.test(varName)) {
        trace.push({ type: "VAR", name: varName, value: parts[3] });
      }
    } else if (type === "CALL") {
      trace.push({ type: "CALL", function: parts[2] });
    } else if (type === "EXPR") {
      // TRACE|EXPR|<leftVar>|<operator>|<rightFn>|<leftValue>
      trace.push({
        type: "EXPR",
        left: parts[2],
        operator: parts[3],
        rightFn: parts[4],
        leftValue: Number(parts[5]),
      });
    } else if (type === "RETURN") {
      trace.push({ type: "RETURN", value: Number(parts[2]) });
    } else if (type === "ARRAY") {
      trace.push({ type: "ARRAY", name: parts[2], index: parts[3], value: parts[4] });
    } else if (type === "LOOP") {
      trace.push({ type: "LOOP", loopId: parts[2], iteration: Number(parts[3]) });
    } else if (type === "NODE_LINK") {
      trace.push({ type: "NODE_LINK", from: parts[2], to: parts[3] });
    } else if (type === "PTR_MOVE") {
      trace.push({ type: "PTR_MOVE", variable: parts[2], nodeId: parts[3] });
    }
  }

  return { trace, output: output.trim() };
}

/**
 * Detect if a return expression is a binary expression involving a recursive call.
 * Supported pattern: <var> <op> <fnName>(...)
 * Returns { left, operator, rightFn } or null.
 */
function detectBinaryExpr(returnExpr, methodName) {
  // Match: identifier OP methodName(...)
  // e.g.  n * solve(n - 1)   →  left="n", op="*", rightFn="solve"
  const match = returnExpr.match(
    /^([a-zA-Z_][a-zA-Z0-9_]*)\s*([+\-*\/])\s*(\w+)\s*\(/);
  if (match) {
    return { left: match[1], operator: match[2], rightFn: match[3] };
  }
  return null;
}

/**
 * Generate the traced return block (used in multiple places).
 */
function buildReturnTrace(returnExpr, lineNumber, methodName = "solve", wantsListNode = false) {
  let out = "";
  out += `System.out.println("TRACE|LINE|${lineNumber}");\n`;

  // Detect and emit expression metadata BEFORE computing trace_return
  const expr = detectBinaryExpr(returnExpr, methodName);
  if (expr) {
    // TRACE|EXPR|<leftVar>|<operator>|<rightFn>
    out += `System.out.println("TRACE|EXPR|${expr.left}|${expr.operator}|${expr.rightFn}|" + ${expr.left});\n`;
  }

  const formatter = wantsListNode ? "__DSAInput.formatNode" : "String.valueOf";

  out += `var trace_return = ${returnExpr};\n`;
  out += `System.out.println("TRACE|VAR|__return__|" + ${formatter}(trace_return));\n`;
  out += `System.out.println("TRACE|RETURN|" + ${formatter}(trace_return));\n`;
  out += `return trace_return;\n`;
  return out;
}

function injectTraceIntoBody(body, methodName = "solve", methodParams = []) {
  // ── Normalize: one statement per line ───────────────────────────────
  // Walk character-by-character tracking paren depth so that semicolons
  // inside for(...) headers are NOT split, but bare multi-statement lines
  // like `head = head.next; return 0;` are broken into separate lines.
  body = (function normalizeSemicolons(src) {
    let result = "";
    let parenDepth = 0;
    for (let ci = 0; ci < src.length; ci++) {
      const ch = src[ci];
      if (ch === "(") parenDepth++;
      else if (ch === ")") parenDepth--;
      result += ch;
      // Only split on `;` that is outside parentheses AND not already
      // followed by a newline (avoid double-blank-lines).
      if (ch === ";" && parenDepth === 0) {
        const next = src[ci + 1];
        if (next !== undefined && next !== "\n" && next !== "\r") {
          result += "\n";
        }
      }
    }
    return result;
  })(body);
  // ────────────────────────────────────────────────────────────────────

  const lines = body.split("\n");
  let currentLoopVar = null;
  let pendingForTrace = null;
  
  const wantsListNode = methodParams.some(p => p.type === "ListNode");
  const formatter = wantsListNode ? "__DSAInput.formatNode" : "String.valueOf";

  let braceDepth = 0;
  const forVarScopeStack = [];

  function emitTracedStatement(stmt, lineNumber) {
    const trimmed = String(stmt || "").trim();
    if (!trimmed) return "";

    // ── Guard: return must never have code after it ──────────────────
    // If this statement is a return, delegate entirely to buildReturnTrace
    // which emits all TRACE lines BEFORE the return keyword.
    if (trimmed.startsWith("return")) {
      const returnExpr = trimmed.replace(/^return\s*/, "").replace(/;$/, "").trim();
      return buildReturnTrace(returnExpr, lineNumber, methodName, wantsListNode);
    }

    let out = "";
    out += `System.out.println("TRACE|LINE|${lineNumber}");\n`;
    out += trimmed + "\n";

    const arrayMatch = trimmed.match(/(\w+)\s*\[(.*?)\]\s*=\s*(.*);/);
    if (arrayMatch) {
      const arrayName = arrayMatch[1];
      const index = arrayMatch[2];
      out += `System.out.println("TRACE|ARRAY|${arrayName}|" + ${index} + "|" + ${arrayName}[${index}]);\n`;
    }

    let match = trimmed.match(/\b([a-zA-Z_][a-zA-Z0-9_]*)\s*(\+|-|\*|\/|%)?=(?!=)/);
    if (!match) {
      match = trimmed.match(/\b([a-zA-Z_][a-zA-Z0-9_]*)\s*(\+\+|--)/);
    }
    if (!match) {
      match = trimmed.match(/(\+\+|--)\s*([a-zA-Z_][a-zA-Z0-9_]*)\b/);
      if (match) match = [match[0], match[2]];
    }
    if (match) {
      const varName = match[1];
      if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(varName)) {
        out += `System.out.println("TRACE|VAR|${varName}|" + ${formatter}(${varName}));\n`;
      }
    }

    // PTR_MOVE: detect var = var.next pattern
    if (wantsListNode) {
      const ptrMatch = trimmed.match(/^(?:ListNode\s+)?([a-zA-Z_]\w*)\s*=\s*([a-zA-Z_]\w*)\.next\s*;/);
      if (ptrMatch) {
        const ptrVar = ptrMatch[1];
        out += `System.out.println("TRACE|PTR_MOVE|${ptrVar}|" + __DSAInput.getNodeId(${ptrVar}));\n`;
      }
    }

    return out;
  }

  // Inject CALL trace as the very first thing inside the method body
  let tracedBody = `System.out.println("TRACE|CALL|${methodName}");\n`;

  // Inject TRACE|VAR for each method parameter right after CALL
  for (const param of methodParams) {
    if (param.type === "int[][]") {
      // For 2D arrays, log the deep string representation
      tracedBody += `System.out.println("TRACE|VAR|${param.name}|" + java.util.Arrays.deepToString(${param.name}));\n`;
    } else if (param.type === "int[]") {
      // For 1D arrays, log the length/string representation
      tracedBody += `System.out.println("TRACE|VAR|${param.name}|" + java.util.Arrays.toString(${param.name}));\n`;
    } else {
      tracedBody += `System.out.println("TRACE|VAR|${param.name}|" + ${formatter}(${param.name}));\n`;
    }
  }

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    if (!line) continue;

    const lineNumber = i + 1;
    const openBracesInLine = (line.match(/{/g) || []).length;
    const closeBracesInLine = (line.match(/}/g) || []).length;

    // Skip pure braces (but allow inserting pending for-loop trace right after '{')
    if (line === "{") {
      tracedBody += line + "\n";
      braceDepth += 1;

      if (pendingForTrace) {
        tracedBody += `System.out.println("TRACE|LINE|${pendingForTrace.lineNumber}");\n`;
        tracedBody += `System.out.println("TRACE|VAR|${pendingForTrace.loopVar}|" + ${pendingForTrace.loopVar});\n`;
        tracedBody += `System.out.println("TRACE|LOOP|loop_${pendingForTrace.lineNumber}|" + ${pendingForTrace.loopVar});\n`;

        // The loop body begins at the new braceDepth; remember to clear the loop var when it ends.
        forVarScopeStack.push({ varName: pendingForTrace.loopVar, depth: braceDepth });
        pendingForTrace = null;
      }

      continue;
    }

    if (line === "}") {
      tracedBody += line + "\n";

      // If this closes a for-loop body, clear the loop variable so it doesn't leak
      // into the next iteration/outer-loop steps.
      const closingDepth = braceDepth;
      braceDepth = Math.max(0, braceDepth - 1);

      while (forVarScopeStack.length > 0 && forVarScopeStack[forVarScopeStack.length - 1].depth === closingDepth) {
        const { varName } = forVarScopeStack.pop();
        tracedBody += `System.out.println("TRACE|LINE|${lineNumber}");\n`;
        tracedBody += `System.out.println("TRACE|VAR|${varName}|null");\n`;
      }
      continue;
    }

    // ── INLINE RETURN inside if/else-if ──────────────────────────
    // Pattern: if(...) return expr;  OR  } else if(...) return expr;
    const inlineReturnMatch = line.match(/^((?:}\s*else\s+)?if\s*\(.*\))\s+return\s+(.*);\s*$/);
    if (inlineReturnMatch) {
      const condition = inlineReturnMatch[1]; // e.g. "if(n == 0)"
      const returnExpr = inlineReturnMatch[2]; // e.g. "1"

      tracedBody += `System.out.println("TRACE|LINE|${lineNumber}");\n`;
      tracedBody += `${condition} {\n`;
      tracedBody += buildReturnTrace(returnExpr, lineNumber, methodName, wantsListNode);
      tracedBody += `}\n`;
      continue;
    }

    // ── Standalone RETURN ────────────────────────────────────────
    if (line.startsWith("return")) {
      const returnExpr = line.replace("return", "").replace(";", "").trim();
      tracedBody += buildReturnTrace(returnExpr, lineNumber, methodName, wantsListNode);
      continue;
    }

    // FOR LOOP handling
    if (line.startsWith("for")) {
      // Expand single-line loop bodies: `for (...) { stmt; }`
      // so that injected traces run inside the loop (loop var in scope).
      const inlineFor = line.match(/^(for\s*\(.*\))\s*\{\s*(.*?)\s*\}\s*$/);
      if (inlineFor) {
        const forHeader = `${inlineFor[1]} {`;
        const inlineBody = inlineFor[2].trim();

        tracedBody += forHeader + "\n";

        const match = line.match(/for\s*\(\s*int\s+(\w+)/);
        if (match) {
          currentLoopVar = match[1];
          braceDepth += 1;
          tracedBody += `System.out.println("TRACE|LINE|${lineNumber}");\n`;
          tracedBody += `System.out.println("TRACE|VAR|${currentLoopVar}|" + ${currentLoopVar});\n`;
          tracedBody += `System.out.println("TRACE|LOOP|loop_${lineNumber}|" + ${currentLoopVar});\n`;
          forVarScopeStack.push({ varName: currentLoopVar, depth: braceDepth });
        } else {
          // Still entering a brace scope even if loop var isn't detected.
          braceDepth += 1;
        }

        if (inlineBody) {
          // Split into statements; keep semicolons.
          const stmts = inlineBody
            .split(";")
            .map((s) => s.trim())
            .filter(Boolean)
            .map((s) => `${s};`);
          for (const stmt of stmts) {
            tracedBody += emitTracedStatement(stmt, lineNumber);
          }
        }

        // Close the loop body
        tracedBody += "}" + "\n";

        const closingDepth = braceDepth;
        braceDepth = Math.max(0, braceDepth - 1);
        while (forVarScopeStack.length > 0 && forVarScopeStack[forVarScopeStack.length - 1].depth === closingDepth) {
          const { varName } = forVarScopeStack.pop();
          tracedBody += `System.out.println("TRACE|LINE|${lineNumber}");\n`;
          tracedBody += `System.out.println("TRACE|VAR|${varName}|null");\n`;
        }

        continue;
      }

      tracedBody += line + "\n";

      const match = line.match(/for\s*\(\s*int\s+(\w+)/);

      if (match) {
        currentLoopVar = match[1];

        // Log loop-variable once per iteration.
        // If the '{' is on the same line, we can inject immediately (inside the loop body).
        // Otherwise, inject right after the next standalone '{' line.
        if (line.includes("{") && !line.includes("}")) {
          tracedBody += `System.out.println("TRACE|LINE|${lineNumber}");\n`;
          tracedBody += `System.out.println("TRACE|VAR|${currentLoopVar}|" + ${currentLoopVar});\n`;
          tracedBody += `System.out.println("TRACE|LOOP|loop_${lineNumber}|" + ${currentLoopVar});\n`;

          // The loop body opened on this line.
          braceDepth += 1;
          forVarScopeStack.push({ varName: currentLoopVar, depth: braceDepth });
        } else {
          pendingForTrace = { lineNumber, loopVar: currentLoopVar };
        }
      }

      // Keep braceDepth in sync for unusual `for` headers that include braces
      // but aren't of the common `for (...) {` form.
      if (line.includes("{") && line.includes("}")) {
        braceDepth = Math.max(0, braceDepth + openBracesInLine - closeBracesInLine);
      }
      continue;
    }

    // LINE TRACE
    tracedBody += `System.out.println("TRACE|LINE|${lineNumber}");\n`;

    // Original line
    tracedBody += line + "\n";

    // ARRAY TRACE
    const arrayMatch = line.match(/(\w+)\s*\[(.*?)\]\s*=\s*(.*);/);
    if (arrayMatch) {
      const arrayName = arrayMatch[1];
      const index = arrayMatch[2];
      tracedBody += `System.out.println("TRACE|ARRAY|${arrayName}|" + ${index} + "|" + ${arrayName}[${index}]);\n`;
    }

    // PTR_MOVE: detect var = var.next pattern
    // Must be checked BEFORE the VAR trace so we can suppress the redundant
    // VAR emission — PTR_MOVE already carries the new nodeId, and emitting VAR
    // first would mutate the state engine's variables BEFORE the PTR_MOVE step
    // fires, breaking the intended "event before state change" ordering.
    let isPtrMove = false;
    if (wantsListNode) {
      const ptrMatch = line.match(/^(?:ListNode\s+)?([a-zA-Z_]\w*)\s*=\s*([a-zA-Z_]\w*)\.next\s*;/);
      if (ptrMatch) {
        isPtrMove = true;
        const ptrVar = ptrMatch[1];
        tracedBody += `System.out.println("TRACE|PTR_MOVE|${ptrVar}|" + __DSAInput.getNodeId(${ptrVar}));\n`;
      }
    }

    // VAR TRACE (assignments and mutations) — skip if this line is a PTR_MOVE
    // (PTR_MOVE is the authoritative event for pointer variables)
    if (!isPtrMove) {
      let match = line.match(/\b([a-zA-Z_][a-zA-Z0-9_]*)\s*(\+|-|\*|\/|%)?=(?!=)/);
      if (!match) {
        match = line.match(/\b([a-zA-Z_][a-zA-Z0-9_]*)\s*(\+\+|--)/);
      }
      if (!match) {
        match = line.match(/(\+\+|--)\s*([a-zA-Z_][a-zA-Z0-9_]*)\b/);
        if (match) match = [match[0], match[2]];
      }

      if (match) {
        const varName = match[1];
        if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(varName)) {
          tracedBody += `System.out.println("TRACE|VAR|${varName}|" + ${formatter}(${varName}));\n`;
        }
      }
    }

    // Keep braceDepth in sync for all other lines (e.g., `if (...) {`).
    // This prevents accidentally treating an inner-block '}' as the end of a loop.
    braceDepth = Math.max(0, braceDepth + openBracesInLine - closeBracesInLine);
  }

  return tracedBody;
}

function extractMethodParts(userCode) {
  let methodName = "solve"; // default fallback
  let methodParams = [];

  // Step 1: Detect method definition and parameters
  const signatureRegex = new RegExp(`\\b(\\w+)\\s*\\(([^)]*)\\)`);
  const methodMatch = userCode.match(signatureRegex);

  if (methodMatch && (userCode.includes("solve(") || userCode.match(/^\s*(public|private|protected)/m))) {
    methodName = methodMatch[1];
    const paramsStr = methodMatch[2];

    if (paramsStr && paramsStr.trim()) {
      methodParams = paramsStr.split(",").map((p) => {
        const parts = p.trim().split(/\s+/).filter(Boolean);
        const paramName = parts[parts.length - 1];
        const typeTokens = parts.slice(0, -1).filter((t) => {
          if (!t) return false;
          if (t === "final") return false;
          if (t.startsWith("@")) return false;
          return true;
        });
        return { name: paramName, type: typeTokens.join("") };
      });
    }
  }

  // Step 2: Use safe string-based approach to locate braces (Works for single-line methods)
  const methodIndex = userCode.indexOf(`${methodName}(`);
  if (methodIndex === -1) {
    return { before: userCode, body: "", after: "", methodName, methodParams };
  }

  const openBraceIndex = userCode.indexOf("{", methodIndex);
  if (openBraceIndex === -1) {
    return { before: userCode, body: "", after: "", methodName, methodParams };
  }

  let braceCount = 1;
  let closeBraceIndex = -1;

  for (let i = openBraceIndex + 1; i < userCode.length; i++) {
    if (userCode[i] === "{") braceCount++;
    else if (userCode[i] === "}") braceCount--;

    if (braceCount === 0) {
      closeBraceIndex = i;
      break;
    }
  }

  if (closeBraceIndex === -1) {
    // Malformed code
    return { before: userCode, body: "", after: "", methodName, methodParams };
  }

  // Step 3: Exact slicing of before, body, and after
  const before = userCode.slice(0, openBraceIndex + 1);
  const body = userCode.slice(openBraceIndex + 1, closeBraceIndex);
  const after = userCode.slice(closeBraceIndex);

  return { before, body, after, methodName, methodParams };
}


module.exports = {
  executeJavaCode,
};
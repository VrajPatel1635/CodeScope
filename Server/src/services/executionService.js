const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const { buildState } = require("../utils/stateEngine");
const { analyzePointerSemantics } = require("../semantic/PointerRelationshipAnalyzer");
const { analyzeLoopSemantics } = require("../semantic/LoopSemanticAnalyzer");
const { analyzeCallStackSemantics } = require("../semantic/CallStackSemanticAnalyzer");
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

function wrapJavaCode(userCode, input, methodName = "solve", methodParams = [], returnType = "int") {
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

  let declarationPart = "";
  if (returnType !== "void") {
    declarationPart = `${returnType} result = sol.${methodName}(${built.argsList});`;
  } else {
    declarationPart = `sol.${methodName}(${built.argsList});`;
  }

  const invocation = `${built.declarations}
        ${declarationPart}`;

  const helperBlock = built.helperCode ? `\n${built.helperCode}\n` : "";

  const outputSerializer = `
class OutputSerializer {
    public static String serialize(Object obj) {
        if (obj == null) return "[]"; // or "null"? The spec asks for [] for Empty list
        if (obj instanceof int[]) {
            return java.util.Arrays.toString((int[]) obj);
        }
        if (obj instanceof int[][]) {
            return java.util.Arrays.deepToString((int[][]) obj);
        }
        if (obj.getClass().getSimpleName().equals("ListNode")) {
            return serializeLinkedList(obj);
        }
        return String.valueOf(obj);
    }

    private static String serializeLinkedList(Object headObj) {
        if (headObj == null) return "[]";
        StringBuilder sb = new StringBuilder();
        sb.append("[");
        java.util.Set<Object> visited = java.util.Collections.newSetFromMap(new java.util.IdentityHashMap<>());
        Object curr = headObj;
        try {
            while (curr != null) {
                if (visited.contains(curr)) {
                    sb.append("\\"CYCLE\\"");
                    break;
                }
                visited.add(curr);
                
                java.lang.reflect.Field valField = curr.getClass().getDeclaredField("val");
                valField.setAccessible(true);
                sb.append(valField.get(curr));
                
                java.lang.reflect.Field nextField = curr.getClass().getDeclaredField("next");
                nextField.setAccessible(true);
                curr = nextField.get(curr);
                
                if (curr != null) {
                    sb.append(",");
                }
            }
        } catch (Exception e) {
            return "Error serializing ListNode";
        }
        sb.append("]");
        return sb.toString();
    }
}
`;

  return {
    javaCode: `
${preamble}
${helperBlock}
${outputSerializer}
${rest}

public class Main {
    public static void main(String[] args) {
        Solution sol = new Solution();
        
        ${invocation}
        ${returnType !== "void" ? 'System.out.println(OutputSerializer.serialize(result));' : ''}
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
    // 🔥 STEP 1 & 2: Extract all methods and Instrument them!
    const { finalUserCode, methodName, methodParams, returnType } = extractAllMethodsAndInstrument(userCode);

    console.log("===== FINAL USER CODE =====");
    console.log(finalUserCode);

    console.log("===== MAIN METHOD NAME =====");
    console.log(methodName);

    console.log("===== MAIN METHOD PARAMS =====");
    console.log(methodParams);

    // 🔥 STEP 3: Wrap and execute
    const wrapped = wrapJavaCode(finalUserCode, input, methodName, methodParams, returnType);

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

    // ── Semantic Interpretation Layer (non-authoritative, read-only) ────────────
    // Runs AFTER state reconstruction. Never mutates `states`.
    const semanticFrames = analyzePointerSemantics(states);
    
    const loopSemanticsMap = analyzeLoopSemantics(states);
    const loopSemanticFrames = states.map(s => ({
        step: s.step,
        loopSemantics: loopSemanticsMap.get(s.step) || []
    }));

    const callStackSemanticsMap = analyzeCallStackSemantics(states);
    const callStackSemanticFrames = states.map(s => ({
      step: s.step,
      callStackSemantics: callStackSemanticsMap.get(s.step) || []
    }));

    return {
      success: true,
      states,
      semanticFrames,
      loopSemanticFrames,
      callStackSemanticFrames,
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
      const valStr = parts[2];
      let parsedVal;
      if (valStr === "null") {
        parsedVal = null;
      } else if (valStr.startsWith("node_")) {
        parsedVal = valStr; // keep runtime reference directly
      } else {
        const num = Number(valStr);
        parsedVal = isNaN(num) ? valStr : num;
      }
      trace.push({ type: "RETURN", value: parsedVal });
    } else if (type === "ARRAY") {
      trace.push({ type: "ARRAY", name: parts[2], index: parts[3], value: parts[4] });
    } else if (type === "LOOP") {
      trace.push({ type: "LOOP", loopId: parts[2], iteration: Number(parts[3]) });
    } else if (type === "NODE_LINK") {
      trace.push({ type: "NODE_LINK", from: parts[2], to: parts[3] });
    } else if (type === "PTR_MOVE") {
      trace.push({ type: "PTR_MOVE", variable: parts[2], nodeId: parts[3] });
    } else if (type === "NODE_MUTATE") {
      trace.push({ type: "NODE_MUTATE", fromNodeId: parts[2], toNodeId: parts[3] });
    } else if (type === "LOOP_ITER") {
      trace.push({ type: "LOOP_ITER", loopId: parts[2] });
    } else if (type === "LOOP_END") {
      trace.push({ type: "LOOP_END", loopId: parts[2] });
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

    // ── VAR detection: use (?<!\.) so field accesses like `tail.next = ...`
    // are never mistaken for a variable named `next` being assigned.
    let match = trimmed.match(/(?<!\.)(\b[a-zA-Z_][a-zA-Z0-9_]*)\s*(\+|-|\*|\/|%)?=(?!=)/);
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
        if (pendingForTrace.isWhile) {
          tracedBody += `System.out.println("TRACE|LOOP_ITER|loop_${pendingForTrace.lineNumber}");\n`;
          forVarScopeStack.push({ isWhile: true, lineId: pendingForTrace.lineNumber, depth: braceDepth });
        } else {
          tracedBody += `System.out.println("TRACE|VAR|${pendingForTrace.loopVar}|" + ${pendingForTrace.loopVar});\n`;
          tracedBody += `System.out.println("TRACE|LOOP|loop_${pendingForTrace.lineNumber}|" + ${pendingForTrace.loopVar});\n`;
          forVarScopeStack.push({ varName: pendingForTrace.loopVar, depth: braceDepth });
        }
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
        const scopeItem = forVarScopeStack.pop();
        if (scopeItem.isWhile) {
          tracedBody += `System.out.println("TRACE|LOOP_END|loop_${scopeItem.lineId}");\n`;
        } else {
          tracedBody += `System.out.println("TRACE|LINE|${lineNumber}");\n`;
          tracedBody += `System.out.println("TRACE|VAR|${scopeItem.varName}|null");\n`;
        }
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
          const scopeItem = forVarScopeStack.pop();
          if (scopeItem.isWhile) {
            tracedBody += `System.out.println("TRACE|LOOP_END|loop_${scopeItem.lineId}");\n`;
          } else {
            tracedBody += `System.out.println("TRACE|LINE|${lineNumber}");\n`;
            tracedBody += `System.out.println("TRACE|VAR|${scopeItem.varName}|null");\n`;
          }
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

    // WHILE LOOP handling
    if (line.match(/^while\s*\(/)) {
      const inlineWhile = line.match(/^(while\s*\(.*\))\s*\{\s*(.*?)\s*\}\s*$/);
      if (inlineWhile) {
        const whileHeader = `${inlineWhile[1]} {`;
        const inlineBody = inlineWhile[2].trim();

        tracedBody += whileHeader + "\n";
        braceDepth += 1;
        tracedBody += `System.out.println("TRACE|LINE|${lineNumber}");\n`;
        tracedBody += `System.out.println("TRACE|LOOP_ITER|loop_${lineNumber}");\n`;

        if (inlineBody) {
          const stmts = inlineBody
            .split(";")
            .map((s) => s.trim())
            .filter(Boolean)
            .map((s) => `${s};`);
          for (const stmt of stmts) {
            tracedBody += emitTracedStatement(stmt, lineNumber);
          }
        }

        tracedBody += "}" + "\n";
        tracedBody += `System.out.println("TRACE|LOOP_END|loop_${lineNumber}");\n`;
        braceDepth = Math.max(0, braceDepth - 1);
        continue;
      }

      tracedBody += line + "\n";

      if (line.includes("{") && !line.includes("}")) {
        tracedBody += `System.out.println("TRACE|LINE|${lineNumber}");\n`;
        tracedBody += `System.out.println("TRACE|LOOP_ITER|loop_${lineNumber}");\n`;
        braceDepth += 1;
        forVarScopeStack.push({ isWhile: true, lineId: lineNumber, depth: braceDepth });
      } else {
        pendingForTrace = { lineNumber, isWhile: true };
      }

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
    let isNodeMutate = false;
    
    if (wantsListNode) {
      const ptrMatch = line.match(/^(?:ListNode\s+)?([a-zA-Z_]\w*)\s*=\s*([a-zA-Z_]\w*)\.next\s*;/);
      if (ptrMatch) {
        isPtrMove = true;
        const ptrVar = ptrMatch[1];
        tracedBody += `System.out.println("TRACE|PTR_MOVE|${ptrVar}|" + __DSAInput.getNodeId(${ptrVar}));\n`;
      }
      
      // NODE_MUTATE: arbitrary deep field assignment like `node.next.next = node`
      // We extract the object path before the last property, the property itself (e.g., 'next'), and the RHS.
      const mutateMatch = line.match(/^(.*)\.([a-zA-Z_]\w*)\s*=\s*(.*?)\s*;/);
      if (mutateMatch && (mutateMatch[2] === 'next' || mutateMatch[2] === 'left' || mutateMatch[2] === 'right')) {
        isNodeMutate = true;
        const targetObject = mutateMatch[1].trim();
        const rhsExpr = mutateMatch[3].trim();
        
        if (rhsExpr === "null") {
          tracedBody += `System.out.println("TRACE|NODE_MUTATE|" + __DSAInput.getNodeId(${targetObject}) + "|null");\n`;
        } else {
          tracedBody += `System.out.println("TRACE|NODE_MUTATE|" + __DSAInput.getNodeId(${targetObject}) + "|" + __DSAInput.getNodeId(${rhsExpr}));\n`;
        }
      }
    }

    // VAR TRACE (assignments and mutations) — skip if this line is a PTR_MOVE
    // or NODE_MUTATE (NODE_MUTATE would incorrectly match 'next' as a variable)
    if (!isPtrMove && !isNodeMutate) {
      // ── VAR detection: (?<!\.) prevents field names (e.g. `next` in `tail.next = ...`)
      // from being treated as the assigned variable.
      let match = line.match(/(?<!\.)(\b[a-zA-Z_][a-zA-Z0-9_]*)\s*(\+|-|\*|\/|%)?=(?!=)/);
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

function extractAllMethodsAndInstrument(userCode) {
  const signatureRegex = /(?:public|private|protected)\s+(?:static\s+)?([A-Za-z0-9_<>[\]]+)\s+(\w+)\s*\(([^)]*)\)\s*\{/g;
  let match;
  
  let mainMethodName = "solve";
  let mainMethodParams = [];
  let mainReturnType = "int";

  const methods = [];
  while ((match = signatureRegex.exec(userCode)) !== null) {
      const isPublic = match[0].includes("public");
      const returnType = match[1];
      const methodName = match[2];
      const paramsStr = match[3];

      let methodParams = [];
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

      if (isPublic && methods.length === 0) { // Assume first public is main
          mainMethodName = methodName;
          mainMethodParams = methodParams;
          mainReturnType = returnType;
      }

      const openBraceIndex = match.index + match[0].length - 1;
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

      if (closeBraceIndex !== -1) {
          const body = userCode.slice(openBraceIndex + 1, closeBraceIndex);
          methods.push({
              openBraceIndex,
              closeBraceIndex,
              methodName,
              methodParams,
              body
          });
      }
  }

  if (methods.length === 0) {
      return { finalUserCode: userCode, methodName: mainMethodName, methodParams: mainMethodParams, returnType: mainReturnType };
  }

  // Replace backwards so indices remain valid
  methods.reverse();
  
  let finalUserCode = userCode;
  
  for (const method of methods) {
      const tracedBody = injectTraceIntoBody(method.body, method.methodName, method.methodParams);
      finalUserCode = finalUserCode.substring(0, method.openBraceIndex + 1) + "\n" + tracedBody + "\n" + finalUserCode.substring(method.closeBraceIndex);
  }

  // ensure we default to the first method if no public method found
  if (mainMethodName === "solve" && methods.length > 0) {
      mainMethodName = methods[methods.length - 1].methodName;
      mainMethodParams = methods[methods.length - 1].methodParams;
  }

  return { finalUserCode, methodName: mainMethodName, methodParams: mainMethodParams, returnType: mainReturnType };
}

module.exports = {
  executeJavaCode,
};
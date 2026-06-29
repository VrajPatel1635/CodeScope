const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { spawn } = require("child_process");
const { buildState } = require("../state/stateEngine");
const { analyzePointerSemantics } = require("../semantic/PointerRelationshipAnalyzer");
const { analyzeLoopSemantics } = require("../semantic/LoopSemanticAnalyzer");
const { analyzeCallStackSemantics } = require("../semantic/CallStackSemanticAnalyzer");
const { analyzeTreeTraversal } = require("../semantic/TreeTraversalAnalyzer");
const { analyzeTreeMutation } = require("../semantic/TreeMutationAnalyzer");
const { analyzeGraphTraversal } = require("../semantic/GraphTraversalAnalyzer");
const { detectPatterns } = require("../patterns/PatternEngine");
const { buildJavaInputsFromSignature, splitJavaPreamble, normalizeType } = require("../execution/runtime/inputRegistry");
const { normalizeJavaControlFlow } = require("../execution/normalizers/javaControlFlowNormalizer");
const { normalizeReturns } = require("../execution/normalizers/javaReturnNormalizer");
const { normalizeLoopFlows } = require("../execution/normalizers/javaLoopFlowNormalizer");
const { normalizeConditions } = require("../execution/normalizers/javaConditionNormalizer");
const { deriveSourceSteps } = require("../sourceSteps/deriveSourceSteps");
const { resolveSourceStepStates } = require("../sourceSteps/resolveSourceStepStates");
const { injectRegistryTraces } = require("../execution/instrumentation/registryInjector");
const IntelligenceDeriver = require("../intelligence/IntelligenceDeriver");
const registry = require("../registry");
const logger = require("../utils/logger");

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
    returnType
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
        if (obj == null) return "null";
        Class<?> c = obj.getClass();
        if (c.isArray()) {
            if (obj instanceof Object[]) return serializeObjectArray((Object[]) obj);
            if (c == int[].class) return java.util.Arrays.toString((int[]) obj);
            if (c == boolean[].class) return java.util.Arrays.toString((boolean[]) obj);
            if (c == double[].class) return java.util.Arrays.toString((double[]) obj);
            if (c == char[].class) return java.util.Arrays.toString((char[]) obj);
            if (c == long[].class) return java.util.Arrays.toString((long[]) obj);
            return "[...]";
        }
        if (obj instanceof java.util.Map) {
            return serializeMap((java.util.Map<?, ?>) obj);
        }
        if (obj instanceof java.util.Collection) {
            return serializeCollection((java.util.Collection<?>) obj);
        }
        if (obj.getClass().getName().equals("ListNode")) {
            return serializeLinkedList(obj);
        }
        if (obj.getClass().getName().equals("TreeNode")) {
            return serializeTree(obj);
        }
        if (obj instanceof String) {
            return "\\"" + obj.toString().replace("\\"", "\\\\\\"") + "\\"";
        }
        return String.valueOf(obj);
    }

    private static String serializeObjectArray(Object[] arr) {
        java.util.List<String> elements = new java.util.ArrayList<>();
        for (Object e : arr) {
            elements.add(serialize(e));
        }
        return "[" + String.join(",", elements) + "]";
    }

    private static String serializeCollection(java.util.Collection<?> coll) {
        java.util.List<String> elements = new java.util.ArrayList<>();
        for (Object e : coll) {
            elements.add(serialize(e));
        }
        return "[" + String.join(",", elements) + "]";
    }

    private static String serializeMap(java.util.Map<?, ?> map) {
        java.util.List<String> entries = new java.util.ArrayList<>();
        for (java.util.Map.Entry<?, ?> entry : map.entrySet()) {
            String keyStr = entry.getKey() instanceof String ? "\\"" + entry.getKey().toString().replace("\\"", "\\\\\\"") + "\\"" : "\\"" + String.valueOf(entry.getKey()) + "\\"";
            entries.add(keyStr + ":" + serialize(entry.getValue()));
        }
        return "{" + String.join(",", entries) + "}";
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

    private static String serializeTree(Object rootObj) {
        if (rootObj == null) return "[]";
        java.util.List<String> res = new java.util.ArrayList<>();
        java.util.Queue<Object> q = new java.util.LinkedList<>();
        q.add(rootObj);
        while (!q.isEmpty()) {
            Object curr = q.poll();
            if (curr == null) {
                res.add("null");
            } else {
                try {
                    java.lang.reflect.Field valField = curr.getClass().getDeclaredField("val");
                    valField.setAccessible(true);
                    res.add(String.valueOf(valField.get(curr)));

                    java.lang.reflect.Field leftField = curr.getClass().getDeclaredField("left");
                    leftField.setAccessible(true);
                    q.add(leftField.get(curr));

                    java.lang.reflect.Field rightField = curr.getClass().getDeclaredField("right");
                    rightField.setAccessible(true);
                    q.add(rightField.get(curr));
                } catch (Exception e) {
                    return "Error serializing TreeNode";
                }
            }
        }
        // Remove trailing nulls
        while (res.size() > 0 && res.get(res.size() - 1).equals("null")) {
            res.remove(res.size() - 1);
        }
        return "[" + String.join(",", res) + "]";
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
    public static boolean __DSA_COND(boolean result, int line, String expr) {
        System.out.println("TRACE|COND|line=" + line + "|expr=" + expr + "|value=" + result);
        return result;
    }

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
  return await runProcess("javac", ["-g", "Main.java"], dirPath);
}

async function runJava(dirPath) {
  return await runProcess("java", ["Main"], dirPath);
}

const USE_DOCKER = process.env.USE_DOCKER !== "false";
const DOCKER_TIMEOUT_MS = parseInt(process.env.DOCKER_TIMEOUT_MS) || 30000;
const MAX_TRACE_SIZE = parseInt(process.env.MAX_TRACE_SIZE) || (5 * 1024 * 1024); // Default 5MB

async function runDockerExecution(dirPath, executionId) {
  return new Promise((resolve, reject) => {
    const uniqueId = crypto.randomUUID();
    const containerName = `sandbox-${uniqueId}`;
    
    logger.debug(`[DOCKER DEBUG] Starting container: ${containerName} for executionId: ${executionId}`);
    
    const args = [
      "run",
      "--rm",
      "--name",
      containerName,
      "--memory=256m",
      "--cpus=0.5",
      "--network=none",
      "--pids-limit=64",
      "-v",
      `${dirPath}:/app`,
      "-w",
      "/app",
      "eclipse-temurin:17",
      "sh",
      "-c",
      "javac Main.java && java Main"
    ];

    const childCmd = spawn("docker", args);

    let stdout = "";
    let stderr = "";
    let isFinished = false;

    const killContainer = () => {
      spawn("docker", ["rm", "-f", containerName]);
    };

    const timer = setTimeout(() => {
      if (isFinished) return;
      isFinished = true;
      logger.debug(`[DOCKER DEBUG] Timeout reached for container: ${containerName}`);
      killContainer();
      reject(new Error("Execution timed out"));
    }, DOCKER_TIMEOUT_MS);

    childCmd.stdout.on("data", (data) => {
      if (isFinished) return;
      stdout += data.toString();
      
      if (stdout.length > MAX_TRACE_SIZE) {
        isFinished = true;
        clearTimeout(timer);
        logger.debug(`[DOCKER DEBUG] TRACE limit exceeded for container: ${containerName}`);
        killContainer();
        reject(new Error("TRACE size exceeded limit"));
      }
    });

    childCmd.stderr.on("data", (data) => {
      if (isFinished) return;
      stderr += data.toString();
    });

    childCmd.on("close", (code) => {
      if (isFinished) return;
      isFinished = true;
      clearTimeout(timer);
      
      logger.debug(`[DOCKER DEBUG] Container closed: ${containerName} with code: ${code}`);
      if (stderr) {
        logger.debug(`[DOCKER DEBUG] Stderr for ${containerName}: ${stderr}`);
      }

      if (code !== 0) {
        reject(new Error(stderr || "Docker execution failed"));
      } else {
        resolve(stdout);
      }
    });

    childCmd.on("error", (err) => {
      if (isFinished) return;
      isFinished = true;
      clearTimeout(timer);
      killContainer();
      reject(err);
    });
  });
}

function cleanup(dirPath) {
  try {
    fs.rmSync(dirPath, { recursive: true, force: true });
  } catch (e) {
    logger.error("Cleanup error:", e.message);
  }
}

async function executeJavaCode(userCode, input) {
  const executionId = generateExecutionId();
  const dirPath = createExecutionFolder(executionId);

  try {
    // 🔥 STEP 1 & 2: Extract all methods and Instrument them!
    const { finalUserCode, methodName, methodParams, returnType } = extractAllMethodsAndInstrument(userCode);

    logger.debug("===== FINAL USER CODE =====");
    logger.debug(finalUserCode);

    logger.debug("===== MAIN METHOD NAME =====");
    logger.debug(methodName);

    logger.debug("===== MAIN METHOD PARAMS =====");
    logger.debug(methodParams);

    // 🔥 STEP 3: Wrap and execute
    const wrapped = wrapJavaCode(finalUserCode, input, methodName, methodParams, returnType);

    writeJavaFile(dirPath, wrapped.javaCode);

    let runResult = { code: 0, stdout: "", stderr: "" };

    if (USE_DOCKER) {
      try {
        const dockerStdout = await runDockerExecution(dirPath, executionId);
        runResult = { code: 0, stdout: dockerStdout, stderr: "" };
      } catch (err) {
        return {
          success: false,
          output: null,
          error: err.message,
        };
      }
    } else {
      const compileResult = await compileJava(dirPath);

      if (compileResult.code !== 0) {
        return {
          success: false,
          output: null,
          error: compileResult.stderr,
        };
      }

      runResult = await runJava(dirPath);
    }

    const { trace, output } = parseExecutionOutput(runResult.stdout);

    // For now, only int[] / int[][] populate the array/matrix visualizer.
    const initialArray = wrapped.initialValueForState ?? null;

    const states = buildState(trace, initialArray);

    const sourceSteps = deriveSourceSteps(states);
    const resolvedSourceSteps = resolveSourceStepStates(sourceSteps, states);


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

    const treeSemanticFrames = analyzeTreeTraversal(states);
    const treeMutationSemanticFrames = analyzeTreeMutation(states);
    const graphSemanticFrames = analyzeGraphTraversal(states);

    // ── Algorithm Pattern Recognition Layer ────────────
    const patterns = detectPatterns({
      states,
      sourceSteps: resolvedSourceSteps,
      semantics: {
        pointerSemanticFrames: semanticFrames,
        loopSemanticFrames,
        callStackSemanticFrames,
        treeSemanticFrames,
        treeMutationSemanticFrames,
        graphSemanticFrames
      }
    });

    // ── Execution Intelligence v2.0 Layer ────────────
    const intelligence = IntelligenceDeriver.derive(states, registry, patterns);

    return {
      success: runResult.code === 0,
      states,
      sourceSteps: resolvedSourceSteps,
      semanticFrames,
      loopSemanticFrames,
      callStackSemanticFrames,
      treeSemanticFrames,
      treeMutationSemanticFrames,
      graphSemanticFrames,
      patterns,
      intelligence,
      output,
      error: runResult.code === 0 ? null : runResult.stderr,
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
        trace.push({ type: "VAR", name: varName, value: parts.slice(3).join("|") });
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
      } else if (valStr.startsWith("node_") || valStr.startsWith("treeNode_")) {
        parsedVal = valStr; // keep runtime reference directly
      } else {
        const num = Number(valStr);
        parsedVal = isNaN(num) ? valStr : num;
      }
      trace.push({ type: "RETURN", value: parsedVal });
    } else if (type === "ARRAY") {
      const name = parts[2];
      const index = parts[3];
      const value = parts[4];
      trace.push({ type: "ARRAY", name, index, value });
      if (name === "visited") {
        trace.push({ type: "VISITED_MARK", node: `graphNode_${index}`, value });
      } else if (name === "distance") {
        trace.push({ type: "DISTANCE_MARK", node: `graphNode_${index}`, value });
      } else if (name === "parent") {
        trace.push({ type: "PARENT_MARK", node: `graphNode_${index}`, value });
      }
    } else if (type === "LOOP") {
      trace.push({ type: "LOOP", loopId: parts[2], iteration: Number(parts[3]) });
    } else if (type === "NODE_LINK") {
      trace.push({ type: "NODE_LINK", from: parts[2], to: parts[3] });
    } else if (type === "TREE_LINK") {
      const parent = parts[2].split("=")[1];
      const dir = parts[3].split("=")[1];
      const child = parts[4].split("=")[1];
      trace.push({ type: "TREE_LINK", parent, dir, child });
    } else if (type === "TREE_VISIT") {
      const node = parts[2].split("=")[1];
      const phase = parts[3].split("=")[1];
      trace.push({ type: "TREE_VISIT", node, phase });
    } else if (type === "TREE_MUTATE") {
      const node = parts[2].split("=")[1];
      const field = parts[3].split("=")[1];
      let to = parts.slice(4).join("|").substring(3);
      if (field === "val") {
        const num = Number(to);
        to = isNaN(num) ? to : num;
      }
      trace.push({ type: "TREE_MUTATE", node, field, to });
    } else if (type === "GRAPH_EDGE" || type === "GRAPH_EDGE_ADD" || type === "GRAPH_EDGE_REMOVE") {
      const from = parts[2].split("=")[1];
      const to = parts[3].split("=")[1];
      trace.push({ type, from, to });
    } else if (type === "GRAPH_VISIT") {
      const node = parts[2].split("=")[1];
      trace.push({ type: "GRAPH_VISIT", node });
    } else if (type === "VISITED_MARK") {
      const node = parts[2].split("=")[1];
      const value = parts[3].split("=")[1];
      trace.push({ type: "VISITED_MARK", node, value });
    } else if (type === "QUEUE_ENQUEUE" || type === "QUEUE_DEQUEUE" || type === "BFS_VISIT") {
      const node = parts[2].split("=")[1];
      trace.push({ type, node });
    } else if (type === "BFS_LEVEL_START") {
      const level = Number(parts[2].split("=")[1]);
      trace.push({ type: "BFS_LEVEL_START", level });
    } else if (type === "PTR_MOVE") {
      trace.push({ type: "PTR_MOVE", variable: parts[2], nodeId: parts[3] });
    } else if (type === "NODE_MUTATE") {
      trace.push({ type: "NODE_MUTATE", fromNodeId: parts[2], toNodeId: parts[3] });
    } else if (type === "LOOP_ITER") {
      trace.push({ type: "LOOP_ITER", loopId: parts[2] });
    } else if (type === "LOOP_END") {
      trace.push({ type: "LOOP_END", loopId: parts[2] });
    } else if (type === "COND") {
      const lineStr = parts[2].substring(5); // line=...
      const exprStr = parts[3].substring(5); // expr=...
      const valStr = parts[4].substring(6); // value=...
      trace.push({
        type: "COND",
        line: Number(lineStr),
        expr: exprStr,
        value: valStr === "true",
      });
    } else if (type === "COLLECTION_MUT") {
      trace.push({ type: "COLLECTION_MUT", name: parts[2], value: parts[3] });
    } else if (type === "COLLECTION_TYPE") {
      trace.push({ type: "COLLECTION_TYPE", name: parts[2], collectionType: parts[3] });
    } else if (type === "ARRAY2D") {
      const name = parts[2];
      const row = parts[3];
      const col = parts[4];
      const value = parts[5];
      trace.push({ type: "ARRAY2D", name, row, col, value });
    } else if (type === "ASSIGN") {
      const name = parts[2];
      const op = parts[3];
      const rhs = parts.slice(4).join("|") || "";
      trace.push({ type: "ASSIGN", name, op, rhs });
    } else if (type === "STATE_OP") {
      const targetName = parts[2].split("=")[1];
      const operation = parts[3].split("=")[1];
      const serializedState = parts.slice(4).join("|").substring(16);
      trace.push({ type: "STATE_OP", targetName, operation, serializedState });
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
 * @param {string}  returnExpr    - the expression being returned
 * @param {number}  lineNumber    - editor-absolute line number
 * @param {string}  methodName    - method name for binary-expr detection
 * @param {boolean} wantsListNode - whether the method deals with ListNode
 * @param {number}  retIdx        - unique index within this method (prevents duplicate var declarations)
 */
function buildReturnTrace(returnExpr, lineNumber, methodName = "solve", wantsListNode = false, retIdx = 0) {
  // Use a collision-safe, deterministic temp var name unique to each return site.
  const tmpVar = `__TRACE_RET_${retIdx}__`;

  let out = "";
  out += `System.out.println("TRACE|LINE|${lineNumber}");\n`;

  // Void return (`return;`) — no expression to evaluate.
  const exprTrimmed = String(returnExpr ?? "").trim();
  if (!exprTrimmed) {
    out += `System.out.println("TRACE|VAR|__return__|void");\n`;
    out += `System.out.println("TRACE|RETURN|void");\n`;
    out += `__DSA_RETURNED__ = true;\n`;
    out += `return;\n`;
    return out;
  }

  const expr = detectBinaryExpr(exprTrimmed, methodName);
  if (expr) {
    out += `System.out.println("TRACE|EXPR|${expr.left}|${expr.operator}|${expr.rightFn}|" + (${expr.left}));\n`;
  }

  const formatter = "__DSAInput.formatValue";

  out += `var ${tmpVar} = ${exprTrimmed};\n`;
  out += `System.out.println("TRACE|VAR|__return__|" + ${formatter}(${tmpVar}));\n`;
  out += `System.out.println("TRACE|RETURN|" + ${formatter}(${tmpVar}));\n`;
  out += `__DSA_RETURNED__ = true;\n`;
  out += `return ${tmpVar};\n`;
  return out;
}

/**
 * Robustly parses Java source to tokens, adds explicit { } for braceless 
 * control flow statements (if, else, for, while, do), and splits statements 
 * on semicolons while preserving the correct original line numbers.
 */
function normalizeControlFlowAndLineMap(source, baseLineOffset, returnType = "") {
  let mappedLines = normalizeJavaControlFlow(source, baseLineOffset).mappedLines;
  mappedLines = normalizeReturns(mappedLines, returnType);
  mappedLines = normalizeLoopFlows(mappedLines);
  mappedLines = normalizeConditions(mappedLines);
  return mappedLines;
}

function injectTraceIntoBody(mappedLines, methodName = "solve", methodParams = [], returnType = "") {
  // Counter for generating unique return-temp variable names within this method.
  // Each return site gets a distinct __TRACE_RET_N__ so the same method can have
  // multiple return statements without Java compilation errors.
  let retCounter = 0;

  let currentLoopVar = null;
  let pendingForTrace = null;
  
  const wantsListNode = methodParams.some(p => p.type === "ListNode") || returnType === "ListNode";
  const wantsTreeNode = methodParams.some(p => p.type === "TreeNode") || returnType === "TreeNode";
  const wantsNodeFormat = wantsListNode || wantsTreeNode;
  const formatter = "__DSAInput.formatValue";

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
      return buildReturnTrace(returnExpr, lineNumber, methodName, wantsNodeFormat, retCounter++);
    }

    let out = "";
    out += `System.out.println("TRACE|LINE|${lineNumber}");\n`;
    out += trimmed + "\n";

    const array2DMatch = trimmed.match(/(\w+)\s*\[(.*?)\]\s*\[(.*?)\]\s*[+\-*\/%]?=\s*(.*);/);
    if (array2DMatch) {
      const arrayName = array2DMatch[1];
      const row = array2DMatch[2];
      const col = array2DMatch[3];
      out += `System.out.println("TRACE|ARRAY2D|${arrayName}|" + (${row}) + "|" + (${col}) + "|" + ${arrayName}[${row}][${col}]);\n`;
      out += `System.out.println("TRACE|VAR|${arrayName}|" + ${formatter}(${arrayName}));\n`;
    } else {
      const arrayMatch = trimmed.match(/(\w+)\s*\[([^\]]+)\]\s*[+\-*\/%]?=\s*(.*);/);
      if (arrayMatch) {
        const arrayName = arrayMatch[1];
        const index = arrayMatch[2];
        out += `System.out.println("TRACE|ARRAY|${arrayName}|" + (${index}) + "|" + ${arrayName}[${index}]);\n`;
        // Emit full array state so the variable panel stays in sync for locally-created arrays
        out += `System.out.println("TRACE|VAR|${arrayName}|" + ${formatter}(${arrayName}));\n`;
      }
    }

    // ── VAR detection: use (?<!\.) so field accesses like `tail.next = ...`
    let match = trimmed.match(/(?<!\.)(\b[a-zA-Z_][a-zA-Z0-9_]*)\s*(=|\+=|-=|\*=|\/=)\s*(.*);/);
    if (!match) {
      match = trimmed.match(/\b([a-zA-Z_][a-zA-Z0-9_]*)\s*(\+\+|--)/);
    }
    if (!match) {
      match = trimmed.match(/(\+\+|--)\s*([a-zA-Z_][a-zA-Z0-9_]*)\b/);
      if (match) match = [match[0], match[2], ""];
    }
    if (match) {
      const varName = match[1];
      const op = match[2];
      const rhs = (match[3] || "").trim().replace(/"/g, '\\"');
      if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(varName)) {
        out += `System.out.println("TRACE|ASSIGN|${varName}|${op}|${rhs}");\n`;
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
  tracedBody += `boolean __DSA_RETURNED__ = false;\n`;
  tracedBody += `int __DSA_BFS_LEVEL__ = 0;\n`;
  tracedBody += `try {\n`;

  // Inject TRACE|VAR for each method parameter right after CALL
  for (const param of methodParams) {
    tracedBody += `System.out.println("TRACE|VAR|${param.name}|" + ${formatter}(${param.name}));\n`;
    
    // Inject initial PREORDER tree visit trace for TreeNode params
    if (param.type === "TreeNode") {
      tracedBody += `System.out.println("TRACE|TREE_VISIT|node=" + __DSAInput.getTreeNodeId(${param.name}) + "|phase=PREORDER");\n`;
    }

    if (param.type === "int" && ["node", "curr", "u", "v", "vertex"].includes(param.name)) {
      tracedBody += `System.out.println("TRACE|GRAPH_VISIT|node=graphNode_" + ${param.name});\n`;
    }
  }

  for (let i = 0; i < mappedLines.length; i++) {
    let lineObj = mappedLines[i];
    let line = lineObj.text.trim();
    if (!line) continue;

    const lineNumber = lineObj.line;
    const openBracesInLine = (line.match(/{/g) || []).length;
    const closeBracesInLine = (line.match(/}/g) || []).length;

    // ── HARD ARCHITECTURAL RULES ───────────────────────────────────
    // 1) NEVER inject TRACE between `if (...) <body>` and `else`.
    // 2) NEVER inject TRACE between `do { ... }` and `while (...) ;`.
    //
    // Our normalization emits `} else ...` and `} while (...) ;` as single
    // structural lines. They must pass through untouched.
    if (/^else\b/.test(line) || /^}\s*else\b/.test(line)) {
      tracedBody += line + "\n";
      braceDepth = Math.max(0, braceDepth + openBracesInLine - closeBracesInLine);
      continue;
    }

    if (/^}\s*while\b/.test(line)) {
      tracedBody += line + "\n";
      const closingDepth = braceDepth;
      braceDepth = Math.max(0, braceDepth + openBracesInLine - closeBracesInLine);

      while (forVarScopeStack.length > 0 && forVarScopeStack[forVarScopeStack.length - 1].depth === closingDepth) {
        const scopeItem = forVarScopeStack.pop();
        if (scopeItem.isDoWhile) {
          tracedBody += `System.out.println("TRACE|LOOP_END|loop_${scopeItem.lineId}");\n`;
        }
      }
      continue;
    }

    if (line.match(/^do\s*\{/)) {
        tracedBody += line + "\n";
        braceDepth += 1;
        tracedBody += `System.out.println("TRACE|LINE|${lineNumber}");\n`;
        tracedBody += `System.out.println("TRACE|LOOP_ITER|loop_${lineNumber}");\n`;
        forVarScopeStack.push({ isWhile: true, isDoWhile: true, lineId: lineNumber, depth: braceDepth });
        continue;
    }


    // Skip pure braces (but allow inserting pending for-loop trace right after '{')
    if (line === "{") {
      tracedBody += line + "\n";
      braceDepth += 1;

      if (pendingForTrace) {
        tracedBody += `System.out.println("TRACE|LINE|${pendingForTrace.lineNumber}");\n`;
        if (pendingForTrace.isWhile) {
          tracedBody += `System.out.println("TRACE|LOOP_ITER|loop_${pendingForTrace.lineNumber}");\n`;
          forVarScopeStack.push({ isWhile: true, lineId: pendingForTrace.lineNumber, depth: braceDepth, isInfinite: pendingForTrace.isInfinite });
        } else if (pendingForTrace.isEnhancedFor) {
          tracedBody += `System.out.println("TRACE|COND|line=${pendingForTrace.lineNumber}|expr=hasNext()|value=true");\n`;
          tracedBody += `System.out.println("TRACE|ASSIGN|${pendingForTrace.loopVar}|=|" + ${pendingForTrace.loopVar});\n`;
          tracedBody += `System.out.println("TRACE|VAR|${pendingForTrace.loopVar}|" + ${formatter}(${pendingForTrace.loopVar}));\n`;
          tracedBody += `System.out.println("TRACE|LOOP_ITER|loop_${pendingForTrace.lineNumber}");\n`;
          forVarScopeStack.push({ isEnhancedFor: true, varName: pendingForTrace.loopVar, lineId: pendingForTrace.lineNumber, depth: braceDepth });
        } else {
          if (pendingForTrace.loopVars) {
            for (let v of pendingForTrace.loopVars) {
              tracedBody += `System.out.println("TRACE|VAR|${v}|" + ${v});\n`;
            }
          } else if (pendingForTrace.loopVar) {
            tracedBody += `System.out.println("TRACE|VAR|${pendingForTrace.loopVar}|" + ${pendingForTrace.loopVar});\n`;
          }
          tracedBody += `System.out.println("TRACE|LOOP|loop_${pendingForTrace.lineNumber}|" + ${pendingForTrace.loopVar});\n`;
          forVarScopeStack.push({ loopVars: pendingForTrace.loopVars, varName: pendingForTrace.loopVar, depth: braceDepth });
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
        } else if (scopeItem.isEnhancedFor) {
          tracedBody += `System.out.println("TRACE|COND|line=${scopeItem.lineId}|expr=hasNext()|value=false");\n`;
          tracedBody += `System.out.println("TRACE|VAR|${scopeItem.varName}|null");\n`;
        } else {
          tracedBody += `System.out.println("TRACE|LINE|${lineNumber}");\n`;
          if (scopeItem.loopVars) {
            for (let v of scopeItem.loopVars) {
              tracedBody += `System.out.println("TRACE|VAR|${v}|null");\n`;
            }
          } else if (scopeItem.varName) {
            tracedBody += `System.out.println("TRACE|VAR|${scopeItem.varName}|null");\n`;
          }
        }
      }
      continue;
    }

    // ── Standalone RETURN ────────────────────────────────────────
    if (line.startsWith("return")) {
      const returnExpr = line.replace("return", "").replace(";", "").trim();
      tracedBody += buildReturnTrace(returnExpr, lineNumber, methodName, wantsListNode, retCounter++);
      continue;
    }

    // FOR LOOP handling
    if (line.startsWith("for")) {
      const isInfiniteFor = /^\s*for\s*\(\s*;\s*;\s*\)/.test(line);
      if (isInfiniteFor) {
        tracedBody += line + "\n";
        if (line.includes("{") && !line.includes("}")) {
          tracedBody += `System.out.println("TRACE|LINE|${lineNumber}");\n`;
          tracedBody += `System.out.println("TRACE|LOOP_ITER|loop_${lineNumber}");\n`;
          braceDepth += 1;
          forVarScopeStack.push({ isWhile: true, lineId: lineNumber, depth: braceDepth, isInfinite: true });
        } else {
          pendingForTrace = { lineNumber, isWhile: true, isInfinite: true };
        }
        if (line.includes("{") && line.includes("}")) {
          braceDepth = Math.max(0, braceDepth + openBracesInLine - closeBracesInLine);
        }
        continue;
      }

      // Expand single-line loop bodies: `for (...) { stmt; }`
      // so that injected traces run inside the loop (loop var in scope).
      const inlineFor = line.match(/^(for\s*\(.*\))\s*\{\s*(.*?)\s*\}\s*$/);
      if (inlineFor) {
        const forHeader = `${inlineFor[1]} {`;
        const inlineBody = inlineFor[2].trim();

        tracedBody += forHeader + "\n";

        const match = line.match(/for\s*\(\s*int\s+([^;]+);/);
        if (match) {
          const loopVarsStr = match[1];
          const declarations = loopVarsStr.split(",");
          const loopVars = [];
          for (let d of declarations) {
            const vName = d.trim().split("=")[0].trim().split(/\s+/).pop();
            if (vName) loopVars.push(vName);
          }
          currentLoopVar = loopVars[0];
          braceDepth += 1;
          tracedBody += `System.out.println("TRACE|LINE|${lineNumber}");\n`;
          for (let v of loopVars) {
            tracedBody += `System.out.println("TRACE|VAR|${v}|" + ${v});\n`;
          }
          tracedBody += `System.out.println("TRACE|LOOP|loop_${lineNumber}|" + ${currentLoopVar});\n`;
          forVarScopeStack.push({ loopVars, varName: currentLoopVar, depth: braceDepth });
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
            if (scopeItem.loopVars) {
              for (let v of scopeItem.loopVars) {
                tracedBody += `System.out.println("TRACE|VAR|${v}|null");\n`;
              }
            } else if (scopeItem.varName) {
              tracedBody += `System.out.println("TRACE|VAR|${scopeItem.varName}|null");\n`;
            }
          }
        }

        continue;
      }

      tracedBody += line + "\n";

      const match = line.match(/for\s*\(\s*int\s+([^;]+);/);
      const enhancedMatch = line.match(/for\s*\(\s*(?:final\s+)?([a-zA-Z_0-9<>\[\]]+)\s+([a-zA-Z_0-9]+)\s*:\s*([^)]+)\s*\)/);

      if (enhancedMatch) {
        const loopVar = enhancedMatch[2];
        currentLoopVar = loopVar;

        if (line.includes("{") && !line.includes("}")) {
          tracedBody += `System.out.println("TRACE|LINE|${lineNumber}");\n`;
          tracedBody += `System.out.println("TRACE|COND|line=${lineNumber}|expr=hasNext()|value=true");\n`;
          tracedBody += `System.out.println("TRACE|ASSIGN|${loopVar}|=|" + ${loopVar});\n`;
          tracedBody += `System.out.println("TRACE|VAR|${loopVar}|" + ${formatter}(${loopVar}));\n`;
          tracedBody += `System.out.println("TRACE|LOOP_ITER|loop_${lineNumber}");\n`;
          
          braceDepth += 1;
          forVarScopeStack.push({ isEnhancedFor: true, varName: loopVar, lineId: lineNumber, depth: braceDepth });
        } else {
          pendingForTrace = { lineNumber, isEnhancedFor: true, loopVar: loopVar };
        }
      } else if (match) {
        const loopVarsStr = match[1];
        const declarations = loopVarsStr.split(",");
        const loopVars = [];
        for (let d of declarations) {
          const vName = d.trim().split("=")[0].trim().split(/\s+/).pop();
          if (vName) loopVars.push(vName);
        }
        currentLoopVar = loopVars[0];

        // Log loop-variable once per iteration.
        // If the '{' is on the same line, we can inject immediately (inside the loop body).
        // Otherwise, inject right after the next standalone '{' line.
        if (line.includes("{") && !line.includes("}")) {
          tracedBody += `System.out.println("TRACE|LINE|${lineNumber}");\n`;
          for (let v of loopVars) {
            tracedBody += `System.out.println("TRACE|VAR|${v}|" + ${v});\n`;
          }
          tracedBody += `System.out.println("TRACE|LOOP|loop_${lineNumber}|" + ${currentLoopVar});\n`;

          // The loop body opened on this line.
          braceDepth += 1;
          forVarScopeStack.push({ loopVars, varName: currentLoopVar, depth: braceDepth });
        } else {
          pendingForTrace = { lineNumber, loopVar: currentLoopVar, loopVars };
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
      const isInfiniteClass = /^\s*while\s*\(\s*true\s*\)/.test(line);

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
        forVarScopeStack.push({ isWhile: true, lineId: lineNumber, depth: braceDepth, isInfinite: isInfiniteClass });
      } else {
        pendingForTrace = { lineNumber, isWhile: true, isInfinite: isInfiniteClass };
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
    const array2DMatch = line.match(/(\w+)\s*\[(.*?)\]\s*\[(.*?)\]\s*[+\-*\/%]?=\s*(.*);/);
    if (array2DMatch) {
      const arrayName = array2DMatch[1];
      const row = array2DMatch[2];
      const col = array2DMatch[3];
      if (row.includes('++') || row.includes('--') || col.includes('++') || col.includes('--')) {
        tracedBody += `System.out.println("TRACE|VAR|${arrayName}|" + ${formatter}(${arrayName}));\n`;
      } else {
        tracedBody += `System.out.println("TRACE|ARRAY2D|${arrayName}|" + (${row}) + "|" + (${col}) + "|" + ${arrayName}[${row}][${col}]);\n`;
        tracedBody += `System.out.println("TRACE|VAR|${arrayName}|" + ${formatter}(${arrayName}));\n`;
      }
    } else {
      const arrayMatch = line.match(/(\w+)\s*\[([^\]]+)\]\s*[+\-*\/%]?=\s*(.*);/);
      if (arrayMatch) {
        const arrayName = arrayMatch[1];
        const index = arrayMatch[2];
        if (index.includes('++') || index.includes('--')) {
          tracedBody += `System.out.println("TRACE|VAR|${arrayName}|" + ${formatter}(${arrayName}));\n`;
        } else {
          tracedBody += `System.out.println("TRACE|ARRAY|${arrayName}|" + (${index}) + "|" + ${arrayName}[${index}]);\n`;
          // Emit full array state so the variable panel stays in sync for locally-created arrays
          tracedBody += `System.out.println("TRACE|VAR|${arrayName}|" + ${formatter}(${arrayName}));\n`;
        }
      }
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

    if (wantsTreeNode) {
      const mutateMatch = line.match(/^(.*)\.([a-zA-Z_]\w*)\s*([+\-*\/%]?=)\s*(.*?)\s*;/);
      if (mutateMatch && (mutateMatch[2] === 'left' || mutateMatch[2] === 'right' || mutateMatch[2] === 'val')) {
        isNodeMutate = true;
        const targetObject = mutateMatch[1].trim();
        const field = mutateMatch[2];
        const rhsExpr = mutateMatch[4].trim();
        
        if (field === 'val') {
          tracedBody += `System.out.println("TRACE|TREE_MUTATE|node=" + __DSAInput.getTreeNodeId(${targetObject}) + "|field=${field}|to=" + (${targetObject}.${field}));\n`;
        } else {
          if (rhsExpr === "null") {
            tracedBody += `System.out.println("TRACE|TREE_MUTATE|node=" + __DSAInput.getTreeNodeId(${targetObject}) + "|field=${field}|to=null");\n`;
          } else {
            tracedBody += `System.out.println("TRACE|TREE_MUTATE|node=" + __DSAInput.getTreeNodeId(${targetObject}) + "|field=${field}|to=" + __DSAInput.getTreeNodeId(${rhsExpr}));\n`;
          }
        }
      }
    }

    // BFS QUEUE ENQUEUE
    const enqueueMatch = line.match(/([a-zA-Z_]\w*)\.(?:add|offer)\s*\(\s*([a-zA-Z_]\w*)\s*\)\s*;/);
    if (enqueueMatch && enqueueMatch[1].match(/q|queue|frontier/i)) {
      const valVar = enqueueMatch[2];
      tracedBody += `System.out.println("TRACE|QUEUE_ENQUEUE|node=graphNode_" + ${valVar});\n`;
    }

    // BFS QUEUE DEQUEUE
    const dequeueMatch = line.match(/(?:int|Integer)\s+([a-zA-Z_]\w*)\s*=\s*([a-zA-Z_]\w*)\.(?:poll|remove)\s*\(\s*\)\s*;/);
    if (dequeueMatch && dequeueMatch[2].match(/q|queue|frontier/i)) {
      const valVar = dequeueMatch[1];
      tracedBody += `System.out.println("TRACE|QUEUE_DEQUEUE|node=graphNode_" + ${valVar});\n`;
      tracedBody += `System.out.println("TRACE|BFS_VISIT|node=graphNode_" + ${valVar});\n`;
    }

    // BFS LEVEL START
    const sizeMatch = line.match(/int\s+([a-zA-Z_]\w*)\s*=\s*([a-zA-Z_]\w*)\.size\s*\(\s*\)\s*;/);
    if (sizeMatch && sizeMatch[2].match(/q|queue|frontier/i)) {
      tracedBody += `System.out.println("TRACE|BFS_LEVEL_START|level=" + (__DSA_BFS_LEVEL__++));\n`;
    }

    // VAR TRACE (assignments and mutations) — skip if this line is a PTR_MOVE
    // or NODE_MUTATE (NODE_MUTATE would incorrectly match 'next' as a variable)
    if (!isPtrMove && !isNodeMutate) {
      // ── VAR detection: (?<!\.) prevents field names (e.g. `next` in `tail.next = ...`)
      // from being treated as the assigned variable.
      let match = line.match(/(?<!\.)(\b[a-zA-Z_][a-zA-Z0-9_]*)\s*(=|\+=|-=|\*=|\/=)\s*(.*);/);
      if (!match) {
        match = line.match(/\b([a-zA-Z_][a-zA-Z0-9_]*)\s*(\+\+|--)/);
      }
      if (!match) {
        match = line.match(/(\+\+|--)\s*([a-zA-Z_][a-zA-Z0-9_]*)\b/);
        if (match) match = [match[0], match[2]];
      }

      if (match) {
        const varName = match[1];
        const op = match[2];
        const rhs = (match[3] || "").trim().replace(/"/g, '\\"');
        if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(varName)) {
          tracedBody += `System.out.println("TRACE|ASSIGN|${varName}|${op}|${rhs}");\n`;
          tracedBody += `System.out.println("TRACE|VAR|${varName}|" + ${formatter}(${varName}));\n`;
        }
      }
    }

    // COLLECTION DECLARATION TRACE
    const collectionDeclMatch = line.match(/(?:java\.util\.)?\b(Stack|Queue|Deque|ArrayDeque|PriorityQueue|Map|HashMap|Set|HashSet|List|ArrayList)(?:\s*<[^>]*>)?\s+([a-zA-Z_]\w*)\s*(?:=|;)/);
    if (collectionDeclMatch) {
      const type = collectionDeclMatch[1];
      const varName = collectionDeclMatch[2];
      tracedBody += `System.out.println("TRACE|COLLECTION_TYPE|${varName}|${type}");\n`;
    }


    // STRINGBUILDER / STRINGBUFFER MUTATION TRACE
    const stringBuilderMatch = line.match(/\b([a-zA-Z_]\w*)\.(append|insert|delete|deleteCharAt|replace|reverse|setCharAt)\s*\(/);
    if (stringBuilderMatch) {
      const varName = stringBuilderMatch[1];
      if (varName !== "Collections" && varName !== "Arrays" && varName !== "Math") {
        tracedBody += `System.out.println("TRACE|VAR|${varName}|" + ${formatter}(${varName}));\n`;
      }
    }

    const registryOut = injectRegistryTraces(line, formatter);
    if (registryOut) {
      tracedBody += registryOut;
    }


    // Keep braceDepth in sync for all other lines (e.g., `if (...) {`).
    // This prevents accidentally treating an inner-block '}' as the end of a loop.
    braceDepth = Math.max(0, braceDepth + openBracesInLine - closeBracesInLine);

    if (wantsTreeNode) {
      const rootParam = methodParams.find(p => p.type === "TreeNode")?.name || "root";
      const leftCallRegex = new RegExp(`\\b${methodName}\\s*\\([^\\{\\}\\;]*\\.left\\b`);
      if (leftCallRegex.test(line)) {
        tracedBody += `System.out.println("TRACE|TREE_VISIT|node=" + __DSAInput.getTreeNodeId(${rootParam}) + "|phase=INORDER");\n`;
      }

      const rightCallRegex = new RegExp(`\\b${methodName}\\s*\\([^\\{\\}\\;]*\\.right\\b`);
      if (rightCallRegex.test(line)) {
        tracedBody += `System.out.println("TRACE|TREE_VISIT|node=" + __DSAInput.getTreeNodeId(${rootParam}) + "|phase=POSTORDER");\n`;
      }
    }
    // Ensure trace loops cleanly
  }

  tracedBody += `} finally {\n`;
  tracedBody += `  if (!__DSA_RETURNED__) {\n`;
  if (returnType === "void") {
    tracedBody += `    System.out.println("TRACE|RETURN|void");\n`;
  } else {
    // If a non-void method throws an exception without returning, we still want to pop the frame.
    tracedBody += `    System.out.println("TRACE|RETURN|null");\n`;
  }
  tracedBody += `  }\n`;
  tracedBody += `}\n`;

  return tracedBody;
}

function extractAllMethodsAndInstrument(userCode) {
  const signatureRegex = /(?:public|private|protected)\s+(?:static\s+)?([A-Za-z0-9_<>[\]]+)\s+(\w+)\s*\(([^)]*)\)\s*\{/g;
  let match;

  const methods = [];
  while ((match = signatureRegex.exec(userCode)) !== null) {
      const isPublic = match[0].includes("public");
      const returnType = match[1];
      const methodName = match[2];
      const paramsStr = match[3];

      let methodParams = [];
      if (paramsStr && paramsStr.trim()) {
          const rawParams = [];
          let currentParam = "";
          let genericDepth = 0;
          for (let i = 0; i < paramsStr.length; i++) {
              const char = paramsStr[i];
              if (char === '<') genericDepth++;
              else if (char === '>') genericDepth--;
              
              if (char === ',' && genericDepth === 0) {
                  rawParams.push(currentParam);
                  currentParam = "";
              } else {
                  currentParam += char;
              }
          }
          if (currentParam.trim()) {
              rawParams.push(currentParam);
          }

          methodParams = rawParams.map((p) => {
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
              returnType,
              isPublic,
              body
          });
      }
  }

  const publicMethods = methods.filter(m => m.isPublic);
  if (publicMethods.length === 0) {
      throw new Error("Exactly one public method is required inside Solution class.");
  }
  if (publicMethods.length > 1) {
      throw new Error("Multiple public methods detected. Exactly one public entry method is required.");
  }

  const mainMethodName = publicMethods[0].methodName;
  const mainMethodParams = publicMethods[0].methodParams;
  const mainReturnType = publicMethods[0].returnType;

  // Replace backwards so indices remain valid
  methods.reverse();
  
  let finalUserCode = userCode;
  
  for (const method of methods) {
      // Compute the number of newlines before the method body's first character
      // (the char immediately after the opening '{'). This gives the
      // 0-based line index of the '{' in the full source, so body line 1
      // maps to lineOffset+1 in the editor.
      const bodyLineOffset = (userCode.substring(0, method.openBraceIndex + 1).match(/\n/g) || []).length;
      
        const mappedLines = normalizeControlFlowAndLineMap(method.body, bodyLineOffset, method.returnType);
        const tracedBody = injectTraceIntoBody(mappedLines, method.methodName, method.methodParams, method.returnType);
      
      finalUserCode = finalUserCode.substring(0, method.openBraceIndex + 1) + "\n" + tracedBody + "\n" + finalUserCode.substring(method.closeBraceIndex);
  }

  return { finalUserCode, methodName: mainMethodName, methodParams: mainMethodParams, returnType: mainReturnType };
}

module.exports = {
  executeJavaCode,
  // Debug-only helpers for instrumentation architecture audits.
  // Not used by production routes.
  __debug: {
    wrapJavaCode,
    parseExecutionOutput,
    normalizeControlFlowAndLineMap,
    injectTraceIntoBody,
    extractAllMethodsAndInstrument,
    buildReturnTrace,
    detectBinaryExpr,
    runDockerExecution,
    compileJava,
    runJava,
    writeJavaFile,
    createExecutionFolder,
    generateExecutionId,
  },
};
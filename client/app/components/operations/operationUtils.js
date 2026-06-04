// Categorize the operation into ASSIGNMENT, ARITHMETIC, COMPARISON, BOOLEAN
export function categorizeOperation(traceEvent) {
  if (!traceEvent) return null;

  if (traceEvent.type === "ASSIGN") {
    const { op, rhs } = traceEvent;
    if (op === "++" || op === "--") return "ARITHMETIC";
    if (op !== "=") return "ARITHMETIC"; // +=, -=, *=, /=
    if (/[+\-*/%]/.test(rhs)) return "ARITHMETIC";
    return "ASSIGNMENT";
  } else if (traceEvent.type === "COND") {
    const { expr } = traceEvent;
    if (/&&|\|\|/.test(expr)) return "BOOLEAN";
    if (/[<>=!]=?/.test(expr)) return "COMPARISON";
    return "BOOLEAN"; // default fallback for conditions like `if (visited[i])`
  }
  return null;
}

// Evaluate expressions, replacing var names and array indices with actual values
export function evaluateExpression(expr, variables, collections = {}, arrayState = null) {
  if (!expr) return "";

  let evaluatedStr = expr;

  // 1. Array accesses: arr[i] or visited[node]
  // We match identifiers followed by [ expression ]
  evaluatedStr = evaluatedStr.replace(/\b([a-zA-Z_]\w*)\[([^\]]+)\]/g, (match, arrName, idxExpr) => {
    // Resolve the index. It could be a number or a variable name
    let idx = variables[idxExpr.trim()] !== undefined ? variables[idxExpr.trim()] : parseInt(idxExpr.trim(), 10);
    
    // Check if it's the main array
    if (arrayState && (arrName === "arr" || arrName === "nums" || arrName === "array" || arrName === "ans")) {
      if (idx !== undefined && !isNaN(idx) && arrayState[idx] !== undefined) {
        return arrayState[idx];
      }
    }
    
    // Check if it's in collections (like graph visited[], distance[], parent[])
    if (collections && collections[arrName]) {
      const coll = collections[arrName];
      if (Array.isArray(coll)) {
        if (idx !== undefined && !isNaN(idx) && coll[idx] !== undefined) {
          return coll[idx];
        }
      } else {
        // Map or Object (e.g. visitedState in graph: graphNode_0 -> true)
        // Try simple number mapping or fallback
        if (idx !== undefined && !isNaN(idx)) {
          const graphNodeKey = `graphNode_${idx}`;
          if (coll[graphNodeKey] !== undefined) return coll[graphNodeKey];
        }
      }
    }
    
    return match;
  });

  // 2. Simple variables
  evaluatedStr = evaluatedStr.replace(/\b([a-zA-Z_]\w*)\b/g, (match, varName) => {
    // Reserved words
    if (varName === 'true' || varName === 'false' || varName === 'null') return match;
    
    if (variables && variables[varName] !== undefined) {
      // Don't inject object strings like "[1,2,3]", only primitives
      const val = variables[varName];
      if (typeof val === 'number' || typeof val === 'boolean') {
        return val;
      }
    }
    return match;
  });

  return evaluatedStr;
}

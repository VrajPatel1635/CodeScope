module.exports = function resolveRuntimeDiagnostic(rawMessage, states, code) {
  const lastState = states && states.length > 0 ? states[states.length - 1] : null;
  
  // 1. Resolve failing line and step
  let failingLine = lastState ? lastState.line : null;
  if (!failingLine && rawMessage) {
    const lineMatch = rawMessage.match(/Main\.java:(\d+)/);
    if (lineMatch) {
      failingLine = parseInt(lineMatch[1], 10);
    }
  }
  const failingStep = states ? states.length : null;
  const variableSnapshot = lastState ? lastState.currentFrameVariables : null;
  
  // Get active line of code text
  let failingLineText = "";
  if (code && failingLine) {
    const lines = code.split("\n");
    failingLineText = lines[failingLine - 1]?.trim() || "";
  }

  // A. NullPointerException
  if (rawMessage.includes("NullPointerException")) {
    let failingVariable = null;
    const helpfulMatch = rawMessage.match(/because "([^"]+)" is null/);
    
    if (helpfulMatch && !helpfulMatch[1].startsWith("<local") && (!variableSnapshot || variableSnapshot[helpfulMatch[1]] !== undefined)) {
      failingVariable = helpfulMatch[1];
    }
    
    if (!failingVariable && variableSnapshot && failingLineText) {
      // Look for null variables on the failing line
      const nullVars = Object.entries(variableSnapshot)
        .filter(([k, descriptor]) => descriptor && (descriptor.value === null || descriptor.value === "null"))
        .map(([k, descriptor]) => k);
      for (const v of nullVars) {
        if (failingLineText.includes(v)) {
          failingVariable = v;
          break;
        }
      }
    }

    const varName = failingVariable ? `\`${failingVariable}\`` : "An object reference";
    return {
      severity: "error",
      category: "runtime",
      title: "NullPointerException",
      explanation: "The application attempted to dereference a null pointer (read/write a field, or invoke a method on a null object).",
      probableCause: failingVariable 
        ? `The variable ${varName} was evaluated as \`null\` right before this statement was executed.`
        : "An object reference or array element involved in this operation was null.",
      failingLine,
      failingStep,
      variableSnapshot,
      failingVariable,
      suggestions: [
        failingVariable 
          ? `Ensure that ${varName} is properly initialized before this line.`
          : "Check the visualizer snapshot or variables panel to identify which reference is null.",
        failingVariable 
          ? `Add a null check protection: \`if (${failingVariable} != null) { ... }\` before using it.`
          : "Add checks to ensure object instances are created before calling their methods.",
        "Use the playback timeline controls to step backward and inspect why the reference was assigned null."
      ],
      rawMessage
    };
  }

  // B. ArrayIndexOutOfBoundsException
  if (rawMessage.includes("ArrayIndexOutOfBoundsException")) {
    let attemptedIndex = null;
    let arrayLength = null;
    
    const boundsMatch = rawMessage.match(/Index (-?\d+) out of bounds for length (\d+)/);
    if (boundsMatch) {
      attemptedIndex = parseInt(boundsMatch[1], 10);
      arrayLength = parseInt(boundsMatch[2], 10);
    } else {
      const idxMatch = rawMessage.match(/ArrayIndexOutOfBoundsException:\s*(-?\d+)/);
      if (idxMatch) {
        attemptedIndex = parseInt(idxMatch[1], 10);
      }
    }

    // Try to guess length from variables if not in rawMessage
    if (arrayLength === null && lastState && lastState.array) {
      arrayLength = lastState.array.length;
    }

    return {
      severity: "error",
      category: "runtime",
      title: "ArrayIndexOutOfBoundsException",
      explanation: "Attempted to access an array index that is negative or greater than or equal to the array length.",
      probableCause: attemptedIndex !== null 
        ? `Accessed index \`${attemptedIndex}\` on an array of length \`${arrayLength !== null ? arrayLength : "unknown"}\`.`
        : "An invalid index was used during an array write/read operation.",
      failingLine,
      failingStep,
      variableSnapshot,
      attemptedIndex,
      arrayLength,
      suggestions: [
        "Verify your loop guard conditions (ensure using `<` instead of `<=`).",
        attemptedIndex !== null && attemptedIndex < 0 
          ? "Check index arithmetic (e.g. `i - 1`) to ensure it never computes a negative value."
          : "Ensure that index calculations do not overshoot the boundary (`length - 1`).",
        "Inspect the index pointers (like `i`, `j`, or `mid`) at the crash step in the variables panel."
      ],
      rawMessage
    };
  }

  // C. IndexOutOfBoundsException
  if (rawMessage.includes("IndexOutOfBoundsException") || rawMessage.includes("StringIndexOutOfBoundsException")) {
    let requestedIndex = null;
    let collectionSize = null;

    const boundsMatch = rawMessage.match(/Index:?\s*(-?\d+),?\s*Size:?\s*(\d+)/i) || 
                        rawMessage.match(/Index\s*(-?\d+)\s*out\s*of\s*bounds\s*for\s*length\s*(\d+)/i);
    if (boundsMatch) {
      requestedIndex = parseInt(boundsMatch[1], 10);
      collectionSize = parseInt(boundsMatch[2], 10);
    }

    return {
      severity: "error",
      category: "runtime",
      title: "IndexOutOfBoundsException",
      explanation: "Attempted to access an element of a List or String using an out-of-range index.",
      probableCause: requestedIndex !== null 
        ? `Accessed index \`${requestedIndex}\` on a collection of size \`${collectionSize}\`.`
        : "An index fell outside the bounds of the collection or string.",
      failingLine,
      failingStep,
      variableSnapshot,
      requestedIndex,
      collectionSize,
      suggestions: [
        "Ensure indices lie in the valid range: `0` (inclusive) to `size - 1` (inclusive).",
        "Add guard clauses: `if (index >= 0 && index < list.size())` to prevent crashing.",
        "Check index computation logic in loop headers."
      ],
      rawMessage
    };
  }

  // D. ArithmeticException
  if (rawMessage.includes("ArithmeticException")) {
    let dividend = null;
    let divisor = null;

    if (rawMessage.includes("/ by zero")) {
      divisor = 0;
      if (failingLineText && variableSnapshot) {
        // Try to parse the dividend
        const opMatch = failingLineText.match(/(\w+)\s*[\/%]/);
        if (opMatch) {
          const varName = opMatch[1];
          const descriptor = variableSnapshot[varName];
          dividend = descriptor !== undefined ? (descriptor.value !== undefined ? descriptor.value : descriptor) : varName;
        }
      }
    }

    return {
      severity: "error",
      category: "runtime",
      title: "ArithmeticException",
      explanation: "An illegal or exceptional mathematical operation was attempted.",
      probableCause: divisor === 0
        ? `A division or modulo operation by zero occurred (dividend: \`${dividend !== null ? dividend : "unknown"}\`, divisor: \`0\`).`
        : "An invalid mathematical operation was executed.",
      failingLine,
      failingStep,
      variableSnapshot,
      divisor,
      dividend,
      suggestions: [
        "Ensure that the divisor variable is checked to be non-zero before executing division or modulo expressions.",
        "Add protective logic: `if (divisor != 0) { ... }`.",
        "Step backward in the execution history to verify why the divisor became zero."
      ],
      rawMessage
    };
  }

  // E. StackOverflowError
  if (rawMessage.includes("StackOverflowError")) {
    // Locate state with maximum stack depth across all states (since stack unwinding in finally blocks pops frames)
    let maxStackState = null;
    let maxStackLen = 0;
    if (states && states.length > 0) {
      for (const s of states) {
        if (s.stack && s.stack.length > maxStackLen) {
          maxStackLen = s.stack.length;
          maxStackState = s;
        }
      }
    }

    if (maxStackState && maxStackState.stack && maxStackState.stack.length > 0) {
      const counts = {};
      maxStackState.stack.forEach(frame => {
        const fn = frame.function || "unknown";
        counts[fn] = (counts[fn] || 0) + 1;
      });
      let maxFn = null;
      let maxCount = 0;
      for (const [fn, count] of Object.entries(counts)) {
        if (count > maxCount) {
          maxCount = count;
          maxFn = fn;
        }
      }
      if (maxFn && maxFn !== "global" && maxFn !== "solve") {
        recursiveMethod = maxFn;
        approximateRecursionDepth = maxCount;
      }
    }

    // Fallback: Parse from stderr stack trace in rawMessage
    if (!recursiveMethod || recursiveMethod === "global" || recursiveMethod === "solve") {
      const traceMatches = [...rawMessage.matchAll(/at Solution\.(\w+)/g)];
      if (traceMatches.length > 0) {
        const counts = {};
        for (const match of traceMatches) {
          const fn = match[1];
          counts[fn] = (counts[fn] || 0) + 1;
        }
        let maxFn = null;
        let maxCount = 0;
        for (const [fn, count] of Object.entries(counts)) {
          if (count > maxCount) {
            maxCount = count;
            maxFn = fn;
          }
        }
        if (maxFn) {
          recursiveMethod = maxFn;
          approximateRecursionDepth = Math.max(approximateRecursionDepth || 0, maxCount);
        }
      }
    }

    return {
      severity: "error",
      category: "runtime",
      title: "StackOverflowError",
      explanation: "The JVM ran out of stack memory space, indicating infinite recursion.",
      probableCause: recursiveMethod
        ? `The method \`${recursiveMethod}\` called itself recursively too many times, reaching a depth of approx. ${approximateRecursionDepth}.`
        : "A recursive function has no termination base case or the base case was bypassed.",
      failingLine,
      failingStep,
      variableSnapshot,
      recursiveMethod,
      approximateRecursionDepth,
      suggestions: [
        "Verify your recursive function has a valid base case that is guaranteed to execute.",
        "Check that parameters passed in recursive calls (e.g. `n - 1`, `head.next`) change and progress towards the base condition.",
        "Examine the Call Stack visualizer to inspect call frame progression."
      ],
      rawMessage
    };
  }

  // F. NoSuchElementException
  if (rawMessage.includes("NoSuchElementException")) {
    let structureInvolved = null;
    let operationAttempted = null;

    if (failingLineText) {
      const callMatch = failingLineText.match(/(\w+)\.(next|nextInt|nextLong|nextFloat|nextDouble|getFirst|getLast|element|remove)\s*\(/);
      if (callMatch) {
        structureInvolved = callMatch[1];
        operationAttempted = `${callMatch[2]}()`;
      }
    }

    return {
      severity: "error",
      category: "runtime",
      title: "NoSuchElementException",
      explanation: "Attempted to access an element from a structure (Iterator, Deque, Scanner, Queue) that does not exist or has been fully consumed.",
      probableCause: structureInvolved
        ? `Invoked \`${operationAttempted}\` on \`${structureInvolved}\` when no elements were available.`
        : "Retrieval operation was called on an exhausted or empty data structure.",
      failingLine,
      failingStep,
      variableSnapshot,
      structureInvolved,
      operationAttempted,
      suggestions: [
        "Verify that elements exist using guard methods (e.g. `iterator.hasNext()`, `!queue.isEmpty()`) before fetching.",
        "Check list or queue size prior to calling bounds-sensitive retrieval functions."
      ],
      rawMessage
    };
  }

  // G. EmptyStackException
  if (rawMessage.includes("EmptyStackException")) {
    let stackName = null;
    let stackSnapshotBeforeFailure = "[] (empty)";

    if (failingLineText) {
      const stackMatch = failingLineText.match(/(\w+)\.(pop|peek)\s*\(/);
      if (stackMatch) {
        stackName = stackMatch[1];
      }
    }

    if (lastState && lastState.collections) {
      if (stackName && lastState.collections[stackName]) {
        stackSnapshotBeforeFailure = JSON.stringify(lastState.collections[stackName]);
      } else {
        // Fallback: look for stack variables
        for (const [k, val] of Object.entries(lastState.collections)) {
          if (k.toLowerCase().includes("stack") || k.toLowerCase().includes("st")) {
            stackName = k;
            stackSnapshotBeforeFailure = JSON.stringify(val);
            break;
          }
        }
      }
    }

    return {
      severity: "error",
      category: "runtime",
      title: "EmptyStackException",
      explanation: "Attempted to peek or pop an element from a stack that contains no elements.",
      probableCause: stackName 
        ? `Invoked peek() or pop() on empty stack \`${stackName}\` (state: \`${stackSnapshotBeforeFailure}\`).`
        : "Attempted stack retrieval operation on an empty stack container.",
      failingLine,
      failingStep,
      variableSnapshot,
      stackName,
      stackSnapshotBeforeFailure,
      suggestions: [
        "Always add a size/empty safeguard like `if (!stack.isEmpty()) { ... }` before popping or peeking.",
        "Verify that you push sufficient elements before attempting retrievals.",
        "Trace the push/pop operations using the timeline playback to check balance."
      ],
      rawMessage
    };
  }

  // Generic fallback exceptions
  if (rawMessage.includes("IllegalArgumentException")) {
    return {
      severity: "error",
      category: "runtime",
      title: "IllegalArgumentException",
      explanation: "A method was passed an illegal or inappropriate argument.",
      probableCause: "Method arguments did not meet validation checks.",
      failingLine,
      failingStep,
      variableSnapshot,
      suggestions: [
        "Verify argument values matches expectations.",
        "Inspect variables at execution crash."
      ],
      rawMessage
    };
  }

  if (rawMessage.includes("ClassCastException")) {
    return {
      severity: "error",
      category: "runtime",
      title: "ClassCastException",
      explanation: "Attempted to cast an object to a subclass of which it is not an instance.",
      probableCause: "Incompatible object types during casting.",
      failingLine,
      failingStep,
      variableSnapshot,
      suggestions: [
        "Verify the object type using `instanceof` check before casting.",
        "Ensure class hierachies align."
      ],
      rawMessage
    };
  }

  if (rawMessage.includes("UnsupportedOperationException")) {
    return {
      severity: "error",
      category: "runtime",
      title: "UnsupportedOperationException",
      explanation: "An invoked method is not supported by the object.",
      probableCause: "The collection or class instance does not implement this mutation.",
      failingLine,
      failingStep,
      variableSnapshot,
      suggestions: [
        "Verify if the collection is read-only (like arrays initialized by `Arrays.asList()`)."
      ],
      rawMessage
    };
  }

  if (rawMessage.includes("Exception in thread \"main\"")) {
    return {
      severity: "error",
      category: "runtime",
      title: "RuntimeException",
      explanation: "An unhandled runtime error crashed the thread.",
      probableCause: "Unhandled exception in application code.",
      failingLine,
      failingStep,
      variableSnapshot,
      suggestions: [
        "Examine stack trace for details."
      ],
      rawMessage
    };
  }

  return null;
};

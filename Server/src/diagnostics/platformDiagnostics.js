module.exports = function resolvePlatformDiagnostic(rawMessage) {
  if (rawMessage.includes("Execution timed out")) {
    return {
      severity: "error",
      category: "platform",
      title: "Execution Timeout",
      explanation: "The algorithm exceeded the allowed execution time.",
      suggestedFix: "Check loops, recursion, and algorithm complexity for infinite loops.",
      rawMessage
    };
  }

  if (rawMessage.includes("TRACE size exceeded limit")) {
    return {
      severity: "error",
      category: "platform",
      title: "Trace Limit Exceeded",
      explanation: "Execution generated more visualization data than allowed.",
      suggestedFix: "Reduce input size or optimize the algorithm to generate fewer trace events.",
      rawMessage
    };
  }

  if (rawMessage.includes("Docker execution failed") || rawMessage.includes("Docker execution failure")) {
    return {
      severity: "error",
      category: "platform",
      title: "Execution Engine Failure",
      explanation: "The sandbox execution engine failed to run your code.",
      suggestedFix: "Ensure your code doesn't consume excessive memory or system resources.",
      rawMessage
    };
  }

  if (rawMessage.includes("OutOfMemoryError")) {
    return {
      severity: "error",
      category: "platform",
      title: "Memory Limit Exceeded",
      explanation: "The program consumed more memory than allowed by the sandbox.",
      suggestedFix: "Check for massive data structures or infinite data generation.",
      rawMessage
    };
  }

  return null;
};

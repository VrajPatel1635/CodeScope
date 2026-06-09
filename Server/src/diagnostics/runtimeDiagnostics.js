module.exports = function resolveRuntimeDiagnostic(rawMessage) {
  if (rawMessage.includes("NullPointerException")) {
    return {
      severity: "error",
      category: "runtime",
      title: "Null Reference Access",
      explanation: "Code attempted to use an object that is null.",
      suggestedFix: "Verify object initialization before usage.",
      rawMessage
    };
  }

  if (rawMessage.includes("ArrayIndexOutOfBoundsException")) {
    return {
      severity: "error",
      category: "runtime",
      title: "Array Index Out Of Bounds",
      explanation: "Code attempted to access an invalid array index.",
      suggestedFix: "Verify loop bounds and index calculations.",
      rawMessage
    };
  }

  if (rawMessage.includes("IndexOutOfBoundsException") || rawMessage.includes("StringIndexOutOfBoundsException")) {
    return {
      severity: "error",
      category: "runtime",
      title: "Index Out Of Bounds",
      explanation: "Code attempted to access an invalid index in a List or String.",
      suggestedFix: "Verify bounds and index calculations.",
      rawMessage
    };
  }

  if (rawMessage.includes("StackOverflowError")) {
    return {
      severity: "error",
      category: "runtime",
      title: "Recursion Overflow",
      explanation: "Recursion exceeded JVM stack limits.",
      suggestedFix: "Check base conditions and recursion termination.",
      rawMessage
    };
  }

  if (rawMessage.includes("ArithmeticException")) {
    return {
      severity: "error",
      category: "runtime",
      title: "Arithmetic Error",
      explanation: "An arithmetic error occurred, such as dividing by zero.",
      suggestedFix: "Check divisors to ensure they are not zero.",
      rawMessage
    };
  }

  if (rawMessage.includes("IllegalArgumentException")) {
    return {
      severity: "error",
      category: "runtime",
      title: "Illegal Argument",
      explanation: "A method was passed an illegal or inappropriate argument.",
      suggestedFix: "Review the arguments being passed to methods.",
      rawMessage
    };
  }

  if (rawMessage.includes("ClassCastException")) {
    return {
      severity: "error",
      category: "runtime",
      title: "Invalid Cast",
      explanation: "Attempted to cast an object to a subclass of which it is not an instance.",
      suggestedFix: "Ensure the object is of the expected type before casting.",
      rawMessage
    };
  }

  if (rawMessage.includes("UnsupportedOperationException")) {
    return {
      severity: "error",
      category: "runtime",
      title: "Unsupported Operation",
      explanation: "An invoked method is not supported by the object.",
      suggestedFix: "Check if the collection is read-only (e.g., Arrays.asList returns a fixed-size list).",
      rawMessage
    };
  }

  if (rawMessage.includes("Exception in thread \"main\"")) {
    return {
      severity: "error",
      category: "runtime",
      title: "Runtime Exception",
      explanation: "An unhandled exception occurred during execution.",
      suggestedFix: "Review the stack trace to locate the error in your code.",
      rawMessage
    };
  }

  return null;
};

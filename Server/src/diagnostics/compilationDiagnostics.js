module.exports = function resolveCompilationDiagnostic(rawMessage) {
  if (rawMessage.includes("Exactly one public method is required inside Solution class.")) {
    return {
      severity: "error",
      category: "compilation",
      title: "Missing Entry Method",
      explanation: "The visualizer requires exactly one public method in the Solution class to act as the entry point.",
      suggestedFix: "Ensure you have a public method like `public int solve(...) { ... }` in your Solution class.",
      rawMessage
    };
  }

  if (rawMessage.includes("cannot find symbol") && rawMessage.includes("method solve")) {
    return {
      severity: "error",
      category: "compilation",
      title: "Missing solve() Method",
      explanation: "The visualizer starts execution from the solve() method.",
      suggestedFix: "Rename your entry method to solve().",
      rawMessage
    };
  }

  if (rawMessage.includes("cannot find symbol") && rawMessage.includes("class")) {
    const match = rawMessage.match(/class (\w+)/);
    const className = match ? match[1] : "a class";
    return {
      severity: "error",
      category: "compilation",
      title: "Missing Import",
      explanation: `${className} is not available in the current scope.`,
      suggestedFix: `import java.util.${className}; (or appropriate package)`,
      rawMessage
    };
  }

  if (rawMessage.includes("cannot find symbol")) {
    return {
      severity: "error",
      category: "compilation",
      title: "Unknown Symbol",
      explanation: "A variable, method, or class used in the code is undeclared or out of scope.",
      suggestedFix: "Check spelling, verify variable declarations, and ensure necessary imports are present.",
      rawMessage
    };
  }

  if (rawMessage.includes("incompatible types")) {
    return {
      severity: "error",
      category: "compilation",
      title: "Type Mismatch",
      explanation: "A value is being assigned to an incompatible type.",
      suggestedFix: "Review variable declarations and assignments.",
      rawMessage
    };
  }

  if (rawMessage.includes("missing return statement")) {
    return {
      severity: "error",
      category: "compilation",
      title: "Missing Return Statement",
      explanation: "A method that is supposed to return a value is missing a return statement in some or all execution paths.",
      suggestedFix: "Ensure all paths (like if/else branches) return a value of the correct type.",
      rawMessage
    };
  }

  if (rawMessage.includes("error:") && rawMessage.includes("expected")) {
    return {
      severity: "error",
      category: "compilation",
      title: "Syntax Error",
      explanation: "The Java compiler encountered a syntax error, such as a missing semicolon or bracket.",
      suggestedFix: "Check the code near the indicated line for missing punctuation.",
      rawMessage
    };
  }

  // Generic fallback for javac stderr
  if (rawMessage.includes("error:")) {
    return {
      severity: "error",
      category: "compilation",
      title: "Compilation Error",
      explanation: "The Java code failed to compile.",
      suggestedFix: "Review the raw error message to identify the specific syntax or semantic error.",
      rawMessage
    };
  }

  return null;
};

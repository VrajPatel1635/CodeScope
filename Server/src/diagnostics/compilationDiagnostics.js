const JavaKnowledgeRegistry = require("../registry/index");

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

  const classSymbolMatch = rawMessage.match(/symbol:\s*class\s+(\w+)/);
  if (rawMessage.includes("cannot find symbol") && classSymbolMatch) {
    const className = classSymbolMatch[1];
    
    const registryEntry = JavaKnowledgeRegistry.lookupByClassName(className);

    let suggestedImport = `import java.util.${className}; (or appropriate package)`;
    if (registryEntry) {
      suggestedImport = `Add this to the top of your code:\n${registryEntry.importStatement}`;
    } else if (className !== "a class") {
      suggestedImport = `Ensure you have imported the class, e.g., \nimport java.util.${className};`;
    }

    return {
      severity: "error",
      category: "compilation",
      title: "Missing Import",
      explanation: `The class '${className}' is not recognized. You are likely missing an import statement.`,
      suggestedFix: suggestedImport,
      rawMessage
    };
  }

  if (rawMessage.includes("cannot find symbol")) {
    const symbolMatch = rawMessage.match(/symbol:\s+(variable|method)\s+(.*)/);
    const symType = symbolMatch ? symbolMatch[1] : "symbol";
    const symName = symbolMatch ? symbolMatch[2] : "a variable or method";

    if (symType === "variable") {
      const registryEntry = JavaKnowledgeRegistry.lookupByClassName(symName);
      if (registryEntry) {
        return {
          severity: "error",
          category: "compilation",
          title: "Missing Import",
          explanation: `The class '${symName}' is not recognized. You are likely missing an import statement.`,
          suggestedFix: `Add this to the top of your code:\n${registryEntry.importStatement}`,
          rawMessage
        };
      }
    }

    return {
      severity: "error",
      category: "compilation",
      title: "Unknown Symbol",
      explanation: `The ${symType} '${symName}' is undeclared or out of scope.`,
      suggestedFix: symType === "variable" 
        ? `Ensure the variable '${symName}' is declared and spelled correctly before using it.`
        : (symType === "method" ? `Ensure the method '${symName}' is defined in your class or correctly imported.` : "Check spelling, verify variable declarations, and ensure necessary imports are present."),
      rawMessage
    };
  }

  if (rawMessage.includes("incompatible types")) {
    const typeMatch = rawMessage.match(/incompatible types: (.*) cannot be converted to (.*)/);
    const fromType = typeMatch ? typeMatch[1] : "a value";
    const toType = typeMatch ? typeMatch[2] : "an incompatible type";

    return {
      severity: "error",
      category: "compilation",
      title: "Type Mismatch",
      explanation: `You are trying to assign or return a '${fromType}' where a '${toType}' is expected.`,
      suggestedFix: `Check your variable declarations, assignments, and method return type to ensure they match exactly. You may need to cast or convert the value.`,
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
    const expectedMatch = rawMessage.match(/error: '(.*)' expected/);
    const expectedChar = expectedMatch ? expectedMatch[1] : "punctuation";

    return {
      severity: "error",
      category: "compilation",
      title: "Syntax Error",
      explanation: `The Java compiler expected a '${expectedChar}' near the failing line.`,
      suggestedFix: `Carefully check the indicated line and the line immediately above it to insert the missing '${expectedChar}'.`,
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

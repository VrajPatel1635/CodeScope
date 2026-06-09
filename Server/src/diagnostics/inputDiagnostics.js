module.exports = function resolveInputDiagnostic(rawMessage) {
  if (rawMessage.includes("input must be a JSON array of length")) {
    const match = rawMessage.match(/For (\d+) parameters/);
    const paramCount = match ? match[1] : "multiple";
    return {
      severity: "error",
      category: "input",
      title: "Input Format Error",
      explanation: `Your method expects ${paramCount} parameters.`,
      suggestedFix: "Provide all values in a single JSON array. Example: [[1, 2, 3], 5]",
      rawMessage
    };
  }

  if (rawMessage.includes("Matrix must be an array of arrays") || rawMessage.includes("Invalid matrix input")) {
    return {
      severity: "error",
      category: "input",
      title: "Invalid Matrix Input",
      explanation: "A matrix requires rows and columns.",
      suggestedFix: "Use a 2D JSON array format. Example: [[1,2],[3,4]]",
      rawMessage
    };
  }

  if (rawMessage.includes("Invalid Tree input") || rawMessage.includes("Tree must be an array") || rawMessage.includes("Invalid Integer[] input") || rawMessage.includes("Invalid tree")) {
    return {
      severity: "error",
      category: "input",
      title: "Invalid Tree Format",
      explanation: "Trees must use level-order format.",
      suggestedFix: "Provide a JSON array representing the level-order traversal. Example: [1,2,3,null,4]",
      rawMessage
    };
  }

  if (rawMessage.includes("Invalid Graph") || rawMessage.includes("Malformed graph")) {
    return {
      severity: "error",
      category: "input",
      title: "Invalid Graph Format",
      explanation: "Graphs must be represented as adjacency lists or matrices.",
      suggestedFix: "Provide a valid graph representation. Example: [[1,2],[0,2],[0,1]]",
      rawMessage
    };
  }

  if (rawMessage.includes("Empty char input")) {
    return {
      severity: "error",
      category: "input",
      title: "Empty Character Input",
      explanation: "A char parameter requires exactly one character.",
      suggestedFix: "Provide a single character string. Example: \"A\"",
      rawMessage
    };
  }

  if (rawMessage.includes("Invalid char input (too long)")) {
    return {
      severity: "error",
      category: "input",
      title: "Invalid Character Input",
      explanation: "A char parameter requires exactly one character, but you provided multiple.",
      suggestedFix: "Provide a single character string. Example: \"A\"",
      rawMessage
    };
  }

  if (rawMessage.includes("Invalid numeric input") || rawMessage.includes("Invalid number in array") || rawMessage.includes("Invalid number in matrix")) {
    return {
      severity: "error",
      category: "input",
      title: "Invalid Number Format",
      explanation: "A numeric parameter or array element contained an invalid number.",
      suggestedFix: "Ensure all numbers are properly formatted. Avoid quotes around numbers if not strings.",
      rawMessage
    };
  }

  if (rawMessage.includes("cannot contain null")) {
    return {
      severity: "error",
      category: "input",
      title: "Null in Primitive Array",
      explanation: "Primitive arrays (like int[]) cannot contain null values in Java.",
      suggestedFix: "Remove nulls or use an object array (like Integer[]) if supported.",
      rawMessage
    };
  }

  if (rawMessage.includes("Invalid boolean")) {
    return {
      severity: "error",
      category: "input",
      title: "Invalid Boolean Format",
      explanation: "A boolean parameter must be either true or false.",
      suggestedFix: "Use true or false without quotes. Example: true",
      rawMessage
    };
  }

  if (rawMessage.includes("No code provided")) {
    return {
      severity: "error",
      category: "input",
      title: "Missing Code",
      explanation: "No Java code was provided for execution.",
      suggestedFix: "Ensure you have written code in the editor before running.",
      rawMessage
    };
  }

  return null;
};

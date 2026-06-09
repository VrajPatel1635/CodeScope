module.exports = function resolveUnsupportedFeatureDiagnostic(rawMessage) {
  if (rawMessage.includes("Unsupported parameter type")) {
    return {
      severity: "error",
      category: "unsupported",
      title: "Unsupported Type",
      explanation: "The visualizer does not currently support this type.",
      suggestedFix: "Use supported primitives, arrays, collections, trees, graphs, or strings.",
      rawMessage
    };
  }

  if (rawMessage.includes("3D array") || rawMessage.match(/\[\]\[\]\[\]/)) {
    return {
      severity: "error",
      category: "unsupported",
      title: "Multi-Dimensional Arrays Unsupported",
      explanation: "Arrays with more than 2 dimensions (e.g. 3D arrays) are not supported.",
      suggestedFix: "Use 1D or 2D arrays instead.",
      rawMessage
    };
  }

  return null;
};

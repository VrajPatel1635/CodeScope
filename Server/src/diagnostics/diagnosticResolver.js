const resolveInputDiagnostic = require("./inputDiagnostics");
const resolveCompilationDiagnostic = require("./compilationDiagnostics");
const resolveRuntimeDiagnostic = require("./runtimeDiagnostics");
const resolvePlatformDiagnostic = require("./platformDiagnostics");
const resolveUnsupportedFeatureDiagnostic = require("./unsupportedFeatureDiagnostics");

function resolveDiagnostic(rawMessage) {
  if (typeof rawMessage !== "string" || !rawMessage) {
    return null;
  }

  // Chain of responsibility: try each category until one matches
  const diagnostic = 
    resolveInputDiagnostic(rawMessage) ||
    resolveUnsupportedFeatureDiagnostic(rawMessage) ||
    resolveCompilationDiagnostic(rawMessage) ||
    resolveRuntimeDiagnostic(rawMessage) ||
    resolvePlatformDiagnostic(rawMessage);

  if (diagnostic) {
    return diagnostic;
  }

  // Fallback diagnostic if no patterns matched
  return {
    severity: "error",
    category: "unknown",
    title: "Unknown Error",
    explanation: "An unexpected error occurred during execution.",
    suggestedFix: "Review the raw error message for more details.",
    rawMessage
  };
}

module.exports = {
  resolveDiagnostic
};

const { executeJavaCode } = require("../services/executionService");
const { resolveDiagnostic } = require("../diagnostics/diagnosticResolver");

const logger = require("../utils/logger");

exports.executeCode = async (req, res) => {
  try {
    const { code, input } = req.body;

    if (!code) {
      const errorMsg = "No code provided";
      return res.status(400).json({
        success: false,
        diagnostic: resolveDiagnostic(errorMsg),
        rawError: errorMsg
      });
    }

    const result = await executeJavaCode(code, input);

    if (!result.success && result.error) {
      result.diagnostic = resolveDiagnostic(result.error, result.states, code);
      result.rawError = result.error;
      delete result.error; // Remove raw error string to enforce structured diagnostic format
    }

    res.json(result);
  } catch (error) {
    logger.error("Internal execution failure:", error);
    const internalErrorMsg = "Internal server error during execution";
    res.status(500).json({
      success: false,
      diagnostic: resolveDiagnostic(internalErrorMsg),
      rawError: internalErrorMsg
    });
  }
};
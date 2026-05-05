const { executeJavaCode } = require("../services/executionService");

exports.executeCode = async (req, res) => {
  const { code, input } = req.body;

  if (!code) {
    return res.status(400).json({
      success: false,
      error: "No code provided",
    });
  }

  const result = await executeJavaCode(code, input);

  res.json(result);
};
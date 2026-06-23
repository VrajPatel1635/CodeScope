const express = require("express");
const router = express.Router();

const { executeCode } = require("../controllers/executeController");
const logger = require("../utils/logger");

router.post("/execute", (req, res, next) => {
  logger.debug("EXECUTE ROUTE HIT");
  next();
}, executeCode);

module.exports = router;
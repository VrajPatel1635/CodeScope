const express = require("express");
const router = express.Router();

const { executeCode } = require("../controllers/executeController");

router.post("/execute", (req, res, next) => {
  console.log("EXECUTE ROUTE HIT");
  next();
}, executeCode);

module.exports = router;
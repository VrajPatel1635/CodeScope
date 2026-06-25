const express = require("express");
const router = express.Router();
const { spawn } = require("child_process");
const logger = require("../utils/logger");

router.get("/", (req, res) => {
  res.json({ status: "ok" });
});

router.get("/docker", (req, res) => {
  const child = spawn("docker", ["info"]);
  
  child.on("close", (code) => {
    if (code === 0) {
      res.json({ docker: "available" });
    } else {
      res.status(503).json({ docker: "unavailable" });
    }
  });

  child.on("error", (err) => {
    logger.error("Docker health check failed:", err.message);
    res.status(503).json({ docker: "unavailable", error: err.message });
  });
});

module.exports = router;

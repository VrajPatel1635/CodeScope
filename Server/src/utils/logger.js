/**
 * A lightweight internal logger utility for the CodeScope backend.
 * Replaces raw console.log calls to allow for consistent formatting
 * and selective output filtering (e.g. hiding DEBUG logs in production).
 */

const isDebugEnabled = process.env.DEBUG === "true" || process.env.NODE_ENV !== "production";

const logger = {
  info: (...args) => {
    console.log(`[INFO] [${new Date().toISOString()}]`, ...args);
  },
  warn: (...args) => {
    console.warn(`[WARN] [${new Date().toISOString()}]`, ...args);
  },
  error: (...args) => {
    console.error(`[ERROR] [${new Date().toISOString()}]`, ...args);
  },
  debug: (...args) => {
    if (isDebugEnabled) {
      console.log(`[DEBUG] [${new Date().toISOString()}]`, ...args);
    }
  }
};

module.exports = logger;

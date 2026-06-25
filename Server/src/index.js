const express = require("express");
const cors = require("cors");
require("dotenv").config();

const executeRoute = require("./routes/executeRoute");
const healthRoute = require("./routes/healthRoute");
const logger = require("./utils/logger");

const app = express();

// Configure CORS
const allowedOrigins = process.env.CLIENT_URL ? [process.env.CLIENT_URL] : ['http://localhost:3000'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));
app.use(express.json());

app.use((req, res, next) => {
  logger.debug("Incoming:", req.method, req.url);
  next();
});


// Test route
app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

// API route
// FIX: Mounted to '/' instead of '/api' so /execute is directly reachable
app.use("/", executeRoute);

app.use("/health", healthRoute);

// Start server
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info("SERVER STARTED");
  logger.info(`Server running on port ${PORT}`);
});

// PM2 Graceful Shutdown Handling
const gracefulShutdown = (signal) => {
  logger.info(`Received ${signal}, shutting down gracefully...`);
  server.close(() => {
    logger.info('Closed out remaining connections.');
    process.exit(0);
  });
  
  // Force shutdown after 10s
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});
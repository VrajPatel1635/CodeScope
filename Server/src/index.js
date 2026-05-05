const express = require("express");
const cors = require("cors");

const executeRoute = require("./routes/executeRoute");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log("Incoming:", req.method, req.url);
  next();
});


// Test route
app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

// API route
// FIX: Mounted to '/' instead of '/api' so /execute is directly reachable
app.use("/", executeRoute);

// Start server
const PORT = 5000;

app.listen(PORT, () => {
  console.log("SERVER STARTED");
  console.log(`Server running on port ${PORT}`);
});
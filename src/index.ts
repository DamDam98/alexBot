import { query } from "@anthropic-ai/claude-code";
import express from "express";

const app = express();
app.use(express.json());

// Verify Claude Code SDK import works (Step 2 test)
console.log(
  "Claude Code SDK imported successfully:",
  typeof query === "function"
);

// Health check endpoint - Step 1
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "alexbot",
    timestamp: new Date().toISOString(),
    version: "0.1.0",
  });
});

// Existing chat endpoint (currently echoing) - leave unchanged
app.post("/chat", (req, res) => {
  res.json({ echo: req.body });
});

app.listen(3000, () => console.log("Server running on port 3000"));

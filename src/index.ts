import { query } from "@anthropic-ai/claude-code";
import dotenv from "dotenv";
import express from "express";
import asyncHandler from "express-async-handler";

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());

// Verify Claude Code SDK import works (Step 2 test)
console.log(
  "Claude Code SDK imported successfully:",
  typeof query === "function"
);

// Verify API key loaded (Generation 1)
console.log("API key loaded:", !!process.env.ANTHROPIC_API_KEY);

// Test function for Claude SDK (Generation 1)
async function testClaudeSDK() {
  try {
    console.log("Testing Claude SDK...");
    const messages = [];
    for await (const msg of query({
      prompt: "Say hello in 3 words",
      options: { maxTurns: 1 },
    })) {
      messages.push(msg);
    }
    const result = messages.find((m) => m.type === "result");
    const response =
      result && "result" in result ? result.result : "No response";
    console.log("Claude test successful:", response);
    return result;
  } catch (error) {
    console.error("Claude test failed:", error);
    throw error;
  }
}

// Helper function for Claude API call
async function callClaude(message: string) {
  const messages = [];
  for await (const msg of query({
    prompt: message,
    options: { maxTurns: 1 },
  })) {
    messages.push(msg);
  }

  const result = messages.find((m) => m.type === "result");
  return result && "result" in result ? result.result : "No response";
}

// Uncomment next line to test Claude SDK on startup
testClaudeSDK();

// Health check endpoint - Step 1
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "alexbot",
    timestamp: new Date().toISOString(),
    version: "0.1.0",
  });
});

// Chat endpoint with Claude Code SDK - Generation 2 (Updated with asyncHandler)
app.post(
  "/chat",
  asyncHandler(async (req, res) => {
    const { message } = req.body;

    if (!message) {
      res.status(400).json({ error: "Message is required" });
      return;
    }

    console.log("Processing message:", message);

    // Clean async/await syntax - no more .then()/.catch() chains!
    const response = await callClaude(message);
    console.log("Claude response:", response);

    res.json({ response });
  })
);

// Centralized error handling middleware (add AFTER all routes)
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Unhandled error:", err);

    res.status(500).json({
      error: "Internal server error",
      message:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Something went wrong",
    });
  }
);

app.listen(3000, () => console.log("Server running on port 3000"));

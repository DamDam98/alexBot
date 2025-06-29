import { query } from "@anthropic-ai/claude-code";
import dotenv from "dotenv";
import express from "express";
import asyncHandler from "express-async-handler";

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());

// Helper function for Claude API calls
async function callClaude(message: string): Promise<string> {
  console.log(`🤖 Processing message: "${message.substring(0, 50)}..."`);

  const messages = [];

  for await (const msg of query({
    prompt: `You are a helpful AI assistant. Please provide clear, helpful responses.

User question: ${message}`,
    options: {
      maxTurns: 3,
    },
  })) {
    messages.push(msg);
  }

  const result = messages.find((m) => m.type === "result");
  return result && "result" in result ? result.result : "No response available";
}

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "alexbot",
    timestamp: new Date().toISOString(),
    version: "0.1.0",
  });
});

// Chat endpoint
app.post(
  "/chat",
  asyncHandler(async (req, res) => {
    const { message } = req.body;

    if (!message) {
      res.status(400).json({ error: "Message is required" });
      return;
    }

    const response = await callClaude(message);
    res.json({ response });
  })
);

// Error handling middleware
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Server error:", err);
    res.status(500).json({
      error: "Internal server error",
      message:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Something went wrong",
    });
  }
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🤖 Alexbot server running on port ${PORT}`);
  console.log(`📡 Health check: curl -s http://localhost:${PORT}/health`);
});

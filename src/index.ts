import { query } from "@anthropic-ai/claude-code";
import dotenv from "dotenv";
import express from "express";
import asyncHandler from "express-async-handler";

// Load environment variables
dotenv.config();

// Validate MCP environment variables
if (!process.env.GITHUB_TOKEN) {
  console.warn("⚠️ GITHUB_TOKEN not found - GitHub MCP tools will not work");
  console.warn("💡 Set GITHUB_TOKEN in your .env file for full functionality");
} else {
  console.log("✅ GITHUB_TOKEN found - GitHub MCP integration ready");
}

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

// GitHub MCP health check endpoint
app.get(
  "/health/mcp/github",
  asyncHandler(async (req, res) => {
    console.log("🔍 Testing GitHub MCP connection...");

    const health = {
      timestamp: new Date().toISOString(),
      github_token: !!process.env.GITHUB_TOKEN,
      github_api: "unknown",
      mcp_config: false,
      allowed_repos: [] as string[],
      errors: [] as string[],
    };

    // Check if GitHub token exists
    if (!process.env.GITHUB_TOKEN) {
      health.errors.push("GITHUB_TOKEN environment variable not set");
      health.github_api = "unavailable";
      res.status(500).json({ status: "error", ...health });
      return;
    }

    try {
      // Test GitHub API authentication
      const response = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "alexbot/0.1.0",
        },
      });

      if (response.ok) {
        const userData = await response.json();
        health.github_api = "connected";
        console.log(`✅ GitHub API connected as: ${userData.login}`);

        // Test access to senseilyapp repositories
        const reposResponse = await fetch(
          "https://api.github.com/orgs/senseilyapp/repos",
          {
            headers: {
              Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
              Accept: "application/vnd.github.v3+json",
              "User-Agent": "alexbot/0.1.0",
            },
          }
        );

        if (reposResponse.ok) {
          const repos = await reposResponse.json();
          health.allowed_repos = repos.map((repo: any) => repo.full_name);
          console.log(`✅ Found ${repos.length} senseilyapp repositories`);
        } else {
          health.errors.push(
            "Cannot access senseilyapp organization repositories"
          );
        }
      } else {
        health.github_api = "authentication_failed";
        health.errors.push(
          `GitHub API responded with ${response.status}: ${response.statusText}`
        );
      }
    } catch (error) {
      health.github_api = "connection_error";
      health.errors.push(
        `GitHub API connection failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }

    // Check if mcp-config.json exists
    try {
      const fs = await import("fs/promises");
      await fs.access("./mcp-config.json");
      health.mcp_config = true;
      console.log("✅ MCP configuration file found");
    } catch (error) {
      health.errors.push("mcp-config.json file not found or not accessible");
    }

    const status = health.errors.length === 0 ? "ok" : "error";
    const statusCode = status === "ok" ? 200 : 500;

    console.log(
      `🏥 MCP Health Check: ${status} (${health.errors.length} errors)`
    );
    res.status(statusCode).json({ status, ...health });
  })
);

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
  console.log(
    `📡 GitHub MCP health check: curl -s http://localhost:${PORT}/health/mcp/github`
  );
});

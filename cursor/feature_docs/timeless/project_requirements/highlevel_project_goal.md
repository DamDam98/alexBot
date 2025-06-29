## 📝 **Alexbot – Internal Code Q&A Bot for Slack**

---

### **Purpose & Vision**

Alexbot is an on-demand technical product manager for our team. It answers any question about our codebase, architecture, or product logic with ground-truth code citations, all inside Slack.

The goal: bridge the gap between technical and non-technical staff, speed up onboarding, and reduce knowledge bottlenecks.

---

### **Primary Goals**

- Empower non-engineers (PMs, sales, support) to self-serve product and code answers
- Let engineers get deep technical insights—fast—without digging through GitHub
- Reduce repetitive questions and free up dev/PM time
- Build organizational trust in answers by always citing source code

---

### **Core User Experience**

- **Slack-first**: Ask AlexBot anything in a Slack thread; bot replies in-thread with clear answers and live code citations
- **Plain language by default**: Answers are approachable for non-technical users
- **“Dev mode” is natural**: If a user requests “dev mode,” “code,” or uses technical language, the bot provides detailed, code-rich explanations (file paths, code snippets, PR links)
- **No new commands to learn**: Just ask naturally; the bot adapts to how you ask

---

### **Key Technical Decisions (High-Level)**

- **Stack**: Node.js/TypeScript backend (Dockerized, always-on)
- **AI/Agent**: Claude Code SDK (for agentic reasoning, multi-step code exploration)
- **Repo Access**: GitHub MCP (always-live, read-only, no local clones required)
- **Platform**: AWS EC2 (t3.medium, always-on, single container)
- **Slack Integration**: Listens for messages in threads, posts answers as thread replies
- **Security**: All tokens managed via secrets manager; read-only permissions throughout

---

### **Out of Scope (for MVP)**

- No voice/huddle or audio features (future phase)
- No write or edit capabilities; strictly read-only, information-only
- No external access; for internal Slack use only

---

### **Success Metrics**

- Non-engineers self-serve product knowledge, report higher confidence
- Engineers/PMs receive fewer repeat questions and interruptions
- All answers are cited with live code references, boosting trust

---

### **Open Questions / Decisions**

- Which Slack integration method? (Bolt.js SDK, Slack Events API, or other)
- Where/how to handle user session/context if scaling up?
- Will we later migrate to Fargate, Cloud Run, or remain on EC2?
- How will we monitor rate limits for the GitHub MCP API?
- How should we handle bot “personality” and tone configuration for different user types?

---

> Next:
>
> - In-depth tech stack and technology decision writeup
> - Implementation roadmap

diagram:

```markdown
[Slack User]
│
▼
[Slack App / Event API]
│
▼
[Alexbot Backend (EC2, Node.js/TypeScript, Docker)]
│
├─────────────► [Claude Code SDK (Agentic Reasoning)]
│ │
│ ├──► [GitHub MCP (Live Code Access)]
│ │
│ └──► [Web Search MCP (External Docs, Best Practices)]
│
▼
[Slack Thread Reply (with citations, code, or web sources)]
```

## **Alexbot Stack: Decisions So Far**

---

### **Decisions Made**

- **Deployment Platform:**
  - **AWS EC2 (t3.medium, always-on)**
  - Simple, low-cost, single Docker container for all logic
- **Containerization:**
  - **Dockerized Node.js app** (TypeScript)
- **AI/Agent:**
  - **Claude Code SDK** (Anthropic) for agentic reasoning and multi-step code navigation
  - **Agent is stateless and all compute happens externally** (no local models)
- **Repo Access:**
  - **GitHub MCP (Model Context Protocol)**
  - No local code clone needed; always-live, read-only, and up-to-date
- **Slack Integration:**
  - Slack bot (receives Events API/webhooks, posts replies in threads)
  - Message threading used for context/scoping sessions
- **Modes:**
  - **Default:** Plain-language answers for non-technical users
  - **Dev Mode:** If user requests or signals (“give me code,” “dev mode”), bot delivers technical, code-heavy, file-path answers
- **Web Search:**
  - **Web Search Tool** added as a new agent tool
  - For technical lookups, external docs, or industry research (integrates a search API—decision on which one is open)
- **Security:**
  - All tokens/credentials managed via AWS Secrets Manager
  - Read-only permissions everywhere

---

### **Open Questions & Decisions To Make**

- **Slack Bot Framework:**
  - Bolt.js SDK (most popular), or raw Slack Events API, or another Node Slack SDK?
  - (Bolt.js recommended for rapid prototyping and event handling)
    - tbd
- **Web Search API Provider:**
  - Bing Search, SerpAPI, Google Programmable Search, Brave, or other?
  - (Evaluate based on cost, quota, reliability, and citation clarity)
    - answer: use claude code’s native web search
- **Hosting Platform (Long-term):**
  - Stick with EC2, or eventually migrate to Fargate, Cloud Run, or other managed/container-native options?
  - (For now, EC2 is fine—no API Gateway or LB needed)
    - answer: ec2 is fine until problems emerge and an upgrade is neccessary
      - or we want to add voice, then single session per container with fargate would be ideal
- **Session/Context Storage (if scaling up):**
  - For MVP, stateless and use Slack thread_ts as session context
  - If you want analytics, admin dashboard, or multi-instance, consider adding Redis or DynamoDB later
    - answer: stateless for now
- **Monitoring/Logging:**
  - CloudWatch for logs?
  - Any error alerting, or will basic logs suffice?
    - answer: maybe cloud watch for logs
- **Bot Personality/Tone:**
  - How much “voice” do you want to inject, and will it vary by user or channel?
    - answer: same alex bot, dev mode will answer much more technically with code lines
    - ultimately should be like having cursor in slack, manageable for any team member to ask questions of how things work - chat with your codebase (or a tpm who studies it) in slack
- **API Rate Limits:**
  - Monitor both GitHub MCP and chosen web search API usage; plan for backup/fallback if needed
    - answer: ehh should be fine in the early days
      - should research the limits to learn more

step 1: claude code in docker

## **First Work Chunk: Step-by-Step**

---

### **1. Set Up Docker**

- **Goal:** Have a local container that boots your Node.js environment.
- **Tasks:**
  - Create a `Dockerfile` (Node.js LTS, copy project files, set up workdir, install deps, expose port)
  - Add a `.dockerignore` to keep the image small
  - Write a basic `package.json` (if not already)
  - Build and run: `docker build -t alexbot .` then `docker run -p 3000:3000 alexbot`

---

### **2. Scaffold Express Server**

- **Goal:** Listen for HTTP requests (test locally with Postman/curl)
- **Tasks:**
  - `npm install express`
  - Write a simple `server.js` (or `index.ts` if TypeScript)
  - Expose a POST endpoint (e.g., `/ask`)
  - Run the server in Docker, confirm you can hit it from Postman

---

### **3. Echo Back the Request**

- **Goal:** Confirm your backend is connected and working
- **Tasks:**
  - In `/ask` handler, just respond with `res.json(req.body)`
  - Test with Postman/curl—see your request echoed back
  - This step validates Docker networking, Node, Express, and your dev workflow

---

### **4. Integrate Claude Code SDK**

- **Goal:** Send real queries to Claude Code and return the response
- **Tasks:**
  - `npm install @anthropic-ai/claude-code` (or whatever the latest package is)
  - Add your API key as a secret/environment variable
  - In `/ask`, call the SDK with a test prompt (e.g., `How do we handle logins in our app?`)
  - Return the Claude response in your API reply

---

### **5. Test Concurrency**

- **Goal:** Ensure your backend/Claude SDK can handle multiple simultaneous requests
- **Tasks:**
  - Write a quick test script or use Postman’s “runner” to send 3–5 concurrent `/ask` requests
  - Confirm all get responses (no blocking, timeouts, or overlaps)
  - Add some simple logging for request/response timing

---

### **6. Add Web Search & GitHub MCP Integration**

- **Goal:** Expand Claude’s tool set for richer, code-based and web-based answers
- **Tasks:**
  - Enable Claude’s native web search tool in your SDK config
  - Connect the GitHub MCP tool (add API key, repo link as needed)
  - Test sample prompts that require both code lookup and web search

---

### **7. Deliver the First “Solid Chunk”**

- **Goal:** Have a Dockerized API backend that:
  - Accepts HTTP requests
  - Handles concurrent requests
  - Returns answers from Claude, with web and code search as needed

---

### **Example Directory Structure**

```
lua
CopyEdit
/alexbot
  |-- Dockerfile
  |-- .dockerignore
  |-- package.json
  |-- index.ts (or server.js)
  |-- /src

```

---

### **Exit Criteria**

- Can build/run Docker container locally
- Can POST to `/ask` and get a response from Claude (and tools, once enabled)
- Can handle multiple simultaneous requests without blocking or errors

## 🚀 **Alexbot Roadmap: General Progression**

---

### **1. Local Core API Development**

- [ ] Set up Dockerized Node.js/Express backend - typescript
- [ ] Echo HTTP requests for basic testing
- [ ] Integrate Claude Code SDK (handle single & concurrent requests)
- [ ] Add web search and GitHub MCP tools

---

### **2. Slack Integration (PoC)**

- [ ] Build minimal Slack bot (reply to DMs or thread posts)
- [ ] Connect to local backend (handle simple “ask/respond” flow)
- [ ] Test end-to-end: Slack ➔ API ➔ Claude ➔ Slack

---

### **3. Hosting (PoC)**

- [ ] Deploy Docker container to EC2 (or other target infra)
- [ ] Expose HTTP(S) endpoint for Slack (publicly reachable, SSL)
- [ ] Ensure persistence and reliability

---

### **4. Product Polish & Integration Lifecycle**

- [ ] Refine prompts and response style (“dev mode,” citations, etc.)
- [ ] Enable seamless Slack channel integration (multi-channel, threading)
- [ ] Establish error logging/monitoring
- [ ] Document full setup and onboarding process
- [ ] Prepare for future enhancements (scaling, voice, analytics)

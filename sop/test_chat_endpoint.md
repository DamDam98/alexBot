# Test Chat Endpoint - SOP

## Chat Endpoint Testing Guide

### Basic Endpoint Information

- **URL**: `POST http://localhost:3000/chat`
- **Content-Type**: `application/json`
- **Body**: `{"message": "your question here"}`

## Test Commands

### 1. Basic Functionality Test

```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, can you help me?"}'
```

**Expected Response:**

```json
{
  "response": "Hello! I'd be happy to help you. I can answer questions about the senseilyapp codebase using GitHub tools when helpful. What would you like to know?"
}
```

### 2. GitHub MCP - Repository Information

```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What repositories are in the senseilyapp organization?"}'
```

### 3. GitHub MCP - Code Search

```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Search for authentication code in the lms repository"}'
```

### 4. GitHub MCP - Recent Activity

```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Show me recent commits in the cognition repository"}'
```

### 5. GitHub MCP - Issues and PRs

```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Are there any open issues in the pete-presentation-editor repository?"}'
```

## Expected Behaviors

### ✅ Successful MCP Integration

- Responses reference specific files, commits, or repository information
- Claude uses GitHub tools to provide accurate, current information
- Responses are scoped to senseilyapp organization only

### ❌ Error Scenarios

#### Missing Message

```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Expected**: `{"error": "Message is required"}`

#### Server Error

If GitHub token is invalid or MCP configuration is broken:
**Expected**: `{"error": "Internal server error"}`

## Troubleshooting

### 1. No GitHub Information

If responses don't include GitHub data:

- Check `GITHUB_TOKEN` in `.env` file
- Verify token has access to senseilyapp organization
- Check server logs for MCP errors

### 2. Permission Errors

If getting access denied errors:

- Run `sop/test_github_token_security.md` tests
- Verify token permissions in GitHub settings

### 3. Server Not Responding

```bash
# Check if server is running
curl http://localhost:3000/health
```

## Development Workflow

### Quick Test Loop

```bash
# 1. Start server
npm run dev

# 2. Basic test (new terminal)
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What repos do we have?"}'

# 3. Check logs in first terminal for MCP activity
```

### Debug Mode

Check server logs for:

- MCP server connections
- GitHub API calls
- Token authentication status
- Error messages

# GitHub Personal Access Token Setup SOP - Alexbot

> **Purpose**: Create read-only GitHub token for alexbot Q&A system with access to senseilyapp organization

## Token Configuration Summary

**Token Name**: `alexbot-senseilyapp-readonly`  
**Expiration**: 3 months (rotate September 27, 2025)  
**Scope**: senseilyapp organization only  
**Access Level**: Read-only across all permissions

## Step-by-Step Setup

### 1. Navigate to GitHub Token Creation

```
https://github.com/settings/personal-access-tokens/new
```

- Choose **"Fine-grained personal access token"** (NOT Classic)

### 2. Basic Configuration

- **Token name**: `alexbot-senseilyapp-readonly`
- **Expiration**: 90 days (3 months)
- **Description**: `Read-only access for alexbot Q&A system - senseilyapp org only`

### 3. Resource Owner Selection

- **Resource owner**: `senseilyapp` (organization)
- **Repository access**: "All repositories" within the organization

### 4. Repository Permissions (Read-only)

Enable exactly these **10 repository permissions** (all Read-only):

```
✅ Actions: Read-only
✅ Administration: Read-only
✅ Contents: Read-only
✅ Deployments: Read-only
✅ Discussions: Read-only
✅ Issues: Read-only
✅ Metadata: Read-only
✅ Pull requests: Read-only
✅ Repository security advisories: Read-only
✅ Commit statuses: Read-only
```

### 5. Organization Permissions (Read-only)

Enable exactly these **3 organization permissions** (all Read-only):

```
✅ Members: Read-only
✅ Projects: Read-only
✅ Team discussions: Read-only
```

### 6. Security Verification

**❌ DO NOT ENABLE** (Confirm these are disabled):

```
❌ Secrets: Any access
❌ Any Write permissions
❌ Any Admin permissions beyond read-only
❌ Personal account access
```

## Token Capabilities

With this configuration, alexbot can:

### **Code & Repository Analysis**

- Read file contents and repository structure
- Search code across all senseilyapp repositories
- Access commit history and branch information
- View deployment status and CI/CD results

### **Issue & Project Management**

- Read issues, comments, and their status
- Access pull request details, reviews, and diffs
- View GitHub Projects and team discussions
- Understand project management workflows

### **Security & Operations**

- Monitor security advisories and alerts
- Check build/test statuses from Actions
- Review deployment history and status
- Access repository administration settings (read-only)

### **Team Context**

- View organization members (public info)
- Access team discussions and org-level conversations
- Understand team structure and responsibilities

## Token Storage & Security

### Environment Setup

```bash
# Add to .env file (never commit this file)
echo "GITHUB_TOKEN=ghp_your_actual_token_here" >> .env

# Verify .env is in .gitignore
grep -q "\.env" .gitignore || echo ".env" >> .gitignore
```

### Verification Commands

```bash
# Test 1: Verify token works
curl -H "Authorization: Bearer $GITHUB_TOKEN" \
  https://api.github.com/user

# Test 2: Verify organization access (should work)
curl -H "Authorization: Bearer $GITHUB_TOKEN" \
  https://api.github.com/orgs/senseilyapp/repos

# Test 3: Verify scope limitation (should fail/be empty)
curl -H "Authorization: Bearer $GITHUB_TOKEN" \
  https://api.github.com/user/repos
```

## Token Rotation Schedule

### Expiration Tracking

- **Current expiration**: September 27, 2025
- **Renewal reminder**: Set calendar reminder for September 20, 2025
- **Rotation frequency**: Every 6 months

### Rotation Process

1. Create new token with identical permissions
2. Test new token with verification commands
3. Update `.env` file with new token
4. Restart alexbot service
5. Revoke old token in GitHub settings
6. Update expiration date in this SOP

## Troubleshooting

### Common Issues

**"Resource owner not found"**

- Verify you're a member of senseilyapp organization
- Check organization permissions allow fine-grained tokens

**"Insufficient permissions" during API calls**

- Verify specific permission is enabled (Contents: Read, Issues: Read, etc.)
- Check token hasn't expired

**Token works but accesses wrong repositories**

- Confirm Resource Owner is `senseilyapp`, not personal account
- Verify Repository access is set to organization repositories

### Security Incident Response

If token is compromised:

1. **Immediately revoke** in GitHub settings: https://github.com/settings/personal-access-tokens
2. **Generate new token** with identical permissions following this SOP
3. **Update `.env` file** with new token
4. **Restart alexbot** server: `npm run dev`
5. **Document incident** and review access logs

## Integration with Alexbot

### MCP Configuration

This token enables GitHub MCP integration in `mcp-config.json`:

```json
{
  "mcpServers": {
    "github": {
      "url": "https://api.githubcopilot.com/mcp/",
      "authorization_token": "Bearer ${GITHUB_TOKEN}"
    }
  }
}
```

### Expected Q&A Capabilities

- "How does authentication work in our app?"
- "What are the recent open issues?"
- "Show me the main API routes file"
- "What's the status of the latest deployment?"
- "Are there any security alerts we should know about?"

---

**Last Updated**: January 2025  
**Next Review**: September 2025 (before token expiration)

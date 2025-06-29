# Test GitHub Token - SOP

## Quick GitHub Token Validation

### Basic Test Commands

```bash
# Load token from .env file
source .env

# Test 1: Basic authentication
curl -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "User-Agent: alexbot-test" \
  https://api.github.com/user
```

### Organization Access Test

```bash
# Test 2: senseilyapp organization access (should work)
curl -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "User-Agent: alexbot-test" \
  https://api.github.com/orgs/senseilyapp/repos
```

### Scope Limitation Test

```bash
# Test 3: Personal repos access (should fail/be empty)
curl -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "User-Agent: alexbot-test" \
  https://api.github.com/user/repos
```

## Expected Responses

### ✅ Valid Token (Test 1)

```json
{
  "login": "your-username",
  "id": 12345,
  "node_id": "MDQ6VXNlcjEyMzQ1",
  "avatar_url": "https://avatars.githubusercontent.com/u/12345?v=4",
  "type": "User",
  "name": "Your Name",
  "company": "senseilyapp"
}
```

### ✅ Organization Access (Test 2)

```json
[
  {
    "id": 123456,
    "name": "repo-name",
    "full_name": "senseilyapp/repo-name",
    "private": true,
    "owner": {
      "login": "senseilyapp",
      "type": "Organization"
    }
  }
]
```

### ✅ Scope Limitation (Test 3)

```json
[
  {
    "id": 123456,
    "name": "senseilyapp-repo",
    "full_name": "senseilyapp/senseilyapp-repo",
    "private": true,
    "owner": {
      "login": "senseilyapp",
      "type": "Organization"
    }
  }
]
```

_Returns only senseilyapp repositories - confirms token is properly scoped to organization only_

### ❌ Invalid Token

```json
{
  "message": "Bad credentials",
  "documentation_url": "https://docs.github.com/rest"
}
```

### ❌ Expired Token

```json
{
  "message": "Token expired. Please regenerate a new token.",
  "documentation_url": "https://docs.github.com/rest"
}
```

### ❌ Insufficient Permissions

```json
{
  "message": "Not Found",
  "documentation_url": "https://docs.github.com/rest"
}
```

## Quick Status Check

**Token Status:** Look for these indicators:

- ✅ `"login": "username"` = Token works, authenticated
- ✅ Organization repos returned = Proper scope
- ✅ Only senseilyapp repos returned = Security boundary working
- ❌ `"Bad credentials"` = Invalid token
- ❌ `"Token expired"` = Needs rotation
- ❌ `"Not Found"` = Insufficient permissions

## When to Use

- **Before MCP integration** - Verify token works
- **After token rotation** - Test new tokens (September 2025)
- **Debugging GitHub MCP issues** - Isolate token vs configuration problems
- **Security audits** - Verify scope limitations

## Notes

- Uses read-only API calls only
- Tests organization scope boundary
- Safe to run multiple times
- No API rate limit concerns for basic testing
- Token expires September 27, 2025

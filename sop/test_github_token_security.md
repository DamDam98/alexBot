# GitHub Token Security Boundary Test - SOP

> **Purpose**: Verify that alexbot's GitHub token cannot access personal repositories or other organizations

## Security Test Commands

### Test 1: Try to Access Personal Repositories Directly

```bash
# Load token from .env file
source .env

# Try to access your personal repos (should fail or be very limited)
curl -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "User-Agent: alexbot-security-test" \
  "https://api.github.com/users/$(curl -s -H "Authorization: Bearer $GITHUB_TOKEN" https://api.github.com/user | grep -o '"login": "[^"]*"' | cut -d'"' -f4)/repos"
```

### Test 2: Try to Access a Specific Personal Repository

```bash
# Replace YOUR_USERNAME with your actual GitHub username
# Replace PERSONAL_REPO with a repository you own personally (not in senseilyapp)

curl -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "User-Agent: alexbot-security-test" \
  https://api.github.com/repos/YOUR_USERNAME/PERSONAL_REPO
```

### Test 3: Try to Access Another Organization

```bash
# Try to access a different organization (should fail)
# Replace OTHER_ORG with any organization you're NOT giving access to

curl -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "User-Agent: alexbot-security-test" \
  https://api.github.com/orgs/OTHER_ORG/repos
```

### Test 4: Check User's Repository List Scope

```bash
# This should only return senseilyapp repos, not personal ones
curl -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "User-Agent: alexbot-security-test" \
  https://api.github.com/user/repos | grep -o '"full_name": "[^"]*"'
```

## Expected Security Results

### ✅ Test 1: Personal Repos Access (Should Fail)

**Expected Response:**

```json
{
  "message": "Not Found",
  "documentation_url": "https://docs.github.com/rest"
}
```

OR

```json
[]
```

### ✅ Test 2: Specific Personal Repo (Should Fail)

**Expected Response:**

```json
{
  "message": "Not Found",
  "documentation_url": "https://docs.github.com/rest/repos/repos#get-a-repository"
}
```

### ✅ Test 3: Other Organization (Should Fail)

**Expected Response:**

```json
{
  "message": "Not Found",
  "documentation_url": "https://docs.github.com/rest"
}
```

### ✅ Test 4: User Repos Scope (Should Only Show senseilyapp)

**Expected Response:**

```
"full_name": "senseilyapp/repo1"
"full_name": "senseilyapp/repo2"
"full_name": "senseilyapp/repo3"
```

_Should ONLY contain senseilyapp/_ repositories\*

## ❌ Security Violations (If You See These)

### 🚨 Personal Repository Access

If Test 1 or 2 returns actual repository data:

```json
{
  "id": 123456,
  "name": "my-personal-repo",
  "full_name": "YOUR_USERNAME/my-personal-repo",
  "private": true,
  "owner": {
    "login": "YOUR_USERNAME",
    "type": "User"
  }
}
```

**This is a security violation - token has too broad access!**

### 🚨 Other Organization Access

If Test 3 returns repository data from other organizations:

```json
[
  {
    "full_name": "other-org/some-repo",
    "owner": {
      "login": "other-org",
      "type": "Organization"
    }
  }
]
```

**This is a security violation - token scope is too broad!**

### 🚨 Mixed Repository Access

If Test 4 returns repositories from multiple organizations or personal repos:

```
"full_name": "YOUR_USERNAME/personal-repo"
"full_name": "other-org/some-repo"
"full_name": "senseilyapp/allowed-repo"
```

**This is a security violation - token is not properly scoped!**

## Security Violation Response

If any test shows a security violation:

### 1. Immediate Action

```bash
# Revoke the token immediately
# Go to: https://github.com/settings/personal-access-tokens
# Find: alexbot-senseilyapp-readonly
# Click: Delete
```

### 2. Recreate Token

Follow the exact process in `sop/github_token_setup.md` with special attention to:

- **Resource owner**: Must be `senseilyapp` organization
- **Repository access**: Must be "All repositories" within senseilyapp ONLY

### 3. Retest

Run all security tests again to confirm proper scope limitation.

## When to Run Security Tests

- **Before MCP integration** - Verify security boundaries
- **After token rotation** - Confirm new token is properly scoped
- **During security audits** - Regular compliance checks
- **If suspicious activity** - Verify token hasn't been compromised
- **Before production deployment** - Final security validation

## Notes

- All tests should return "Not Found" or empty results for non-senseilyapp access
- Only senseilyapp repositories should be accessible
- Any broader access indicates a security misconfiguration
- These tests are safe to run - they're all read-only operations

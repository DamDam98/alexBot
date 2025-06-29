# Test Anthropic API Key - SOP

## Quick API Key Validation

### Basic Test Command

```bash
curl https://api.anthropic.com/v1/messages \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY_HERE" \
  -H "anthropic-version: 2023-06-01" \
  -d '{
    "model": "claude-3-haiku-20240307",
    "max_tokens": 10,
    "messages": [{"role": "user", "content": "Hi"}]
  }'
```

**Replace `YOUR_API_KEY_HERE` with your actual API key**

### Alternative - List Models (Lighter Test)

```bash
curl https://api.anthropic.com/v1/models \
  -H "x-api-key: YOUR_API_KEY_HERE" \
  -H "anthropic-version: 2023-06-01"
```

## Expected Responses

### ✅ Valid Key

```json
{
  "id": "msg_abc123...",
  "content": [{"type": "text", "text": "Hi there! How can I assist you today?"}],
  "model": "claude-3-haiku-20240307",
  "stop_reason": "max_tokens",
  "usage": {"input_tokens": 8, "output_tokens": 10, ...}
}
```

### ❌ Invalid Key

```json
{
  "type": "error",
  "error": {
    "type": "authentication_error",
    "message": "invalid x-api-key"
  }
}
```

### ❌ No Credits/Quota Exceeded

```json
{
  "type": "error",
  "error": {
    "type": "rate_limit_error",
    "message": "Your credit balance is too low to access the Anthropic API"
  }
}
```

### ❌ Usage Limit Exceeded

```json
{
  "type": "error",
  "error": {
    "type": "rate_limit_error",
    "message": "Number of requests per minute exceeded"
  }
}
```

## Quick Status Check

**Key Status:** Look for these indicators:

- ✅ `"id": "msg_..."` = Key works, API responding
- ✅ `"usage": {...}` = Token consumption tracking
- ❌ `"authentication_error"` = Invalid key
- ❌ `"rate_limit_error"` = Quota/limit issues

## When to Use

- **Before starting development** - Verify key works
- **After key rotation** - Test new keys
- **Debugging API issues** - Isolate key vs code problems
- **Checking quota status** - Monitor usage limits

## Notes

- Uses cheapest model (Haiku) for cost efficiency
- 10 token limit keeps test costs minimal (~$0.0001)
- Returns immediately, no waiting
- Safe to run multiple times

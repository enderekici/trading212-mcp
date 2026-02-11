# Environment Configuration Guide

This guide explains the `TRADING212_ENVIRONMENT` variable and how to use demo vs live environments.

---

## Overview

Trading 212 provides two separate environments for API access:

1. **Demo Environment** - Paper trading (no real money)
2. **Live Environment** - Real money trading

The `TRADING212_ENVIRONMENT` variable controls which environment the MCP server connects to.

---

## Valid Values

### `demo` (Default)

Paper trading environment for testing and development.

**Configuration:**
```bash
TRADING212_ENVIRONMENT=demo
```

**Details:**
- **API Base URL**: `https://demo.trading212.com/api/v0`
- **Trading Mode**: Simulated/paper trading
- **Money**: Virtual funds (not real money)
- **API Key Source**: Demo account in Trading 212 app
- **Account Type**: Demo account
- **Risk**: Zero (cannot lose real money)
- **Use Cases**:
  - Testing the MCP server
  - Learning Trading 212 API
  - Developing strategies
  - Training AI agents
  - Demonstrating features

**When to Use:**
- ✅ First time setup
- ✅ Testing new features
- ✅ Developing trading bots
- ✅ Learning the API
- ✅ Before going live

**Safety:** ✅ **Safe** - Uses virtual money, no real financial risk

---

### `live`

Real money trading environment for production use.

**Configuration:**
```bash
TRADING212_ENVIRONMENT=live
```

**Details:**
- **API Base URL**: `https://live.trading212.com/api/v0`
- **Trading Mode**: Real money trading
- **Money**: Real funds from your bank account
- **API Key Source**: Live or ISA account in Trading 212 app
- **Account Type**: Invest or ISA account
- **Risk**: High (can lose real money)
- **Use Cases**:
  - Production trading
  - Real investment management
  - Actual portfolio tracking
  - Live order execution

**When to Use:**
- ⚠️ After thorough testing in demo
- ⚠️ When you understand the risks
- ⚠️ With proper safeguards in place
- ⚠️ Only with funds you can afford to risk

**Safety:** ⚠️ **Use with extreme caution** - Uses real money, real financial risk

---

## API Key Requirements

### Critical Requirement: Environment-Specific Keys

⚠️ **Your API key is tied to ONE environment only**

You **CANNOT** interchange API keys between environments:

| API Key Type | Works with `demo` | Works with `live` |
|--------------|-------------------|-------------------|
| **Demo key** | ✅ Yes | ❌ No |
| **Live key** | ❌ No | ✅ Yes |

**Example of incorrect configuration:**
```bash
# ❌ WRONG - Demo key with live environment
TRADING212_API_KEY=demo_key_abc123
TRADING212_ENVIRONMENT=live  # Will fail with 401 Unauthorized
```

**Correct configurations:**
```bash
# ✅ Correct - Demo key with demo environment
TRADING212_API_KEY=demo_key_abc123
TRADING212_ENVIRONMENT=demo

# ✅ Correct - Live key with live environment
TRADING212_API_KEY=live_key_xyz789
TRADING212_ENVIRONMENT=live
```

---

## Getting API Keys

### For Demo Environment

1. Open Trading 212 app
2. Switch to **Demo Account** (top-left account switcher)
3. Go to **Settings** → **API (Beta)**
4. Click **Generate API Key**
5. Enable permissions
6. Copy the API key
7. Use with `TRADING212_ENVIRONMENT=demo`

### For Live Environment

1. Open Trading 212 app
2. Switch to **Live Account** or **ISA Account**
3. Go to **Settings** → **API (Beta)**
4. Click **Generate API Key**
5. Enable permissions
6. Copy the API key
7. Use with `TRADING212_ENVIRONMENT=live`

---

## Configuration Examples

### Local Development (.env file)

**Demo Configuration:**
```bash
# .env
TRADING212_API_KEY=demo_key_from_trading212_app
TRADING212_ENVIRONMENT=demo
```

**Live Configuration:**
```bash
# .env
TRADING212_API_KEY=live_key_from_trading212_app
TRADING212_ENVIRONMENT=live
```

---

### Claude Desktop

**Demo Setup:**
```json
{
  "mcpServers": {
    "trading212-demo": {
      "command": "trading212-mcp",
      "env": {
        "TRADING212_API_KEY": "demo_key_here",
        "TRADING212_ENVIRONMENT": "demo"
      }
    }
  }
}
```

**Live Setup:**
```json
{
  "mcpServers": {
    "trading212-live": {
      "command": "trading212-mcp",
      "env": {
        "TRADING212_API_KEY": "live_key_here",
        "TRADING212_ENVIRONMENT": "live"
      }
    }
  }
}
```

**Both Environments (Recommended):**
```json
{
  "mcpServers": {
    "trading212-demo": {
      "command": "trading212-mcp",
      "env": {
        "TRADING212_API_KEY": "demo_key_here",
        "TRADING212_ENVIRONMENT": "demo"
      }
    },
    "trading212-live": {
      "command": "trading212-mcp",
      "env": {
        "TRADING212_API_KEY": "live_key_here",
        "TRADING212_ENVIRONMENT": "live"
      }
    }
  }
}
```

This configuration gives you access to both environments simultaneously, allowing you to test in demo before executing in live.

---

### Docker

**Demo Container:**
```bash
docker run --rm -i \
  -e TRADING212_API_KEY=demo_key_here \
  -e TRADING212_ENVIRONMENT=demo \
  trading212-mcp:latest
```

**Live Container:**
```bash
docker run --rm -i \
  -e TRADING212_API_KEY=live_key_here \
  -e TRADING212_ENVIRONMENT=live \
  trading212-mcp:latest
```

---

### Docker Compose

```yaml
version: '3.8'

services:
  trading212-mcp-demo:
    image: trading212-mcp:latest
    container_name: trading212-mcp-demo
    environment:
      - TRADING212_API_KEY=${DEMO_API_KEY}
      - TRADING212_ENVIRONMENT=demo
    restart: unless-stopped

  trading212-mcp-live:
    image: trading212-mcp:latest
    container_name: trading212-mcp-live
    environment:
      - TRADING212_API_KEY=${LIVE_API_KEY}
      - TRADING212_ENVIRONMENT=live
    restart: unless-stopped
```

With `.env` file:
```bash
DEMO_API_KEY=demo_key_from_trading212
LIVE_API_KEY=live_key_from_trading212
```

---

## Default Behavior

If you **don't specify** `TRADING212_ENVIRONMENT`, it defaults to `demo` for safety:

```typescript
const ENVIRONMENT = process.env.TRADING212_ENVIRONMENT || 'demo';
```

This prevents accidentally trading real money if you forget to set the environment variable.

**Examples:**

```bash
# Only API key set - defaults to demo
TRADING212_API_KEY=some_key
# Result: Uses demo environment

# Explicitly set to demo
TRADING212_API_KEY=demo_key
TRADING212_ENVIRONMENT=demo
# Result: Uses demo environment

# Explicitly set to live
TRADING212_API_KEY=live_key
TRADING212_ENVIRONMENT=live
# Result: Uses live environment
```

---

## Testing Your Configuration

### Verify Environment

After starting the MCP server, you can verify which environment it's connected to by checking the base URL in logs or testing with a simple query.

**Check via logs:**
```bash
# Local
trading212-mcp 2>&1 | grep "Trading 212 MCP server"

# Docker
docker logs trading212-mcp | grep environment
```

**Test with Claude:**
```
User: "Get my account information"

Claude will show:
- Demo environment: Virtual account with paper trading
- Live environment: Real account with actual funds
```

---

## Common Errors

### Error: "401 Unauthorized"

**Cause:** API key doesn't match the environment

**Solutions:**
```bash
# Check your key/environment match
# Demo key must use demo environment
TRADING212_API_KEY=demo_key_abc
TRADING212_ENVIRONMENT=demo  # ✅ Correct

# Live key must use live environment
TRADING212_API_KEY=live_key_xyz
TRADING212_ENVIRONMENT=live  # ✅ Correct
```

### Error: "Invalid environment value"

**Cause:** Typo in environment variable

**Valid values:**
- `demo` ✅
- `live` ✅
- `Demo` ❌ (case-sensitive)
- `DEMO` ❌ (case-sensitive)
- `staging` ❌ (doesn't exist)
- `test` ❌ (doesn't exist)

---

## Best Practices

### 1. Always Test in Demo First

```bash
# Step 1: Test in demo
TRADING212_ENVIRONMENT=demo

# Step 2: Verify everything works

# Step 3: Switch to live (if needed)
TRADING212_ENVIRONMENT=live
```

### 2. Use Environment-Specific Key Names

```bash
# .env file
TRADING212_DEMO_KEY=demo_key_here
TRADING212_LIVE_KEY=live_key_here

# Then in config
TRADING212_API_KEY=${TRADING212_DEMO_KEY}  # For demo
TRADING212_API_KEY=${TRADING212_LIVE_KEY}  # For live
```

### 3. Keep Keys Separate

**Don't:**
```bash
# ❌ Same key variable for both environments
TRADING212_API_KEY=some_key
```

**Do:**
```bash
# ✅ Separate variables
DEMO_API_KEY=demo_key
LIVE_API_KEY=live_key
```

### 4. Use Both Environments in Claude

Configure both in Claude Desktop to easily switch:

```json
{
  "mcpServers": {
    "t212-demo": { "env": { "TRADING212_ENVIRONMENT": "demo", ... } },
    "t212-live": { "env": { "TRADING212_ENVIRONMENT": "live", ... } }
  }
}
```

Then specify in Claude: "Using demo environment, show my portfolio"

### 5. Document Which Environment You're Using

Always be explicit:

```bash
# Good commit message
"Test portfolio analytics in demo environment"

# Good documentation
"This feature tested with TRADING212_ENVIRONMENT=demo"
```

---

## Security Considerations

### API Key Storage

**Never:**
- ❌ Commit API keys to Git
- ❌ Share keys in chat/email
- ❌ Use live keys for testing
- ❌ Store keys in code files

**Always:**
- ✅ Use environment variables
- ✅ Use `.env` files (gitignored)
- ✅ Use secrets management in production
- ✅ Rotate keys regularly

### Environment Isolation

**Recommendation:** Use completely separate API keys for demo and live:

```bash
# Demo key - Limited risk
DEMO_API_KEY=demo_key_with_all_permissions

# Live key - Restricted permissions
LIVE_API_KEY=live_key_with_read_only_permissions
```

For live environments, consider:
- Read-only permissions initially
- IP address whitelisting
- Separate keys per application
- Regular key rotation

---

## Troubleshooting

### "How do I know which environment I'm using?"

Check logs or test with Claude:
```
User: "Am I using demo or live environment?"
Claude: [Checks account info] "You're using the demo environment"
```

### "Can I switch environments without restarting?"

No, you need to restart the MCP server with the new environment variable.

### "I have both keys, which should I use?"

**For testing, development, learning:** Use demo key + `demo` environment

**For real trading:** Use live key + `live` environment

---

## Summary

| Aspect | Demo | Live |
|--------|------|------|
| **Money** | Virtual | Real |
| **Risk** | None | High |
| **API Key** | From demo account | From live/ISA account |
| **Base URL** | `demo.trading212.com` | `live.trading212.com` |
| **Default** | ✅ Yes | No |
| **Testing** | ✅ Recommended | ⚠️ Not recommended |
| **Production** | ❌ No | ✅ Yes |

**Key Takeaway:** Always use `demo` for testing, only use `live` when ready for real trading with proper safeguards in place.

---

## Additional Resources

- [Trading 212 API Documentation](https://docs.trading212.com/api)
- [README.md](./README.md) - Main documentation
- [QUICKSTART.md](./QUICKSTART.md) - Setup guide
- [DOCKER.md](./DOCKER.md) - Docker deployment

---

**Questions?** Open an issue on GitHub or check the FAQ in README.md.

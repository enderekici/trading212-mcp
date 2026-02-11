# Quick Start Guide

Get your Trading 212 MCP server up and running in 5 minutes!

Choose your preferred setup method: **Docker** (easiest), **npm install** (fastest), or **local build** (for development).

---

## Step 1: Get Your API Key

1. Open Trading 212 app (mobile or web)
2. Go to **Settings** → **API (Beta)**
3. Click **Generate API Key**
4. Enable these permissions:
   - ✅ Account data (read)
   - ✅ History (read)
   - ✅ Orders (read/write)
   - ✅ Portfolio (read)
5. Copy your API key

---

## Step 2: Choose Your Setup Method

### 🐳 Method A: Docker (Recommended - No Node.js Required!)

**Step 1:** Pull the image

```bash
docker pull ghcr.io/enderekici/trading212-mcp:latest
```

Or build locally:

```bash
git clone https://github.com/enderekici/trading212-mcp.git
cd trading212-mcp
docker build -t trading212-mcp:latest .
```

**Step 2:** Configure Claude Desktop

Edit:
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "trading212": {
      "command": "docker",
      "args": [
        "run",
        "--rm",
        "-i",
        "--name", "trading212-mcp-claude",
        "-e", "TRADING212_API_KEY=your_api_key_here",
        "-e", "TRADING212_ENVIRONMENT=demo",
        "trading212-mcp:latest"
      ]
    }
  }
}
```

**✅ Done! Skip to Step 3.**

---

### 📦 Method B: Global npm Install

**Requires Node.js 18+**

**Step 1:** Install globally

```bash
npm install -g trading212-mcp
```

**Step 2:** Configure Claude Desktop

```json
{
  "mcpServers": {
    "trading212": {
      "command": "trading212-mcp",
      "env": {
        "TRADING212_API_KEY": "your_api_key_here",
        "TRADING212_ENVIRONMENT": "demo"
      }
    }
  }
}
```

**✅ Done! Skip to Step 3.**

---

### 🛠️ Method C: Local Build (For Development)

**Requires Node.js 18+**

**Step 1:** Clone and build

```bash
git clone https://github.com/enderekici/trading212-mcp.git
cd trading212-mcp
npm install
npm run build
```

**Step 2:** Configure Claude Desktop

```json
{
  "mcpServers": {
    "trading212": {
      "command": "node",
      "args": ["/absolute/path/to/trading212-mcp/dist/index.js"],
      "env": {
        "TRADING212_API_KEY": "your_api_key_here",
        "TRADING212_ENVIRONMENT": "demo"
      }
    }
  }
}
```

⚠️ **Important:** Replace `/absolute/path/to/` with your actual path!

---

## Step 3: Restart Claude Desktop

Completely quit and restart Claude Desktop to load the MCP server.

---

## Step 4: Test It!

Open Claude and try these commands:

1. **Check your balance:**
   ```
   How much cash do I have available?
   ```

2. **View your portfolio:**
   ```
   What stocks do I own?
   ```

3. **Search for stocks:**
   ```
   Search for Apple stocks
   ```

---

## Setup Comparison

| Method | Startup | Requires | Best For |
|--------|---------|----------|----------|
| **🐳 Docker** | ~2s | Docker | Production, teams, consistency |
| **📦 npm install** | ~0.3s | Node.js | Quick setup, simplicity |
| **🛠️ Local build** | ~0.3s | Node.js + Git | Development, testing |

---

## Troubleshooting

### Server not showing up?

1. Check the path/command is correct in config
2. Verify the build succeeded (for local builds)
3. Restart Claude Desktop completely
4. Check Claude Desktop logs:
   - **macOS**: `~/Library/Logs/Claude/mcp*.log`
   - **Windows**: `%APPDATA%/Claude/logs/`

### Authentication errors?

1. Verify API key is correct (no extra spaces)
2. Check all permissions are enabled in Trading 212
3. Ensure using correct environment (`demo` or `live`)

### Docker-specific issues?

```bash
# Check if Docker is running
docker ps

# Test image manually
docker run --rm -e TRADING212_API_KEY=your_key trading212-mcp:latest

# Find Docker path (if command not found)
which docker  # Usually /usr/local/bin/docker
```

If Docker path isn't found, use absolute path in config:

```json
{
  "command": "/usr/local/bin/docker",
  "args": ["run", "--rm", "-i", ...]
}
```

### Need more help?

- Read the full [README.md](README.md)
- Check [EXAMPLES.md](EXAMPLES.md) for usage examples
- See [DOCKER.md](DOCKER.md) for Docker deployment details
- Open an issue on GitHub

---

## Advanced: Docker Compose (For Always-On Container)

For a persistent container that starts automatically:

**Step 1:** Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  trading212-mcp:
    image: trading212-mcp:latest
    container_name: trading212-mcp
    environment:
      - TRADING212_API_KEY=your_api_key_here
      - TRADING212_ENVIRONMENT=demo
    restart: unless-stopped
```

**Step 2:** Start container:

```bash
docker-compose up -d
```

**Step 3:** Configure Claude Desktop:

```json
{
  "mcpServers": {
    "trading212": {
      "command": "docker",
      "args": ["exec", "-i", "trading212-mcp", "node", "/app/dist/index.js"]
    }
  }
}
```

This method keeps the container running continuously for faster startup.

---

## Next Steps

✅ You're all set! Try these next:

- Read [EXAMPLES.md](EXAMPLES.md) for real-world usage examples
- Test order placement in demo environment
- Create your first investment pie
- Analyze your portfolio performance
- Explore all 26 available tools

---

## Important Notes

⚠️ **Always test in demo environment first!**

⚠️ **Never commit your API key to version control**

⚠️ **Review all orders before confirming**

---

## Quick Reference

### Common Commands

- Get account info: `Show me my account summary`
- View portfolio: `What are my holdings?`
- Check orders: `Show my pending orders`
- Place order: `Buy 5 shares of AAPL at market price`
- Search stocks: `Search for Tesla`
- View history: `Show my order history`

### Available Tools (26 total)

- **Account** (3): get_account_info, get_account_cash, get_account_summary
- **Portfolio** (2): get_portfolio, get_position
- **Orders** (7): get_orders, get_order, cancel_order, place_market_order, place_limit_order, place_stop_order, place_stop_limit_order
- **Market Data** (2): get_instruments, get_exchanges
- **Pies** (5): get_pies, get_pie, create_pie, update_pie, delete_pie
- **History** (4): get_order_history, get_dividends, get_transactions, request_export

---

Happy trading! 📈

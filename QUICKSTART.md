# Quick Start Guide

Get your Trading 212 MCP server up and running in 5 minutes!

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

## Step 2: Install Dependencies

```bash
cd /Users/ender/code/trading212-mcp
npm install
```

## Step 3: Configure Environment

Create a `.env` file:

```bash
cp .env.example .env
```

Edit `.env` and add your API key:

```bash
TRADING212_API_KEY=your_actual_api_key_here
TRADING212_ENVIRONMENT=demo
```

**Important:** Use `demo` environment for testing!

## Step 4: Build the Project

```bash
npm run build
```

## Step 5: Configure Claude Desktop

### macOS

Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "trading212": {
      "command": "node",
      "args": ["/Users/ender/code/trading212-mcp/dist/index.js"],
      "env": {
        "TRADING212_API_KEY": "your_actual_api_key_here",
        "TRADING212_ENVIRONMENT": "demo"
      }
    }
  }
}
```

### Windows

Edit `%APPDATA%/Claude/claude_desktop_config.json` with the same content (adjust path).

## Step 6: Restart Claude Desktop

Completely quit and restart Claude Desktop.

## Step 7: Test It!

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

## Troubleshooting

### Server not showing up?

1. Check the path is absolute (not relative)
2. Verify `dist/index.js` exists
3. Restart Claude Desktop completely
4. Check Claude Desktop logs

### Authentication errors?

1. Verify API key is correct
2. Check permissions are enabled
3. Ensure using correct environment (demo/live)

### Need help?

- Read the full [README.md](README.md)
- Check [EXAMPLES.md](EXAMPLES.md) for usage examples
- Open an issue on GitHub

## Next Steps

✅ You're all set! Try these next:

- Read [EXAMPLES.md](EXAMPLES.md) for usage examples
- Test order placement in demo environment
- Create your first investment pie
- Analyze your portfolio performance

## Important Notes

⚠️ **Always test in demo environment first!**

⚠️ **Never commit your API key to version control**

⚠️ **Review all orders before confirming**

## Quick Reference

### Common Commands

- Get account info: `Show me my account summary`
- View portfolio: `What are my holdings?`
- Check orders: `Show my pending orders`
- Place order: `Buy 5 shares of AAPL at market price`
- Search stocks: `Search for Tesla`
- View history: `Show my order history`

### Available Tools (26 total)

- **Account:** get_account_info, get_account_cash, get_account_summary
- **Portfolio:** get_portfolio, get_position
- **Orders:** get_orders, get_order, cancel_order, place_market_order, place_limit_order, place_stop_order, place_stop_limit_order
- **Market Data:** get_instruments, get_exchanges
- **Pies:** get_pies, get_pie, create_pie, update_pie, delete_pie
- **History:** get_order_history, get_dividends, get_transactions, request_export

Happy trading! 📈

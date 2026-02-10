# Trading 212 MCP Server

A comprehensive Model Context Protocol (MCP) server for seamless integration with the Trading 212 API. This server enables AI assistants like Claude to interact with your Trading 212 investment account, providing full access to account management, portfolio tracking, order execution, and historical data analysis.

## Features

### 🏦 Account Management
- Get account information (currency, ID)
- View cash balances (free, invested, blocked, total)
- Retrieve comprehensive account summaries

### 📊 Portfolio Management
- List all open positions
- Get detailed position information by ticker
- Real-time profit/loss tracking

### 📈 Order Management
- View all active orders
- Place market, limit, stop, and stop-limit orders
- Cancel pending orders
- Support for DAY and GTC (Good Till Cancelled) orders
- Extended hours trading support

### 🔍 Market Data & Instruments
- Search and filter thousands of tradeable instruments
- Access instrument metadata (ISIN, currency, type, trading schedules)
- View exchange information and trading hours

### 🥧 Investment Pies
- List all investment pies (portfolio buckets)
- Create new pies with custom allocations
- Update and delete existing pies
- Configure dividend reinvestment settings

### 📜 Historical Data
- Access order history with pagination
- Retrieve dividend payment records
- View complete transaction history
- Export data to CSV for specified time periods

### ⚡ Performance Features
- Automatic rate limit tracking and headers
- Zod schema validation for type safety
- Comprehensive error handling
- Support for both demo and live environments

## Installation

### Prerequisites
- Node.js 18+ installed
- Trading 212 account (Invest or ISA)
- Trading 212 API key (see [Setup Guide](#getting-your-api-key))

### Install Dependencies

```bash
npm install
```

### Build the Project

```bash
npm run build
```

## Configuration

### Getting Your API Key

1. Open the Trading 212 app (mobile or web)
2. Navigate to **Settings** → **API (Beta)**
3. Click **Generate API Key**
4. Configure permissions:
   - ✅ **Account data** (read) - View account information
   - ✅ **History** (read) - Access historical data
   - ✅ **Orders** (read/write) - View and place orders
   - ✅ **Portfolio** (read) - View positions
5. (Optional) Set IP address whitelist for additional security
6. Copy your API key and store it securely

⚠️ **Security Warning**: Never commit your API key to version control or share it publicly.

### Environment Variables

Create a `.env` file in the project root:

```bash
# Required: Your Trading 212 API key
TRADING212_API_KEY=your_api_key_here

# Optional: Environment (demo or live), defaults to demo
TRADING212_ENVIRONMENT=demo
```

**Environments:**
- `demo` - Paper trading environment (recommended for testing)
- `live` - Real money trading environment

## Usage with Claude Desktop

### Configure Claude Desktop

Add this server to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

**Windows**: `%APPDATA%/Claude/claude_desktop_config.json`

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

### Restart Claude Desktop

After updating the configuration, restart Claude Desktop to load the MCP server.

## Available Tools

### Account Management

#### `get_account_info`
Retrieve account metadata including currency code and account ID.

**Example:**
```
Get my account information
```

#### `get_account_cash`
Get detailed cash balance information.

**Returns:** Free cash, total, invested, blocked amounts, and more.

**Example:**
```
How much cash do I have available?
```

#### `get_account_summary`
Get comprehensive account summary with all balances and P&L.

**Example:**
```
Show me my complete account summary
```

### Portfolio Management

#### `get_portfolio`
List all open positions with current values and profit/loss.

**Example:**
```
What stocks do I own?
```

#### `get_position`
Get detailed information about a specific position.

**Parameters:**
- `ticker` (string, required) - The ticker symbol (e.g., "AAPL", "TSLA")

**Example:**
```
Show me my Apple position details
```

### Order Management

#### `get_orders`
Retrieve all active orders.

**Example:**
```
What are my pending orders?
```

#### `get_order`
Get detailed information about a specific order.

**Parameters:**
- `orderId` (number, required) - The order ID

**Example:**
```
Show me details for order 12345
```

#### `cancel_order`
Cancel an active order.

**Parameters:**
- `orderId` (number, required) - The order ID to cancel

**Example:**
```
Cancel order 12345
```

#### `place_market_order`
Place a market order to execute immediately at the current market price.

**Parameters:**
- `ticker` (string, required) - Ticker symbol
- `quantity` (number, required) - Quantity to buy (positive) or sell (negative)
- `timeValidity` (string, optional) - "DAY" or "GTC" (default: "DAY")

**Example:**
```
Buy 10 shares of Apple at market price
```

#### `place_limit_order`
Place a limit order to execute at a specified price or better.

**Parameters:**
- `ticker` (string, required) - Ticker symbol
- `quantity` (number, required) - Quantity to buy/sell
- `limitPrice` (number, required) - Maximum buy price or minimum sell price
- `timeValidity` (string, optional) - "DAY" or "GTC"

**Example:**
```
Place a limit order to buy 5 shares of Tesla at $200
```

#### `place_stop_order`
Place a stop order that becomes a market order when triggered.

**Parameters:**
- `ticker` (string, required) - Ticker symbol
- `quantity` (number, required) - Quantity to buy/sell
- `stopPrice` (number, required) - Price that triggers the order
- `timeValidity` (string, optional) - "DAY" or "GTC"

**Example:**
```
Place a stop order to sell 10 shares of MSFT if price drops below $300
```

#### `place_stop_limit_order`
Place a stop-limit order that becomes a limit order when triggered.

**Parameters:**
- `ticker` (string, required) - Ticker symbol
- `quantity` (number, required) - Quantity to buy/sell
- `stopPrice` (number, required) - Price that triggers the order
- `limitPrice` (number, required) - Limit price once triggered
- `timeValidity` (string, optional) - "DAY" or "GTC"

**Example:**
```
Place a stop-limit order to sell GOOGL at $140 with stop at $145
```

### Instruments & Market Data

#### `get_instruments`
List all tradeable instruments with optional search filtering.

**Parameters:**
- `search` (string, optional) - Filter by ticker, name, or ISIN

**Example:**
```
Search for all Apple instruments
```

#### `get_exchanges`
Get information about exchanges and trading schedules.

**Example:**
```
Show me exchange trading hours
```

### Investment Pies

#### `get_pies`
List all investment pies with their configurations.

**Example:**
```
Show me all my pies
```

#### `get_pie`
Get detailed information about a specific pie.

**Parameters:**
- `pieId` (number, required) - The pie ID

**Example:**
```
Show details for pie 123
```

#### `create_pie`
Create a new investment pie.

**Parameters:**
- `name` (string, required) - Pie name (1-50 characters)
- `icon` (string, required) - Icon identifier
- `instrumentShares` (object, required) - Ticker to allocation mapping
- `dividendCashAction` (string, required) - "REINVEST" or "TO_ACCOUNT_CASH"
- `goal` (number, optional) - Investment goal amount

**Example:**
```
Create a new pie called "Tech Portfolio" with 50% AAPL and 50% GOOGL, reinvesting dividends
```

#### `update_pie`
Update an existing pie configuration.

**Parameters:**
- `pieId` (number, required) - The pie ID
- Other parameters same as create_pie (all optional)

**Example:**
```
Update pie 123 to change allocation to 60% AAPL and 40% GOOGL
```

#### `delete_pie`
Delete an investment pie.

**Parameters:**
- `pieId` (number, required) - The pie ID to delete

**Example:**
```
Delete pie 123
```

### Historical Data

#### `get_order_history`
Get historical orders with pagination support.

**Parameters:**
- `cursor` (number, optional) - Pagination cursor
- `limit` (number, optional) - Results per page (default: 50)
- `ticker` (string, optional) - Filter by ticker

**Example:**
```
Show me my order history for the last month
```

#### `get_dividends`
Get dividend payment history.

**Parameters:**
- `cursor` (number, optional) - Pagination cursor
- `limit` (number, optional) - Results per page
- `ticker` (string, optional) - Filter by ticker

**Example:**
```
Show me all dividends received this year
```

#### `get_transactions`
Get complete transaction history.

**Parameters:**
- `cursor` (number, optional) - Pagination cursor
- `limit` (number, optional) - Results per page

**Example:**
```
Show me my recent transactions
```

#### `request_export`
Request a CSV export of account data.

**Parameters:**
- `timeFrom` (string, required) - Start date (ISO 8601 format)
- `timeTo` (string, required) - End date (ISO 8601 format)
- `includeDividends` (boolean, optional) - Include dividends (default: true)
- `includeInterest` (boolean, optional) - Include interest (default: true)
- `includeOrders` (boolean, optional) - Include orders (default: true)
- `includeTransactions` (boolean, optional) - Include transactions (default: true)

**Example:**
```
Export all my data from January 1st to December 31st 2024
```

## Example Conversations

### Portfolio Analysis
```
User: What's my current portfolio performance?

Claude: Let me check your account summary and portfolio.
[Calls get_account_summary and get_portfolio]

You have a total portfolio value of $10,523.45 with an overall profit of $523.45 (+5.2%).

Your positions:
- AAPL: 10 shares at $150.00 (avg $145.00) - +$50.00 profit
- GOOGL: 5 shares at $140.00 (avg $135.00) - +$25.00 profit
- TSLA: 8 shares at $200.00 (avg $210.00) - -$80.00 loss
```

### Order Placement
```
User: Buy 5 shares of Microsoft at market price

Claude: I'll place a market order for 5 shares of MSFT.
[Calls place_market_order]

Order placed successfully:
- Order ID: 12345
- Ticker: MSFT
- Quantity: 5
- Type: MARKET
- Status: CONFIRMED
- Filled at: $350.25 per share
```

### Historical Analysis
```
User: How much have I received in dividends this year?

Claude: Let me check your dividend history.
[Calls get_dividends]

You've received $125.50 in dividends this year:
- AAPL: $45.00 (3 payments)
- MSFT: $50.50 (4 payments)
- JNJ: $30.00 (2 payments)
```

## Rate Limits

Trading 212 API enforces rate limits on a per-endpoint basis. This MCP server automatically tracks rate limit information via response headers:

- `x-ratelimit-limit` - Maximum requests allowed
- `x-ratelimit-remaining` - Requests remaining
- `x-ratelimit-reset` - Unix timestamp when limit resets

**Known Limits:**
- Account Summary: 1 request / 5 seconds
- Market Orders: 1 request / 2 seconds
- Limit Orders: 1 request / 2 seconds

The server will throw an error if you exceed rate limits. Always check the error messages for rate limit information.

## Error Handling

All errors are returned with descriptive messages:

```json
{
  "error": "Trading 212 API Error (401): Invalid API key"
}
```

Common errors:
- **401 Unauthorized** - Invalid API key
- **403 Forbidden** - Insufficient permissions
- **404 Not Found** - Resource doesn't exist
- **429 Too Many Requests** - Rate limit exceeded
- **500 Internal Server Error** - Trading 212 service issue

## Development

### Run in Development Mode

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Watch Mode (Auto-rebuild)

```bash
npm run watch
```

## API Documentation

For complete API documentation, visit:
- [Trading 212 Public API Documentation](https://docs.trading212.com/api)
- [Interactive API Docs](https://t212public-api-docs.redoc.ly/)

## Supported Account Types

- ✅ **Invest Accounts** (General trading accounts)
- ✅ **ISA Accounts** (UK tax-advantaged accounts)
- ❌ **CFD Accounts** (Not supported by Trading 212 API)

## Limitations

- API is currently in BETA and under active development
- No WebSocket/streaming support (REST only)
- Pies API is deprecated and won't receive further updates
- CFD accounts are not supported
- Rate limits apply per account (not per API key)

## Security Best Practices

1. **Never commit API keys** to version control
2. **Use environment variables** for sensitive configuration
3. **Enable IP whitelisting** if possible
4. **Test in demo environment** before using live
5. **Use minimal permissions** needed for your use case
6. **Rotate API keys** regularly
7. **Monitor API usage** through rate limit headers

## Troubleshooting

### Server Not Appearing in Claude Desktop

1. Verify the path in `claude_desktop_config.json` is absolute
2. Ensure the project is built (`npm run build`)
3. Check that `dist/index.js` exists
4. Restart Claude Desktop completely
5. Check Claude Desktop logs for errors

### Authentication Errors

1. Verify API key is correct in `.env` or config
2. Check that API key has required permissions
3. Ensure you're using the correct environment (demo/live)
4. Verify IP whitelist settings if enabled

### Rate Limit Errors

1. Wait for the rate limit window to reset
2. Check `x-ratelimit-reset` header for reset time
3. Reduce frequency of API calls
4. Implement caching where appropriate

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Disclaimer

This is an unofficial integration. Always test thoroughly in the demo environment before using with real money. Trading involves risk, and you should only invest what you can afford to lose.

## Support

For issues with this MCP server:
- Open an issue on GitHub

For Trading 212 API issues:
- Visit [Trading 212 Help Center](https://helpcentre.trading212.com/)
- Check [Trading 212 API Documentation](https://docs.trading212.com/api)

## Acknowledgments

Built with:
- [Model Context Protocol SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Zod](https://github.com/colinhacks/zod) for schema validation
- [Trading 212 Public API](https://docs.trading212.com/api)

---

**Made with ❤️ for the Trading 212 and AI community**

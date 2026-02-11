# Architecture

Technical guide for developers contributing to or deploying the Trading 212 MCP server.

---

## System Overview

```
┌─────────────────────────────────────────────────────┐
│                   Client Layer                       │
│        AI Agent (Claude, GPT, etc.)                  │
└──────────────────────┬──────────────────────────────┘
                       │ MCP (stdio)
                       ▼
┌──────────────────────────────────────────────────────┐
│                  MCP Server                          │
│               src/index.ts                           │
│                                                      │
│   Tools (26 total):                                 │
│   ├─ Account Management (3)                         │
│   ├─ Portfolio Management (2)                       │
│   ├─ Order Management (7)                           │
│   ├─ Market Data (2)                                │
│   ├─ Investment Pies (5)                            │
│   └─ Historical Data (4)                            │
│                                                      │
│   Request Handler:                                  │
│   ├─ Validate input                                 │
│   ├─ Call Trading212Client                          │
│   ├─ Format response                                │
│   └─ Handle errors                                  │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────┐
│              Trading212Client Layer                  │
│                src/client.ts                         │
│                                                      │
│   Responsibilities:                                 │
│   ├─ HTTP Basic Authentication                      │
│   ├─ Request/Response handling                      │
│   ├─ Schema validation (Zod)                        │
│   ├─ Rate limit tracking                            │
│   ├─ Error transformation                           │
│   └─ Environment switching (demo/live)              │
│                                                      │
│   Methods (26 total):                               │
│   ├─ getAccountInfo()                               │
│   ├─ getAccountCash()                               │
│   ├─ getAccountSummary()                            │
│   ├─ getPortfolio()                                 │
│   ├─ getPosition(ticker)                            │
│   ├─ getOrders()                                    │
│   ├─ getOrder(orderId)                              │
│   ├─ cancelOrder(orderId)                           │
│   ├─ placeMarketOrder(order)                        │
│   ├─ placeLimitOrder(order)                         │
│   ├─ placeStopOrder(order)                          │
│   ├─ placeStopLimitOrder(order)                     │
│   ├─ getInstruments()                               │
│   ├─ getExchanges()                                 │
│   ├─ getPies()                                      │
│   ├─ getPie(pieId)                                  │
│   ├─ createPie(pie)                                 │
│   ├─ updatePie(pieId, pie)                          │
│   ├─ deletePie(pieId)                               │
│   ├─ getOrderHistory(params)                        │
│   ├─ getDividends(params)                           │
│   ├─ getTransactions(params)                        │
│   └─ requestExport(params)                          │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────┐
│                 Type System Layer                     │
│                  src/types.ts                         │
│                                                      │
│   Zod Schemas (26 schemas):                         │
│   ├─ Account schemas                                │
│   ├─ Instrument schemas                             │
│   ├─ Position schema                                │
│   ├─ Order schemas                                  │
│   ├─ Pie schemas                                    │
│   └─ Historical data schemas                        │
│                                                      │
│   TypeScript Types (exported via z.infer):          │
│   ├─ Runtime validation                             │
│   ├─ Compile-time type checking                     │
│   └─ Auto-generated from schemas                    │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────┐
│               Trading 212 API                        │
│                                                      │
│   Environments:                                     │
│   ├─ Demo: demo.trading212.com/api/v0              │
│   └─ Live: live.trading212.com/api/v0              │
│                                                      │
│   Authentication: HTTP Basic Auth                   │
│   Rate Limiting: Per-endpoint limits                │
│   Response Format: JSON                             │
└──────────────────────────────────────────────────────┘
```

---

## Directory Structure

```
trading212-mcp/
├── src/
│   ├── index.ts              # MCP server entry point (26 tools)
│   ├── cli.ts                # CLI binary with argument parsing
│   ├── client.ts             # Trading212Client API wrapper
│   ├── types.ts              # Zod schemas + TypeScript types
│   └── utils/
│       ├── logger.ts         # Structured logging (Pino)
│       └── errors.ts         # Custom error classes
│
├── test/
│   ├── unit/
│   │   ├── types.test.ts     # Schema validation tests (46 tests)
│   │   └── client.test.ts    # API client tests (38 tests)
│   └── integration/
│       └── mcp.test.ts       # MCP tool handler tests (31 tests)
│
├── dist/                     # Compiled JavaScript (gitignored)
│   ├── index.js              # MCP server
│   ├── cli.js                # CLI binary
│   ├── client.js             # API client
│   ├── types.js              # Types and schemas
│   └── *.d.ts                # TypeScript declarations
│
├── .github/
│   └── workflows/
│       ├── ci.yml            # Test + build + lint
│       └── docker.yml        # Docker build + publish
│
├── README.md                 # Main documentation
├── QUICKSTART.md             # 5-minute setup guide
├── EXAMPLES.md               # Real-world usage scenarios
├── ARCHITECTURE.md           # This file
├── ROADMAP.md                # Future plans
├── CONTRIBUTING.md           # Contribution guidelines
├── CHANGELOG.md              # Version history
├── DOCKER.md                 # Docker deployment guide
├── TESTING.md                # Testing guide
├── CLAUDE.md                 # AI agent instructions
│
├── Dockerfile                # Multi-stage Docker build
├── docker-compose.yml        # Container orchestration
├── .dockerignore             # Docker build exclusions
│
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript config
├── vitest.config.ts          # Test configuration
├── biome.json                # Linter/formatter config
│
├── .env.example              # Environment template
├── .gitignore                # Git exclusions
└── LICENSE                   # MIT license
```

---

## Request Lifecycle

### MCP Tool Call

```
1. Client (Claude) sends tool call via stdio
   ├─ Tool name (e.g., "get_account_summary")
   └─ Arguments (e.g., {})

2. MCP SDK receives and parses JSON-RPC message
   ├─ Validates message format
   └─ Extracts tool name and arguments

3. CallToolRequest handler dispatches by name
   ├─ Matches tool name in switch statement
   └─ Extracts arguments

4. Input validation
   ├─ Zod schema validates arguments
   ├─ Throws ValidationError if invalid
   └─ Returns validated data

5. Trading212Client method call
   ├─ Constructs request (URL, headers, body)
   ├─ Sends HTTP request to Trading 212 API
   ├─ Receives response
   ├─ Extracts rate limit headers
   ├─ Validates response with Zod schema
   └─ Returns typed data

6. Response formatting
   ├─ JSON.stringify(data, null, 2)
   └─ Wrap in MCP content format

7. Error handling (if any)
   ├─ Catch exception
   ├─ Log error with context
   ├─ Format error message
   └─ Return { isError: true }

8. MCP SDK sends response via stdio
   └─ JSON-RPC response with result or error
```

---

## Data Flow

### Example: Place Market Order

```
1. User tells Claude: "Buy 10 shares of Apple at market price"

2. Claude calls MCP tool:
   Tool: place_market_order
   Args: { ticker: "AAPL", quantity: 10, timeValidity: "DAY" }

3. MCP server validates args:
   MarketOrderRequestSchema.parse(args)
   ✓ ticker: string
   ✓ quantity: positive number
   ✓ timeValidity: "DAY" | "GTC"

4. Client sends HTTP POST:
   URL: https://demo.trading212.com/api/v0/equity/orders/market
   Headers: Authorization: Basic <base64(apiKey:)>
   Body: { ticker: "AAPL", quantity: 10, timeValidity: "DAY" }

5. Trading 212 API processes order:
   ├─ Validates account has sufficient funds
   ├─ Places order on exchange
   └─ Returns order details

6. Client validates response:
   OrderSchema.parse(response)
   Returns: { id: 123456, ticker: "AAPL", quantity: 10, ... }

7. MCP server formats response:
   {
     content: [{
       type: "text",
       text: "{\n  \"id\": 123456,\n  \"ticker\": \"AAPL\",\n  ...\n}"
     }]
   }

8. Claude receives and interprets:
   "Order placed successfully: Order ID 123456 for 10 shares of AAPL..."
```

---

## Type Safety Architecture

### Zod Schema → TypeScript Type Flow

```typescript
// 1. Define Zod schema (runtime validation)
export const AccountCashSchema = z.object({
  free: z.number(),
  total: z.number(),
  ppl: z.number().optional(),
  invested: z.number().optional(),
});

// 2. Infer TypeScript type (compile-time checking)
export type AccountCash = z.infer<typeof AccountCashSchema>;

// 3. Client method uses both
async getAccountCash(): Promise<AccountCash> {
  // Runtime validation ensures response matches schema
  return this.request('/equity/account/cash', {}, AccountCashSchema);
}

// 4. MCP tool handler gets typed data
case 'get_account_cash': {
  // TypeScript knows cash has free, total, ppl?, invested? properties
  const cash = await client.getAccountCash();

  // Safe to access properties
  console.log(cash.free, cash.total);

  return { content: [{ type: 'text', text: JSON.stringify(cash, null, 2) }] };
}
```

**Benefits:**
- Runtime validation catches API contract changes
- Compile-time checking catches typos and logic errors
- Auto-complete in IDEs
- Self-documenting code

---

## Rate Limit Tracking

```typescript
// 1. Trading 212 API response includes headers
x-ratelimit-limit: 60
x-ratelimit-remaining: 58
x-ratelimit-reset: 1707350460
x-ratelimit-used: 2
x-ratelimit-period: 60

// 2. Client extracts and stores per endpoint
private extractRateLimitInfo(headers: Headers): RateLimitInfo | null {
  return {
    limit: parseInt(headers.get('x-ratelimit-limit'), 10),
    period: parseInt(headers.get('x-ratelimit-period'), 10),
    remaining: parseInt(headers.get('x-ratelimit-remaining'), 10),
    reset: parseInt(headers.get('x-ratelimit-reset'), 10),
    used: parseInt(headers.get('x-ratelimit-used'), 10),
  };
}

// 3. Stored in Map per endpoint
this.lastRateLimitInfo.set(endpoint, rateLimitInfo);

// 4. Can be queried
const info = client.getRateLimitInfo('/equity/account/summary');
if (info && info.remaining <= 2) {
  logger.warn({ endpoint, info }, 'Approaching rate limit');
}

// 5. Logger automatically tracks in debug mode
// [DEBUG] Rate limit for /equity/account/summary: 58/60 remaining, resets at 2024-02-10T15:21:00Z
```

---

## Error Handling Hierarchy

```
Error (JavaScript built-in)
  │
  └─ Trading212Error (base class)
       ├─ code: string
       ├─ message: string
       ├─ statusCode: number
       └─ context?: Record<string, any>
       │
       ├─ ApiError (HTTP errors from Trading 212 API)
       │    ├─ statusCode: 400-599
       │    ├─ response?: string
       │    └─ static fromResponse(status, body)
       │
       ├─ AuthError (authentication failures)
       │    ├─ statusCode: 401
       │    ├─ static missingApiKey()
       │    └─ static invalidApiKey()
       │
       ├─ RateLimitError (rate limit exceeded)
       │    ├─ statusCode: 429
       │    ├─ resetAt: number
       │    └─ static fromRateLimitInfo(info)
       │
       └─ ValidationError (invalid input)
            ├─ statusCode: 400
            ├─ errors: ZodIssue[]
            └─ static fromZodError(error)
```

**Usage:**

```typescript
// Throw specific error
if (!config.apiKey) {
  throw AuthError.missingApiKey();
}

// Catch and handle
try {
  await client.placeMarketOrder(order);
} catch (error) {
  if (error instanceof RateLimitError) {
    logger.warn(`Rate limit exceeded. Retry after ${error.resetAt}`);
  } else if (error instanceof ValidationError) {
    logger.error({ errors: error.errors }, 'Invalid order parameters');
  } else {
    logger.error({ error: serializeError(error) }, 'Order failed');
  }
}
```

---

## Logging Architecture

### Log Levels

| Level | When to Use | Production |
|-------|------------|------------|
| `trace` | Very detailed debugging (every function call) | ❌ |
| `debug` | Debugging information (API requests, rate limits) | ❌ |
| `info` | Normal operational messages (startup, config) | ✅ |
| `warn` | Warnings that don't stop execution (approaching rate limit) | ✅ |
| `error` | Errors that need attention (API failures, validation) | ✅ |
| `fatal` | Critical errors that stop the server | ✅ |

### Structured Logging Example

```typescript
// Development (pretty)
[INFO] (12345): Trading 212 MCP server starting
    version: "1.0.0"
    nodeVersion: "v20.11.0"
    platform: "darwin"
    environment: "demo"
    logLevel: "debug"

// Production (JSON)
{"level":30,"time":1707350400000,"pid":12345,"version":"1.0.0","nodeVersion":"v20.11.0","platform":"darwin","environment":"demo","logLevel":"debug","msg":"Trading 212 MCP server starting"}
```

### Sensitive Data Redaction

```typescript
logger.info({
  apiKey: 'secret_key_123',  // Automatically redacted
  password: 'my_password',   // Automatically redacted
  token: 'bearer_token',     // Automatically redacted
  user: 'john@example.com',  // Not redacted
});

// Output
{"apiKey":"[Redacted]","password":"[Redacted]","token":"[Redacted]","user":"john@example.com"}
```

---

## Build Process

```
1. Source files (src/**/*.ts)
   ├─ index.ts (MCP server)
   ├─ cli.ts (CLI binary)
   ├─ client.ts (API client)
   ├─ types.ts (schemas)
   └─ utils/*.ts (logger, errors)

2. TypeScript compilation (tsup)
   ├─ Transpile TS → JS (ESM)
   ├─ Generate type declarations (*.d.ts)
   ├─ Bundle with esbuild
   └─ Add shebang to cli.js

3. Output (dist/)
   ├─ index.js + index.d.ts
   ├─ cli.js + cli.d.ts (with #!/usr/bin/env node)
   ├─ client.js + client.d.ts
   ├─ types.js + types.d.ts
   └─ utils/*.js + utils/*.d.ts

4. npm package
   ├─ files: dist/, LICENSE, README.md
   ├─ main: dist/index.js
   ├─ types: dist/index.d.ts
   └─ bin: trading212-mcp → dist/cli.js

5. Installation
   npm install -g trading212-mcp
   ├─ Installs to global node_modules
   ├─ Symlinks bin: trading212-mcp → dist/cli.js
   └─ Makes CLI available globally
```

---

## Testing Strategy

### Test Pyramid

```
                   ╱╲
                  ╱  ╲
                 ╱ E2E ╲ (Future)
                ╱──────╲
               ╱        ╲
              ╱  Integ.  ╲ (31 tests)
             ╱────────────╲
            ╱              ╲
           ╱  Unit Tests    ╲ (84 tests)
          ╱──────────────────╲
```

**Unit Tests** (test/unit/)
- Test individual functions in isolation
- Mock external dependencies (fetch, API responses)
- Fast execution (~100ms)
- High coverage (aim for 80%+)

**Integration Tests** (test/integration/)
- Test complete flows (tool call → client → response)
- Mock Trading 212 API responses
- Slower execution (~1s per test)
- Focus on critical paths

**E2E Tests** (future)
- Test against real Trading 212 demo API
- Slow execution (seconds per test)
- Run less frequently (pre-release only)

---

## Security Considerations

### 1. API Key Protection

```typescript
// ✅ Good: Environment variable
const API_KEY = process.env.TRADING212_API_KEY;

// ❌ Bad: Hardcoded
const API_KEY = 'my_secret_key_123';

// ✅ Good: Redacted in logs
logger.info({ apiKey }, 'Authenticating');  // Logs: apiKey: "[Redacted]"

// ❌ Bad: Exposed in logs
console.log(`API Key: ${apiKey}`);  // Exposes key
```

### 2. Input Validation

```typescript
// ✅ Good: Zod validation
const validated = MarketOrderRequestSchema.parse(args);

// ❌ Bad: No validation
const order = args as MarketOrderRequest;
```

### 3. Error Messages

```typescript
// ✅ Good: Generic error for users
throw new AuthError('AUTH_FAILED', 'Invalid API key', 401);

// ❌ Bad: Exposes internal details
throw new Error(`API key ${apiKey} is invalid for user ${userId}`);
```

### 4. Docker Security

- Non-root user (UID 1001)
- Read-only root filesystem
- No new privileges
- Minimal base image (Alpine Linux)

---

## Performance Optimization

### 1. Rate Limit Management

```typescript
// Track per-endpoint rate limits
const info = client.getRateLimitInfo('/equity/account/summary');

// Warn before hitting limit
if (info && info.remaining <= 2) {
  logger.warn('Approaching rate limit, consider throttling');
}
```

### 2. Response Caching (Future)

```typescript
// Cache instrument list (changes infrequently)
const instruments = await cachedGet('instruments',
  () => client.getInstruments(),
  { ttl: 3600000 }  // 1 hour
);
```

### 3. Connection Pooling

Node.js `fetch` automatically handles connection pooling. No configuration needed.

---

## Deployment Topologies

### 1. Local Development

```
Developer Machine
├─ Claude Desktop
└─ trading212-mcp (stdio)
    └─ Trading 212 Demo API
```

### 2. Docker Container

```
Docker Host
├─ trading212-mcp container
│   ├─ Environment: API_KEY, ENVIRONMENT
│   └─ Volumes: none (stateless)
└─ Trading 212 Live API
```

### 3. Cloud Deployment (Future)

```
Cloud Platform (AWS/GCP/Azure)
├─ Container Service
│   ├─ trading212-mcp instances (auto-scaling)
│   ├─ Load balancer
│   └─ Health checks
├─ Secrets Manager (API keys)
├─ Logging Service (CloudWatch/Stackdriver)
└─ Trading 212 Live API
```

---

## Future Enhancements

See [ROADMAP.md](ROADMAP.md) for detailed plans.

**Key areas:**
1. WebSocket support (if Trading 212 adds it)
2. Response caching
3. Portfolio analytics
4. Risk assessment tools
5. Multi-account support
6. Batch operations
7. Tax reporting helpers

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on:
- Code style
- Testing requirements
- Pull request process
- Commit message format

---

## Resources

- [Trading 212 API Docs](https://docs.trading212.com/api)
- [MCP SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Zod Documentation](https://zod.dev/)
- [Pino Logger](https://getpino.io/)
- [Vitest](https://vitest.dev/)
- [Biome](https://biomejs.dev/)

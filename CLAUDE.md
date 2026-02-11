# Claude Agent Instructions

This document provides instructions for AI agents (like Claude) working with the Trading 212 MCP server codebase.

---

## Project Overview

**Name:** trading212-mcp
**Type:** Model Context Protocol (MCP) server
**Purpose:** Enable AI agents to interact with Trading 212 investment accounts
**Language:** TypeScript (Node.js)
**Architecture:** MCP stdio server → Trading 212 REST API

---

## Quick Context

### What This Project Does

This MCP server provides 26 tools that allow AI agents to:
- View account balances and portfolio positions
- Place and manage orders (market, limit, stop, stop-limit)
- Search for tradeable instruments
- Create and manage investment pies
- Access historical data (orders, dividends, transactions)
- Export data for tax reporting

### Core Components

1. **src/index.ts** - MCP server with 26 tool handlers
2. **src/client.ts** - Trading 212 API client wrapper
3. **src/types.ts** - Zod schemas and TypeScript types
4. **src/cli.ts** - CLI binary with argument parsing

---

## Development Guidelines

### When Adding New Features

#### 1. API Endpoint Integration

If Trading 212 adds a new API endpoint:

**Step 1:** Add Zod schema in `src/types.ts`
```typescript
export const NewFeatureSchema = z.object({
  id: z.number(),
  name: z.string(),
  // ... other fields
});

export type NewFeature = z.infer<typeof NewFeatureSchema>;
```

**Step 2:** Add client method in `src/client.ts`
```typescript
async getNewFeature(): Promise<NewFeature> {
  return this.request('/equity/new-feature', {}, NewFeatureSchema);
}
```

**Step 3:** Add MCP tool in `src/index.ts`

Add to `tools` array:
```typescript
{
  name: 'get_new_feature',
  description: 'Clear description of what this tool does',
  inputSchema: {
    type: 'object',
    properties: {
      // ... parameters
    },
    required: ['param1'],
  },
}
```

Add handler in `CallToolRequestSchema`:
```typescript
case 'get_new_feature': {
  const { param1 } = args as { param1: string };
  const result = await client.getNewFeature();
  return {
    content: [{
      type: 'text',
      text: JSON.stringify(result, null, 2),
    }],
  };
}
```

**Step 4:** Add tests in `test/`
- Unit test for schema validation
- Unit test for client method
- Integration test for MCP tool

**Step 5:** Update documentation
- Add to README.md "Available Tools" section
- Add examples to EXAMPLES.md
- Update tool count in all docs

---

#### 2. Utility Functions

For shared logic (logging, validation, formatting):

**Create in `src/utils/`:**
```typescript
// src/utils/formatter.ts
export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}
```

**Use in handlers:**
```typescript
import { formatCurrency } from './utils/formatter.js';

const formatted = formatCurrency(cash.free, 'USD');
```

---

### Code Style

#### TypeScript

```typescript
// ✅ Good: Explicit types, descriptive names
async getAccountCash(): Promise<AccountCash> {
  return this.request('/equity/account/cash', {}, AccountCashSchema);
}

// ❌ Bad: Implicit any, unclear names
async get(path: string) {
  return this.request(path, {});
}

// ✅ Good: Zod validation
const validated = MarketOrderRequestSchema.parse(args);

// ❌ Bad: Type assertion without validation
const order = args as MarketOrderRequest;

// ✅ Good: Error handling with context
try {
  await client.placeOrder(order);
} catch (error) {
  logger.error({ error: serializeError(error), order }, 'Order placement failed');
  throw error;
}

// ❌ Bad: Silent failure
try {
  await client.placeOrder(order);
} catch (error) {
  console.log('error');
}
```

#### Imports

```typescript
// ✅ Good: Use .js extension for ESM
import { Trading212Client } from './client.js';
import { AccountInfo } from './types.js';

// ❌ Bad: No extension (won't work with ESM)
import { Trading212Client } from './client';
```

#### Naming Conventions

```typescript
// Files: lowercase-with-hyphens
src/trading-client.ts

// Classes: PascalCase
class Trading212Client {}

// Functions: camelCase
function getAccountInfo() {}

// Constants: UPPER_SNAKE_CASE
const API_KEY = process.env.TRADING212_API_KEY;

// Types/Interfaces: PascalCase
interface AccountInfo {}
type Environment = 'demo' | 'live';
```

---

### Testing

#### Test File Naming

```
test/
├── unit/
│   ├── client.test.ts       # Tests for src/client.ts
│   ├── types.test.ts        # Tests for src/types.ts
│   └── utils.test.ts        # Tests for src/utils/*
└── integration/
    └── mcp.test.ts          # Tests for src/index.ts
```

#### Test Structure

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Trading212Client', () => {
  describe('getAccountInfo', () => {
    it('should return valid account info', async () => {
      // Arrange
      const mockResponse = { currencyCode: 'USD', id: 123 };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
        headers: new Headers(),
      });

      // Act
      const client = new Trading212Client({ apiKey: 'test', environment: 'demo' });
      const result = await client.getAccountInfo();

      // Assert
      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        'https://demo.trading212.com/api/v0/equity/account/info',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: expect.stringContaining('Basic'),
          }),
        })
      );
    });

    it('should throw error for invalid API key', async () => {
      // Arrange
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        text: async () => 'Unauthorized',
      });

      // Act & Assert
      const client = new Trading212Client({ apiKey: 'invalid', environment: 'demo' });
      await expect(client.getAccountInfo()).rejects.toThrow('Trading 212 API Error (401)');
    });
  });
});
```

#### Running Tests

```bash
# Run all tests
npm test

# Watch mode (auto-rerun on changes)
npm run test:watch

# Coverage report
npm run test:coverage

# Interactive UI
npm run test:ui
```

---

### Logging

```typescript
import { logger } from './utils/logger.js';

// ✅ Good: Structured logging with context
logger.info({
  tool: 'get_account_summary',
  duration: 234,
  rateLimit: { remaining: 58, limit: 60 }
}, 'Account summary retrieved');

// ❌ Bad: String concatenation
console.log('Account summary retrieved in ' + duration + 'ms');

// ✅ Good: Error logging with stack
logger.error({ error: serializeError(error), context }, 'Operation failed');

// ❌ Bad: Logging error object directly
console.error('Error:', error);

// Log levels
logger.trace('Very detailed debugging');  // Development only
logger.debug('Debugging information');    // Development only
logger.info('Normal operational message'); // Production
logger.warn('Warning message');           // Production
logger.error('Error message');            // Production
logger.fatal('Critical error');           // Production
```

---

### Error Handling

```typescript
// ✅ Good: Custom error with context
throw new ApiError(
  'ORDER_FAILED',
  'Failed to place market order',
  400,
  { ticker: 'AAPL', quantity: 10 }
);

// ❌ Bad: Generic error
throw new Error('Order failed');

// ✅ Good: Catch specific errors
try {
  await client.placeOrder(order);
} catch (error) {
  if (error instanceof RateLimitError) {
    logger.warn({ resetAt: error.resetAt }, 'Rate limit exceeded');
    // Handle rate limit
  } else if (error instanceof ValidationError) {
    logger.error({ errors: error.errors }, 'Invalid order');
    // Handle validation
  } else {
    logger.error({ error: serializeError(error) }, 'Unexpected error');
    throw error;
  }
}

// ❌ Bad: Catch all without distinction
try {
  await client.placeOrder(order);
} catch (error) {
  console.log('error');
}
```

---

### Documentation

#### Code Comments

```typescript
/**
 * Retrieves detailed information about a specific position.
 *
 * @param ticker - The ticker symbol of the instrument (e.g., 'AAPL')
 * @returns Position details including quantity, prices, and P&L
 * @throws {ApiError} If the position is not found or API request fails
 * @throws {RateLimitError} If rate limit is exceeded
 *
 * @example
 * ```typescript
 * const position = await client.getPosition('AAPL');
 * console.log(`${position.quantity} shares at $${position.currentPrice}`);
 * ```
 */
async getPosition(ticker: string): Promise<Position> {
  return this.request(`/equity/portfolio/${ticker}`, {}, PositionSchema);
}
```

#### README Updates

When adding features, update:

1. **Feature list** in "Key Features" section
2. **Tool count** (currently 26 tools)
3. **Available Tools** section with new tool
4. **Example Conversations** if applicable

---

### Git Workflow

#### Commit Messages

```bash
# Format: <type>(<scope>): <subject>

# Types:
feat: New feature
fix: Bug fix
docs: Documentation changes
style: Code style changes (formatting)
refactor: Code refactoring
test: Adding tests
chore: Maintenance tasks

# Examples:
feat(orders): add trailing stop order support
fix(client): handle rate limit errors correctly
docs(readme): add examples for pie management
test(client): add tests for error handling
chore(deps): update dependencies
```

#### Branch Naming

```bash
feature/add-trailing-stop-orders
fix/rate-limit-handling
docs/improve-examples
test/client-coverage
chore/update-dependencies
```

#### Pull Request Process

1. **Create feature branch** from `main`
2. **Make changes** with clear commits
3. **Add tests** for new features
4. **Update documentation**
5. **Run tests** (`npm test`)
6. **Run linter** (`npm run lint`)
7. **Build** (`npm run build`)
8. **Push** and create PR
9. **Address review feedback**

---

## Common Tasks

### Task: Add a New Order Type

**Scenario:** Trading 212 API adds "trailing stop" orders

**Step-by-step:**

1. **Add schema** in `src/types.ts`:
```typescript
export const TrailingStopOrderRequestSchema = z.object({
  ticker: z.string(),
  quantity: z.number().positive(),
  trailingPercent: z.number().positive().max(100),
  timeValidity: TimeInForceSchema.default('DAY'),
});

export type TrailingStopOrderRequest = z.infer<typeof TrailingStopOrderRequestSchema>;
```

2. **Add client method** in `src/client.ts`:
```typescript
async placeTrailingStopOrder(order: TrailingStopOrderRequest): Promise<Order> {
  return this.request(
    '/equity/orders/trailing_stop',
    {
      method: 'POST',
      body: JSON.stringify(order),
    },
    OrderSchema
  );
}
```

3. **Add MCP tool** in `src/index.ts`:
```typescript
// In tools array:
{
  name: 'place_trailing_stop_order',
  description: 'Place a trailing stop order that adjusts stop price as market price moves',
  inputSchema: {
    type: 'object',
    properties: {
      ticker: { type: 'string', description: 'Ticker symbol' },
      quantity: { type: 'number', description: 'Quantity to sell' },
      trailingPercent: { type: 'number', description: 'Trailing percentage (1-100)' },
      timeValidity: { type: 'string', enum: ['DAY', 'GTC'], default: 'DAY' },
    },
    required: ['ticker', 'quantity', 'trailingPercent'],
  },
}

// In switch statement:
case 'place_trailing_stop_order': {
  const validated = TrailingStopOrderRequestSchema.parse(args);
  const order = await client.placeTrailingStopOrder(validated);
  return {
    content: [{ type: 'text', text: JSON.stringify(order, null, 2) }],
  };
}
```

4. **Add tests** in `test/unit/client.test.ts`:
```typescript
describe('placeTrailingStopOrder', () => {
  it('should place trailing stop order successfully', async () => {
    const mockOrder = { id: 123, ticker: 'AAPL', type: 'TRAILING_STOP' };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockOrder,
      headers: new Headers(),
    });

    const result = await client.placeTrailingStopOrder({
      ticker: 'AAPL',
      quantity: 10,
      trailingPercent: 5,
      timeValidity: 'GTC',
    });

    expect(result).toEqual(mockOrder);
  });

  it('should validate trailing percent is positive', () => {
    expect(() => TrailingStopOrderRequestSchema.parse({
      ticker: 'AAPL',
      quantity: 10,
      trailingPercent: -5,
    })).toThrow();
  });
});
```

5. **Update documentation**:
   - README.md: Add to "Order Management" tools
   - EXAMPLES.md: Add usage example
   - CHANGELOG.md: Add to "Added" section
   - Update tool count (26 → 27)

6. **Build and test**:
```bash
npm run build
npm test
npm run lint
```

---

### Task: Fix a Bug

**Scenario:** Rate limit errors not being caught properly

**Step-by-step:**

1. **Write failing test** in `test/unit/client.test.ts`:
```typescript
it('should handle rate limit errors', async () => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: false,
    status: 429,
    text: async () => 'Rate limit exceeded',
    headers: new Headers({
      'x-ratelimit-reset': '1707350460',
    }),
  });

  const client = new Trading212Client({ apiKey: 'test', environment: 'demo' });
  await expect(client.getAccountInfo()).rejects.toThrow('Rate limit');
});
```

2. **Fix the code** in `src/client.ts`:
```typescript
if (!response.ok) {
  if (response.status === 429) {
    const reset = response.headers.get('x-ratelimit-reset');
    throw new RateLimitError(
      'RATE_LIMIT_EXCEEDED',
      'Rate limit exceeded',
      429,
      { resetAt: reset ? parseInt(reset, 10) : Date.now() + 60000 }
    );
  }
  // ... other error handling
}
```

3. **Verify fix**:
```bash
npm test
```

4. **Update CHANGELOG.md**:
```markdown
### Fixed
- Properly handle rate limit errors with reset timestamp
```

---

### Task: Improve Documentation

**Scenario:** Users confused about environment setup

**Step-by-step:**

1. **Identify pain points** (from issues, questions)
2. **Update relevant docs**:
   - QUICKSTART.md: Add troubleshooting section
   - README.md: Clarify environment variables
   - EXAMPLES.md: Add more beginner examples
3. **Add screenshots/diagrams** if helpful
4. **Test instructions** yourself or with someone new

---

## Debugging

### Debug MCP Server

```bash
# Enable debug logging
TRADING212_LOG_LEVEL=debug node dist/index.js

# Test with curl (if REST mode added)
curl -X POST http://localhost:3000/api/account/info \
  -H "Authorization: Bearer $API_KEY"

# Inspect MCP messages
# (MCP uses JSON-RPC over stdio, so you'll see JSON messages)
```

### Debug Tests

```bash
# Run specific test file
npm test -- test/unit/client.test.ts

# Run specific test
npm test -- -t "should handle rate limit"

# Debug mode
node --inspect-brk ./node_modules/.bin/vitest run

# Then open chrome://inspect in Chrome
```

### Common Issues

**Issue:** Tests failing with "Cannot find module"
**Solution:** Check .js extensions in imports

**Issue:** TypeScript errors in dist/
**Solution:** Run `npm run build` to recompile

**Issue:** MCP server not showing in Claude
**Solution:**
1. Check path is absolute in config
2. Restart Claude Desktop
3. Check logs: `tail -f ~/Library/Logs/Claude/mcp*.log`

---

## Performance Considerations

### Rate Limiting

```typescript
// ✅ Good: Check rate limits before making requests
const info = client.getRateLimitInfo('/equity/account/summary');
if (info && info.remaining < 5) {
  logger.warn('Approaching rate limit');
}

// ✅ Good: Batch related requests
const [account, portfolio, orders] = await Promise.all([
  client.getAccountSummary(),
  client.getPortfolio(),
  client.getOrders(),
]);

// ❌ Bad: Sequential requests when parallel is possible
const account = await client.getAccountSummary();
const portfolio = await client.getPortfolio();
const orders = await client.getOrders();
```

### Memory Usage

```typescript
// ✅ Good: Stream large results
async *getOrderHistoryStream() {
  let cursor = 0;
  while (true) {
    const page = await client.getOrderHistory({ cursor, limit: 50 });
    yield* page.items;
    if (!page.nextPagePath) break;
    cursor += 50;
  }
}

// ❌ Bad: Load all into memory
const allOrders = [];
let cursor = 0;
while (true) {
  const page = await client.getOrderHistory({ cursor, limit: 50 });
  allOrders.push(...page.items);
  if (!page.nextPagePath) break;
  cursor += 50;
}
```

---

## Security Checklist

When adding features:

- [ ] Validate all user input with Zod schemas
- [ ] Never log API keys or sensitive data
- [ ] Use parameterized queries (if adding database)
- [ ] Sanitize error messages (no internal details)
- [ ] Check rate limits before operations
- [ ] Use HTTPS for all external requests
- [ ] Document security implications in PR

---

## Release Process

### Pre-release Checklist

- [ ] All tests passing (`npm test`)
- [ ] Linter passing (`npm run lint`)
- [ ] Build successful (`npm run build`)
- [ ] CHANGELOG.md updated
- [ ] Version bumped in package.json
- [ ] Documentation updated
- [ ] Docker image builds
- [ ] Tag created (`git tag v1.x.x`)

### Release Steps

1. **Update version** in package.json
2. **Update CHANGELOG.md** with changes
3. **Commit changes**: `git commit -m "chore: release v1.x.x"`
4. **Create tag**: `git tag v1.x.x`
5. **Push**: `git push && git push --tags`
6. **GitHub Actions** will build and test
7. **Create GitHub Release** with changelog
8. **(Optional) Publish to npm**: `npm publish`

---

## Getting Help

### Resources

- **Documentation**: Start with README.md, then ARCHITECTURE.md
- **Examples**: Check EXAMPLES.md for usage patterns
- **Tests**: Look at test/ directory for examples
- **Issues**: Search GitHub issues for similar problems
- **API Docs**: [Trading 212 API](https://docs.trading212.com/api)

### Asking Questions

When asking for help, include:

1. **What you're trying to do** (goal)
2. **What you tried** (steps)
3. **What happened** (actual result)
4. **What you expected** (expected result)
5. **Environment** (Node version, OS, etc.)
6. **Relevant code** (minimal reproduction)
7. **Error messages** (full stack trace)

---

## Best Practices Summary

### Do ✅

- Write tests for new features
- Use Zod for validation
- Log with structured data
- Handle errors gracefully
- Update documentation
- Use TypeScript types
- Follow naming conventions
- Keep functions small and focused
- Use async/await (not callbacks)
- Return early to reduce nesting

### Don't ❌

- Skip tests
- Use `any` type
- Log sensitive data
- Swallow errors silently
- Leave TODOs without context
- Commit commented-out code
- Hardcode configuration
- Make breaking changes without major version
- Push directly to main

---

## Multi-Agent Collaboration

### When Working with Multiple Agents

If you're collaborating with other AI agents on this project:

1. **Coordinate on tasks** - Check what others are working on
2. **Use branches** - Create feature branches for parallel work
3. **Avoid conflicts** - Work on different files when possible
4. **Communicate** - Leave clear commit messages
5. **Test integration** - Ensure your changes work with others'
6. **Review each other** - Check PRs from other agents

### Parallel Work Distribution

**Agent 1: Features**
- Implement new API endpoints
- Add new MCP tools
- Write feature documentation

**Agent 2: Tests**
- Write unit tests
- Write integration tests
- Improve coverage

**Agent 3: Documentation**
- Update README
- Write examples
- Create tutorials

**Agent 4: Infrastructure**
- Improve build process
- Optimize Docker
- Enhance CI/CD

---

## Final Notes

This is a **living document**. As you work on the project:

- **Update this file** when you discover new patterns
- **Add examples** from real situations
- **Remove outdated** information
- **Clarify** confusing sections

The goal is to make contributing smooth and consistent for all agents and humans working on the project.

---

**Questions?** Open an issue or start a discussion on GitHub.

**Happy coding!** 🚀

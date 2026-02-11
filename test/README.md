# Trading 212 MCP Server - Test Suite

Comprehensive test suite for the Trading 212 MCP server with 115+ tests covering all functionality.

## Test Structure

```
test/
├── unit/                    # Unit tests for isolated components
│   ├── types.test.ts        # Schema validation tests (46 tests)
│   └── client.test.ts       # API client tests (38 tests)
├── integration/             # Integration tests for complete flows
│   └── mcp.test.ts          # MCP server tool handlers (31 tests)
└── README.md                # This file
```

## Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Generate coverage report
npm run test:coverage

# Open interactive test UI
npm run test:ui
```

## Test Coverage

Current coverage status:
- **Client (client.ts)**: 100% coverage
- **Types (types.ts)**: Comprehensive schema validation
- **MCP Tools**: All 26 tools tested

Coverage thresholds:
- Lines: 17% (will increase as more integration tests are added)
- Functions: 50%
- Branches: 50%
- Statements: 17%

## Test Categories

### 1. Unit Tests - Types (46 tests)

Tests all Zod schemas for validation correctness:

**Account Schemas (8 tests)**
- AccountInfoSchema validation
- AccountCashSchema with optional fields
- AccountSummarySchema with nested objects

**Instrument Schemas (6 tests)**
- InstrumentSchema with all types (STOCK, ETF, FUND)
- ExchangeSchema with working schedules

**Position Schema (2 tests)**
- Position validation with required and optional fields

**Order Schemas (18 tests)**
- OrderTypeSchema (MARKET, LIMIT, STOP, STOP_LIMIT)
- OrderSideSchema (BUY, SELL)
- OrderStatusSchema (8 statuses)
- TimeInForceSchema (DAY, GTC)
- MarketOrderRequestSchema with defaults
- LimitOrderRequestSchema with positive price validation
- StopOrderRequestSchema with stop price validation
- StopLimitOrderRequestSchema with both prices

**Pie Schemas (7 tests)**
- PieInstrumentSchema
- PieSchema with instruments array
- CreatePieRequestSchema with name length validation (1-50 chars)
- Goal validation (positive numbers only)

**Historical Data Schemas (5 tests)**
- HistoricalOrderSchema
- DividendSchema with types (ORDINARY, SPECIAL, RETURN_OF_CAPITAL)
- TransactionSchema with 8 transaction types
- ExportRequestSchema with selective data inclusion

### 2. Unit Tests - Client (38 tests)

Tests the Trading212Client API wrapper:

**Constructor & Configuration (6 tests)**
- Demo and live environment initialization
- Base URL construction
- Authorization header generation

**Request Method (5 tests)**
- Successful API requests with schema validation
- Authorization header inclusion
- Error handling (JSON, plain text, status codes)

**Rate Limit Tracking (3 tests)**
- Rate limit header extraction
- Storage per endpoint
- Null handling for missing headers

**Account Management (3 tests)**
- getAccountInfo()
- getAccountCash()
- getAccountSummary()

**Portfolio Management (2 tests)**
- getPortfolio() - list all positions
- getPosition(ticker) - get specific position

**Order Management (7 tests)**
- getOrders() - list all orders
- getOrder(id) - get specific order
- cancelOrder(id) - delete order
- placeMarketOrder() - POST market order
- placeLimitOrder() - POST limit order with price
- placeStopOrder() - POST stop order
- placeStopLimitOrder() - POST stop-limit order

**Instruments & Market Data (2 tests)**
- getInstruments() - search instruments
- getExchanges() - get exchange info

**Pies Management (5 tests)**
- getPies() - list all pies
- getPie(id) - get specific pie
- createPie() - POST new pie
- updatePie() - POST update pie
- deletePie() - DELETE pie

**Historical Data (4 tests)**
- getOrderHistory() with pagination
- getDividends() with filtering
- getTransactions() with limits
- requestExport() with date ranges

**Environment Configuration (2 tests)**
- Demo URL construction
- Live URL construction

### 3. Integration Tests - MCP Server (31 tests)

Tests complete MCP tool handler flows:

**Account Management Tools (3 tests)**
- get_account_info
- get_account_cash
- get_account_summary

**Portfolio Tools (2 tests)**
- get_portfolio
- get_position

**Order Management Tools (7 tests)**
- get_orders
- get_order
- cancel_order
- place_market_order
- place_limit_order
- place_stop_order
- place_stop_limit_order

**Instrument Tools (2 tests)**
- search_instruments
- get_exchanges

**Pies Tools (5 tests)**
- get_pies
- get_pie
- create_pie
- update_pie
- delete_pie

**Historical Data Tools (4 tests)**
- get_order_history
- get_dividends
- get_transactions
- request_export

**Additional Tests (8 tests)**
- Rate limit tracking
- Error handling (4 scenarios)
- Data consistency checks (3 types)

## Test Patterns

### Schema Validation Pattern
```typescript
it('should validate valid data', () => {
  const validData = { /* ... */ };
  const result = Schema.safeParse(validData);
  expect(result.success).toBe(true);
});

it('should reject invalid data', () => {
  const invalidData = { /* ... */ };
  const result = Schema.safeParse(invalidData);
  expect(result.success).toBe(false);
});
```

### API Client Pattern
```typescript
it('should call API endpoint', async () => {
  const mockResponse = { /* ... */ };
  (global.fetch as any).mockResolvedValueOnce({
    ok: true,
    headers: new Map(),
    json: async () => mockResponse,
  });

  const result = await client.getMethod();
  expect(result).toEqual(mockResponse);
});
```

### MCP Tool Pattern
```typescript
it('should handle tool call', async () => {
  const result = await mockClient.getMethod();
  expect(result).toHaveProperty('expectedField');
  expect(mockClient.getMethod).toHaveBeenCalledTimes(1);
});
```

## Writing New Tests

### Adding Type Tests
1. Create test in `test/unit/types.test.ts`
2. Test both valid and invalid inputs
3. Test optional fields
4. Test enum values
5. Test validation constraints (min, max, positive, etc.)

### Adding Client Tests
1. Create test in `test/unit/client.test.ts`
2. Mock `global.fetch` with appropriate response
3. Test successful calls
4. Test error handling
5. Test rate limit tracking
6. Verify request parameters

### Adding Integration Tests
1. Create test in `test/integration/mcp.test.ts`
2. Use mocked Trading212Client
3. Test complete tool handler flow
4. Verify data structure consistency
5. Test error propagation

## Test Configuration

See `vitest.config.ts` for full configuration:

- **Environment**: Node.js
- **Globals**: Enabled
- **Timeout**: 30 seconds per test
- **Coverage Provider**: v8
- **Coverage Reports**: text, json, html, lcov
- **Excluded from Coverage**: dist/, test/, types.ts

## Continuous Integration

Tests are automatically run on:
- Every push to any branch
- Every pull request
- Before publishing to npm

See `.github/workflows/ci.yml` for CI configuration.

## Mocking Strategy

### Global Fetch Mock
```typescript
global.fetch = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
});
```

### Trading212Client Mock
```typescript
vi.mock('../../src/client.js', () => ({
  Trading212Client: vi.fn().mockImplementation(() => ({
    getAccountInfo: vi.fn().mockResolvedValue({ /* ... */ }),
    // ... more methods
  })),
}));
```

## Best Practices

1. **Test Isolation**: Each test should be independent
2. **Clear Names**: Use descriptive test names
3. **Single Assertion**: Test one thing per test
4. **Mock External Dependencies**: Don't make real API calls
5. **Test Edge Cases**: Zero, negative, null, undefined, empty strings
6. **Test Error Paths**: Not just happy paths
7. **Use Type Safety**: Leverage TypeScript for test data

## Debugging Tests

### Run Single Test File
```bash
npx vitest run test/unit/client.test.ts
```

### Run Single Test
```bash
npx vitest run -t "should validate valid account info"
```

### Debug Mode
```bash
npx vitest --inspect-brk --no-file-parallelism
```

### View Coverage for Specific File
```bash
npx vitest run --coverage --coverage.include=src/client.ts
```

## Future Enhancements

Potential additions to test suite:

1. **End-to-End Tests**: Test with real demo API (rate limited)
2. **Performance Tests**: Test rate limit compliance
3. **Security Tests**: Test authentication and authorization
4. **Snapshot Tests**: Test JSON response structures
5. **Contract Tests**: Verify API contract compliance
6. **Load Tests**: Test concurrent request handling

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Zod Documentation](https://zod.dev/)
- [Trading 212 API Docs](https://docs.trading212.com/api)

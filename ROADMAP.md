# Roadmap

Future plans and enhancements for the Trading 212 MCP server.

---

## Version 1.x (Current - Maintenance)

### ✅ Completed (v1.0.0 - v1.1.0)

- [x] Complete MCP server with 26 tools
- [x] TypeScript with strict mode
- [x] Zod schema validation
- [x] Rate limit tracking
- [x] Docker support with multi-stage builds
- [x] Global CLI binary (`trading212-mcp`)
- [x] Comprehensive testing (115 tests, Vitest)
- [x] Code quality tools (Biome linter)
- [x] Structured logging (Pino)
- [x] Custom error classes
- [x] GitHub Actions CI/CD
- [x] Comprehensive documentation

### 🔧 Planned (v1.2.0 - Patch Releases)

- [ ] Add health check endpoint (optional HTTP server)
- [ ] Improve error messages with suggestions
- [ ] Add request retry logic with exponential backoff
- [ ] Performance benchmarking suite
- [ ] Memory usage optimization
- [ ] Add more test coverage (target 90%+)
- [ ] CLI interactive mode (prompt for API key)
- [ ] Environment config file support (~/.trading212rc)

---

## Version 2.0 (Q2 2026) - Enhanced Features

### 🎯 Priority Features

#### 1. Response Caching System
**Priority:** High
**Effort:** Medium

```typescript
// Cache frequently accessed, rarely changing data
const instruments = await client.getInstruments({ cache: true });

// Features:
// - Instrument list caching (1 hour TTL)
// - Exchange schedule caching (24 hour TTL)
// - Account info caching (5 minute TTL)
// - Automatic cache invalidation
// - LRU cache with size limits
```

**Benefits:**
- Reduce API calls by 30-50%
- Faster responses for repeated queries
- Lower rate limit usage
- Better user experience

---

#### 2. Portfolio Analytics Tools
**Priority:** High
**Effort:** High

**New MCP Tools:**
- `analyze_portfolio` - Comprehensive portfolio analysis
- `calculate_metrics` - Financial metrics (Sharpe ratio, beta, alpha)
- `assess_risk` - Risk assessment and diversification score
- `compare_performance` - Compare against benchmarks (S&P 500, etc.)
- `get_recommendations` - Rebalancing suggestions

**Example:**
```typescript
{
  "tool": "analyze_portfolio",
  "result": {
    "totalValue": 50000,
    "diversification": {
      "score": 7.5,
      "sectorConcentration": { "tech": 0.45, "healthcare": 0.25, ... },
      "geographicConcentration": { "us": 0.80, "eu": 0.15, ... }
    },
    "risk": {
      "volatility": 0.18,
      "beta": 1.05,
      "sharpeRatio": 1.4
    },
    "recommendations": [
      "Reduce tech sector exposure from 45% to 30%",
      "Consider adding international exposure"
    ]
  }
}
```

---

#### 3. WebSocket Support (Conditional)
**Priority:** Medium
**Effort:** High
**Depends on:** Trading 212 API adding WebSocket support

```typescript
// Real-time price updates
await client.subscribeToPrice('AAPL', (data) => {
  console.log(`AAPL: ${data.price}`);
});

// Real-time order updates
await client.subscribeToOrders((order) => {
  console.log(`Order ${order.id}: ${order.status}`);
});
```

**Use Cases:**
- Real-time portfolio tracking
- Live order status updates
- Market data streaming
- Alert triggers

---

#### 4. Advanced Order Types
**Priority:** Medium
**Effort:** Medium

**New Order Features:**
- Trailing stop orders
- OCO (One-Cancels-Other) orders
- Bracket orders (entry + stop-loss + take-profit)
- Conditional orders (if-then logic)
- Scheduled orders

**Example:**
```typescript
await client.placeTrailingStopOrder({
  ticker: 'AAPL',
  quantity: 10,
  trailingPercent: 5,  // Stop loss 5% below peak
});

await client.placeBracketOrder({
  ticker: 'TSLA',
  quantity: 5,
  entryPrice: 200,
  stopLoss: 190,
  takeProfit: 220,
});
```

---

#### 5. Tax Reporting Tools
**Priority:** Medium
**Effort:** High

**New MCP Tools:**
- `calculate_capital_gains` - Short-term vs long-term gains
- `generate_tax_report` - Annual tax summary
- `export_for_turbotax` - TurboTax CSV format
- `calculate_wash_sales` - Identify wash sale violations
- `optimize_tax_loss_harvesting` - Suggest loss harvesting opportunities

**Example:**
```typescript
{
  "tool": "calculate_capital_gains",
  "args": { "year": 2024 },
  "result": {
    "shortTerm": {
      "totalGain": 5000,
      "taxRate": 0.22,
      "estimatedTax": 1100
    },
    "longTerm": {
      "totalGain": 15000,
      "taxRate": 0.15,
      "estimatedTax": 2250
    },
    "washSales": [
      { "ticker": "TSLA", "loss": 500, "disallowed": true }
    ]
  }
}
```

---

## Version 3.0 (Q4 2026) - Advanced Features

### 🚀 Major Enhancements

#### 1. Multi-Account Support
**Priority:** High
**Effort:** High

**Features:**
- Manage multiple Trading 212 accounts
- Switch between accounts seamlessly
- Aggregate portfolio view across accounts
- Per-account rate limit tracking

**Configuration:**
```json
{
  "accounts": {
    "personal": {
      "apiKey": "key1",
      "environment": "live"
    },
    "isa": {
      "apiKey": "key2",
      "environment": "live"
    },
    "demo": {
      "apiKey": "key3",
      "environment": "demo"
    }
  }
}
```

**New MCP Tools:**
- `switch_account` - Switch active account
- `list_accounts` - List configured accounts
- `get_aggregate_portfolio` - Combined portfolio view

---

#### 2. Automated Rebalancing
**Priority:** Medium
**Effort:** High

**Features:**
- Define target allocation
- Automatic rebalancing suggestions
- Dry-run mode (preview changes)
- Execute rebalancing with one command
- Minimize tax impact

**Example:**
```typescript
await client.rebalancePortfolio({
  target: {
    'AAPL': 0.25,
    'MSFT': 0.25,
    'GOOGL': 0.25,
    'AMZN': 0.25
  },
  threshold: 0.05,  // Rebalance if >5% off target
  minimizeTaxes: true,
  dryRun: true
});
```

---

#### 3. Backtesting Engine
**Priority:** Low
**Effort:** Very High

**Features:**
- Test strategies against historical data
- Monte Carlo simulations
- Risk analysis
- Performance metrics

**Example:**
```typescript
await client.backtestStrategy({
  strategy: 'dollar_cost_averaging',
  instrument: 'AAPL',
  amount: 1000,
  frequency: 'monthly',
  startDate: '2020-01-01',
  endDate: '2023-12-31'
});
```

---

#### 4. Alerting System
**Priority:** Medium
**Effort:** Medium

**Alert Types:**
- Price alerts (above/below threshold)
- Portfolio value alerts
- Dividend payment alerts
- Order fill alerts
- Rate limit warnings

**Example:**
```typescript
await client.createAlert({
  type: 'price',
  ticker: 'AAPL',
  condition: 'above',
  threshold: 200,
  notification: 'email'
});
```

---

#### 5. AI-Powered Insights
**Priority:** Low
**Effort:** High

**Features:**
- Pattern recognition in portfolio
- Anomaly detection
- Predictive analytics
- Natural language portfolio queries

**Example:**
```
User: "Why did my portfolio drop 5% today?"

AI: "Your portfolio decreased primarily due to:
1. TSLA down 12% (-$1,200) - Missed earnings expectations
2. NVDA down 8% (-$800) - Broader tech sector selloff
3. Other holdings stable

Tech sector exposure (45%) amplified the impact."
```

---

## Version 4.0 (2027+) - Platform Evolution

### 🌟 Long-Term Vision

#### 1. REST API Server Mode
Transform from stdio-only to dual-mode server:

```typescript
// Mode 1: MCP server (stdio) - Current
trading212-mcp --mcp

// Mode 2: REST API server - New
trading212-mcp --rest --port 3000

// Mode 3: Both
trading212-mcp --rest --mcp
```

**REST API Features:**
- HTTP endpoints mirroring MCP tools
- API key authentication
- Rate limiting per client
- OpenAPI/Swagger documentation
- WebSocket support for real-time data

---

#### 2. Web Dashboard
**Priority:** Low
**Effort:** Very High

React-based web interface:
- Portfolio visualization
- Real-time charts
- Order management UI
- Analytics dashboard
- Account settings

---

#### 3. Mobile App Integration
**Priority:** Low
**Effort:** Very High

Native apps (iOS/Android):
- Portfolio tracking
- Quick order placement
- Push notifications for alerts
- Biometric authentication

---

#### 4. Plugin System
**Priority:** Low
**Effort:** High

Extensible architecture:
```typescript
// Custom strategy plugin
export default {
  name: 'my-strategy',
  version: '1.0.0',
  tools: [
    {
      name: 'execute_my_strategy',
      handler: async (client, args) => { ... }
    }
  ]
};
```

---

## Technical Debt & Improvements

### Continuous Improvements

#### Testing
- [ ] Increase coverage to 90%+
- [ ] Add E2E tests against demo API
- [ ] Performance regression tests
- [ ] Load testing for concurrent requests

#### Documentation
- [ ] Video tutorials
- [ ] Interactive examples
- [ ] API reference (auto-generated)
- [ ] Architecture decision records (ADR)

#### Performance
- [ ] Connection pooling optimization
- [ ] Response streaming for large datasets
- [ ] Pagination optimization
- [ ] Memory profiling and optimization

#### Security
- [ ] Security audit
- [ ] Dependency vulnerability scanning
- [ ] SAST (Static Application Security Testing)
- [ ] API key rotation workflow

#### Developer Experience
- [ ] Debugging tools
- [ ] Better error messages with fix suggestions
- [ ] CLI auto-completion
- [ ] IDE extensions (VSCode)

---

## Community Features

### Open Source Growth

- [ ] Contributor recognition system
- [ ] Monthly community calls
- [ ] Bug bounty program
- [ ] Feature request voting
- [ ] Community plugins repository

---

## Dependencies on Trading 212 API

Many features depend on Trading 212 API evolution:

| Feature | Requires from T212 API |
|---------|----------------------|
| WebSocket support | WebSocket endpoints |
| Advanced orders | New order types API |
| Real-time streaming | Streaming API |
| Historical data | Extended historical data API |
| Account insights | Additional metadata endpoints |

---

## How to Suggest Features

1. **Check existing issues** on GitHub
2. **Open a feature request** with:
   - Clear use case
   - Expected behavior
   - Benefits to users
   - Rough implementation ideas (optional)
3. **Discuss in community** (GitHub Discussions)
4. **Vote** on existing feature requests

---

## Versioning Strategy

We follow [Semantic Versioning](https://semver.org/):

- **Major (x.0.0)**: Breaking changes, major features
- **Minor (1.x.0)**: New features, backward compatible
- **Patch (1.0.x)**: Bug fixes, small improvements

**Release Cadence:**
- Patch releases: As needed (bug fixes)
- Minor releases: Quarterly
- Major releases: Yearly

---

## Contributing to Roadmap

Your input shapes the roadmap! Contribute by:

1. **Using the software** and providing feedback
2. **Reporting bugs** and edge cases
3. **Suggesting features** with real use cases
4. **Contributing code** for planned features
5. **Writing documentation** and tutorials

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

*Last updated: 2026-02-10*

*This roadmap is aspirational and subject to change based on community feedback, Trading 212 API evolution, and resource availability.*

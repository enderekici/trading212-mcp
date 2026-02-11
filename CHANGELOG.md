# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

#### Docker Support
- Production-ready Dockerfile with multi-stage build
- Docker Compose configuration for easy orchestration
- Security hardening (non-root user, read-only filesystem)
- Health checks for container monitoring
- Resource limits (1GB memory, 1 CPU)
- Comprehensive Docker deployment guide (DOCKER.md)
- `.dockerignore` for optimized builds
- Container image size: ~249MB (Alpine Linux based)

## [1.0.0] - 2026-02-10

### Added

#### Core Features
- Complete MCP server implementation for Trading 212 API
- Support for both demo and live trading environments
- Comprehensive error handling and rate limit tracking
- Zod schema validation for all API requests and responses

#### Account Management (3 tools)
- `get_account_info` - Retrieve account metadata
- `get_account_cash` - Get detailed cash balance information
- `get_account_summary` - Get comprehensive account summary

#### Portfolio Management (2 tools)
- `get_portfolio` - List all open positions
- `get_position` - Get detailed position information by ticker

#### Order Management (7 tools)
- `get_orders` - Retrieve all active orders
- `get_order` - Get detailed information about a specific order
- `cancel_order` - Cancel an active order
- `place_market_order` - Place market orders
- `place_limit_order` - Place limit orders
- `place_stop_order` - Place stop orders
- `place_stop_limit_order` - Place stop-limit orders

#### Market Data & Instruments (2 tools)
- `get_instruments` - Search and filter tradeable instruments
- `get_exchanges` - Get exchange information and trading schedules

#### Investment Pies (5 tools)
- `get_pies` - List all investment pies
- `get_pie` - Get detailed information about a specific pie
- `create_pie` - Create new investment pies
- `update_pie` - Update existing pie configurations
- `delete_pie` - Delete investment pies

#### Historical Data (4 tools)
- `get_order_history` - Access historical orders with pagination
- `get_dividends` - Retrieve dividend payment records
- `get_transactions` - View complete transaction history
- `request_export` - Export data to CSV for specified time periods

#### Documentation
- Comprehensive README with setup instructions
- Quick start guide for fast setup
- Detailed usage examples (EXAMPLES.md)
- Contributing guidelines (CONTRIBUTING.md)
- MIT License

#### Configuration
- Environment variable support for API key and environment
- Claude Desktop integration configuration
- TypeScript configuration with strict mode
- ESM module support

### Technical Details

#### Dependencies
- `@modelcontextprotocol/sdk` ^1.0.4 - MCP server implementation
- `zod` ^3.24.1 - Schema validation

#### Development Dependencies
- `@types/node` ^22.10.2 - Node.js type definitions
- `tsx` ^4.19.2 - TypeScript execution
- `typescript` ^5.7.2 - TypeScript compiler

#### Architecture
- Clean separation of concerns (types, client, server)
- Type-safe API client with full TypeScript support
- Automatic rate limit tracking via response headers
- Comprehensive error handling with descriptive messages
- Support for pagination in historical data endpoints

#### Rate Limiting
- Automatic extraction of rate limit headers
- Per-endpoint rate limit tracking
- Clear error messages when limits are exceeded

#### Security Features
- HTTP Basic Authentication
- Environment variable configuration
- No hardcoded credentials
- Support for API key permissions
- Optional IP whitelisting support

### Known Limitations

- Trading 212 API is in BETA (under active development)
- No WebSocket/streaming support (REST only)
- Pies API is deprecated (no further updates from Trading 212)
- CFD accounts are not supported
- Rate limits enforced per account

### Browser Support

Not applicable - this is a server-side MCP implementation.

### Platform Support

- ✅ macOS
- ✅ Linux
- ✅ Windows
- ⚠️ Requires Node.js 18+

### Migration Notes

This is the initial release. No migration required.

---

## Future Considerations

Potential features for future releases (subject to Trading 212 API availability):

- [ ] WebSocket support (if Trading 212 adds it)
- [ ] Additional order types (if available)
- [ ] Portfolio analytics tools
- [ ] Risk assessment tools
- [ ] Multi-account support
- [ ] Batch operations
- [ ] Automated rebalancing suggestions
- [ ] Tax reporting helpers
- [ ] Performance metrics
- [ ] Watchlist management

## Support

For issues, feature requests, or questions:
- GitHub Issues: https://github.com/enderekici/trading212-mcp/issues
- Trading 212 API Docs: https://docs.trading212.com/api

## Acknowledgments

- Trading 212 for providing the public API
- Anthropic for the Model Context Protocol
- The open-source community

---

[1.0.0]: https://github.com/enderekici/trading212-mcp/releases/tag/v1.0.0

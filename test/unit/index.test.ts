import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock logger before anything else
vi.mock('../../src/utils/logger.js', () => {
  return {
    default: {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
      fatal: vi.fn(),
      level: 'info',
    },
  };
});

// Store reference to the request handlers
let listToolsHandler: ((request: any) => Promise<any>) | null = null;
let callToolHandler: ((request: any) => Promise<any>) | null = null;
let handlerSetCount = 0;

vi.mock('@modelcontextprotocol/sdk/server/index.js', () => {
  return {
    // biome-ignore lint/complexity/useArrowFunction: must use function for constructor mock
    Server: vi.fn(function () {
      return {
        connect: vi.fn().mockResolvedValue(undefined),
        setRequestHandler: vi.fn().mockImplementation((_schema: any, handler: any) => {
          if (handlerSetCount === 0) {
            listToolsHandler = handler;
          } else {
            callToolHandler = handler;
          }
          handlerSetCount++;
        }),
      };
    }),
  };
});

vi.mock('@modelcontextprotocol/sdk/server/stdio.js', () => {
  return {
    // biome-ignore lint/complexity/useArrowFunction: must use function for constructor mock
    StdioServerTransport: vi.fn(function () {
      return {};
    }),
  };
});

// Mock the Trading212Client
const mockClientInstance = {
  getAccountInfo: vi.fn().mockResolvedValue({ currencyCode: 'USD', id: 12345 }),
  getAccountCash: vi.fn().mockResolvedValue({ free: 1000.5, total: 5000.0 }),
  getAccountSummary: vi.fn().mockResolvedValue({
    cash: { free: 1000.5, total: 5000.0 },
    invested: 3500.0,
    ppl: 500.25,
    pieCash: 100.0,
  }),
  getPortfolio: vi.fn().mockResolvedValue([
    {
      averagePrice: 150.25,
      currentPrice: 155.5,
      ppl: 52.5,
      quantity: 10,
      ticker: 'AAPL',
    },
  ]),
  getPosition: vi.fn().mockResolvedValue({
    averagePrice: 150.25,
    currentPrice: 155.5,
    ppl: 52.5,
    quantity: 10,
    ticker: 'AAPL',
  }),
  getOrders: vi.fn().mockResolvedValue([]),
  getOrder: vi.fn().mockResolvedValue({
    createdOn: '2024-01-01T00:00:00Z',
    filledQuantity: 0,
    filledValue: 0,
    id: 123456,
    quantity: 10,
    side: 'BUY',
    status: 'NEW',
    ticker: 'AAPL',
    timeValidity: 'DAY',
    type: 'MARKET',
  }),
  cancelOrder: vi.fn().mockResolvedValue(undefined),
  placeMarketOrder: vi.fn().mockResolvedValue({
    createdOn: '2024-01-01T00:00:00Z',
    filledQuantity: 0,
    filledValue: 0,
    id: 123456,
    quantity: 10,
    side: 'BUY',
    status: 'NEW',
    ticker: 'AAPL',
    timeValidity: 'DAY',
    type: 'MARKET',
  }),
  placeLimitOrder: vi.fn().mockResolvedValue({
    createdOn: '2024-01-01T00:00:00Z',
    filledQuantity: 0,
    filledValue: 0,
    id: 123456,
    limitPrice: 150.0,
    quantity: 10,
    side: 'BUY',
    status: 'NEW',
    ticker: 'AAPL',
    timeValidity: 'GTC',
    type: 'LIMIT',
  }),
  placeStopOrder: vi.fn().mockResolvedValue({
    createdOn: '2024-01-01T00:00:00Z',
    filledQuantity: 0,
    filledValue: 0,
    id: 123456,
    quantity: 10,
    side: 'SELL',
    status: 'NEW',
    stopPrice: 140.0,
    ticker: 'AAPL',
    timeValidity: 'DAY',
    type: 'STOP',
  }),
  placeStopLimitOrder: vi.fn().mockResolvedValue({
    createdOn: '2024-01-01T00:00:00Z',
    filledQuantity: 0,
    filledValue: 0,
    id: 123456,
    limitPrice: 145.0,
    quantity: 10,
    side: 'SELL',
    status: 'NEW',
    stopPrice: 140.0,
    ticker: 'AAPL',
    timeValidity: 'GTC',
    type: 'STOP_LIMIT',
  }),
  getInstruments: vi.fn().mockResolvedValue([
    {
      addedOn: '2024-01-01T00:00:00Z',
      currencyCode: 'USD',
      isin: 'US0378331005',
      minTradeQuantity: 1,
      name: 'Apple Inc.',
      shortName: 'AAPL',
      ticker: 'AAPL_US_EQ',
      type: 'STOCK',
      workingScheduleId: 1,
    },
    {
      addedOn: '2024-01-01T00:00:00Z',
      currencyCode: 'USD',
      isin: 'US5949181045',
      minTradeQuantity: 1,
      name: 'Microsoft Corporation',
      shortName: 'MSFT',
      ticker: 'MSFT_US_EQ',
      type: 'STOCK',
      workingScheduleId: 1,
    },
  ]),
  getExchanges: vi.fn().mockResolvedValue([
    {
      id: 1,
      name: 'NASDAQ',
      workingSchedules: [],
    },
  ]),
  getPies: vi.fn().mockResolvedValue([]),
  getPie: vi.fn().mockResolvedValue({
    cash: 100.0,
    dividendCashAction: 'REINVEST',
    icon: 'BRIEFCASE',
    id: 123,
    instruments: [],
    name: 'Test Pie',
    result: 50.0,
    status: 'ACTIVE',
  }),
  createPie: vi.fn().mockResolvedValue({
    cash: 0,
    dividendCashAction: 'REINVEST',
    icon: 'BRIEFCASE',
    id: 456,
    instruments: [],
    name: 'New Pie',
    result: 0,
    status: 'ACTIVE',
  }),
  updatePie: vi.fn().mockResolvedValue({
    cash: 100.0,
    dividendCashAction: 'REINVEST',
    icon: 'BRIEFCASE',
    id: 123,
    instruments: [],
    name: 'Updated Pie',
    result: 50.0,
    status: 'ACTIVE',
  }),
  deletePie: vi.fn().mockResolvedValue(undefined),
  getOrderHistory: vi.fn().mockResolvedValue({
    items: [],
    nextPagePath: undefined,
  }),
  getDividends: vi.fn().mockResolvedValue({
    items: [],
    nextPagePath: undefined,
  }),
  getTransactions: vi.fn().mockResolvedValue({
    items: [],
    nextPagePath: undefined,
  }),
  requestExport: vi.fn().mockResolvedValue({ reportId: 789 }),
};

vi.mock('../../src/client.js', () => {
  return {
    // biome-ignore lint/complexity/useArrowFunction: must use function for constructor mock
    Trading212Client: vi.fn(function () {
      return mockClientInstance;
    }),
  };
});

// Set the env var before the module loads
process.env.TRADING212_API_KEY = 'test-api-key';
process.env.TRADING212_ENVIRONMENT = 'demo';

// Import the module -- this triggers all top-level code (handlers are registered)
// The import itself exercises the module's initialization path.
await import('../../src/index.js');

describe('MCP Server Index', () => {
  beforeEach(() => {
    // Reset mock call history but keep implementations
    vi.clearAllMocks();

    // Re-set default implementations that were cleared
    mockClientInstance.getAccountInfo.mockResolvedValue({ currencyCode: 'USD', id: 12345 });
    mockClientInstance.getAccountCash.mockResolvedValue({ free: 1000.5, total: 5000.0 });
    mockClientInstance.getAccountSummary.mockResolvedValue({
      cash: { free: 1000.5, total: 5000.0 },
      invested: 3500.0,
      ppl: 500.25,
      pieCash: 100.0,
    });
    mockClientInstance.getPortfolio.mockResolvedValue([
      {
        averagePrice: 150.25,
        currentPrice: 155.5,
        ppl: 52.5,
        quantity: 10,
        ticker: 'AAPL',
      },
    ]);
    mockClientInstance.getPosition.mockResolvedValue({
      averagePrice: 150.25,
      currentPrice: 155.5,
      ppl: 52.5,
      quantity: 10,
      ticker: 'AAPL',
    });
    mockClientInstance.getOrders.mockResolvedValue([]);
    mockClientInstance.getOrder.mockResolvedValue({
      createdOn: '2024-01-01T00:00:00Z',
      filledQuantity: 0,
      filledValue: 0,
      id: 123456,
      quantity: 10,
      side: 'BUY',
      status: 'NEW',
      ticker: 'AAPL',
      timeValidity: 'DAY',
      type: 'MARKET',
    });
    mockClientInstance.cancelOrder.mockResolvedValue(undefined);
    mockClientInstance.placeMarketOrder.mockResolvedValue({
      createdOn: '2024-01-01T00:00:00Z',
      filledQuantity: 0,
      filledValue: 0,
      id: 123456,
      quantity: 10,
      side: 'BUY',
      status: 'NEW',
      ticker: 'AAPL',
      timeValidity: 'DAY',
      type: 'MARKET',
    });
    mockClientInstance.placeLimitOrder.mockResolvedValue({
      createdOn: '2024-01-01T00:00:00Z',
      filledQuantity: 0,
      filledValue: 0,
      id: 123456,
      limitPrice: 150.0,
      quantity: 10,
      side: 'BUY',
      status: 'NEW',
      ticker: 'AAPL',
      timeValidity: 'GTC',
      type: 'LIMIT',
    });
    mockClientInstance.placeStopOrder.mockResolvedValue({
      createdOn: '2024-01-01T00:00:00Z',
      filledQuantity: 0,
      filledValue: 0,
      id: 123456,
      quantity: 10,
      side: 'SELL',
      status: 'NEW',
      stopPrice: 140.0,
      ticker: 'AAPL',
      timeValidity: 'DAY',
      type: 'STOP',
    });
    mockClientInstance.placeStopLimitOrder.mockResolvedValue({
      createdOn: '2024-01-01T00:00:00Z',
      filledQuantity: 0,
      filledValue: 0,
      id: 123456,
      limitPrice: 145.0,
      quantity: 10,
      side: 'SELL',
      status: 'NEW',
      stopPrice: 140.0,
      ticker: 'AAPL',
      timeValidity: 'GTC',
      type: 'STOP_LIMIT',
    });
    mockClientInstance.getInstruments.mockResolvedValue([
      {
        addedOn: '2024-01-01T00:00:00Z',
        currencyCode: 'USD',
        isin: 'US0378331005',
        minTradeQuantity: 1,
        name: 'Apple Inc.',
        shortName: 'AAPL',
        ticker: 'AAPL_US_EQ',
        type: 'STOCK',
        workingScheduleId: 1,
      },
      {
        addedOn: '2024-01-01T00:00:00Z',
        currencyCode: 'USD',
        isin: 'US5949181045',
        minTradeQuantity: 1,
        name: 'Microsoft Corporation',
        shortName: 'MSFT',
        ticker: 'MSFT_US_EQ',
        type: 'STOCK',
        workingScheduleId: 1,
      },
    ]);
    mockClientInstance.getExchanges.mockResolvedValue([
      {
        id: 1,
        name: 'NASDAQ',
        workingSchedules: [],
      },
    ]);
    mockClientInstance.getPies.mockResolvedValue([]);
    mockClientInstance.getPie.mockResolvedValue({
      cash: 100.0,
      dividendCashAction: 'REINVEST',
      icon: 'BRIEFCASE',
      id: 123,
      instruments: [],
      name: 'Test Pie',
      result: 50.0,
      status: 'ACTIVE',
    });
    mockClientInstance.createPie.mockResolvedValue({
      cash: 0,
      dividendCashAction: 'REINVEST',
      icon: 'BRIEFCASE',
      id: 456,
      instruments: [],
      name: 'New Pie',
      result: 0,
      status: 'ACTIVE',
    });
    mockClientInstance.updatePie.mockResolvedValue({
      cash: 100.0,
      dividendCashAction: 'REINVEST',
      icon: 'BRIEFCASE',
      id: 123,
      instruments: [],
      name: 'Updated Pie',
      result: 50.0,
      status: 'ACTIVE',
    });
    mockClientInstance.deletePie.mockResolvedValue(undefined);
    mockClientInstance.getOrderHistory.mockResolvedValue({
      items: [],
      nextPagePath: undefined,
    });
    mockClientInstance.getDividends.mockResolvedValue({
      items: [],
      nextPagePath: undefined,
    });
    mockClientInstance.getTransactions.mockResolvedValue({
      items: [],
      nextPagePath: undefined,
    });
    mockClientInstance.requestExport.mockResolvedValue({ reportId: 789 });
  });

  describe('Server initialization', () => {
    it('should have registered the ListTools handler', () => {
      expect(listToolsHandler).not.toBeNull();
    });

    it('should have registered the CallTool handler', () => {
      expect(callToolHandler).not.toBeNull();
    });
  });

  describe('ListTools handler', () => {
    it('should return all tools', async () => {
      const result = await listToolsHandler?.({});
      expect(result.tools).toBeDefined();
      expect(result.tools.length).toBeGreaterThanOrEqual(23);

      const toolNames = result.tools.map((t: any) => t.name);
      expect(toolNames).toContain('get_account_info');
      expect(toolNames).toContain('get_account_cash');
      expect(toolNames).toContain('get_account_summary');
      expect(toolNames).toContain('get_portfolio');
      expect(toolNames).toContain('get_position');
      expect(toolNames).toContain('get_orders');
      expect(toolNames).toContain('get_order');
      expect(toolNames).toContain('cancel_order');
      expect(toolNames).toContain('place_market_order');
      expect(toolNames).toContain('place_limit_order');
      expect(toolNames).toContain('place_stop_order');
      expect(toolNames).toContain('place_stop_limit_order');
      expect(toolNames).toContain('get_instruments');
      expect(toolNames).toContain('get_exchanges');
      expect(toolNames).toContain('get_pies');
      expect(toolNames).toContain('get_pie');
      expect(toolNames).toContain('create_pie');
      expect(toolNames).toContain('update_pie');
      expect(toolNames).toContain('delete_pie');
      expect(toolNames).toContain('get_order_history');
      expect(toolNames).toContain('get_dividends');
      expect(toolNames).toContain('get_transactions');
      expect(toolNames).toContain('request_export');
    });
  });

  describe('CallTool handler - Account Management', () => {
    it('should handle get_account_info', async () => {
      const result = await callToolHandler?.({
        params: { name: 'get_account_info', arguments: {} },
      });
      expect(result.content[0].type).toBe('text');
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.currencyCode).toBe('USD');
      expect(parsed.id).toBe(12345);
    });

    it('should handle get_account_cash', async () => {
      const result = await callToolHandler?.({
        params: { name: 'get_account_cash', arguments: {} },
      });
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.free).toBe(1000.5);
      expect(parsed.total).toBe(5000.0);
    });

    it('should handle get_account_summary', async () => {
      const result = await callToolHandler?.({
        params: { name: 'get_account_summary', arguments: {} },
      });
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.cash).toBeDefined();
      expect(parsed.invested).toBe(3500.0);
    });
  });

  describe('CallTool handler - Portfolio/Positions', () => {
    it('should handle get_portfolio', async () => {
      const result = await callToolHandler?.({
        params: { name: 'get_portfolio', arguments: {} },
      });
      const parsed = JSON.parse(result.content[0].text);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed[0].ticker).toBe('AAPL');
    });

    it('should handle get_position', async () => {
      const result = await callToolHandler?.({
        params: { name: 'get_position', arguments: { ticker: 'AAPL' } },
      });
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.ticker).toBe('AAPL');
      expect(mockClientInstance.getPosition).toHaveBeenCalledWith('AAPL');
    });
  });

  describe('CallTool handler - Order Management', () => {
    it('should handle get_orders', async () => {
      const result = await callToolHandler?.({
        params: { name: 'get_orders', arguments: {} },
      });
      const parsed = JSON.parse(result.content[0].text);
      expect(Array.isArray(parsed)).toBe(true);
    });

    it('should handle get_order', async () => {
      const result = await callToolHandler?.({
        params: { name: 'get_order', arguments: { orderId: 123456 } },
      });
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.id).toBe(123456);
    });

    it('should handle cancel_order', async () => {
      const result = await callToolHandler?.({
        params: { name: 'cancel_order', arguments: { orderId: 123456 } },
      });
      expect(result.content[0].text).toContain('cancelled successfully');
    });

    it('should handle place_market_order', async () => {
      const result = await callToolHandler?.({
        params: {
          name: 'place_market_order',
          arguments: { ticker: 'AAPL', quantity: 10 },
        },
      });
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.type).toBe('MARKET');
    });

    it('should handle place_limit_order', async () => {
      const result = await callToolHandler?.({
        params: {
          name: 'place_limit_order',
          arguments: { ticker: 'AAPL', quantity: 10, limitPrice: 150.0 },
        },
      });
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.type).toBe('LIMIT');
    });

    it('should handle place_stop_order', async () => {
      const result = await callToolHandler?.({
        params: {
          name: 'place_stop_order',
          arguments: { ticker: 'AAPL', quantity: 10, stopPrice: 140.0 },
        },
      });
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.type).toBe('STOP');
    });

    it('should handle place_stop_limit_order', async () => {
      const result = await callToolHandler?.({
        params: {
          name: 'place_stop_limit_order',
          arguments: {
            ticker: 'AAPL',
            quantity: 10,
            stopPrice: 140.0,
            limitPrice: 145.0,
          },
        },
      });
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.type).toBe('STOP_LIMIT');
    });
  });

  describe('CallTool handler - Instruments & Market Data', () => {
    it('should handle get_instruments without search', async () => {
      const result = await callToolHandler?.({
        params: { name: 'get_instruments', arguments: {} },
      });
      const parsed = JSON.parse(result.content[0].text);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed.length).toBe(2);
    });

    it('should handle get_instruments with search by name (case-insensitive)', async () => {
      const result = await callToolHandler?.({
        params: { name: 'get_instruments', arguments: { search: 'apple' } },
      });
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.length).toBe(1);
      expect(parsed[0].name).toBe('Apple Inc.');
    });

    it('should handle get_instruments with search by ticker', async () => {
      const result = await callToolHandler?.({
        params: { name: 'get_instruments', arguments: { search: 'AAPL' } },
      });
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.length).toBe(1);
    });

    it('should handle get_instruments with search by shortName', async () => {
      const result = await callToolHandler?.({
        params: { name: 'get_instruments', arguments: { search: 'MSFT' } },
      });
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.length).toBe(1);
      expect(parsed[0].shortName).toBe('MSFT');
    });

    it('should handle get_instruments with search by ISIN', async () => {
      const result = await callToolHandler?.({
        params: { name: 'get_instruments', arguments: { search: 'US0378331005' } },
      });
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.length).toBe(1);
    });

    it('should return empty for non-matching search', async () => {
      const result = await callToolHandler?.({
        params: { name: 'get_instruments', arguments: { search: 'ZZZZZ' } },
      });
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.length).toBe(0);
    });

    it('should handle get_exchanges', async () => {
      const result = await callToolHandler?.({
        params: { name: 'get_exchanges', arguments: {} },
      });
      const parsed = JSON.parse(result.content[0].text);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed[0].name).toBe('NASDAQ');
    });
  });

  describe('CallTool handler - Pies', () => {
    it('should handle get_pies', async () => {
      const result = await callToolHandler?.({
        params: { name: 'get_pies', arguments: {} },
      });
      const parsed = JSON.parse(result.content[0].text);
      expect(Array.isArray(parsed)).toBe(true);
    });

    it('should handle get_pie', async () => {
      const result = await callToolHandler?.({
        params: { name: 'get_pie', arguments: { pieId: 123 } },
      });
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.id).toBe(123);
    });

    it('should handle create_pie', async () => {
      const result = await callToolHandler?.({
        params: {
          name: 'create_pie',
          arguments: {
            name: 'New Pie',
            icon: 'BRIEFCASE',
            instrumentShares: { AAPL: 0.5, MSFT: 0.5 },
            dividendCashAction: 'REINVEST',
          },
        },
      });
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.name).toBe('New Pie');
    });

    it('should handle update_pie', async () => {
      const result = await callToolHandler?.({
        params: {
          name: 'update_pie',
          arguments: { pieId: 123, name: 'Updated Pie' },
        },
      });
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.name).toBe('Updated Pie');
      expect(mockClientInstance.updatePie).toHaveBeenCalledWith(123, { name: 'Updated Pie' });
    });

    it('should handle delete_pie', async () => {
      const result = await callToolHandler?.({
        params: { name: 'delete_pie', arguments: { pieId: 123 } },
      });
      expect(result.content[0].text).toContain('deleted successfully');
    });
  });

  describe('CallTool handler - Historical Data', () => {
    it('should handle get_order_history with all params', async () => {
      const result = await callToolHandler?.({
        params: {
          name: 'get_order_history',
          arguments: { cursor: 0, limit: 10, ticker: 'AAPL' },
        },
      });
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.items).toBeDefined();
      expect(mockClientInstance.getOrderHistory).toHaveBeenCalledWith({
        cursor: 0,
        limit: 10,
        ticker: 'AAPL',
      });
    });

    it('should handle get_order_history without params', async () => {
      const result = await callToolHandler?.({
        params: { name: 'get_order_history', arguments: {} },
      });
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.items).toBeDefined();
    });

    it('should handle get_dividends with all params', async () => {
      const result = await callToolHandler?.({
        params: {
          name: 'get_dividends',
          arguments: { cursor: 0, limit: 5, ticker: 'AAPL' },
        },
      });
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.items).toBeDefined();
    });

    it('should handle get_transactions with params', async () => {
      const result = await callToolHandler?.({
        params: {
          name: 'get_transactions',
          arguments: { cursor: 0, limit: 20 },
        },
      });
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.items).toBeDefined();
    });

    it('should handle request_export with explicit include values', async () => {
      const result = await callToolHandler?.({
        params: {
          name: 'request_export',
          arguments: {
            timeFrom: '2024-01-01T00:00:00Z',
            timeTo: '2024-12-31T23:59:59Z',
            includeDividends: true,
            includeInterest: false,
            includeOrders: true,
            includeTransactions: true,
          },
        },
      });
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.reportId).toBe(789);
    });

    it('should handle request_export with default include values', async () => {
      const result = await callToolHandler?.({
        params: {
          name: 'request_export',
          arguments: {
            timeFrom: '2024-01-01T00:00:00Z',
            timeTo: '2024-12-31T23:59:59Z',
          },
        },
      });
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.reportId).toBe(789);
      const calledWith = mockClientInstance.requestExport.mock.calls[0][0];
      expect(calledWith.dataIncluded.includeDividends).toBe(true);
      expect(calledWith.dataIncluded.includeInterest).toBe(true);
      expect(calledWith.dataIncluded.includeOrders).toBe(true);
      expect(calledWith.dataIncluded.includeTransactions).toBe(true);
    });
  });

  describe('CallTool handler - Unknown tool', () => {
    it('should return error for unknown tool', async () => {
      const result = await callToolHandler?.({
        params: { name: 'nonexistent_tool', arguments: {} },
      });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Unknown tool: nonexistent_tool');
    });
  });

  describe('CallTool handler - Error handling', () => {
    it('should handle client errors', async () => {
      mockClientInstance.getAccountInfo.mockRejectedValueOnce(new Error('Network error'));
      const result = await callToolHandler?.({
        params: { name: 'get_account_info', arguments: {} },
      });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Error: Network error');
    });

    it('should handle Zod validation errors for market order', async () => {
      const result = await callToolHandler?.({
        params: {
          name: 'place_market_order',
          arguments: { ticker: 'AAPL', quantity: -10 },
        },
      });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Validation Error');
    });

    it('should handle non-Error thrown values', async () => {
      mockClientInstance.getAccountInfo.mockRejectedValueOnce('string error');
      const result = await callToolHandler?.({
        params: { name: 'get_account_info', arguments: {} },
      });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Error: string error');
    });

    it('should handle validation error for limit order with missing limitPrice', async () => {
      const result = await callToolHandler?.({
        params: {
          name: 'place_limit_order',
          arguments: { ticker: 'AAPL', quantity: 10 },
        },
      });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Validation Error');
    });

    it('should handle validation error for stop order with invalid stopPrice', async () => {
      const result = await callToolHandler?.({
        params: {
          name: 'place_stop_order',
          arguments: { ticker: 'AAPL', quantity: 10, stopPrice: -1 },
        },
      });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Validation Error');
    });

    it('should handle validation error for stop-limit order with missing fields', async () => {
      const result = await callToolHandler?.({
        params: {
          name: 'place_stop_limit_order',
          arguments: { ticker: 'AAPL', quantity: 10 },
        },
      });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Validation Error');
    });

    it('should handle validation error for create_pie with invalid data', async () => {
      const result = await callToolHandler?.({
        params: {
          name: 'create_pie',
          arguments: {
            name: '',
            icon: 'BRIEFCASE',
            instrumentShares: { AAPL: 1.0 },
            dividendCashAction: 'REINVEST',
          },
        },
      });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Validation Error');
    });

    it('should handle validation error for request_export with missing fields', async () => {
      const result = await callToolHandler?.({
        params: {
          name: 'request_export',
          arguments: {},
        },
      });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Validation Error');
    });
  });
});

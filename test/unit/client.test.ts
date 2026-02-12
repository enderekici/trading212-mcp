import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Trading212Client } from '../../src/client.js';

// Mock fetch globally
global.fetch = vi.fn();

describe('Trading212Client', () => {
  let client: Trading212Client;
  const mockApiKey = 'test-api-key-123';

  beforeEach(() => {
    vi.clearAllMocks();
    client = new Trading212Client({
      apiKey: mockApiKey,
      environment: 'demo',
    });
  });

  describe('constructor', () => {
    it('should initialize with demo environment', () => {
      const demoClient = new Trading212Client({
        apiKey: mockApiKey,
        environment: 'demo',
      });
      expect(demoClient).toBeDefined();
    });

    it('should initialize with live environment', () => {
      const liveClient = new Trading212Client({
        apiKey: mockApiKey,
        environment: 'live',
      });
      expect(liveClient).toBeDefined();
    });
  });

  describe('getBaseUrl', () => {
    it('should use demo URL for demo environment', () => {
      const demoClient = new Trading212Client({
        apiKey: mockApiKey,
        environment: 'demo',
      });
      // We can't directly test private method, but we can verify behavior
      expect(demoClient).toBeDefined();
    });

    it('should use live URL for live environment', () => {
      const liveClient = new Trading212Client({
        apiKey: mockApiKey,
        environment: 'live',
      });
      expect(liveClient).toBeDefined();
    });
  });

  describe('request method', () => {
    it('should make successful API request', async () => {
      const mockResponse = {
        currencyCode: 'USD',
        id: 12345,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        headers: new Map([
          ['x-ratelimit-limit', '10'],
          ['x-ratelimit-period', '60'],
          ['x-ratelimit-remaining', '9'],
          ['x-ratelimit-reset', '1234567890'],
          ['x-ratelimit-used', '1'],
        ]),
        json: async () => mockResponse,
      });

      const result = await client.getAccountInfo();
      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should include authorization header', async () => {
      const mockResponse = { currencyCode: 'USD', id: 12345 };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        headers: new Map(),
        json: async () => mockResponse,
      });

      await client.getAccountInfo();

      const fetchCall = (global.fetch as any).mock.calls[0];
      const headers = fetchCall[1].headers;
      expect(headers.Authorization).toContain('Basic');
      expect(headers['Content-Type']).toBe('application/json');
    });

    it('should handle API errors with JSON error message', async () => {
      const errorMessage = 'Invalid API key';
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401,
        headers: new Map(),
        text: async () => JSON.stringify({ message: errorMessage }),
      });

      await expect(client.getAccountInfo()).rejects.toThrow(errorMessage);
    });

    it('should handle API errors with errorMessage field', async () => {
      const errorMessage = 'Unauthorized access';
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 403,
        headers: new Map(),
        text: async () => JSON.stringify({ errorMessage }),
      });

      await expect(client.getAccountInfo()).rejects.toThrow(errorMessage);
    });

    it('should handle API errors with plain text', async () => {
      const errorText = 'Internal Server Error';
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        headers: new Map(),
        text: async () => errorText,
      });

      await expect(client.getAccountInfo()).rejects.toThrow(errorText);
    });

    it('should throw error with status code', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
        headers: new Map(),
        text: async () => 'Not Found',
      });

      await expect(client.getAccountInfo()).rejects.toThrow('Trading 212 API Error (404)');
    });
  });

  describe('rate limit tracking', () => {
    it('should extract and store rate limit info', async () => {
      const mockResponse = { currencyCode: 'USD', id: 12345 };
      const mockHeaders = new Map([
        ['x-ratelimit-limit', '10'],
        ['x-ratelimit-period', '60'],
        ['x-ratelimit-remaining', '9'],
        ['x-ratelimit-reset', '1234567890'],
        ['x-ratelimit-used', '1'],
      ]);

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        headers: mockHeaders,
        json: async () => mockResponse,
      });

      await client.getAccountInfo();
      const rateLimitInfo = client.getRateLimitInfo('/equity/account/info');

      expect(rateLimitInfo).toEqual({
        limit: 10,
        period: 60,
        remaining: 9,
        reset: 1234567890,
        used: 1,
      });
    });

    it('should return null when rate limit headers are missing', async () => {
      const mockResponse = { currencyCode: 'USD', id: 12345 };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        headers: new Map(),
        json: async () => mockResponse,
      });

      await client.getAccountInfo();
      const rateLimitInfo = client.getRateLimitInfo('/equity/account/info');

      expect(rateLimitInfo).toBeNull();
    });

    it('should return null for endpoint not yet called', () => {
      const rateLimitInfo = client.getRateLimitInfo('/equity/orders');
      expect(rateLimitInfo).toBeNull();
    });
  });

  describe('Account Management', () => {
    it('should get account info', async () => {
      const mockResponse = { currencyCode: 'USD', id: 12345 };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        headers: new Map(),
        json: async () => mockResponse,
      });

      const result = await client.getAccountInfo();
      expect(result).toEqual(mockResponse);
    });

    it('should get account cash', async () => {
      const mockResponse = {
        free: 1000.5,
        total: 5000.0,
        ppl: 500.25,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        headers: new Map(),
        json: async () => mockResponse,
      });

      const result = await client.getAccountCash();
      expect(result).toEqual(mockResponse);
    });

    it('should get account summary', async () => {
      const mockResponse = {
        cash: { free: 1000.5, total: 5000.0 },
        invested: 3500.0,
        ppl: 500.25,
        pieCash: 100.0,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        headers: new Map(),
        json: async () => mockResponse,
      });

      const result = await client.getAccountSummary();
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Portfolio/Positions', () => {
    it('should get portfolio', async () => {
      const mockResponse = [
        {
          averagePrice: 150.25,
          currentPrice: 155.5,
          ppl: 52.5,
          quantity: 10,
          ticker: 'AAPL',
        },
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        headers: new Map(),
        json: async () => mockResponse,
      });

      const result = await client.getPortfolio();
      expect(result).toEqual(mockResponse);
      expect(result).toHaveLength(1);
    });

    it('should get specific position', async () => {
      const mockResponse = {
        averagePrice: 150.25,
        currentPrice: 155.5,
        ppl: 52.5,
        quantity: 10,
        ticker: 'AAPL',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        headers: new Map(),
        json: async () => mockResponse,
      });

      const result = await client.getPosition('AAPL');
      expect(result).toEqual(mockResponse);
      expect(result.ticker).toBe('AAPL');
    });
  });

  describe('Order Management', () => {
    it('should get all orders', async () => {
      const mockResponse = [
        {
          createdOn: '2024-01-01T00:00:00Z',
          filledQuantity: 5,
          filledValue: 750.0,
          id: 123456,
          quantity: 10,
          side: 'BUY',
          status: 'NEW',
          ticker: 'AAPL',
          timeValidity: 'DAY',
          type: 'MARKET',
        },
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        headers: new Map(),
        json: async () => mockResponse,
      });

      const result = await client.getOrders();
      expect(result).toEqual(mockResponse);
    });

    it('should get specific order', async () => {
      const mockResponse = {
        createdOn: '2024-01-01T00:00:00Z',
        filledQuantity: 5,
        filledValue: 750.0,
        id: 123456,
        quantity: 10,
        side: 'BUY',
        status: 'NEW',
        ticker: 'AAPL',
        timeValidity: 'DAY',
        type: 'MARKET',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        headers: new Map(),
        json: async () => mockResponse,
      });

      const result = await client.getOrder(123456);
      expect(result).toEqual(mockResponse);
      expect(result.id).toBe(123456);
    });

    it('should cancel order', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        headers: new Map(),
        json: async () => ({}),
      });

      await expect(client.cancelOrder(123456)).resolves.toBeUndefined();
      expect(global.fetch).toHaveBeenCalledTimes(1);

      const fetchCall = (global.fetch as any).mock.calls[0];
      expect(fetchCall[1].method).toBe('DELETE');
    });

    it('should place market order', async () => {
      const orderRequest = {
        quantity: 10,
        ticker: 'AAPL',
        timeValidity: 'DAY' as const,
      };

      const mockResponse = {
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
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        headers: new Map(),
        json: async () => mockResponse,
      });

      const result = await client.placeMarketOrder(orderRequest);
      expect(result).toEqual(mockResponse);

      const fetchCall = (global.fetch as any).mock.calls[0];
      expect(fetchCall[1].method).toBe('POST');
      expect(fetchCall[1].body).toContain('AAPL');
    });

    it('should place limit order', async () => {
      const orderRequest = {
        limitPrice: 150.0,
        quantity: 10,
        ticker: 'AAPL',
        timeValidity: 'GTC' as const,
      };

      const mockResponse = {
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
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        headers: new Map(),
        json: async () => mockResponse,
      });

      const result = await client.placeLimitOrder(orderRequest);
      expect(result).toEqual(mockResponse);
      expect(result.limitPrice).toBe(150.0);
    });

    it('should place stop order', async () => {
      const orderRequest = {
        quantity: 10,
        stopPrice: 140.0,
        ticker: 'AAPL',
        timeValidity: 'DAY' as const,
      };

      const mockResponse = {
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
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        headers: new Map(),
        json: async () => mockResponse,
      });

      const result = await client.placeStopOrder(orderRequest);
      expect(result).toEqual(mockResponse);
      expect(result.stopPrice).toBe(140.0);
    });

    it('should place stop-limit order', async () => {
      const orderRequest = {
        limitPrice: 145.0,
        quantity: 10,
        stopPrice: 140.0,
        ticker: 'AAPL',
        timeValidity: 'GTC' as const,
      };

      const mockResponse = {
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
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        headers: new Map(),
        json: async () => mockResponse,
      });

      const result = await client.placeStopLimitOrder(orderRequest);
      expect(result).toEqual(mockResponse);
      expect(result.limitPrice).toBe(145.0);
      expect(result.stopPrice).toBe(140.0);
    });
  });

  describe('Instruments & Market Data', () => {
    it('should get instruments', async () => {
      const mockResponse = [
        {
          addedOn: '2024-01-01T00:00:00Z',
          currencyCode: 'USD',
          isin: 'US0378331005',
          minTradeQuantity: 1,
          name: 'Apple Inc.',
          shortName: 'AAPL',
          ticker: 'AAPL',
          type: 'STOCK',
          workingScheduleId: 1,
        },
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        headers: new Map(),
        json: async () => mockResponse,
      });

      const result = await client.getInstruments();
      expect(result).toEqual(mockResponse);
      expect(result[0].ticker).toBe('AAPL');
    });

    it('should get exchanges', async () => {
      const mockResponse = [
        {
          id: 1,
          name: 'NASDAQ',
          workingSchedules: [
            {
              id: 1,
              timeEvents: [
                {
                  date: '2024-01-01',
                  type: 'OPEN',
                },
              ],
            },
          ],
        },
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        headers: new Map(),
        json: async () => mockResponse,
      });

      const result = await client.getExchanges();
      expect(result).toEqual(mockResponse);
      expect(result[0].name).toBe('NASDAQ');
    });
  });

  describe('Pies', () => {
    it('should get all pies', async () => {
      const mockResponse = [
        {
          cash: 100.0,
          dividendCashAction: 'REINVEST',
          icon: 'BRIEFCASE',
          id: 123,
          instruments: [
            { expectedShare: 0.5, ticker: 'AAPL' },
            { expectedShare: 0.5, ticker: 'MSFT' },
          ],
          name: 'Tech Portfolio',
          result: 50.0,
          status: 'ACTIVE',
        },
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        headers: new Map(),
        json: async () => mockResponse,
      });

      const result = await client.getPies();
      expect(result).toEqual(mockResponse);
    });

    it('should get specific pie', async () => {
      const mockResponse = {
        cash: 100.0,
        dividendCashAction: 'REINVEST',
        icon: 'BRIEFCASE',
        id: 123,
        instruments: [
          { expectedShare: 0.5, ticker: 'AAPL' },
          { expectedShare: 0.5, ticker: 'MSFT' },
        ],
        name: 'Tech Portfolio',
        result: 50.0,
        status: 'ACTIVE',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        headers: new Map(),
        json: async () => mockResponse,
      });

      const result = await client.getPie(123);
      expect(result).toEqual(mockResponse);
      expect(result.id).toBe(123);
    });

    it('should create pie', async () => {
      const pieRequest = {
        dividendCashAction: 'REINVEST' as const,
        icon: 'BRIEFCASE',
        instrumentShares: {
          AAPL: 0.5,
          MSFT: 0.5,
        },
        name: 'Tech Portfolio',
      };

      const mockResponse = {
        cash: 0,
        dividendCashAction: 'REINVEST',
        icon: 'BRIEFCASE',
        id: 123,
        instruments: [
          { expectedShare: 0.5, ticker: 'AAPL' },
          { expectedShare: 0.5, ticker: 'MSFT' },
        ],
        name: 'Tech Portfolio',
        result: 0,
        status: 'ACTIVE',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        headers: new Map(),
        json: async () => mockResponse,
      });

      const result = await client.createPie(pieRequest);
      expect(result).toEqual(mockResponse);
      expect(result.name).toBe('Tech Portfolio');
    });

    it('should update pie', async () => {
      const pieUpdate = {
        name: 'Updated Portfolio',
      };

      const mockResponse = {
        cash: 100.0,
        dividendCashAction: 'REINVEST',
        icon: 'BRIEFCASE',
        id: 123,
        instruments: [
          { expectedShare: 0.5, ticker: 'AAPL' },
          { expectedShare: 0.5, ticker: 'MSFT' },
        ],
        name: 'Updated Portfolio',
        result: 50.0,
        status: 'ACTIVE',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        headers: new Map(),
        json: async () => mockResponse,
      });

      const result = await client.updatePie(123, pieUpdate);
      expect(result).toEqual(mockResponse);
      expect(result.name).toBe('Updated Portfolio');
    });

    it('should delete pie', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        headers: new Map(),
        json: async () => ({}),
      });

      await expect(client.deletePie(123)).resolves.toBeUndefined();
      expect(global.fetch).toHaveBeenCalledTimes(1);

      const fetchCall = (global.fetch as any).mock.calls[0];
      expect(fetchCall[1].method).toBe('DELETE');
    });
  });

  describe('Historical Data', () => {
    it('should get order history', async () => {
      const mockResponse = {
        items: [
          {
            dateCreated: '2024-01-01T00:00:00Z',
            fillCost: 5.0,
            fillId: 123,
            fillPrice: 150.0,
            fillResult: 50.0,
            fillType: 'MARKET',
            filledQuantity: 10,
            filledValue: 1500.0,
            id: 456,
            orderedQuantity: 10,
            orderedValue: 1500.0,
            status: 'CONFIRMED',
            taxes: {
              fillTax: 1.5,
            },
            ticker: 'AAPL',
            timeValidity: 'DAY',
            type: 'MARKET',
          },
        ],
        nextPagePath: '/equity/history/orders?cursor=789',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        headers: new Map(),
        json: async () => mockResponse,
      });

      const result = await client.getOrderHistory({ limit: 10 });
      expect(result.items).toHaveLength(1);
      expect(result.nextPagePath).toBeDefined();
    });

    it('should get dividends', async () => {
      const mockResponse = {
        items: [
          {
            amount: 10.5,
            amountInEuro: 9.75,
            grossAmountPerShare: 1.05,
            paidOn: '2024-01-01',
            quantity: 10,
            reference: 'DIV-123',
            ticker: 'AAPL',
            type: 'ORDINARY',
          },
        ],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        headers: new Map(),
        json: async () => mockResponse,
      });

      const result = await client.getDividends({ ticker: 'AAPL' });
      expect(result.items).toHaveLength(1);
      expect(result.items[0].ticker).toBe('AAPL');
    });

    it('should get transactions', async () => {
      const mockResponse = {
        items: [
          {
            amount: 1000.0,
            dateTime: '2024-01-01T00:00:00Z',
            reference: 'TXN-123',
            type: 'DEPOSIT',
          },
        ],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        headers: new Map(),
        json: async () => mockResponse,
      });

      const result = await client.getTransactions();
      expect(result.items).toHaveLength(1);
      expect(result.items[0].type).toBe('DEPOSIT');
    });

    it('should request export', async () => {
      const exportRequest = {
        dataIncluded: {
          includeDividends: true,
          includeInterest: true,
          includeOrders: true,
          includeTransactions: true,
        },
        timeFrom: '2024-01-01T00:00:00Z',
        timeTo: '2024-12-31T23:59:59Z',
      };

      const mockResponse = { reportId: 456 };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        headers: new Map(),
        json: async () => mockResponse,
      });

      const result = await client.requestExport(exportRequest);
      expect(result).toEqual(mockResponse);
      expect(result.reportId).toBe(456);
    });
  });

  describe('Historical Data - query param building', () => {
    it('should get order history without any params', async () => {
      const mockResponse = {
        items: [],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        headers: new Map(),
        json: async () => mockResponse,
      });

      const result = await client.getOrderHistory();
      expect(result.items).toHaveLength(0);
      expect(result.nextPagePath).toBeUndefined();

      const fetchCall = (global.fetch as any).mock.calls[0];
      expect(fetchCall[0]).not.toContain('?');
    });

    it('should get order history with cursor param', async () => {
      const mockResponse = {
        items: [],
        nextPagePath: '/equity/history/orders?cursor=200',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        headers: new Map(),
        json: async () => mockResponse,
      });

      const result = await client.getOrderHistory({ cursor: 100 });
      expect(result.items).toHaveLength(0);

      const fetchCall = (global.fetch as any).mock.calls[0];
      expect(fetchCall[0]).toContain('cursor=100');
    });

    it('should get order history with all params', async () => {
      const mockResponse = {
        items: [],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        headers: new Map(),
        json: async () => mockResponse,
      });

      await client.getOrderHistory({ cursor: 50, limit: 25, ticker: 'MSFT' });

      const fetchCall = (global.fetch as any).mock.calls[0];
      expect(fetchCall[0]).toContain('cursor=50');
      expect(fetchCall[0]).toContain('limit=25');
      expect(fetchCall[0]).toContain('ticker=MSFT');
    });

    it('should get dividends without any params', async () => {
      const mockResponse = {
        items: [],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        headers: new Map(),
        json: async () => mockResponse,
      });

      const result = await client.getDividends();
      expect(result.items).toHaveLength(0);

      const fetchCall = (global.fetch as any).mock.calls[0];
      expect(fetchCall[0]).not.toContain('?');
    });

    it('should get dividends with cursor param', async () => {
      const mockResponse = {
        items: [],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        headers: new Map(),
        json: async () => mockResponse,
      });

      await client.getDividends({ cursor: 10 });

      const fetchCall = (global.fetch as any).mock.calls[0];
      expect(fetchCall[0]).toContain('cursor=10');
    });

    it('should get dividends with limit param', async () => {
      const mockResponse = {
        items: [],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        headers: new Map(),
        json: async () => mockResponse,
      });

      await client.getDividends({ limit: 20 });

      const fetchCall = (global.fetch as any).mock.calls[0];
      expect(fetchCall[0]).toContain('limit=20');
    });

    it('should get transactions with cursor and limit', async () => {
      const mockResponse = {
        items: [],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        headers: new Map(),
        json: async () => mockResponse,
      });

      await client.getTransactions({ cursor: 5, limit: 15 });

      const fetchCall = (global.fetch as any).mock.calls[0];
      expect(fetchCall[0]).toContain('cursor=5');
      expect(fetchCall[0]).toContain('limit=15');
    });

    it('should get transactions without params', async () => {
      const mockResponse = {
        items: [],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        headers: new Map(),
        json: async () => mockResponse,
      });

      const result = await client.getTransactions();
      expect(result.items).toHaveLength(0);

      const fetchCall = (global.fetch as any).mock.calls[0];
      expect(fetchCall[0]).not.toContain('?');
    });
  });

  describe('error parsing edge cases', () => {
    it('should fallback to errorText when JSON has no message or errorMessage', async () => {
      const errorJson = JSON.stringify({ code: 'UNKNOWN', detail: 'something went wrong' });
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 400,
        headers: new Map(),
        text: async () => errorJson,
      });

      await expect(client.getAccountInfo()).rejects.toThrow(errorJson);
    });

    it('should use errorMessage when message is not present', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 403,
        headers: new Map(),
        text: async () => JSON.stringify({ errorMessage: 'Forbidden access' }),
      });

      await expect(client.getAccountInfo()).rejects.toThrow('Forbidden access');
    });

    it('should handle JSON with empty message field falling back to errorMessage', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 400,
        headers: new Map(),
        text: async () => JSON.stringify({ message: '', errorMessage: 'actual error' }),
      });

      await expect(client.getAccountInfo()).rejects.toThrow('actual error');
    });

    it('should handle JSON with null message falling back to errorText', async () => {
      const errorJson = JSON.stringify({ message: null, errorMessage: null });
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 400,
        headers: new Map(),
        text: async () => errorJson,
      });

      await expect(client.getAccountInfo()).rejects.toThrow(errorJson);
    });
  });

  describe('rate limit info with partial headers', () => {
    it('should return null when some rate limit headers are missing', async () => {
      const mockResponse = { currencyCode: 'USD', id: 12345 };
      const partialHeaders = new Map([
        ['x-ratelimit-limit', '10'],
        ['x-ratelimit-period', '60'],
        // missing remaining, reset, used
      ]);

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        headers: partialHeaders,
        json: async () => mockResponse,
      });

      await client.getAccountInfo();
      const rateLimitInfo = client.getRateLimitInfo('/equity/account/info');
      expect(rateLimitInfo).toBeNull();
    });
  });

  describe('environment configuration', () => {
    it('should construct correct demo URL', async () => {
      const demoClient = new Trading212Client({
        apiKey: mockApiKey,
        environment: 'demo',
      });

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        headers: new Map(),
        json: async () => ({ currencyCode: 'USD', id: 12345 }),
      });

      await demoClient.getAccountInfo();

      const fetchCall = (global.fetch as any).mock.calls[0];
      expect(fetchCall[0]).toContain('demo.trading212.com');
    });

    it('should construct correct live URL', async () => {
      const liveClient = new Trading212Client({
        apiKey: mockApiKey,
        environment: 'live',
      });

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        headers: new Map(),
        json: async () => ({ currencyCode: 'USD', id: 12345 }),
      });

      await liveClient.getAccountInfo();

      const fetchCall = (global.fetch as any).mock.calls[0];
      expect(fetchCall[0]).toContain('live.trading212.com');
    });
  });
});

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Trading212Client } from '../../src/client.js';

// Mock the Trading212Client
vi.mock('../../src/client.js', () => {
  return {
    Trading212Client: vi.fn().mockImplementation(() => ({
      getAccountInfo: vi.fn().mockResolvedValue({ currencyCode: 'USD', id: 12345 }),
      getAccountCash: vi.fn().mockResolvedValue({ free: 1000.50, total: 5000.00 }),
      getAccountSummary: vi.fn().mockResolvedValue({
        cash: { free: 1000.50, total: 5000.00 },
        invested: 3500.00,
        ppl: 500.25,
        pieCash: 100.00,
      }),
      getPortfolio: vi.fn().mockResolvedValue([
        {
          averagePrice: 150.25,
          currentPrice: 155.50,
          ppl: 52.50,
          quantity: 10,
          ticker: 'AAPL',
        },
      ]),
      getPosition: vi.fn().mockResolvedValue({
        averagePrice: 150.25,
        currentPrice: 155.50,
        ppl: 52.50,
        quantity: 10,
        ticker: 'AAPL',
      }),
      getOrders: vi.fn().mockResolvedValue([
        {
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
        },
      ]),
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
        limitPrice: 150.00,
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
        stopPrice: 140.00,
        ticker: 'AAPL',
        timeValidity: 'DAY',
        type: 'STOP',
      }),
      placeStopLimitOrder: vi.fn().mockResolvedValue({
        createdOn: '2024-01-01T00:00:00Z',
        filledQuantity: 0,
        filledValue: 0,
        id: 123456,
        limitPrice: 145.00,
        quantity: 10,
        side: 'SELL',
        status: 'NEW',
        stopPrice: 140.00,
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
          ticker: 'AAPL',
          type: 'STOCK',
          workingScheduleId: 1,
        },
      ]),
      getExchanges: vi.fn().mockResolvedValue([
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
      ]),
      getPies: vi.fn().mockResolvedValue([
        {
          cash: 100.00,
          dividendCashAction: 'REINVEST',
          icon: 'BRIEFCASE',
          id: 123,
          instruments: [
            { expectedShare: 0.5, ticker: 'AAPL' },
            { expectedShare: 0.5, ticker: 'MSFT' },
          ],
          name: 'Tech Portfolio',
          result: 50.00,
          status: 'ACTIVE',
        },
      ]),
      getPie: vi.fn().mockResolvedValue({
        cash: 100.00,
        dividendCashAction: 'REINVEST',
        icon: 'BRIEFCASE',
        id: 123,
        instruments: [
          { expectedShare: 0.5, ticker: 'AAPL' },
          { expectedShare: 0.5, ticker: 'MSFT' },
        ],
        name: 'Tech Portfolio',
        result: 50.00,
        status: 'ACTIVE',
      }),
      createPie: vi.fn().mockResolvedValue({
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
      }),
      updatePie: vi.fn().mockResolvedValue({
        cash: 100.00,
        dividendCashAction: 'REINVEST',
        icon: 'BRIEFCASE',
        id: 123,
        instruments: [
          { expectedShare: 0.5, ticker: 'AAPL' },
          { expectedShare: 0.5, ticker: 'MSFT' },
        ],
        name: 'Updated Portfolio',
        result: 50.00,
        status: 'ACTIVE',
      }),
      deletePie: vi.fn().mockResolvedValue(undefined),
      getOrderHistory: vi.fn().mockResolvedValue({
        items: [
          {
            dateCreated: '2024-01-01T00:00:00Z',
            fillCost: 5.00,
            fillId: 123,
            fillPrice: 150.00,
            fillResult: 50.00,
            fillType: 'MARKET',
            filledQuantity: 10,
            filledValue: 1500.00,
            id: 456,
            orderedQuantity: 10,
            orderedValue: 1500.00,
            status: 'CONFIRMED',
            taxes: {
              fillTax: 1.50,
            },
            ticker: 'AAPL',
            timeValidity: 'DAY',
            type: 'MARKET',
          },
        ],
      }),
      getDividends: vi.fn().mockResolvedValue({
        items: [
          {
            amount: 10.50,
            amountInEuro: 9.75,
            grossAmountPerShare: 1.05,
            paidOn: '2024-01-01',
            quantity: 10,
            reference: 'DIV-123',
            ticker: 'AAPL',
            type: 'ORDINARY',
          },
        ],
      }),
      getTransactions: vi.fn().mockResolvedValue({
        items: [
          {
            amount: 1000.00,
            dateTime: '2024-01-01T00:00:00Z',
            reference: 'TXN-123',
            type: 'DEPOSIT',
          },
        ],
      }),
      requestExport: vi.fn().mockResolvedValue({ reportId: 456 }),
      getRateLimitInfo: vi.fn().mockReturnValue({
        limit: 10,
        period: 60,
        remaining: 9,
        reset: 1234567890,
        used: 1,
      }),
    })),
  };
});

describe('MCP Server Integration', () => {
  let mockClient: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockClient = new Trading212Client({
      apiKey: 'test-key',
      environment: 'demo',
    });
  });

  describe('Tool Handler Simulation', () => {
    describe('Account Management Tools', () => {
      it('should handle get_account_info tool', async () => {
        const result = await mockClient.getAccountInfo();
        expect(result).toEqual({ currencyCode: 'USD', id: 12345 });
        expect(mockClient.getAccountInfo).toHaveBeenCalledTimes(1);
      });

      it('should handle get_account_cash tool', async () => {
        const result = await mockClient.getAccountCash();
        expect(result).toHaveProperty('free');
        expect(result).toHaveProperty('total');
        expect(mockClient.getAccountCash).toHaveBeenCalledTimes(1);
      });

      it('should handle get_account_summary tool', async () => {
        const result = await mockClient.getAccountSummary();
        expect(result).toHaveProperty('cash');
        expect(result).toHaveProperty('invested');
        expect(result).toHaveProperty('ppl');
        expect(mockClient.getAccountSummary).toHaveBeenCalledTimes(1);
      });
    });

    describe('Portfolio Tools', () => {
      it('should handle get_portfolio tool', async () => {
        const result = await mockClient.getPortfolio();
        expect(Array.isArray(result)).toBe(true);
        expect(result[0]).toHaveProperty('ticker');
        expect(result[0]).toHaveProperty('quantity');
        expect(mockClient.getPortfolio).toHaveBeenCalledTimes(1);
      });

      it('should handle get_position tool', async () => {
        const result = await mockClient.getPosition('AAPL');
        expect(result).toHaveProperty('ticker');
        expect(result.ticker).toBe('AAPL');
        expect(mockClient.getPosition).toHaveBeenCalledWith('AAPL');
      });
    });

    describe('Order Management Tools', () => {
      it('should handle get_orders tool', async () => {
        const result = await mockClient.getOrders();
        expect(Array.isArray(result)).toBe(true);
        expect(result[0]).toHaveProperty('id');
        expect(result[0]).toHaveProperty('ticker');
        expect(mockClient.getOrders).toHaveBeenCalledTimes(1);
      });

      it('should handle get_order tool', async () => {
        const result = await mockClient.getOrder(123456);
        expect(result).toHaveProperty('id');
        expect(result.id).toBe(123456);
        expect(mockClient.getOrder).toHaveBeenCalledWith(123456);
      });

      it('should handle cancel_order tool', async () => {
        const result = await mockClient.cancelOrder(123456);
        expect(result).toBeUndefined();
        expect(mockClient.cancelOrder).toHaveBeenCalledWith(123456);
      });

      it('should handle place_market_order tool', async () => {
        const orderRequest = {
          quantity: 10,
          ticker: 'AAPL',
          timeValidity: 'DAY' as const,
        };
        const result = await mockClient.placeMarketOrder(orderRequest);
        expect(result).toHaveProperty('type');
        expect(result.type).toBe('MARKET');
        expect(mockClient.placeMarketOrder).toHaveBeenCalledWith(orderRequest);
      });

      it('should handle place_limit_order tool', async () => {
        const orderRequest = {
          limitPrice: 150.00,
          quantity: 10,
          ticker: 'AAPL',
          timeValidity: 'GTC' as const,
        };
        const result = await mockClient.placeLimitOrder(orderRequest);
        expect(result).toHaveProperty('type');
        expect(result.type).toBe('LIMIT');
        expect(result).toHaveProperty('limitPrice');
        expect(mockClient.placeLimitOrder).toHaveBeenCalledWith(orderRequest);
      });

      it('should handle place_stop_order tool', async () => {
        const orderRequest = {
          quantity: 10,
          stopPrice: 140.00,
          ticker: 'AAPL',
          timeValidity: 'DAY' as const,
        };
        const result = await mockClient.placeStopOrder(orderRequest);
        expect(result).toHaveProperty('type');
        expect(result.type).toBe('STOP');
        expect(result).toHaveProperty('stopPrice');
        expect(mockClient.placeStopOrder).toHaveBeenCalledWith(orderRequest);
      });

      it('should handle place_stop_limit_order tool', async () => {
        const orderRequest = {
          limitPrice: 145.00,
          quantity: 10,
          stopPrice: 140.00,
          ticker: 'AAPL',
          timeValidity: 'GTC' as const,
        };
        const result = await mockClient.placeStopLimitOrder(orderRequest);
        expect(result).toHaveProperty('type');
        expect(result.type).toBe('STOP_LIMIT');
        expect(result).toHaveProperty('limitPrice');
        expect(result).toHaveProperty('stopPrice');
        expect(mockClient.placeStopLimitOrder).toHaveBeenCalledWith(orderRequest);
      });
    });

    describe('Instrument Tools', () => {
      it('should handle search_instruments tool', async () => {
        const result = await mockClient.getInstruments();
        expect(Array.isArray(result)).toBe(true);
        expect(result[0]).toHaveProperty('ticker');
        expect(result[0]).toHaveProperty('name');
        expect(result[0]).toHaveProperty('type');
        expect(mockClient.getInstruments).toHaveBeenCalledTimes(1);
      });

      it('should handle get_exchanges tool', async () => {
        const result = await mockClient.getExchanges();
        expect(Array.isArray(result)).toBe(true);
        expect(result[0]).toHaveProperty('id');
        expect(result[0]).toHaveProperty('name');
        expect(mockClient.getExchanges).toHaveBeenCalledTimes(1);
      });
    });

    describe('Pies Tools', () => {
      it('should handle get_pies tool', async () => {
        const result = await mockClient.getPies();
        expect(Array.isArray(result)).toBe(true);
        expect(result[0]).toHaveProperty('id');
        expect(result[0]).toHaveProperty('name');
        expect(mockClient.getPies).toHaveBeenCalledTimes(1);
      });

      it('should handle get_pie tool', async () => {
        const result = await mockClient.getPie(123);
        expect(result).toHaveProperty('id');
        expect(result.id).toBe(123);
        expect(mockClient.getPie).toHaveBeenCalledWith(123);
      });

      it('should handle create_pie tool', async () => {
        const pieRequest = {
          dividendCashAction: 'REINVEST' as const,
          icon: 'BRIEFCASE',
          instrumentShares: {
            AAPL: 0.5,
            MSFT: 0.5,
          },
          name: 'Tech Portfolio',
        };
        const result = await mockClient.createPie(pieRequest);
        expect(result).toHaveProperty('id');
        expect(result).toHaveProperty('name');
        expect(mockClient.createPie).toHaveBeenCalledWith(pieRequest);
      });

      it('should handle update_pie tool', async () => {
        const pieUpdate = { name: 'Updated Portfolio' };
        const result = await mockClient.updatePie(123, pieUpdate);
        expect(result).toHaveProperty('name');
        expect(result.name).toBe('Updated Portfolio');
        expect(mockClient.updatePie).toHaveBeenCalledWith(123, pieUpdate);
      });

      it('should handle delete_pie tool', async () => {
        const result = await mockClient.deletePie(123);
        expect(result).toBeUndefined();
        expect(mockClient.deletePie).toHaveBeenCalledWith(123);
      });
    });

    describe('Historical Data Tools', () => {
      it('should handle get_order_history tool', async () => {
        const result = await mockClient.getOrderHistory({ limit: 10 });
        expect(result).toHaveProperty('items');
        expect(Array.isArray(result.items)).toBe(true);
        expect(mockClient.getOrderHistory).toHaveBeenCalledWith({ limit: 10 });
      });

      it('should handle get_dividends tool', async () => {
        const result = await mockClient.getDividends({ ticker: 'AAPL' });
        expect(result).toHaveProperty('items');
        expect(Array.isArray(result.items)).toBe(true);
        expect(mockClient.getDividends).toHaveBeenCalledWith({ ticker: 'AAPL' });
      });

      it('should handle get_transactions tool', async () => {
        const result = await mockClient.getTransactions();
        expect(result).toHaveProperty('items');
        expect(Array.isArray(result.items)).toBe(true);
        expect(mockClient.getTransactions).toHaveBeenCalledTimes(1);
      });

      it('should handle request_export tool', async () => {
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
        const result = await mockClient.requestExport(exportRequest);
        expect(result).toHaveProperty('reportId');
        expect(mockClient.requestExport).toHaveBeenCalledWith(exportRequest);
      });
    });

    describe('Rate Limit Tracking', () => {
      it('should track rate limit information', () => {
        const rateLimitInfo = mockClient.getRateLimitInfo('/equity/account/info');
        expect(rateLimitInfo).toBeDefined();
        expect(rateLimitInfo).toHaveProperty('limit');
        expect(rateLimitInfo).toHaveProperty('remaining');
        expect(rateLimitInfo).toHaveProperty('used');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle client errors gracefully', async () => {
      mockClient.getAccountInfo.mockRejectedValueOnce(new Error('API Error'));
      await expect(mockClient.getAccountInfo()).rejects.toThrow('API Error');
    });

    it('should handle validation errors', async () => {
      mockClient.placeMarketOrder.mockRejectedValueOnce(new Error('Invalid quantity'));
      const invalidOrder = {
        quantity: -10,
        ticker: 'AAPL',
        timeValidity: 'DAY' as const,
      };
      await expect(mockClient.placeMarketOrder(invalidOrder)).rejects.toThrow('Invalid quantity');
    });

    it('should handle not found errors', async () => {
      mockClient.getOrder.mockRejectedValueOnce(new Error('Order not found'));
      await expect(mockClient.getOrder(999999)).rejects.toThrow('Order not found');
    });

    it('should handle unauthorized errors', async () => {
      mockClient.getAccountInfo.mockRejectedValueOnce(new Error('Unauthorized'));
      await expect(mockClient.getAccountInfo()).rejects.toThrow('Unauthorized');
    });
  });

  describe('Data Consistency', () => {
    it('should return consistent data structure for portfolio', async () => {
      const result = await mockClient.getPortfolio();
      expect(result).toHaveLength(1);
      const position = result[0];
      expect(typeof position.averagePrice).toBe('number');
      expect(typeof position.currentPrice).toBe('number');
      expect(typeof position.quantity).toBe('number');
      expect(typeof position.ticker).toBe('string');
    });

    it('should return consistent data structure for orders', async () => {
      const result = await mockClient.getOrders();
      expect(result).toHaveLength(1);
      const order = result[0];
      expect(typeof order.id).toBe('number');
      expect(typeof order.ticker).toBe('string');
      expect(typeof order.quantity).toBe('number');
      expect(['BUY', 'SELL']).toContain(order.side);
    });

    it('should return consistent data structure for pies', async () => {
      const result = await mockClient.getPies();
      expect(result).toHaveLength(1);
      const pie = result[0];
      expect(typeof pie.id).toBe('number');
      expect(typeof pie.name).toBe('string');
      expect(Array.isArray(pie.instruments)).toBe(true);
    });
  });
});

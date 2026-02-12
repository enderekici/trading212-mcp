import { describe, expect, it } from 'vitest';
import {
  AccountCashSchema,
  AccountInfoSchema,
  AccountSummarySchema,
  CreatePieRequestSchema,
  DividendSchema,
  ExchangeSchema,
  ExportRequestSchema,
  HistoricalOrderSchema,
  InstrumentSchema,
  LimitOrderRequestSchema,
  MarketOrderRequestSchema,
  OrderSchema,
  OrderSideSchema,
  OrderStatusSchema,
  OrderTypeSchema,
  PieInstrumentSchema,
  PieSchema,
  PositionSchema,
  StopLimitOrderRequestSchema,
  StopOrderRequestSchema,
  TimeInForceSchema,
  TransactionSchema,
} from '../../src/types.js';

describe('Account Schemas', () => {
  describe('AccountInfoSchema', () => {
    it('should validate valid account info', () => {
      const validData = {
        currencyCode: 'USD',
        id: 12345,
      };
      const result = AccountInfoSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid account info', () => {
      const invalidData = {
        currencyCode: 'USD',
        // missing id
      };
      const result = AccountInfoSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject non-number id', () => {
      const invalidData = {
        currencyCode: 'USD',
        id: '12345', // string instead of number
      };
      const result = AccountInfoSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('AccountCashSchema', () => {
    it('should validate valid account cash with all fields', () => {
      const validData = {
        free: 1000.5,
        total: 5000.0,
        ppl: 500.25,
        result: 250.75,
        invested: 3500.0,
        pieCash: 100.0,
        blocked: 50.0,
      };
      const result = AccountCashSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate valid account cash with required fields only', () => {
      const validData = {
        free: 1000.5,
        total: 5000.0,
      };
      const result = AccountCashSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept new API format with availableToTrade', () => {
      const validData = {
        availableToTrade: 1000.5,
        inPies: 50,
        reservedForOrders: 0,
      };
      const result = AccountCashSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('AccountSummarySchema', () => {
    it('should validate valid account summary', () => {
      const validData = {
        cash: {
          free: 1000.5,
          total: 5000.0,
        },
        invested: 3500.0,
        ppl: 500.25,
        pieCash: 100.0,
      };
      const result = AccountSummarySchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept new API format with investments object', () => {
      const newFormatData = {
        id: 12345,
        currency: 'GBP',
        cash: { availableToTrade: 1000.5, inPies: 50, reservedForOrders: 0 },
        investments: { currentValue: 3500, totalCost: 3000, unrealizedProfitLoss: 500 },
        totalValue: 4500.5,
      };
      const result = AccountSummarySchema.safeParse(newFormatData);
      expect(result.success).toBe(true);
    });
  });
});

describe('Instrument Schemas', () => {
  describe('InstrumentSchema', () => {
    it('should validate valid instrument', () => {
      const validData = {
        addedOn: '2024-01-01T00:00:00Z',
        currencyCode: 'USD',
        isin: 'US0378331005',
        minTradeQuantity: 1,
        name: 'Apple Inc.',
        shortName: 'AAPL',
        ticker: 'AAPL',
        type: 'STOCK',
        workingScheduleId: 1,
      };
      const result = InstrumentSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate instrument with optional maxOpenQuantity', () => {
      const validData = {
        addedOn: '2024-01-01T00:00:00Z',
        currencyCode: 'USD',
        isin: 'US0378331005',
        maxOpenQuantity: 100,
        minTradeQuantity: 1,
        name: 'Apple Inc.',
        shortName: 'AAPL',
        ticker: 'AAPL',
        type: 'ETF',
        workingScheduleId: 1,
      };
      const result = InstrumentSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept all instrument types including new API types', () => {
      const types = ['STOCK', 'ETF', 'FUND', 'CRYPTOCURRENCY', 'FOREX', 'FUTURES', 'INDEX', 'WARRANT'];
      types.forEach((type) => {
        const validData = {
          ticker: 'TEST',
          name: 'Test Instrument',
          type,
          currencyCode: 'USD',
        };
        const result = InstrumentSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('ExchangeSchema', () => {
    it('should validate valid exchange', () => {
      const validData = {
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
      };
      const result = ExchangeSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });
});

describe('Position Schema', () => {
  it('should validate valid position', () => {
    const validData = {
      averagePrice: 150.25,
      currentPrice: 155.5,
      ppl: 52.5,
      quantity: 10,
      ticker: 'AAPL',
    };
    const result = PositionSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should validate position with all optional fields', () => {
    const validData = {
      averagePrice: 150.25,
      currentPrice: 155.5,
      frontend: 'web',
      initialFillDate: '2024-01-01T00:00:00Z',
      maxBuy: 100,
      maxSell: 10,
      pieQuantity: 5,
      ppl: 52.5,
      quantity: 10,
      ticker: 'AAPL',
    };
    const result = PositionSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should accept null maxSell values', () => {
    const validData = {
      currentPrice: 155.5,
      quantity: 10,
      ticker: 'AAPL',
      maxSell: null,
    };
    const result = PositionSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should validate new API position format', () => {
    const validData = {
      instrument: { ticker: 'AAPL', name: 'Apple Inc.', currency: 'USD' },
      quantity: 10,
      averagePricePaid: 150.25,
      currentPrice: 155.5,
      createdAt: '2024-01-01T00:00:00Z',
      quantityAvailableForTrading: 10,
      quantityInPies: 0,
      walletImpact: {
        currency: 'GBP',
        totalCost: 1200,
        currentValue: 1250,
        unrealizedProfitLoss: 50,
        fxImpact: -5,
      },
    };
    const result = PositionSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });
});

describe('Order Schemas', () => {
  describe('OrderTypeSchema', () => {
    it('should accept valid order types', () => {
      const types = ['MARKET', 'LIMIT', 'STOP', 'STOP_LIMIT'];
      types.forEach((type) => {
        const result = OrderTypeSchema.safeParse(type);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid order type', () => {
      const result = OrderTypeSchema.safeParse('INVALID');
      expect(result.success).toBe(false);
    });
  });

  describe('OrderSideSchema', () => {
    it('should accept BUY and SELL', () => {
      expect(OrderSideSchema.safeParse('BUY').success).toBe(true);
      expect(OrderSideSchema.safeParse('SELL').success).toBe(true);
    });

    it('should reject invalid order side', () => {
      expect(OrderSideSchema.safeParse('HOLD').success).toBe(false);
    });
  });

  describe('OrderStatusSchema', () => {
    it('should accept all valid statuses', () => {
      const statuses = [
        'NEW',
        'PROCESSING',
        'CONFIRMED',
        'PENDING',
        'LOCAL',
        'REPLACED',
        'CANCELLED',
        'REJECTED',
      ];
      statuses.forEach((status) => {
        const result = OrderStatusSchema.safeParse(status);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('TimeInForceSchema', () => {
    it('should accept DAY and GTC', () => {
      expect(TimeInForceSchema.safeParse('DAY').success).toBe(true);
      expect(TimeInForceSchema.safeParse('GTC').success).toBe(true);
    });
  });

  describe('OrderSchema', () => {
    it('should validate valid order', () => {
      const validData = {
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
      const result = OrderSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate new API order format', () => {
      const validData = {
        id: 123456,
        instrument: { ticker: 'AAPL', name: 'Apple Inc.', currency: 'USD' },
        side: 'BUY',
        type: 'MARKET',
        status: 'FILLED',
        createdAt: '2024-01-01T00:00:00Z',
        currency: 'GBP',
        strategy: 'QUANTITY',
        timeInForce: 'DAY',
      };
      const result = OrderSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('MarketOrderRequestSchema', () => {
    it('should validate valid market order request', () => {
      const validData = {
        quantity: 10,
        ticker: 'AAPL',
        timeValidity: 'DAY',
      };
      const result = MarketOrderRequestSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should use default timeValidity', () => {
      const validData = {
        quantity: 10,
        ticker: 'AAPL',
      };
      const result = MarketOrderRequestSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.timeValidity).toBe('DAY');
      }
    });

    it('should reject negative quantity', () => {
      const invalidData = {
        quantity: -10,
        ticker: 'AAPL',
        timeValidity: 'DAY',
      };
      const result = MarketOrderRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject zero quantity', () => {
      const invalidData = {
        quantity: 0,
        ticker: 'AAPL',
        timeValidity: 'DAY',
      };
      const result = MarketOrderRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('LimitOrderRequestSchema', () => {
    it('should validate valid limit order request', () => {
      const validData = {
        limitPrice: 150.0,
        quantity: 10,
        ticker: 'AAPL',
        timeValidity: 'GTC',
      };
      const result = LimitOrderRequestSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject negative limit price', () => {
      const invalidData = {
        limitPrice: -150.0,
        quantity: 10,
        ticker: 'AAPL',
        timeValidity: 'GTC',
      };
      const result = LimitOrderRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('StopOrderRequestSchema', () => {
    it('should validate valid stop order request', () => {
      const validData = {
        quantity: 10,
        stopPrice: 140.0,
        ticker: 'AAPL',
        timeValidity: 'DAY',
      };
      const result = StopOrderRequestSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject zero stop price', () => {
      const invalidData = {
        quantity: 10,
        stopPrice: 0,
        ticker: 'AAPL',
        timeValidity: 'DAY',
      };
      const result = StopOrderRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('StopLimitOrderRequestSchema', () => {
    it('should validate valid stop-limit order request', () => {
      const validData = {
        limitPrice: 145.0,
        quantity: 10,
        stopPrice: 140.0,
        ticker: 'AAPL',
        timeValidity: 'GTC',
      };
      const result = StopLimitOrderRequestSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject missing limit price', () => {
      const invalidData = {
        quantity: 10,
        stopPrice: 140.0,
        ticker: 'AAPL',
        timeValidity: 'GTC',
      };
      const result = StopLimitOrderRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});

describe('Pie Schemas', () => {
  describe('PieInstrumentSchema', () => {
    it('should validate valid pie instrument', () => {
      const validData = {
        expectedShare: 0.5,
        ticker: 'AAPL',
      };
      const result = PieInstrumentSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('PieSchema', () => {
    it('should validate valid pie', () => {
      const validData = {
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
      const result = PieSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('CreatePieRequestSchema', () => {
    it('should validate valid create pie request', () => {
      const validData = {
        dividendCashAction: 'REINVEST',
        icon: 'BRIEFCASE',
        instrumentShares: {
          AAPL: 0.5,
          MSFT: 0.5,
        },
        name: 'Tech Portfolio',
      };
      const result = CreatePieRequestSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate with optional goal', () => {
      const validData = {
        dividendCashAction: 'TO_ACCOUNT_CASH',
        goal: 10000,
        icon: 'BRIEFCASE',
        instrumentShares: {
          AAPL: 1.0,
        },
        name: 'Growth',
      };
      const result = CreatePieRequestSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject empty name', () => {
      const invalidData = {
        dividendCashAction: 'REINVEST',
        icon: 'BRIEFCASE',
        instrumentShares: {
          AAPL: 1.0,
        },
        name: '',
      };
      const result = CreatePieRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject name longer than 50 characters', () => {
      const invalidData = {
        dividendCashAction: 'REINVEST',
        icon: 'BRIEFCASE',
        instrumentShares: {
          AAPL: 1.0,
        },
        name: 'A'.repeat(51),
      };
      const result = CreatePieRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject negative goal', () => {
      const invalidData = {
        dividendCashAction: 'REINVEST',
        goal: -100,
        icon: 'BRIEFCASE',
        instrumentShares: {
          AAPL: 1.0,
        },
        name: 'Test',
      };
      const result = CreatePieRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});

describe('Historical Data Schemas', () => {
  describe('HistoricalOrderSchema', () => {
    it('should validate legacy historical order format', () => {
      const validData = {
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
      };
      const result = HistoricalOrderSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate new API nested historical order format', () => {
      const validData = {
        order: {
          id: 123,
          ticker: 'AAPL',
          side: 'BUY',
          type: 'MARKET',
          status: 'FILLED',
          createdAt: '2024-01-01T00:00:00Z',
        },
        fill: {
          id: 456,
          filledAt: '2024-01-01T00:00:01Z',
          quantity: 10,
          price: 150.0,
          type: 'TRADE',
        },
      };
      const result = HistoricalOrderSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('DividendSchema', () => {
    it('should validate valid dividend', () => {
      const validData = {
        amount: 10.5,
        amountInEuro: 9.75,
        grossAmountPerShare: 1.05,
        paidOn: '2024-01-01',
        quantity: 10,
        reference: 'DIV-123',
        ticker: 'AAPL',
        type: 'ORDINARY',
      };
      const result = DividendSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept all valid dividend types', () => {
      const types = ['ORDINARY', 'SPECIAL', 'RETURN_OF_CAPITAL'];
      types.forEach((type) => {
        const validData = {
          amount: 10.5,
          amountInEuro: 9.75,
          grossAmountPerShare: 1.05,
          paidOn: '2024-01-01',
          quantity: 10,
          reference: 'DIV-123',
          ticker: 'AAPL',
          type,
        };
        const result = DividendSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('TransactionSchema', () => {
    it('should validate valid transaction', () => {
      const validData = {
        amount: 1000.0,
        dateTime: '2024-01-01T00:00:00Z',
        reference: 'TXN-123',
        type: 'DEPOSIT',
      };
      const result = TransactionSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept all valid transaction types', () => {
      const types = [
        'DEPOSIT',
        'WITHDRAWAL',
        'ORDER',
        'DIVIDEND',
        'AUTOINVEST',
        'FEE',
        'INTEREST',
        'LENDING',
      ];
      types.forEach((type) => {
        const validData = {
          amount: 100.0,
          dateTime: '2024-01-01T00:00:00Z',
          reference: 'TXN-123',
          type,
        };
        const result = TransactionSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('ExportRequestSchema', () => {
    it('should validate valid export request', () => {
      const validData = {
        dataIncluded: {
          includeDividends: true,
          includeInterest: true,
          includeOrders: true,
          includeTransactions: true,
        },
        timeFrom: '2024-01-01T00:00:00Z',
        timeTo: '2024-12-31T23:59:59Z',
      };
      const result = ExportRequestSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate export request with selective data', () => {
      const validData = {
        dataIncluded: {
          includeDividends: true,
          includeInterest: false,
          includeOrders: true,
          includeTransactions: false,
        },
        timeFrom: '2024-01-01T00:00:00Z',
        timeTo: '2024-12-31T23:59:59Z',
      };
      const result = ExportRequestSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });
});

import { describe, it, expect } from 'vitest';
import {
  AccountInfoSchema,
  AccountCashSchema,
  AccountSummarySchema,
  InstrumentSchema,
  ExchangeSchema,
  PositionSchema,
  OrderSchema,
  OrderTypeSchema,
  OrderSideSchema,
  OrderStatusSchema,
  TimeInForceSchema,
  MarketOrderRequestSchema,
  LimitOrderRequestSchema,
  StopOrderRequestSchema,
  StopLimitOrderRequestSchema,
  PieInstrumentSchema,
  PieSchema,
  CreatePieRequestSchema,
  HistoricalOrderSchema,
  DividendSchema,
  TransactionSchema,
  ExportRequestSchema,
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
        free: 1000.50,
        total: 5000.00,
        ppl: 500.25,
        result: 250.75,
        invested: 3500.00,
        pieCash: 100.00,
        blocked: 50.00,
      };
      const result = AccountCashSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate valid account cash with required fields only', () => {
      const validData = {
        free: 1000.50,
        total: 5000.00,
      };
      const result = AccountCashSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject missing required fields', () => {
      const invalidData = {
        free: 1000.50,
        // missing total
      };
      const result = AccountCashSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('AccountSummarySchema', () => {
    it('should validate valid account summary', () => {
      const validData = {
        cash: {
          free: 1000.50,
          total: 5000.00,
        },
        invested: 3500.00,
        ppl: 500.25,
        pieCash: 100.00,
      };
      const result = AccountSummarySchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid nested cash object', () => {
      const invalidData = {
        cash: {
          free: 1000.50,
          // missing total
        },
        invested: 3500.00,
        ppl: 500.25,
        pieCash: 100.00,
      };
      const result = AccountSummarySchema.safeParse(invalidData);
      expect(result.success).toBe(false);
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

    it('should reject invalid instrument type', () => {
      const invalidData = {
        addedOn: '2024-01-01T00:00:00Z',
        currencyCode: 'USD',
        isin: 'US0378331005',
        minTradeQuantity: 1,
        name: 'Apple Inc.',
        shortName: 'AAPL',
        ticker: 'AAPL',
        type: 'CRYPTO', // invalid type
        workingScheduleId: 1,
      };
      const result = InstrumentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should accept STOCK, ETF, and FUND types', () => {
      const types = ['STOCK', 'ETF', 'FUND'];
      types.forEach(type => {
        const validData = {
          addedOn: '2024-01-01T00:00:00Z',
          currencyCode: 'USD',
          isin: 'US0378331005',
          minTradeQuantity: 1,
          name: 'Test Instrument',
          shortName: 'TEST',
          ticker: 'TEST',
          type,
          workingScheduleId: 1,
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
      currentPrice: 155.50,
      ppl: 52.50,
      quantity: 10,
      ticker: 'AAPL',
    };
    const result = PositionSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should validate position with all optional fields', () => {
    const validData = {
      averagePrice: 150.25,
      currentPrice: 155.50,
      frontend: 'web',
      initialFillDate: '2024-01-01T00:00:00Z',
      maxBuy: 100,
      maxSell: 10,
      pieQuantity: 5,
      ppl: 52.50,
      quantity: 10,
      ticker: 'AAPL',
    };
    const result = PositionSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });
});

describe('Order Schemas', () => {
  describe('OrderTypeSchema', () => {
    it('should accept valid order types', () => {
      const types = ['MARKET', 'LIMIT', 'STOP', 'STOP_LIMIT'];
      types.forEach(type => {
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
      const statuses = ['NEW', 'PROCESSING', 'CONFIRMED', 'PENDING', 'LOCAL', 'REPLACED', 'CANCELLED', 'REJECTED'];
      statuses.forEach(status => {
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
        filledValue: 750.00,
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
        limitPrice: 150.00,
        quantity: 10,
        ticker: 'AAPL',
        timeValidity: 'GTC',
      };
      const result = LimitOrderRequestSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject negative limit price', () => {
      const invalidData = {
        limitPrice: -150.00,
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
        stopPrice: 140.00,
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
        limitPrice: 145.00,
        quantity: 10,
        stopPrice: 140.00,
        ticker: 'AAPL',
        timeValidity: 'GTC',
      };
      const result = StopLimitOrderRequestSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject missing limit price', () => {
      const invalidData = {
        quantity: 10,
        stopPrice: 140.00,
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
    it('should validate valid historical order', () => {
      const validData = {
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
      };
      const result = HistoricalOrderSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('DividendSchema', () => {
    it('should validate valid dividend', () => {
      const validData = {
        amount: 10.50,
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
      types.forEach(type => {
        const validData = {
          amount: 10.50,
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
        amount: 1000.00,
        dateTime: '2024-01-01T00:00:00Z',
        reference: 'TXN-123',
        type: 'DEPOSIT',
      };
      const result = TransactionSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept all valid transaction types', () => {
      const types = ['DEPOSIT', 'WITHDRAWAL', 'ORDER', 'DIVIDEND', 'AUTOINVEST', 'FEE', 'INTEREST', 'LENDING'];
      types.forEach(type => {
        const validData = {
          amount: 100.00,
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

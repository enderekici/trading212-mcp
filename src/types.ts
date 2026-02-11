import { z } from 'zod';

// Environment configuration
export type Environment = 'demo' | 'live';

export interface Trading212Config {
  apiKey: string;
  environment: Environment;
}

// Account schemas
export const AccountInfoSchema = z.object({
  currencyCode: z.string(),
  id: z.number(),
});

export const AccountCashSchema = z.object({
  free: z.number(),
  total: z.number(),
  ppl: z.number().optional(),
  result: z.number().optional(),
  invested: z.number().optional(),
  pieCash: z.number().optional(),
  blocked: z.number().optional(),
});

export const AccountSummarySchema = z.object({
  cash: AccountCashSchema,
  invested: z.number(),
  ppl: z.number(),
  pieCash: z.number(),
  maxRisk: z.number().optional(),
  freeForStocks: z.number().optional(),
  freeForInvest: z.number().optional(),
  pplRelative: z.number().optional(),
});

// Instrument schemas
export const InstrumentSchema = z.object({
  addedOn: z.string(),
  currencyCode: z.string(),
  isin: z.string(),
  maxOpenQuantity: z.number().optional(),
  minTradeQuantity: z.number(),
  name: z.string(),
  shortName: z.string(),
  ticker: z.string(),
  type: z.enum(['STOCK', 'ETF', 'FUND']),
  workingScheduleId: z.number(),
});

export const ExchangeSchema = z.object({
  id: z.number(),
  name: z.string(),
  workingSchedules: z.array(
    z.object({
      id: z.number(),
      timeEvents: z.array(
        z.object({
          date: z.string(),
          type: z.string(),
        }),
      ),
    }),
  ),
});

// Position schemas
export const PositionSchema = z.object({
  averagePrice: z.number(),
  currentPrice: z.number(),
  frontend: z.string().optional(),
  initialFillDate: z.string().optional(),
  maxBuy: z.number().optional(),
  maxSell: z.number().optional(),
  pieQuantity: z.number().optional(),
  ppl: z.number(),
  quantity: z.number(),
  ticker: z.string(),
});

// Order schemas
export const OrderTypeSchema = z.enum(['MARKET', 'LIMIT', 'STOP', 'STOP_LIMIT']);
export const OrderSideSchema = z.enum(['BUY', 'SELL']);
export const OrderStatusSchema = z.enum([
  'NEW',
  'PROCESSING',
  'CONFIRMED',
  'PENDING',
  'LOCAL',
  'REPLACED',
  'CANCELLED',
  'REJECTED',
]);
export const TimeInForceSchema = z.enum(['DAY', 'GTC']);

export const OrderSchema = z.object({
  createdOn: z.string(),
  filledQuantity: z.number(),
  filledValue: z.number(),
  id: z.number(),
  limitPrice: z.number().optional(),
  quantity: z.number(),
  side: OrderSideSchema,
  status: OrderStatusSchema,
  stopPrice: z.number().optional(),
  strategy: z.string().optional(),
  ticker: z.string(),
  timeValidity: TimeInForceSchema,
  type: OrderTypeSchema,
  value: z.number().optional(),
});

// Market order request
export const MarketOrderRequestSchema = z.object({
  quantity: z.number().positive(),
  ticker: z.string(),
  timeValidity: TimeInForceSchema.default('DAY'),
});

// Limit order request
export const LimitOrderRequestSchema = z.object({
  limitPrice: z.number().positive(),
  quantity: z.number().positive(),
  ticker: z.string(),
  timeValidity: TimeInForceSchema.default('DAY'),
});

// Stop order request
export const StopOrderRequestSchema = z.object({
  quantity: z.number().positive(),
  stopPrice: z.number().positive(),
  ticker: z.string(),
  timeValidity: TimeInForceSchema.default('DAY'),
});

// Stop-limit order request
export const StopLimitOrderRequestSchema = z.object({
  limitPrice: z.number().positive(),
  quantity: z.number().positive(),
  stopPrice: z.number().positive(),
  ticker: z.string(),
  timeValidity: TimeInForceSchema.default('DAY'),
});

// Pie schemas
export const PieInstrumentSchema = z.object({
  expectedShare: z.number(),
  ticker: z.string(),
});

export const PieSchema = z.object({
  cash: z.number(),
  dividendCashAction: z.enum(['REINVEST', 'TO_ACCOUNT_CASH']),
  goal: z.number().optional(),
  icon: z.string(),
  id: z.number(),
  instruments: z.array(PieInstrumentSchema),
  name: z.string(),
  pubicUrl: z.string().optional(),
  result: z.number(),
  status: z.enum(['ACTIVE', 'INACTIVE']),
});

export const CreatePieRequestSchema = z.object({
  dividendCashAction: z.enum(['REINVEST', 'TO_ACCOUNT_CASH']),
  goal: z.number().positive().optional(),
  icon: z.string(),
  instrumentShares: z.record(z.string(), z.number()),
  name: z.string().min(1).max(50),
});

// Historical data schemas
export const HistoricalOrderSchema = z.object({
  dateCreated: z.string(),
  dateExecuted: z.string().optional(),
  dateModified: z.string().optional(),
  executor: z.string().optional(),
  fillCost: z.number(),
  fillId: z.number(),
  fillPrice: z.number(),
  fillResult: z.number(),
  fillType: z.string(),
  filledQuantity: z.number(),
  filledValue: z.number(),
  id: z.number(),
  limitPrice: z.number().optional(),
  orderedQuantity: z.number(),
  orderedValue: z.number(),
  parentOrder: z.number().optional(),
  status: OrderStatusSchema,
  stopPrice: z.number().optional(),
  taxes: z.object({
    fillTax: z.number(),
    finraTradingActivityFee: z.number().optional(),
    stampDutyReserveTax: z.number().optional(),
    transactionTax: z.number().optional(),
  }),
  ticker: z.string(),
  timeValidity: TimeInForceSchema,
  type: OrderTypeSchema,
});

export const DividendSchema = z.object({
  amount: z.number(),
  amountInEuro: z.number(),
  grossAmountPerShare: z.number(),
  paidOn: z.string(),
  quantity: z.number(),
  reference: z.string(),
  ticker: z.string(),
  type: z.enum(['ORDINARY', 'SPECIAL', 'RETURN_OF_CAPITAL']),
});

export const TransactionSchema = z.object({
  amount: z.number(),
  dateTime: z.string(),
  reference: z.string(),
  type: z.enum([
    'DEPOSIT',
    'WITHDRAWAL',
    'ORDER',
    'DIVIDEND',
    'AUTOINVEST',
    'FEE',
    'INTEREST',
    'LENDING',
  ]),
});

export const ExportRequestSchema = z.object({
  dataIncluded: z.object({
    includeDividends: z.boolean(),
    includeInterest: z.boolean(),
    includeOrders: z.boolean(),
    includeTransactions: z.boolean(),
  }),
  timeFrom: z.string(),
  timeTo: z.string(),
});

// Rate limit info
export interface RateLimitInfo {
  limit: number;
  period: number;
  remaining: number;
  reset: number;
  used: number;
}

// Export types
export type AccountInfo = z.infer<typeof AccountInfoSchema>;
export type AccountCash = z.infer<typeof AccountCashSchema>;
export type AccountSummary = z.infer<typeof AccountSummarySchema>;
export type Instrument = z.infer<typeof InstrumentSchema>;
export type Exchange = z.infer<typeof ExchangeSchema>;
export type Position = z.infer<typeof PositionSchema>;
export type Order = z.infer<typeof OrderSchema>;
export type MarketOrderRequest = z.infer<typeof MarketOrderRequestSchema>;
export type LimitOrderRequest = z.infer<typeof LimitOrderRequestSchema>;
export type StopOrderRequest = z.infer<typeof StopOrderRequestSchema>;
export type StopLimitOrderRequest = z.infer<typeof StopLimitOrderRequestSchema>;
export type Pie = z.infer<typeof PieSchema>;
export type CreatePieRequest = z.infer<typeof CreatePieRequestSchema>;
export type HistoricalOrder = z.infer<typeof HistoricalOrderSchema>;
export type Dividend = z.infer<typeof DividendSchema>;
export type Transaction = z.infer<typeof TransactionSchema>;
export type ExportRequest = z.infer<typeof ExportRequestSchema>;

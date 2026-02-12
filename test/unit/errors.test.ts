import { describe, expect, it } from 'vitest';
import {
  ApiError,
  AuthError,
  RateLimitError,
  serializeError,
  Trading212Error,
  ValidationError,
} from '../../src/utils/errors.js';

describe('Trading212Error', () => {
  it('should create error with message, code, and statusCode', () => {
    const error = new Trading212Error('test error', 'TEST_CODE', 500);
    expect(error.message).toBe('test error');
    expect(error.code).toBe('TEST_CODE');
    expect(error.statusCode).toBe(500);
    expect(error.name).toBe('Trading212Error');
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(Trading212Error);
  });

  it('should create error without statusCode', () => {
    const error = new Trading212Error('test error', 'TEST_CODE');
    expect(error.message).toBe('test error');
    expect(error.code).toBe('TEST_CODE');
    expect(error.statusCode).toBeUndefined();
  });

  it('should have a stack trace', () => {
    const error = new Trading212Error('test error', 'TEST_CODE');
    expect(error.stack).toBeDefined();
  });
});

describe('ApiError', () => {
  it('should create API error with message, statusCode, and response', () => {
    const response = { detail: 'some detail' };
    const error = new ApiError('API failed', 400, response);
    expect(error.message).toBe('API failed');
    expect(error.code).toBe('API_ERROR');
    expect(error.statusCode).toBe(400);
    expect(error.response).toEqual(response);
    expect(error.name).toBe('ApiError');
    expect(error).toBeInstanceOf(Trading212Error);
  });

  it('should create API error without response', () => {
    const error = new ApiError('API failed', 500);
    expect(error.response).toBeUndefined();
  });

  describe('fromResponse', () => {
    it('should create error from response body with message field', () => {
      const body = { message: 'Invalid request' };
      const error = ApiError.fromResponse(400, body);
      expect(error.message).toBe('Invalid request');
      expect(error.statusCode).toBe(400);
      expect(error.response).toEqual(body);
    });

    it('should create error with default message when body has no message field', () => {
      const body = { code: 'UNKNOWN' };
      const error = ApiError.fromResponse(500, body);
      expect(error.message).toBe('API request failed');
      expect(error.statusCode).toBe(500);
    });

    it('should handle null body', () => {
      const error = ApiError.fromResponse(500, null);
      expect(error.message).toBe('API request failed');
    });

    it('should handle non-object body', () => {
      const error = ApiError.fromResponse(500, 'plain text error');
      expect(error.message).toBe('API request failed');
    });

    it('should handle body where message is not a string', () => {
      const body = { message: 42 };
      const error = ApiError.fromResponse(400, body);
      expect(error.message).toBe('42');
    });
  });
});

describe('AuthError', () => {
  it('should create auth error with message', () => {
    const error = new AuthError('unauthorized');
    expect(error.message).toBe('unauthorized');
    expect(error.code).toBe('AUTH_ERROR');
    expect(error.statusCode).toBe(401);
    expect(error.name).toBe('AuthError');
    expect(error).toBeInstanceOf(Trading212Error);
  });

  describe('missingApiKey', () => {
    it('should create error for missing API key', () => {
      const error = AuthError.missingApiKey();
      expect(error.message).toBe('TRADING212_API_KEY environment variable is required');
      expect(error).toBeInstanceOf(AuthError);
    });
  });

  describe('invalidApiKey', () => {
    it('should create error for invalid API key', () => {
      const error = AuthError.invalidApiKey();
      expect(error.message).toBe('Invalid API key');
      expect(error).toBeInstanceOf(AuthError);
    });
  });
});

describe('RateLimitError', () => {
  it('should create rate limit error', () => {
    const error = new RateLimitError('rate limited', 1234567890, 60);
    expect(error.message).toBe('rate limited');
    expect(error.code).toBe('RATE_LIMIT_ERROR');
    expect(error.statusCode).toBe(429);
    expect(error.resetAt).toBe(1234567890);
    expect(error.limit).toBe(60);
    expect(error.name).toBe('RateLimitError');
    expect(error).toBeInstanceOf(Trading212Error);
  });

  describe('fromHeaders', () => {
    it('should create error from rate limit headers', () => {
      const headers = {
        'x-ratelimit-reset': '1707350460',
        'x-ratelimit-limit': '60',
        'x-ratelimit-remaining': '0',
      };
      const error = RateLimitError.fromHeaders(headers);
      expect(error.resetAt).toBe(1707350460);
      expect(error.limit).toBe(60);
      expect(error.message).toContain('Rate limit exceeded');
      expect(error.message).toContain('Limit: 60');
      expect(error.message).toContain('Remaining: 0');
      expect(error.message).toContain('Resets at:');
    });

    it('should handle missing headers with defaults', () => {
      const headers = {};
      const error = RateLimitError.fromHeaders(headers);
      expect(error.resetAt).toBe(0);
      expect(error.limit).toBe(0);
      expect(error.message).toContain('Remaining: 0');
    });
  });
});

describe('ValidationError', () => {
  it('should create validation error with message and issues', () => {
    const issues = [{ path: ['ticker'], message: 'Required' }];
    const error = new ValidationError('invalid params', issues);
    expect(error.message).toBe('invalid params');
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.statusCode).toBe(400);
    expect(error.issues).toEqual(issues);
    expect(error.name).toBe('ValidationError');
    expect(error).toBeInstanceOf(Trading212Error);
  });

  it('should create validation error without issues', () => {
    const error = new ValidationError('invalid');
    expect(error.issues).toBeUndefined();
  });

  describe('fromZodError', () => {
    it('should create error from Zod-like error object', () => {
      const zodError = {
        issues: [
          { path: ['ticker'], message: 'Required' },
          { path: ['quantity'], message: 'Expected number' },
        ],
      };
      const error = ValidationError.fromZodError(zodError);
      expect(error.message).toBe('Invalid request parameters');
      expect(error.issues).toEqual(zodError.issues);
      expect(error).toBeInstanceOf(ValidationError);
    });
  });
});

describe('serializeError', () => {
  it('should serialize Trading212Error', () => {
    const error = new Trading212Error('test', 'TEST', 500);
    const serialized = serializeError(error);
    expect(serialized).toEqual({
      name: 'Trading212Error',
      message: 'test',
      code: 'TEST',
      statusCode: 500,
    });
  });

  it('should serialize ApiError', () => {
    const error = new ApiError('api fail', 400, { detail: 'bad' });
    const serialized = serializeError(error);
    expect(serialized).toEqual({
      name: 'ApiError',
      message: 'api fail',
      code: 'API_ERROR',
      statusCode: 400,
    });
  });

  it('should serialize AuthError', () => {
    const error = AuthError.missingApiKey();
    const serialized = serializeError(error);
    expect(serialized).toEqual({
      name: 'AuthError',
      message: 'TRADING212_API_KEY environment variable is required',
      code: 'AUTH_ERROR',
      statusCode: 401,
    });
  });

  it('should serialize ValidationError with issues', () => {
    const issues = [{ path: ['ticker'], message: 'Required' }];
    const error = new ValidationError('invalid', issues);
    const serialized = serializeError(error);
    expect(serialized).toEqual({
      name: 'ValidationError',
      message: 'invalid',
      code: 'VALIDATION_ERROR',
      statusCode: 400,
      issues,
    });
  });

  it('should serialize ValidationError without issues', () => {
    const error = new ValidationError('invalid');
    const serialized = serializeError(error);
    expect(serialized).toEqual({
      name: 'ValidationError',
      message: 'invalid',
      code: 'VALIDATION_ERROR',
      statusCode: 400,
    });
  });

  it('should serialize RateLimitError', () => {
    const error = new RateLimitError('rate limited', 123, 60);
    const serialized = serializeError(error);
    expect(serialized).toEqual({
      name: 'RateLimitError',
      message: 'rate limited',
      code: 'RATE_LIMIT_ERROR',
      statusCode: 429,
    });
  });

  it('should serialize standard Error', () => {
    const error = new Error('standard error');
    const serialized = serializeError(error);
    expect(serialized).toEqual({
      name: 'Error',
      message: 'standard error',
    });
  });

  it('should serialize non-Error values', () => {
    const serialized = serializeError('string error');
    expect(serialized).toEqual({
      name: 'UnknownError',
      message: 'string error',
    });
  });

  it('should serialize number as error', () => {
    const serialized = serializeError(42);
    expect(serialized).toEqual({
      name: 'UnknownError',
      message: '42',
    });
  });

  it('should serialize null as error', () => {
    const serialized = serializeError(null);
    expect(serialized).toEqual({
      name: 'UnknownError',
      message: 'null',
    });
  });

  it('should serialize undefined as error', () => {
    const serialized = serializeError(undefined);
    expect(serialized).toEqual({
      name: 'UnknownError',
      message: 'undefined',
    });
  });
});

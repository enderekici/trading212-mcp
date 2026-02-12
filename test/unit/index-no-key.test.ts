import { describe, expect, it, vi } from 'vitest';

// Test the missing API key path of index.ts
// This requires importing index.ts without TRADING212_API_KEY set.

// Mock logger to suppress output
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

vi.mock('@modelcontextprotocol/sdk/server/index.js', () => {
  return {
    // biome-ignore lint/complexity/useArrowFunction: must use function for constructor mock
    Server: vi.fn(function () {
      return {
        connect: vi.fn().mockResolvedValue(undefined),
        setRequestHandler: vi.fn(),
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

vi.mock('../../src/client.js', () => {
  return {
    // biome-ignore lint/complexity/useArrowFunction: must use function for constructor mock
    Trading212Client: vi.fn(function () {
      return {};
    }),
  };
});

describe('Index - missing API key', () => {
  it('should throw AuthError when TRADING212_API_KEY is not set', async () => {
    // Clear the API key env var
    const originalKey = process.env.TRADING212_API_KEY;
    delete process.env.TRADING212_API_KEY;

    try {
      await expect(import('../../src/index.js')).rejects.toThrow(
        'TRADING212_API_KEY environment variable is required',
      );
    } finally {
      // Restore env var
      if (originalKey) {
        process.env.TRADING212_API_KEY = originalKey;
      }
    }
  });
});

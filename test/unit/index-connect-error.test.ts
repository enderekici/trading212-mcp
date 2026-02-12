import { describe, expect, it, vi } from 'vitest';

// Test the main() error path of index.ts when server.connect() fails.
// This tests the catch block in main() and the .catch() handler.

// Mock logger
const mockLogger = {
  info: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  debug: vi.fn(),
  fatal: vi.fn(),
  level: 'info',
};

vi.mock('../../src/utils/logger.js', () => {
  return {
    default: mockLogger,
  };
});

const connectError = new Error('Connection failed');

vi.mock('@modelcontextprotocol/sdk/server/index.js', () => {
  return {
    // biome-ignore lint/complexity/useArrowFunction: must use function for constructor mock
    Server: vi.fn(function () {
      return {
        connect: vi.fn().mockRejectedValue(connectError),
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

describe('Index - connect error handling', () => {
  it('should log fatal error and call process.exit when connect fails', async () => {
    process.env.TRADING212_API_KEY = 'test-api-key';
    process.env.TRADING212_ENVIRONMENT = 'demo';

    // Mock process.exit to prevent actual exit
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => {
      /* noop */
    }) as any);

    try {
      await import('../../src/index.js');
      // Give the main().catch() a tick to execute
      await new Promise((resolve) => setTimeout(resolve, 50));
    } catch {
      // The import might throw or not depending on how the error propagates
    }

    // The main() catch block should have logged a fatal error
    expect(mockLogger.fatal).toHaveBeenCalled();
    // process.exit(1) should have been called
    expect(exitSpy).toHaveBeenCalledWith(1);

    exitSpy.mockRestore();
  });
});

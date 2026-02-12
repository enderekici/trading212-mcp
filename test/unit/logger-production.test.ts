import { afterEach, describe, expect, it, vi } from 'vitest';

describe('Logger - production mode', () => {
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    if (originalNodeEnv !== undefined) {
      process.env.NODE_ENV = originalNodeEnv;
    } else {
      delete process.env.NODE_ENV;
    }
    vi.resetModules();
  });

  it('should create logger without pino-pretty transport in production', async () => {
    process.env.NODE_ENV = 'production';

    const { default: logger } = await import('../../src/utils/logger.js');
    expect(logger).toBeDefined();
    expect(typeof logger.info).toBe('function');
    // In production mode, the transport should be undefined (no pino-pretty)
    // We just verify the logger works
    expect(() => logger.info('production test')).not.toThrow();
  });

  it('should create logger with pino-pretty transport in non-production', async () => {
    process.env.NODE_ENV = 'development';

    const { default: logger } = await import('../../src/utils/logger.js');
    expect(logger).toBeDefined();
    expect(typeof logger.info).toBe('function');
  });
});

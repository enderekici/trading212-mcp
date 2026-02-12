import { describe, expect, it } from 'vitest';
import logger from '../../src/utils/logger.js';

describe('Logger', () => {
  it('should export a pino logger instance', () => {
    expect(logger).toBeDefined();
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.error).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.debug).toBe('function');
    expect(typeof logger.trace).toBe('function');
    expect(typeof logger.fatal).toBe('function');
  });

  it('should have a valid log level', () => {
    expect(typeof logger.level).toBe('string');
    expect(['trace', 'debug', 'info', 'warn', 'error', 'fatal', 'silent']).toContain(logger.level);
  });

  it('should be callable for logging', () => {
    // Ensure that calling logger methods does not throw
    expect(() => logger.info('test message')).not.toThrow();
    expect(() => logger.info({ key: 'value' }, 'structured log')).not.toThrow();
    expect(() => logger.debug('debug message')).not.toThrow();
    expect(() => logger.warn('warn message')).not.toThrow();
  });
});

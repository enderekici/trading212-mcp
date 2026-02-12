import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type AnyHandler = (...args: unknown[]) => unknown;

describe('CLI direct coverage', () => {
  const originalArgv = process.argv;
  const originalExit = process.exit;
  const originalEnv = { ...process.env };
  let exitCode: number | undefined;
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.resetModules();
    exitCode = undefined;
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {
      /* noop */
    });
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {
      /* noop */
    });

    // Mock process.exit to capture exit code without actually exiting
    process.exit = vi.fn().mockImplementation((code?: number) => {
      exitCode = code ?? 0;
      throw new Error(`process.exit(${code})`);
    }) as any;
  });

  afterEach(() => {
    process.argv = originalArgv;
    process.exit = originalExit;
    process.env = { ...originalEnv };
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it('should show help for --help flag', async () => {
    process.argv = ['node', 'cli.ts', '--help'];
    delete process.env.TRADING212_API_KEY;

    vi.doMock('node:child_process', () => ({
      spawn: vi.fn(() => ({
        on: vi.fn(),
        kill: vi.fn(),
      })),
    }));

    try {
      await import('../../src/cli.js');
    } catch (e: any) {
      if (!e.message?.includes('process.exit')) throw e;
    }

    expect(exitCode).toBe(0);
    const output = consoleLogSpy.mock.calls.map((c: any) => c[0]).join('\n');
    expect(output).toContain('Trading 212 MCP Server');
    expect(output).toContain('USAGE:');
  });

  it('should show help for -h flag', async () => {
    process.argv = ['node', 'cli.ts', '-h'];
    delete process.env.TRADING212_API_KEY;

    vi.doMock('node:child_process', () => ({
      spawn: vi.fn(() => ({
        on: vi.fn(),
        kill: vi.fn(),
      })),
    }));

    try {
      await import('../../src/cli.js');
    } catch (e: any) {
      if (!e.message?.includes('process.exit')) throw e;
    }

    expect(exitCode).toBe(0);
  });

  it('should show version for --version flag', async () => {
    process.argv = ['node', 'cli.ts', '--version'];
    delete process.env.TRADING212_API_KEY;

    vi.doMock('node:child_process', () => ({
      spawn: vi.fn(() => ({
        on: vi.fn(),
        kill: vi.fn(),
      })),
    }));

    try {
      await import('../../src/cli.js');
    } catch (e: any) {
      if (!e.message?.includes('process.exit')) throw e;
    }

    expect(exitCode).toBe(0);
    const output = consoleLogSpy.mock.calls.map((c: any) => c[0]).join('\n');
    expect(output).toContain('trading212-mcp version 1.0.0');
  });

  it('should show version for -v flag', async () => {
    process.argv = ['node', 'cli.ts', '-v'];
    delete process.env.TRADING212_API_KEY;

    vi.doMock('node:child_process', () => ({
      spawn: vi.fn(() => ({
        on: vi.fn(),
        kill: vi.fn(),
      })),
    }));

    try {
      await import('../../src/cli.js');
    } catch (e: any) {
      if (!e.message?.includes('process.exit')) throw e;
    }

    expect(exitCode).toBe(0);
  });

  it('should error when API key is missing', async () => {
    process.argv = ['node', 'cli.ts'];
    delete process.env.TRADING212_API_KEY;

    vi.doMock('node:child_process', () => ({
      spawn: vi.fn(() => ({
        on: vi.fn(),
        kill: vi.fn(),
      })),
    }));

    try {
      await import('../../src/cli.js');
    } catch (e: any) {
      if (!e.message?.includes('process.exit')) throw e;
    }

    expect(exitCode).toBe(1);
    const errorOutput = consoleErrorSpy.mock.calls.map((c: any) => c[0]).join('\n');
    expect(errorOutput).toContain('TRADING212_API_KEY is required');
  });

  it('should reject invalid environment', async () => {
    process.argv = ['node', 'cli.ts', '-e', 'staging'];
    process.env.TRADING212_API_KEY = 'test-key';

    vi.doMock('node:child_process', () => ({
      spawn: vi.fn(() => ({
        on: vi.fn(),
        kill: vi.fn(),
      })),
    }));

    try {
      await import('../../src/cli.js');
    } catch (e: any) {
      if (!e.message?.includes('process.exit')) throw e;
    }

    expect(exitCode).toBe(1);
    const errorOutput = consoleErrorSpy.mock.calls.map((c: any) => c[0]).join('\n');
    expect(errorOutput).toContain('Environment must be "demo" or "live"');
  });

  it('should accept -k flag and spawn server', async () => {
    process.argv = ['node', 'cli.ts', '-k', 'my-api-key'];
    delete process.env.TRADING212_API_KEY;

    const mockSpawn = vi.fn(() => ({
      on: vi.fn(),
      kill: vi.fn(),
    }));

    vi.doMock('node:child_process', () => ({
      spawn: mockSpawn,
    }));

    await import('../../src/cli.js');

    // Should NOT have exited with error
    expect(exitCode).toBeUndefined();
    expect(mockSpawn).toHaveBeenCalled();
  });

  it('should accept --api-key flag and spawn server', async () => {
    process.argv = ['node', 'cli.ts', '--api-key', 'my-api-key'];
    delete process.env.TRADING212_API_KEY;

    const mockSpawn = vi.fn(() => ({
      on: vi.fn(),
      kill: vi.fn(),
    }));

    vi.doMock('node:child_process', () => ({
      spawn: mockSpawn,
    }));

    await import('../../src/cli.js');

    expect(exitCode).toBeUndefined();
    expect(mockSpawn).toHaveBeenCalled();
  });

  it('should accept -e demo and spawn server', async () => {
    process.argv = ['node', 'cli.ts', '-e', 'demo'];
    process.env.TRADING212_API_KEY = 'test-key';

    const mockSpawn = vi.fn(() => ({
      on: vi.fn(),
      kill: vi.fn(),
    }));

    vi.doMock('node:child_process', () => ({
      spawn: mockSpawn,
    }));

    await import('../../src/cli.js');

    expect(exitCode).toBeUndefined();
    expect(mockSpawn).toHaveBeenCalled();
  });

  it('should accept -e live and spawn server', async () => {
    process.argv = ['node', 'cli.ts', '-e', 'live'];
    process.env.TRADING212_API_KEY = 'test-key';

    const mockSpawn = vi.fn(() => ({
      on: vi.fn(),
      kill: vi.fn(),
    }));

    vi.doMock('node:child_process', () => ({
      spawn: mockSpawn,
    }));

    await import('../../src/cli.js');

    expect(exitCode).toBeUndefined();
  });

  it('should accept --environment flag', async () => {
    process.argv = ['node', 'cli.ts', '--environment', 'demo'];
    process.env.TRADING212_API_KEY = 'test-key';

    const mockSpawn = vi.fn(() => ({
      on: vi.fn(),
      kill: vi.fn(),
    }));

    vi.doMock('node:child_process', () => ({
      spawn: mockSpawn,
    }));

    await import('../../src/cli.js');

    expect(exitCode).toBeUndefined();
  });

  it('should use API key from env when no flag', async () => {
    process.argv = ['node', 'cli.ts'];
    process.env.TRADING212_API_KEY = 'env-api-key';
    process.env.TRADING212_ENVIRONMENT = 'demo';

    const mockSpawn = vi.fn(() => ({
      on: vi.fn(),
      kill: vi.fn(),
    }));

    vi.doMock('node:child_process', () => ({
      spawn: mockSpawn,
    }));

    await import('../../src/cli.js');

    expect(exitCode).toBeUndefined();
    expect(mockSpawn).toHaveBeenCalled();
    // Check that the spawn env includes the API key
    const spawnCall = mockSpawn.mock.calls[0];
    const env = spawnCall[2]?.env;
    expect(env?.TRADING212_API_KEY).toBe('env-api-key');
  });

  it('should set up signal handlers and spawn event handlers', async () => {
    process.argv = ['node', 'cli.ts'];
    process.env.TRADING212_API_KEY = 'test-key';

    const eventHandlers: Record<string, AnyHandler> = {};
    const mockSpawn = vi.fn(() => ({
      on: vi.fn((event: string, handler: AnyHandler) => {
        eventHandlers[event] = handler;
      }),
      kill: vi.fn(),
    }));

    vi.doMock('node:child_process', () => ({
      spawn: mockSpawn,
    }));

    const processOnSpy = vi.spyOn(process, 'on');

    await import('../../src/cli.js');

    // Check signal handlers were registered
    const sigintCalls = processOnSpy.mock.calls.filter((c) => c[0] === 'SIGINT');
    const sigtermCalls = processOnSpy.mock.calls.filter((c) => c[0] === 'SIGTERM');
    expect(sigintCalls.length).toBeGreaterThanOrEqual(1);
    expect(sigtermCalls.length).toBeGreaterThanOrEqual(1);

    // Check spawn event handlers were registered
    expect(eventHandlers.exit).toBeDefined();
    expect(eventHandlers.error).toBeDefined();

    processOnSpy.mockRestore();
  });

  it('should handle child process exit with code', async () => {
    process.argv = ['node', 'cli.ts'];
    process.env.TRADING212_API_KEY = 'test-key';

    const eventHandlers: Record<string, AnyHandler> = {};
    const mockSpawn = vi.fn(() => ({
      on: vi.fn((event: string, handler: AnyHandler) => {
        eventHandlers[event] = handler;
      }),
      kill: vi.fn(),
    }));

    vi.doMock('node:child_process', () => ({
      spawn: mockSpawn,
    }));

    await import('../../src/cli.js');

    // Trigger exit with code 0
    try {
      eventHandlers.exit(0);
    } catch (e: any) {
      if (!e.message?.includes('process.exit')) throw e;
    }
    expect(exitCode).toBe(0);
  });

  it('should handle child process exit with null code', async () => {
    process.argv = ['node', 'cli.ts'];
    process.env.TRADING212_API_KEY = 'test-key';

    const eventHandlers: Record<string, AnyHandler> = {};
    const mockSpawn = vi.fn(() => ({
      on: vi.fn((event: string, handler: AnyHandler) => {
        eventHandlers[event] = handler;
      }),
      kill: vi.fn(),
    }));

    vi.doMock('node:child_process', () => ({
      spawn: mockSpawn,
    }));

    await import('../../src/cli.js');

    try {
      eventHandlers.exit(null);
    } catch (e: any) {
      if (!e.message?.includes('process.exit')) throw e;
    }
    expect(exitCode).toBe(0);
  });

  it('should handle child process exit with non-zero code', async () => {
    process.argv = ['node', 'cli.ts'];
    process.env.TRADING212_API_KEY = 'test-key';

    const eventHandlers: Record<string, AnyHandler> = {};
    const mockSpawn = vi.fn(() => ({
      on: vi.fn((event: string, handler: AnyHandler) => {
        eventHandlers[event] = handler;
      }),
      kill: vi.fn(),
    }));

    vi.doMock('node:child_process', () => ({
      spawn: mockSpawn,
    }));

    await import('../../src/cli.js');

    try {
      eventHandlers.exit(1);
    } catch (e: any) {
      if (!e.message?.includes('process.exit')) throw e;
    }
    expect(exitCode).toBe(1);
  });

  it('should handle child process error event', async () => {
    process.argv = ['node', 'cli.ts'];
    process.env.TRADING212_API_KEY = 'test-key';

    const eventHandlers: Record<string, AnyHandler> = {};
    const mockSpawn = vi.fn(() => ({
      on: vi.fn((event: string, handler: AnyHandler) => {
        eventHandlers[event] = handler;
      }),
      kill: vi.fn(),
    }));

    vi.doMock('node:child_process', () => ({
      spawn: mockSpawn,
    }));

    await import('../../src/cli.js');

    try {
      eventHandlers.error(new Error('spawn ENOENT'));
    } catch (e: any) {
      if (!e.message?.includes('process.exit')) throw e;
    }
    expect(exitCode).toBe(1);
    const errorOutput = consoleErrorSpy.mock.calls.map((c: any) => c[0]).join('\n');
    expect(errorOutput).toContain('Failed to start MCP server:');
  });

  it('should handle SIGINT signal', async () => {
    process.argv = ['node', 'cli.ts'];
    process.env.TRADING212_API_KEY = 'test-key';

    const mockKill = vi.fn();
    const mockSpawn = vi.fn(() => ({
      on: vi.fn(),
      kill: mockKill,
    }));

    vi.doMock('node:child_process', () => ({
      spawn: mockSpawn,
    }));

    const signalHandlers: Record<string, AnyHandler> = {};
    const processOnSpy = vi.spyOn(process, 'on').mockImplementation(((
      event: string,
      handler: AnyHandler,
    ) => {
      signalHandlers[event] = handler;
      return process;
    }) as any);

    await import('../../src/cli.js');

    expect(signalHandlers.SIGINT).toBeDefined();
    try {
      signalHandlers.SIGINT();
    } catch (e: any) {
      if (!e.message?.includes('process.exit')) throw e;
    }

    expect(mockKill).toHaveBeenCalledWith('SIGINT');
    expect(exitCode).toBe(0);

    processOnSpy.mockRestore();
  });

  it('should handle SIGTERM signal', async () => {
    process.argv = ['node', 'cli.ts'];
    process.env.TRADING212_API_KEY = 'test-key';

    const mockKill = vi.fn();
    const mockSpawn = vi.fn(() => ({
      on: vi.fn(),
      kill: mockKill,
    }));

    vi.doMock('node:child_process', () => ({
      spawn: mockSpawn,
    }));

    const signalHandlers: Record<string, AnyHandler> = {};
    const processOnSpy = vi.spyOn(process, 'on').mockImplementation(((
      event: string,
      handler: AnyHandler,
    ) => {
      signalHandlers[event] = handler;
      return process;
    }) as any);

    await import('../../src/cli.js');

    expect(signalHandlers.SIGTERM).toBeDefined();
    try {
      signalHandlers.SIGTERM();
    } catch (e: any) {
      if (!e.message?.includes('process.exit')) throw e;
    }

    expect(mockKill).toHaveBeenCalledWith('SIGTERM');
    expect(exitCode).toBe(0);

    processOnSpy.mockRestore();
  });

  it('should pass correct environment to spawned process', async () => {
    process.argv = ['node', 'cli.ts', '-k', 'custom-key', '-e', 'live'];
    delete process.env.TRADING212_API_KEY;

    const mockSpawn = vi.fn(() => ({
      on: vi.fn(),
      kill: vi.fn(),
    }));

    vi.doMock('node:child_process', () => ({
      spawn: mockSpawn,
    }));

    await import('../../src/cli.js');

    const spawnCall = mockSpawn.mock.calls[0];
    expect(spawnCall[0]).toBe('node');
    expect(spawnCall[2]?.env?.TRADING212_API_KEY).toBe('custom-key');
    expect(spawnCall[2]?.env?.TRADING212_ENVIRONMENT).toBe('live');
    expect(spawnCall[2]?.stdio).toBe('inherit');
  });
});

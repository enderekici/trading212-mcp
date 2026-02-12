import { spawn } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const cliPath = join(__dirname, '..', '..', 'src', 'cli.ts');

describe('CLI', () => {
  describe('--help flag', () => {
    it('should display help text and exit with code 0 for --help', async () => {
      const result = await runCli(['--help']);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Trading 212 MCP Server');
      expect(result.stdout).toContain('USAGE:');
      expect(result.stdout).toContain('OPTIONS:');
      expect(result.stdout).toContain('ENVIRONMENT VARIABLES:');
      expect(result.stdout).toContain('EXAMPLES:');
      expect(result.stdout).toContain('CLAUDE DESKTOP CONFIGURATION:');
      expect(result.stdout).toContain('DOCUMENTATION:');
      expect(result.stdout).toContain('VERSION:');
    });

    it('should display help text for -h shorthand', async () => {
      const result = await runCli(['-h']);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Trading 212 MCP Server');
    });
  });

  describe('--version flag', () => {
    it('should display version and exit with code 0 for --version', async () => {
      const result = await runCli(['--version']);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('trading212-mcp version 1.0.0');
    });

    it('should display version for -v shorthand', async () => {
      const result = await runCli(['-v']);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('trading212-mcp version 1.0.0');
    });
  });

  describe('missing API key', () => {
    it('should exit with error when no API key is provided', async () => {
      const result = await runCli([], { TRADING212_API_KEY: '' });
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('TRADING212_API_KEY is required');
    });
  });

  describe('--environment flag', () => {
    it('should reject invalid environment value', async () => {
      const result = await runCli(['-e', 'staging'], { TRADING212_API_KEY: 'test-key' });
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('Environment must be "demo" or "live"');
    });
  });

  describe('--api-key flag', () => {
    it('should accept API key from -k flag', async () => {
      // This will attempt to start the server (index.js) which may fail since
      // we're running from source, but it should NOT fail with "API key is required"
      const result = await runCli(
        ['-k', 'test-api-key-from-flag'],
        {
          TRADING212_API_KEY: '',
        },
        2000,
      );
      // It should NOT complain about missing API key
      expect(result.stderr).not.toContain('TRADING212_API_KEY is required');
    });

    it('should accept API key from --api-key flag', async () => {
      const result = await runCli(
        ['--api-key', 'test-api-key-from-flag'],
        {
          TRADING212_API_KEY: '',
        },
        2000,
      );
      expect(result.stderr).not.toContain('TRADING212_API_KEY is required');
    });
  });

  describe('--environment valid values', () => {
    it('should accept demo environment', async () => {
      const result = await runCli(
        ['-e', 'demo', '-k', 'test-key'],
        {
          TRADING212_API_KEY: '',
        },
        2000,
      );
      expect(result.stderr).not.toContain('Environment must be');
    });

    it('should accept live environment', async () => {
      const result = await runCli(
        ['-e', 'live', '-k', 'test-key'],
        {
          TRADING212_API_KEY: '',
        },
        2000,
      );
      expect(result.stderr).not.toContain('Environment must be');
    });
  });
});

/**
 * Helper function to run the CLI and capture output
 */
function runCli(
  args: string[],
  envOverrides: Record<string, string> = {},
  timeout = 5000,
): Promise<{ stdout: string; stderr: string; exitCode: number | null }> {
  return new Promise((resolve) => {
    let stdout = '';
    let stderr = '';
    let resolved = false;

    const env = {
      ...process.env,
      // Clear env vars by default so tests are isolated
      TRADING212_API_KEY: '',
      TRADING212_ENVIRONMENT: '',
      ...envOverrides,
    };

    const child = spawn('npx', ['tsx', cliPath, ...args], {
      env,
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout,
    });

    child.stdout.on('data', (data: Buffer) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data: Buffer) => {
      stderr += data.toString();
    });

    const finalize = (code: number | null) => {
      if (!resolved) {
        resolved = true;
        resolve({ stdout, stderr, exitCode: code });
      }
    };

    child.on('exit', (code) => {
      finalize(code);
    });

    child.on('error', () => {
      finalize(1);
    });

    // Ensure we don't hang if the process doesn't exit
    setTimeout(() => {
      if (!resolved) {
        child.kill('SIGTERM');
        finalize(null);
      }
    }, timeout);
  });
}

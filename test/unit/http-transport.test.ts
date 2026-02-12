import http from 'node:http';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

// Mock logger
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

// Track handler registrations per server instance
const serverInstances: Array<{
  connect: ReturnType<typeof vi.fn>;
  setRequestHandler: ReturnType<typeof vi.fn>;
}> = [];

vi.mock('@modelcontextprotocol/sdk/server/index.js', () => {
  return {
    // biome-ignore lint/complexity/useArrowFunction: must use function for constructor mock
    Server: vi.fn(function () {
      const instance = {
        connect: vi.fn().mockResolvedValue(undefined),
        setRequestHandler: vi.fn(),
      };
      serverInstances.push(instance);
      return instance;
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

// Mock StreamableHTTPServerTransport
let sessionInitCallback: ((id: string) => void) | null = null;
let oncloseCallback: (() => void) | null = null;

vi.mock('@modelcontextprotocol/sdk/server/streamableHttp.js', () => {
  return {
    // biome-ignore lint/complexity/useArrowFunction: must use function for constructor mock
    StreamableHTTPServerTransport: vi.fn(function (opts: any) {
      const sessionId = 'test-session-id';
      sessionInitCallback = opts.onsessioninitialized;
      const instance = {
        sessionId,
        set onclose(fn: () => void) {
          oncloseCallback = fn;
        },
        handleRequest: vi.fn((_req: any, res: any, _body: any) => {
          // Trigger session initialization on first handleRequest
          if (sessionInitCallback) {
            sessionInitCallback(sessionId);
            sessionInitCallback = null;
          }
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ jsonrpc: '2.0', result: {} }));
        }),
      };
      return instance;
    }),
  };
});

vi.mock('../../src/client.js', () => {
  return {
    // biome-ignore lint/complexity/useArrowFunction: must use function for constructor mock
    Trading212Client: vi.fn(function () {
      return {
        getAccountInfo: vi.fn().mockResolvedValue({ currencyCode: 'USD', id: 12345 }),
      };
    }),
  };
});

// Set env vars before importing
process.env.TRADING212_API_KEY = 'test-api-key';
process.env.TRADING212_ENVIRONMENT = 'demo';

const { startHttpServer } = await import('../../src/index.js');

// Helper to make HTTP requests
function request(
  server: http.Server,
  method: string,
  path: string,
  headers?: Record<string, string>,
  body?: unknown,
): Promise<{ statusCode: number; body: string; headers: http.IncomingHttpHeaders }> {
  return new Promise((resolve, reject) => {
    const addr = server.address() as { port: number };
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: addr.port,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      },
      (res) => {
        let responseBody = '';
        res.on('data', (chunk: Buffer) => {
          responseBody += chunk;
        });
        res.on('end', () =>
          resolve({ statusCode: res.statusCode!, body: responseBody, headers: res.headers }),
        );
      },
    );
    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

describe('HTTP Transport', () => {
  let httpServer: http.Server;

  beforeAll(async () => {
    httpServer = await startHttpServer(0, '127.0.0.1');
  });

  afterAll(() => {
    httpServer.close();
  });

  it('should respond to health check', async () => {
    const res = await request(httpServer, 'GET', '/health');
    expect(res.statusCode).toBe(200);
    const json = JSON.parse(res.body);
    expect(json.status).toBe('ok');
    expect(json.transport).toBe('streamable-http');
  });

  it('should return 404 for unknown paths', async () => {
    const res = await request(httpServer, 'GET', '/unknown');
    expect(res.statusCode).toBe(404);
    const json = JSON.parse(res.body);
    expect(json.error).toBe('Not found');
  });

  it('should handle CORS preflight on /mcp', async () => {
    const res = await request(httpServer, 'OPTIONS', '/mcp');
    expect(res.statusCode).toBe(204);
    expect(res.headers['access-control-allow-origin']).toBe('*');
    expect(res.headers['access-control-allow-methods']).toContain('POST');
    expect(res.headers['access-control-allow-headers']).toContain('mcp-session-id');
  });

  it('should create a new session on POST /mcp', async () => {
    const res = await request(httpServer, 'POST', '/mcp', {}, {
      jsonrpc: '2.0',
      method: 'initialize',
      id: 1,
    });
    expect(res.statusCode).toBe(200);
  });

  it('should reject GET /mcp without session', async () => {
    const res = await request(httpServer, 'GET', '/mcp');
    expect(res.statusCode).toBe(400);
    const json = JSON.parse(res.body);
    expect(json.error).toContain('No valid session');
  });

  it('should handle the onclose callback', () => {
    // Verify the onclose was set and can be called without error
    expect(oncloseCallback).toBeDefined();
    if (oncloseCallback) {
      oncloseCallback();
    }
  });
});

#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { VERSION } from './version.js';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Parse command-line arguments
const args = process.argv.slice(2);

// Show help
function showHelp() {
  console.log(`
Trading 212 MCP Server

USAGE:
  trading212-mcp [OPTIONS]

OPTIONS:
  -h, --help                 Show this help message
  -v, --version              Show version information
  -k, --api-key <key>        Trading 212 API key
  -e, --environment <env>    Environment: "demo" or "live" (default: "demo")

ENVIRONMENT VARIABLES:
  TRADING212_API_KEY         Trading 212 API key (required)
  TRADING212_ENVIRONMENT     Environment: "demo" or "live" (default: "demo")

EXAMPLES:
  # Using environment variables (recommended)
  export TRADING212_API_KEY="your_api_key_here"
  export TRADING212_ENVIRONMENT="demo"
  trading212-mcp

  # Using command-line arguments
  trading212-mcp --api-key your_api_key --environment demo

GETTING STARTED:
  1. Get your API key from https://www.trading212.com/
  2. Set the TRADING212_API_KEY environment variable
  3. Run: trading212-mcp
  4. Configure Claude Desktop to use this MCP server

CLAUDE DESKTOP CONFIGURATION:
  Add to ~/.claude/mcp_config.json:
  {
    "mcpServers": {
      "trading212": {
        "command": "trading212-mcp",
        "env": {
          "TRADING212_API_KEY": "your_api_key",
          "TRADING212_ENVIRONMENT": "demo"
        }
      }
    }
  }

DOCUMENTATION:
  GitHub: https://github.com/enderekici/trading212-mcp
  API Docs: https://docs.trading212.com/api

VERSION:
  ${VERSION}
`);
}

// Show version
function showVersion() {
  console.log(`trading212-mcp version ${VERSION}`);
}

// Parse arguments
let apiKey = process.env.TRADING212_API_KEY;
let environment = process.env.TRADING212_ENVIRONMENT || 'demo';

for (let i = 0; i < args.length; i++) {
  const arg = args[i];

  if (arg === '-h' || arg === '--help') {
    showHelp();
    process.exit(0);
  }

  if (arg === '-v' || arg === '--version') {
    showVersion();
    process.exit(0);
  }

  if (arg === '-k' || arg === '--api-key') {
    apiKey = args[++i];
  }

  if (arg === '-e' || arg === '--environment') {
    environment = args[++i];
    if (environment !== 'demo' && environment !== 'live') {
      console.error('Error: Environment must be "demo" or "live"');
      process.exit(1);
    }
  }
}

// Validate configuration
if (!apiKey) {
  console.error('Error: TRADING212_API_KEY is required');
  console.error('');
  console.error('Set it via environment variable:');
  console.error('  export TRADING212_API_KEY="your_api_key"');
  console.error('');
  console.error('Or pass it as a command-line argument:');
  console.error('  trading212-mcp --api-key your_api_key');
  console.error('');
  console.error('Run "trading212-mcp --help" for more information');
  process.exit(1);
}

// Set environment variables for the child process
const env = {
  ...process.env,
  TRADING212_API_KEY: apiKey,
  TRADING212_ENVIRONMENT: environment,
};

// Determine the path to index.js
const indexPath = join(__dirname, 'index.js');

// Spawn the MCP server
const serverProcess = spawn('node', [indexPath], {
  env,
  stdio: 'inherit',
});

// Handle process termination
process.on('SIGINT', () => {
  serverProcess.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  serverProcess.kill('SIGTERM');
  process.exit(0);
});

// Forward exit code
serverProcess.on('exit', (code) => {
  process.exit(code || 0);
});

// Handle errors
serverProcess.on('error', (error) => {
  console.error('Failed to start MCP server:', error.message);
  process.exit(1);
});

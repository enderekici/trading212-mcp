# Contributing to Trading 212 MCP Server

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards other community members

## How to Contribute

### Reporting Bugs

Before creating bug reports, please check existing issues. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce**
- **Expected behavior**
- **Actual behavior**
- **Environment details** (OS, Node version, etc.)
- **Error messages** (if applicable)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Clear title and description**
- **Use case** - Why is this enhancement needed?
- **Proposed solution**
- **Alternative solutions** you've considered
- **Additional context**

### Pull Requests

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes**
4. **Add tests** if applicable
5. **Ensure code quality** (see below)
6. **Commit your changes** (`git commit -m 'Add amazing feature'`)
7. **Push to branch** (`git push origin feature/amazing-feature`)
8. **Open a Pull Request**

## Development Setup

### Prerequisites

- Node.js 18 or higher
- npm 9 or higher
- Trading 212 account with API access

### Setup Steps

1. Clone your fork:
```bash
git clone https://github.com/YOUR_USERNAME/trading212-mcp.git
cd trading212-mcp
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
# Edit .env with your API key
```

4. Build the project:
```bash
npm run build
```

5. Test your changes:
```bash
npm run dev
```

## Code Style Guidelines

### TypeScript

- Use TypeScript strict mode
- Define proper types (avoid `any`)
- Use descriptive variable names
- Add JSDoc comments for public APIs
- Follow existing code patterns

### Code Organization

```
src/
├── types.ts      # All TypeScript types and Zod schemas
├── client.ts     # Trading 212 API client
└── index.ts      # MCP server implementation
```

### Naming Conventions

- **Files:** lowercase with hyphens (e.g., `client.ts`)
- **Classes:** PascalCase (e.g., `Trading212Client`)
- **Functions:** camelCase (e.g., `getAccountInfo`)
- **Constants:** UPPER_SNAKE_CASE (e.g., `API_KEY`)
- **Types/Interfaces:** PascalCase (e.g., `AccountInfo`)

### Error Handling

- Always use try-catch for async operations
- Provide descriptive error messages
- Include context in error messages
- Use Zod for input validation

Example:
```typescript
try {
  const result = await client.getAccountInfo();
  return result;
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  throw new Error(`Failed to get account info: ${errorMessage}`);
}
```

### Validation

- Use Zod schemas for all API inputs/outputs
- Validate user input before API calls
- Return validated, typed data

Example:
```typescript
export const OrderSchema = z.object({
  id: z.number(),
  ticker: z.string(),
  quantity: z.number().positive(),
});

const validated = OrderSchema.parse(data);
```

## Adding New Features

### Adding a New API Endpoint

1. **Add types** in `src/types.ts`:
```typescript
export const NewFeatureSchema = z.object({
  // Define schema
});

export type NewFeature = z.infer<typeof NewFeatureSchema>;
```

2. **Add client method** in `src/client.ts`:
```typescript
async getNewFeature(): Promise<NewFeature> {
  return this.request('/endpoint', {}, NewFeatureSchema);
}
```

3. **Add MCP tool** in `src/index.ts`:
```typescript
// Add to tools array
{
  name: 'get_new_feature',
  description: 'Description of what this does',
  inputSchema: {
    type: 'object',
    properties: {
      // Define parameters
    },
    required: ['param1'],
  },
}

// Add handler in CallToolRequestSchema
case 'get_new_feature': {
  const result = await client.getNewFeature();
  return {
    content: [{
      type: 'text',
      text: JSON.stringify(result, null, 2),
    }],
  };
}
```

4. **Update documentation**:
- Add to README.md "Available Tools" section
- Add examples to EXAMPLES.md
- Update tool count in QUICKSTART.md

### Testing New Features

1. Test in demo environment first
2. Verify error handling
3. Check rate limit handling
4. Test with various inputs
5. Verify output format

## Documentation

### Code Comments

- Add JSDoc comments for public methods
- Explain complex logic
- Document parameters and return types

Example:
```typescript
/**
 * Retrieves detailed information about a specific position.
 *
 * @param ticker - The ticker symbol of the instrument (e.g., 'AAPL')
 * @returns Position details including quantity, prices, and P&L
 * @throws Error if position not found or API request fails
 */
async getPosition(ticker: string): Promise<Position> {
  return this.request(`/equity/portfolio/${ticker}`, {}, PositionSchema);
}
```

### README Updates

When adding features, update:
- Feature list
- Available tools section
- Usage examples
- API reference

### Examples

Add practical examples to `EXAMPLES.md` showing:
- Real-world use cases
- Expected inputs/outputs
- Common patterns

## Testing

### Manual Testing Checklist

Before submitting a PR, test:

- [ ] Build succeeds (`npm run build`)
- [ ] TypeScript compilation has no errors
- [ ] MCP server starts without errors
- [ ] New features work in demo environment
- [ ] Error handling works correctly
- [ ] Documentation is updated
- [ ] Examples are included

### Test in Claude Desktop

1. Build your changes
2. Update Claude Desktop config
3. Restart Claude Desktop
4. Test new features in conversation
5. Verify error messages are helpful

## Commit Message Guidelines

Use clear, descriptive commit messages:

### Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- **feat:** New feature
- **fix:** Bug fix
- **docs:** Documentation changes
- **style:** Code style changes (formatting, etc.)
- **refactor:** Code refactoring
- **test:** Adding tests
- **chore:** Maintenance tasks

### Examples

```
feat(orders): add support for stop-limit orders

Add new stop-limit order type with validation and proper
error handling. Includes rate limit support and comprehensive
error messages.

Closes #123
```

```
fix(client): handle rate limit errors gracefully

Previously rate limit errors would crash the server. Now they
are caught and returned with helpful retry information.
```

```
docs(readme): add examples for pie management

Add comprehensive examples showing how to create, update,
and manage investment pies.
```

## Pull Request Guidelines

### Before Submitting

- [ ] Code builds successfully
- [ ] All tests pass (if applicable)
- [ ] Documentation is updated
- [ ] Examples are included
- [ ] Commit messages are clear
- [ ] No merge conflicts

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring
- [ ] Other (describe)

## Testing
Describe how you tested these changes

## Screenshots (if applicable)
Add screenshots showing new feature in action

## Checklist
- [ ] Code builds without errors
- [ ] Documentation updated
- [ ] Examples added
- [ ] Tested in demo environment
```

## Release Process

Maintainers will:

1. Review and merge PRs
2. Update version in `package.json`
3. Update CHANGELOG.md
4. Create GitHub release
5. Publish to npm (if applicable)

## Questions?

- Open an issue for questions
- Check existing issues and PRs
- Read the documentation thoroughly

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Recognition

Contributors will be recognized in:
- GitHub contributors page
- Release notes (for significant contributions)
- README acknowledgments (for major features)

Thank you for contributing! 🎉

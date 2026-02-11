import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Test configuration
    globals: true,
    environment: 'node',
    testTimeout: 30000,

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: [
        'dist/**',
        'node_modules/**',
        'test/**',
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/types.ts', // Exclude type-only files from coverage
      ],
      all: true,
      clean: true,
      thresholds: {
        lines: 17,
        functions: 50,
        branches: 50,
        statements: 17,
      },
    },

    // Include test files
    include: ['test/**/*.test.ts'],

    // Exclude patterns
    exclude: [
      'node_modules/**',
      'dist/**',
      '**/*.config.ts',
    ],
  },
});

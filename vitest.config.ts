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
        lines: 90,
        functions: 90,
        branches: 90,
        statements: 90,
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

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Test environment
    environment: 'node',

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],

      // Files to include in coverage
      include: ['src/**/*.ts'],

      // Files to exclude from coverage
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.spec.ts',
        'src/cli.ts', // CLI entry point - mostly console.log
        'src/**/types.ts', // Type-only files
        'src/**/index.ts', // Re-export files
        'dist/**',
        'tests/**',
        'scripts/**',
      ],

      // Coverage thresholds (fail build if not met)
      // Current baseline: lines 72%, functions 64%, branches 61%, statements 73%
      // Thresholds set slightly below to allow gradual improvement
      thresholds: {
        lines: 70,
        functions: 60,
        branches: 60,
        statements: 70,
      },

      // Clean coverage directory before each run
      clean: true,

      // Report uncovered lines
      all: true,
    },

    // Test globals (optional - allows using describe/it without import)
    globals: true,
    clearMocks: true,
    restoreMocks: true,

    // Exclude Playwright E2E tests (run separately via pnpm test:e2e)
    exclude: ['tests/e2e/**', 'node_modules/**'],

    // Test timeout (increased from 10s to 30s for complex tests)
    testTimeout: 30_000,
    hookTimeout: 10_000,

    // Pool workers (limit to prevent memory accumulation)
    maxWorkers: 4,
    minWorkers: 1,
    pool: 'forks',
  },
});

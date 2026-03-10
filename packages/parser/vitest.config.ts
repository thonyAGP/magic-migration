import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    clearMocks: true,
    restoreMocks: true,
    testTimeout: 30_000,
    hookTimeout: 10_000,
    maxWorkers: 4,
    minWorkers: 1,
    pool: 'forks',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/**/types.ts', 'src/**/index.ts'],
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 90,
        statements: 100,
      },
    },
  },
});

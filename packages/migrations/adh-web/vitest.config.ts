import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': resolve(__dirname, './src') },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    testTimeout: 15000,
    alias: {
      'react-router-dom': resolve(__dirname, './src/test/mocks/react-router-dom.tsx'),
    },
    coverage: {
      provider: 'v8',
      include: ['src/services/**', 'src/stores/**', 'src/hooks/**'],
      exclude: ['**/*.stories.tsx', '**/*.test.ts', '**/index.ts'],
    },
  },
});

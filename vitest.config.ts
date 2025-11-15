import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '**/__tests__/**',
        '**/*.test.ts',
        '**/*.config.ts',
        '**/dist/**',
      ],
    },
    setupFiles: ['./vitest.setup.ts'],
  },
  resolve: {
    alias: {
      '@sil/core': path.resolve(__dirname, './packages/core/src'),
      '@sil/games': path.resolve(__dirname, './packages/games/src'),
      '@sil/semantics': path.resolve(__dirname, './packages/semantics/src'),
      '@sil/ui': path.resolve(__dirname, './packages/ui/src'),
    },
  },
});

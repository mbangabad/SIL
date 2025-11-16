/**
 * Vitest setup file
 * Runs before all tests
 */

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/sil_test';

// Global test utilities
global.console = {
  ...console,
  // Suppress console.log in tests but keep errors
  log: () => {},
  debug: () => {},
  info: () => {},
  warn: console.warn,
  error: console.error,
};

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/integration/setup.js'],
    fileParallelism: false,
    coverage: {
      provider: 'v8',
    },
  },
});

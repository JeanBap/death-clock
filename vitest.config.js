import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.{js,ts}'],
    environment: 'node',
    coverage: { provider: 'v8', reporter: ['text', 'lcov'] }
  }
});

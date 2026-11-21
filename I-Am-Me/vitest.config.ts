import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': fileURLToPath(new URL('.', import.meta.url)) } },
  test: {
    environment: 'jsdom',
    include: ['**/*.test.{ts,tsx}'],
    exclude: ['node_modules', 'out', '.next'],
    coverage: { include: ['lib/**', 'components/**'], thresholds: { lines: 90, functions: 85, branches: 80 } },
  },
});

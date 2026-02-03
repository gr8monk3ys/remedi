import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./__tests__/setup.ts'],
    exclude: [
      'node_modules/**',
      'e2e/**', // Exclude Playwright E2E tests
    ],
    include: [
      '**/__tests__/**/*.test.{ts,tsx}',
      'lib/__tests__/**/*.test.{ts,tsx}',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        '.next/',
        'out/',
        'dist/',
        '**/*.config.{ts,js,mjs}',
        '**/*.d.ts',
        '**/types.ts',
        'prisma/',
        'e2e/',
        '__tests__/mocks/**',
        'scripts/',
        'app/**/page.tsx',
        'app/**/layout.tsx',
        'app/**/loading.tsx',
        'app/**/error.tsx',
        'app/**/not-found.tsx',
        'components/ui/**', // UI components are visually tested
        'components/providers.tsx',
        'components/theme-provider.tsx',
        'lib/structured-data.ts',
        'lib/accessibility.ts',
        'lib/env.ts',
      ],
      thresholds: {
        global: {
          branches: 75,
          functions: 75,
          lines: 75,
          statements: 75,
        },
        // Higher thresholds for critical paths
        'lib/validations/**': {
          branches: 80,
          functions: 90,
          lines: 90,
          statements: 90,
        },
        'lib/api/**': {
          branches: 80,
          functions: 85,
          lines: 85,
          statements: 85,
        },
        'lib/stripe.ts': {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70,
        },
      },
    },
    testTimeout: 30000,
    hookTimeout: 30000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});

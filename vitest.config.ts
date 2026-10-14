import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      // fileURLToPath 还原 percent-encoding；`.pathname` 在含中文的目录下会得到 %E7... 导致模块解析失败
      '~': fileURLToPath(new URL('./src/', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    // These upstream suites require the removed demo site, Japanese demo
    // articles, landing pages or pristine apply-template input files.
    // Retained in Git for upstream maintenance; not site regressions.
    exclude: [
      'tests/apply-template.test.ts',
      'tests/changelog.test.ts',
      'tests/codes-consistency.test.ts',
      'tests/community-digest.test.ts',
      'tests/handbook.test.ts',
      'tests/landing-paths.test.ts',
      'tests/redirects.test.ts',
      'tests/workflows.test.ts',
    ],
  },
});

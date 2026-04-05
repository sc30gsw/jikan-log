import path from 'node:path';

import { reactNative } from 'vitest-native';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [reactNative()],
  resolve: {
    alias: {
      '~': path.resolve(__dirname),
    },
  },
  test: {
    exclude: ['node_modules/**', 'opensrc/**'],
    globals: true,
  },
});

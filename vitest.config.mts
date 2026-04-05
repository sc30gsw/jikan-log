import { reactNative } from 'vitest-native';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [reactNative()],
  test: {
    exclude: ['node_modules/**', 'opensrc/**'],
    globals: true,
  },
});

import { defineConfig } from 'vitest/config';
import { resolve } from 'path';
import react from '@vitejs/plugin-react-swc';
import validateEnvVars from 'validate-env-vars';

import envConfigSchema from './env.config';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'validate-env-vars',
      buildStart: () =>
        validateEnvVars({
          schema: envConfigSchema,
          logVars: false,
          exitOnError: true,
        }),
    },
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['.vitest/setup'],
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        nested: resolve(__dirname, 'nested/index.html'),
      },
    },
  },
});

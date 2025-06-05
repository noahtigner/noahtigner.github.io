import { defineConfig } from 'vitest/config';
import { resolve } from 'path';
import react from '@vitejs/plugin-react-swc';
import validateEnvVars from 'validate-env-vars';
import { z } from 'zod';

import envConfigSchema from './.env.config';

declare global {
  type Env = z.infer<typeof envConfigSchema>;
}

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

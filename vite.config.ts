// import { resolve } from 'path';
import { defineConfig } from 'vite';
import { reactRouter } from '@react-router/dev/vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import svgr from 'vite-plugin-svgr';
import validateEnvVars from 'validate-env-vars';

import envConfigSchema from './.env.config';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    reactRouter(),
    tsconfigPaths(),
    svgr(),
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
  ssr: {
    noExternal:
      process.env.NODE_ENV === 'production'
        ? ['@mui/material', '@mui/icons-material']
        : [],
  },
});

// import { resolve } from 'path';
import { defineConfig } from 'vite';
import { reactRouter } from '@react-router/dev/vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import svgr from 'vite-plugin-svgr';
import { plugin as mdPlugin, Mode } from 'vite-plugin-markdown';
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
    mdPlugin({
      mode: [Mode.HTML, Mode.REACT],
      markdownIt: {
        html: true,
        linkify: true,
        typographer: true,
      },
    }),
    {
      name: 'markdown-entity-decoder',
      enforce: 'post',
      transform(code, id) {
        // Only process markdown files that have been transformed by vite-plugin-markdown
        if (!id.endsWith('.md')) return null;

        // Decode HTML entities in the generated JavaScript code
        // This handles entities that markdown-it creates in code blocks
        // Replace entities in string literals within the generated code
        const entityMap: Record<string, string> = {
          '&amp;lt;': '<',
          '&amp;gt;': '>',
          '&amp;quot;': '"',
          '&amp;#39;': "'",
          '&amp;apos;': "'",
        };

        let modifiedCode = code;
        for (const [entity, char] of Object.entries(entityMap)) {
          modifiedCode = modifiedCode.replaceAll(entity, char);
        }

        return {
          code: modifiedCode,
          map: null,
        };
      },
    },
  ],
  ssr: {
    noExternal:
      process.env.NODE_ENV === 'production'
        ? ['@mui/material', '@mui/icons-material']
        : [],
  },
});

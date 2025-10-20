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
      mode: [Mode.REACT],
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

        // Fix double-encoded HTML entities in the generated JavaScript code
        // markdown-it correctly encodes < as &lt;, but somewhere in the pipeline
        // the & gets encoded again, resulting in &amp;lt; which displays as "&lt;" instead of "<"
        // We need to decode one level: &amp;lt; -> &lt; (not -> <)
        const entityMap: Record<string, string> = {
          '&amp;lt;': '&lt;',
          '&amp;gt;': '&gt;',
          '&amp;quot;': '&quot;',
          '&amp;#39;': '&#39;',
          '&amp;apos;': '&apos;',
          '&amp;nbsp;': '&nbsp;',
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
  server: {
    open: true,
    host: true,
  },
  preview: {
    open: true,
    host: true,
  },
});

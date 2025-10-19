// import { resolve } from 'path';
import { defineConfig } from 'vite';
import { reactRouter } from '@react-router/dev/vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import svgr from 'vite-plugin-svgr';
import { plugin as mdPlugin, Mode } from 'vite-plugin-markdown';
import MarkdownIt from 'markdown-it';
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
      markdown: (body: string) => {
        // Use markdown-it to render the markdown
        const md = new MarkdownIt({
          html: true,
          linkify: true,
          typographer: true,
        });

        // Render the markdown to HTML
        let html = md.render(body);

        // Decode HTML entities in the rendered output
        // This allows characters like < and > to be properly rendered in JSX
        // IMPORTANT: Replace &amp; FIRST, otherwise we'll double-decode
        html = html
          .replaceAll('&amp;', '&')
          .replaceAll('&lt;', '<')
          .replaceAll('&gt;', '>')
          .replaceAll('&quot;', '"')
          .replaceAll('&#39;', "'")
          .replaceAll('&apos;', "'")
          .replaceAll('&nbsp;', ' ');

        return html;
      },
    }),
  ],
  ssr: {
    noExternal:
      process.env.NODE_ENV === 'production'
        ? ['@mui/material', '@mui/icons-material']
        : [],
  },
});

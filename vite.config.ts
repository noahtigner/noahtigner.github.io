// import { resolve } from 'path';
import { defineConfig } from 'vite';
import { reactRouter } from '@react-router/dev/vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import svgr from 'vite-plugin-svgr';
import { plugin as mdPlugin, Mode } from 'vite-plugin-markdown';
import MarkdownIt from 'markdown-it';
import validateEnvVars from 'validate-env-vars';

import envConfigSchema from './.env.config';

// Create a single MarkdownIt instance to reuse across all markdown files
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
});

// Map of HTML entities to their decoded characters
const entityMap: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'",
  '&nbsp;': ' ',
};

// Create a regex to match all entities at once
const entityRegex = new RegExp(Object.keys(entityMap).join('|'), 'g');

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
        // Render the markdown to HTML
        let html = md.render(body);

        // Decode HTML entities in the rendered output using a single replace operation
        // This allows characters like < and > to be properly rendered in JSX
        html = html.replace(entityRegex, (match) => entityMap[match]);

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

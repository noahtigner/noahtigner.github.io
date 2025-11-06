import { defineConfig } from 'vite';
import { reactRouter } from '@react-router/dev/vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import svgr from 'vite-plugin-svgr';
import { plugin as mdPlugin, Mode } from 'vite-plugin-markdown';
import validateEnvVars from 'validate-env-vars';
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
import { alert } from '@mdit/plugin-alert';

import envConfigSchema from './.env.config';
import generateSitemap from './src/utils/node/sitemap';

const md = MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str: string, lang: string): string {
    if (lang && hljs.getLanguage(lang)) {
      try {
        const highlighted = hljs.highlight(str, { language: lang }).value;
        // Return properly escaped HTML for React
        return `<pre><code class="hljs language-${lang}">${highlighted}</code></pre>`;
      } catch (e) {
        console.error('Highlight.js error:', e);
      }
    }
    // Fallback: escape the code properly
    return `<pre><code>${md.utils.escapeHtml(str)}</code></pre>`;
  },
});

// Add alert plugin for GitHub-style callouts (NOTE, WARNING, TIP, IMPORTANT, CAUTION)
md.use(alert);

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
          envPath: '/dev/null',
        }),
    },
    mdPlugin({
      mode: [Mode.HTML],
      markdownIt: md,
    }),
    {
      name: 'sitemap',
      closeBundle: generateSitemap,
    },
  ],
  ssr: {
    noExternal:
      process.env.NODE_ENV === 'production' ? ['@mui/icons-material'] : [],
  },
  server: {
    open: true,
    host: true,
  },
  preview: {
    open: true,
    host: true,
  },
  // base: './',
});

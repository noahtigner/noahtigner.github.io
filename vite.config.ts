import { defineConfig } from 'vite';
import { reactRouter } from '@react-router/dev/vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import svgr from 'vite-plugin-svgr';
import { plugin as mdPlugin, Mode } from 'vite-plugin-markdown';
import validateEnvVars from 'validate-env-vars';
import markdownit from 'markdown-it';
import hljs from 'highlight.js';

import envConfigSchema from './.env.config';

const md = markdownit({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str: string, lang: string) {
    if (lang && hljs.getLanguage(lang)) {
      console.log('Highlighting code block:', { lang, str });
      try {
        const highlighted = hljs.highlight(str, { language: lang }).value;
        // Return properly escaped HTML for React
        return `<pre><code class="hljs language-${lang}">${highlighted}</code></pre>`;
      } catch (e) {
        console.error('Highlight.js error:', e);
      }
    }
    // Fallback: escape the code properly
    return '';
  },
});

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

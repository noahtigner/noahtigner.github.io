import type { Config } from '@react-router/dev/config';
import getPrerenderPaths from './src/utils/node/paths';

export default {
  ssr: false,
  appDirectory: 'src',
  buildDirectory: 'dist',
  future: {
    // This might help reduce data duplication
    unstable_optimizeDeps: true,
  },
  async prerender() {
    const paths = await getPrerenderPaths();
    console.log('Prerendering paths:', paths);
    return paths;
  },
} satisfies Config;

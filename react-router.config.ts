import type { Config } from '@react-router/dev/config';
import paths from './src/paths';

export default {
  ssr: false,
  appDirectory: 'src',
  buildDirectory: 'dist',
  async prerender() {
    return Object.values(paths);
  },
} satisfies Config;

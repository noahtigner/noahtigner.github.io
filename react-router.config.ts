import type { Config } from '@react-router/dev/config';

export default {
  ssr: false,
  appDirectory: 'src',
  buildDirectory: 'dist',
  async prerender() {
    return ['/', '/articles'];
  },
} satisfies Config;

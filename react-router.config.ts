import type { Config } from '@react-router/dev/config';

export default {
  ssr: false,
  appDirectory: 'src',
  async prerender() {
    return ['/', '/articles'];
  },
} satisfies Config;

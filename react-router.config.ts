import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { Config } from '@react-router/dev/config';
import { paths } from './src/routes';

// have to use node APIs here instead of vite glob imports because this file
// is executed in a Node context outside of Vite's module system
async function getArticlePaths() {
  const contentDir = join(process.cwd(), 'src', 'assets', 'content');
  const files = await readdir(contentDir);
  const mdFiles = files.filter((file) => file.endsWith('.md'));

  const articlePaths: string[] = [];

  for (const file of mdFiles) {
    const content = await readFile(join(contentDir, file), 'utf-8');
    // Extract frontmatter path
    const pathMatch = content.match(/^---\n[\s\S]*?path:\s*(.+?)\n[\s\S]*?---/);
    if (pathMatch && pathMatch[1]) {
      articlePaths.push(pathMatch[1].trim());
    }
  }

  return articlePaths;
}

export default {
  ssr: false,
  appDirectory: 'src',
  buildDirectory: 'dist',
  future: {
    // This might help reduce data duplication
    unstable_optimizeDeps: true,
  },
  async prerender() {
    const nonSlugPaths = Object.values(paths).filter(
      (p) => !p.includes(':') && !p.includes('*')
    );
    const articlePaths = await getArticlePaths();
    const deduped = new Set([...nonSlugPaths, ...articlePaths]);
    return Array.from(deduped);
  },
} satisfies Config;

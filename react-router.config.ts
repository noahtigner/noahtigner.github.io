import type { Config } from '@react-router/dev/config';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

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
  async prerender() {
    const articlePaths = await getArticlePaths();
    return ['/', '/articles', ...articlePaths];
  },
} satisfies Config;

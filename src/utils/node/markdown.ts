import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import frontmatter from 'front-matter';

import {
  getAllArticleAttributes,
  type ArticleAttributes,
} from '../shared/markdown';

// have to use node APIs here instead of vite glob imports because this file
// is executed in a Node context outside of Vite's module system

export const getAllArticles = async (): Promise<ArticleAttributes[]> => {
  const contentDir = join(process.cwd(), 'src', 'assets', 'articles');
  const files = await readdir(contentDir);
  const mdFiles = files.filter((file) => file.endsWith('.md'));

  return getAllArticleAttributes(
    await Promise.all(
      mdFiles.map(async (file) => {
        const filePath = join(contentDir, file);
        const content = await readFile(filePath, 'utf-8');
        const fm = frontmatter(content);
        return fm.attributes;
      })
    )
  );
};

export async function getArticlePaths() {
  const allArticles = await getAllArticles();
  const publishedArticles = allArticles.filter((attr) => attr.published);
  const articlePaths = publishedArticles.map((attr) => attr.path);
  return articlePaths;
}

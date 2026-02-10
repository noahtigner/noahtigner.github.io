import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import frontmatter from 'front-matter';

import type { ArticleAttributes } from '../shared/markdown';
import { extractLinksFromMarkdown, filterInternalLinks } from '../shared/links';
import { generateGraphFromArticles, type GraphData } from '../shared/graph';
import { getAllArticles } from './markdown';

/**
 * Extract internal article links from a markdown file
 */
export async function extractArticleLinks(filePath: string): Promise<string[]> {
  const content = await readFile(filePath, 'utf-8');
  const fm = frontmatter(content);

  // Extract all links from the markdown content
  const allLinks = extractLinksFromMarkdown(fm.body);

  // Filter to only internal links and normalize them
  const internalLinks = filterInternalLinks(allLinks);

  return internalLinks;
}

/**
 * Generate graph data from all articles
 * Each article becomes a node, each internal link becomes an edge
 */
export async function generateArticleGraph(): Promise<GraphData> {
  const allArticles = await getAllArticles();
  const publishedArticles = allArticles.filter((attr) => attr.published);
  const contentDir = join(process.cwd(), 'src', 'assets', 'articles');

  // Load markdown content for all articles
  const contentMap = new Map<string, string>();
  const files = await import('node:fs/promises').then((fs) =>
    fs.readdir(contentDir)
  );
  const mdFiles = files.filter((file) => file.endsWith('.md'));

  for (const file of mdFiles) {
    const filePath = join(contentDir, file);
    const content = await readFile(filePath, 'utf-8');
    const fm = frontmatter(content);
    const attrs = fm.attributes as Partial<ArticleAttributes>;

    if (attrs.path) {
      contentMap.set(attrs.path, fm.body);
    }
  }

  return generateGraphFromArticles(publishedArticles, contentMap);
}

import frontmatter from 'front-matter';

import type { ArticleAttributes } from '../shared/markdown';
import { generateGraphFromArticles, type GraphData } from '../shared/graph';
import { allArticles } from './markdown';

// Import all markdown file contents
const markdownContents = import.meta.glob('../../assets/articles/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

/**
 * Generate graph data from all articles
 * Each article becomes a node, each internal link becomes an edge
 */
export function generateArticleGraph(): GraphData {
  const publishedArticles = allArticles.filter((attr) => attr.published);

  // Create a map of paths to markdown content
  const contentMap = new Map<string, string>();
  for (const [, content] of Object.entries(markdownContents)) {
    const rawContent = content as string;
    const fm = frontmatter(rawContent);
    const attrs = fm.attributes as Partial<ArticleAttributes>;

    if (attrs.path) {
      contentMap.set(attrs.path, fm.body);
    }
  }

  return generateGraphFromArticles(publishedArticles, contentMap);
}

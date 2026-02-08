import type { ArticleAttributes } from './markdown';
import {
  extractLinksFromMarkdown,
  filterInternalLinks,
  normalizeArticlePath,
} from './links';

export interface GraphNode {
  id: string;
  title: string;
  group: number;
}

export interface GraphLink {
  source: string;
  target: string;
  value: number;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

/**
 * Generate graph data from articles and their content
 * @param publishedArticles - Array of published article metadata
 * @param contentMap - Map of article paths to their markdown content
 * @returns Graph data with nodes and links
 */
export function generateGraphFromArticles(
  publishedArticles: ArticleAttributes[],
  contentMap: Map<string, string>
): GraphData {
  // Create a map of article paths to their metadata
  const articleMap = new Map<string, ArticleAttributes>();
  for (const article of publishedArticles) {
    const normalizedPath = normalizeArticlePath(article.path);
    articleMap.set(normalizedPath, article);
  }

  // Create nodes from articles
  const nodes: GraphNode[] = publishedArticles.map((article, index) => ({
    id: article.path,
    title: article.title,
    group: index % 10, // Distribute across 10 groups for color variety
  }));

  // Extract links from each article and create edges
  const linkCounts = new Map<string, number>();

  for (const article of publishedArticles) {
    const articleContent = contentMap.get(article.path);
    if (!articleContent) continue;

    // Extract internal links from this article
    const allLinks = extractLinksFromMarkdown(articleContent);
    const internalLinks = filterInternalLinks(allLinks);

    // Create edges for each link to another article
    for (const targetPath of internalLinks) {
      const normalizedTarget = normalizeArticlePath(targetPath);

      // Only create edge if target article exists
      if (articleMap.has(normalizedTarget)) {
        const edgeKey = `${article.path}->${normalizedTarget}`;

        // Count link frequency
        const currentCount = linkCounts.get(edgeKey) || 0;
        linkCounts.set(edgeKey, currentCount + 1);
      }
    }
  }

  // Convert link counts to graph edges
  const links: GraphLink[] = [];
  for (const [edgeKey, count] of linkCounts) {
    const [source, target] = edgeKey.split('->');
    links.push({
      source,
      target,
      value: count,
    });
  }

  return { nodes, links };
}

import { publishedArticles } from '~/utils/vite/markdown';
import { extractInternalLinks } from '~/utils/shared/links';
import type { ArticleGraph, GraphNode, GraphLink } from '~/utils/node/graph';

// Import raw markdown content for link extraction
const rawModules = import.meta.glob('../../assets/articles/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

// Build a map from article path to raw content
function getRawContentByPath(): Map<string, string> {
  const attributeModules = import.meta.glob('../../assets/articles/*.md', {
    import: 'attributes',
    eager: true,
  });

  const contentMap = new Map<string, string>();
  for (const [modulePath, attrs] of Object.entries(attributeModules)) {
    const attributes = attrs as { path?: string };
    if (attributes.path && rawModules[modulePath]) {
      contentMap.set(attributes.path, rawModules[modulePath] as string);
    }
  }
  return contentMap;
}

function buildGraph(): ArticleGraph {
  const knownPaths = new Set(publishedArticles.map((attr) => attr.path));
  const contentMap = getRawContentByPath();

  const nodes: GraphNode[] = publishedArticles.map((attr) => ({
    id: attr.path,
    name: attr.title,
  }));

  const links: GraphLink[] = [];
  for (const attr of publishedArticles) {
    const raw = contentMap.get(attr.path);
    if (!raw) continue;

    const internalLinks = extractInternalLinks(raw);
    for (const targetPath of internalLinks) {
      if (knownPaths.has(targetPath) && targetPath !== attr.path) {
        links.push({
          source: attr.path,
          target: targetPath,
        });
      }
    }
  }

  return { nodes, links };
}

export const articleGraph: ArticleGraph = buildGraph();

export type { ArticleGraph, GraphNode, GraphLink };

import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import frontmatter from 'front-matter';

import {
  getAllArticleAttributes,
  type ArticleAttributes,
} from '../shared/markdown';
import { extractInternalLinks } from '../shared/links';

export interface GraphNode {
  id: string;
  name: string;
}

export interface GraphLink {
  source: string;
  target: string;
}

export interface ArticleGraph {
  nodes: GraphNode[];
  links: GraphLink[];
}

/**
 * Build a graph of article connections by reading all markdown files,
 * extracting internal links, and mapping them to known article paths.
 */
export async function buildArticleGraph(): Promise<ArticleGraph> {
  const contentDir = join(process.cwd(), 'src', 'assets', 'articles');
  const files = await readdir(contentDir);
  const mdFiles = files.filter((file) => file.endsWith('.md'));

  // Read all files and extract frontmatter + content
  const articles = await Promise.all(
    mdFiles.map(async (file) => {
      const filePath = join(contentDir, file);
      const raw = await readFile(filePath, 'utf-8');
      const fm = frontmatter(raw);
      return {
        attributes: fm.attributes,
        body: fm.body,
      };
    })
  );

  // Validate and get published articles
  const allAttributes = getAllArticleAttributes(
    articles.map((a) => a.attributes)
  );
  const publishedAttributes = allAttributes.filter((attr) => attr.published);

  // Build a set of known article paths for fast lookup
  const knownPaths = new Set(publishedAttributes.map((attr) => attr.path));

  // Create a map from path to attributes for quick access
  const pathToAttributes = new Map<string, ArticleAttributes>();
  for (const attr of publishedAttributes) {
    pathToAttributes.set(attr.path, attr);
  }

  // Build a map from path to body content
  const pathToBody = new Map<string, string>();
  for (const article of articles) {
    const attrs = article.attributes as Record<string, unknown>;
    if (typeof attrs.path === 'string') {
      pathToBody.set(attrs.path, article.body);
    }
  }

  // Build nodes (one per published article)
  const nodes: GraphNode[] = publishedAttributes.map((attr) => ({
    id: attr.path,
    name: attr.title,
  }));

  // Build links by extracting internal links from each article
  const links: GraphLink[] = [];
  for (const attr of publishedAttributes) {
    const body = pathToBody.get(attr.path);
    if (!body) continue;

    const internalLinks = extractInternalLinks(body);
    for (const targetPath of internalLinks) {
      // Only add links that point to known published articles
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

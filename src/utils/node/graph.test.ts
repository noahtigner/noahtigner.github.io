import { describe, it, expect } from 'vitest';
import { buildArticleGraph } from './graph';

describe('buildArticleGraph', () => {
  it('returns nodes and links', async () => {
    const graph = await buildArticleGraph();

    expect(graph.nodes).toBeDefined();
    expect(graph.links).toBeDefined();
    expect(Array.isArray(graph.nodes)).toBe(true);
    expect(Array.isArray(graph.links)).toBe(true);
  });

  it('creates a node for each published article', async () => {
    const graph = await buildArticleGraph();

    // All nodes should have id and name
    for (const node of graph.nodes) {
      expect(node.id).toBeTruthy();
      expect(node.name).toBeTruthy();
    }

    // Node ids should be unique
    const ids = graph.nodes.map((n) => n.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('links reference valid node ids', async () => {
    const graph = await buildArticleGraph();
    const nodeIds = new Set(graph.nodes.map((n) => n.id));

    for (const link of graph.links) {
      expect(nodeIds.has(link.source)).toBe(true);
      expect(nodeIds.has(link.target)).toBe(true);
    }
  });

  it('does not include self-referential links', async () => {
    const graph = await buildArticleGraph();

    for (const link of graph.links) {
      expect(link.source).not.toBe(link.target);
    }
  });

  it('detects links from databaseInternals to chapter articles', async () => {
    const graph = await buildArticleGraph();

    // The databaseInternals.md article links to chapter 1, 2, and 3
    const dbInternalsLinks = graph.links.filter(
      (l) => l.source === '/articles/database-internals/'
    );
    const targets = dbInternalsLinks.map((l) => l.target);

    expect(targets).toContain('/articles/database-internals-chapter-1/');
    expect(targets).toContain('/articles/database-internals-chapter-2/');
    expect(targets).toContain('/articles/database-internals-chapter-3/');
  });
});

import * as d3Force from 'd3-force';
import * as d3Scale from 'd3-scale';

import type { ArticleAttributes } from './markdown';
import {
  extractLinksFromMarkdown,
  filterInternalLinks,
  normalizeArticlePath,
} from './links';

const SIMULATION_TICKS = 450; // Number of ticks to run the force simulation
const GRAPH_PADDING = 0;
const LINK_DISTANCE_FACTOR = 0.25;
const MIN_LINK_DISTANCE = 48;
const MAX_LINK_DISTANCE = 96;
const CHARGE_STRENGTH = -2;
const COLLISION_PADDING = 12;
const AXIS_FORCE_STRENGTH = 0.6;

export interface GraphNode {
  id: string;
  title: string;
  x?: number;
  y?: number;
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
  const nodes: GraphNode[] = publishedArticles.map((article) => ({
    id: article.path,
    title: article.title,
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
    if (source === target) continue; // Skip self-links
    links.push({
      source,
      target,
      value: count,
    });
  }

  return { nodes, links };
}

/**
 * Compute positions for graph nodes using D3 force simulation
 * This runs the simulation to completion and returns nodes with x,y coordinates
 */
export function computeGraphLayout(
  data: GraphData,
  width: number,
  height: number
): GraphData {
  // Create copies to avoid mutating original data
  const links = data.links.map((d) => ({ ...d }));
  const nodes = data.nodes.map((d) => ({
    ...d,
    x: d.x ?? Math.random() * width,
    y: d.y ?? Math.random() * height,
  }));

  // Calculate in-degree for node sizing
  const inDegree = new Map<string, number>();
  nodes.forEach((node) => inDegree.set(node.id, 0));
  links.forEach((link) => {
    inDegree.set(link.target, (inDegree.get(link.target) ?? 0) + 1);
  });

  const maxDegree = Math.max(...Array.from(inDegree.values()));
  const radiusScale = d3Scale.scaleSqrt().domain([0, maxDegree]).range([6, 16]);
  const padding = GRAPH_PADDING;
  const linkDistance = Math.max(
    MIN_LINK_DISTANCE,
    Math.min(MAX_LINK_DISTANCE, Math.min(width, height) * LINK_DISTANCE_FACTOR)
  );

  // Create and run the simulation
  const simulation = d3Force
    .forceSimulation(nodes)
    .force(
      'link',
      d3Force
        .forceLink(links)
        .id((d) => (d as GraphNode).id)
        .distance(linkDistance)
    )
    .force('charge', d3Force.forceManyBody().strength(CHARGE_STRENGTH))
    .force('center', d3Force.forceCenter(width / 2, height / 2))
    .force(
      'collision',
      d3Force
        .forceCollide()
        .radius(
          (d) =>
            radiusScale(inDegree.get((d as GraphNode).id) ?? 0) +
            COLLISION_PADDING
        )
        .iterations(20)
    )
    .force('x', d3Force.forceX(width / 2).strength(AXIS_FORCE_STRENGTH))
    .force('y', d3Force.forceY(height / 2).strength(AXIS_FORCE_STRENGTH))
    .stop();

  // Run the simulation long enough for the stronger spacing forces to settle.
  for (let i = 0; i < SIMULATION_TICKS; ++i) {
    simulation.tick();
  }

  // Constrain nodes to bounds
  nodes.forEach((d) => {
    const radius = radiusScale(inDegree.get(d.id) ?? 0);
    d.x = Math.max(padding + radius, Math.min(width - padding - radius, d.x));
    d.y = Math.max(padding + radius, Math.min(height - padding - radius, d.y));
  });

  // D3 forceLink mutates link source/target from strings to node object references.
  // Restore them to string IDs so the serialized output remains clean.
  const resolvedLinks: GraphLink[] = links.map((link) => ({
    source:
      typeof link.source === 'object'
        ? (link.source as GraphNode).id
        : link.source,
    target:
      typeof link.target === 'object'
        ? (link.target as GraphNode).id
        : link.target,
    value: link.value,
  }));

  return { nodes, links: resolvedLinks };
}

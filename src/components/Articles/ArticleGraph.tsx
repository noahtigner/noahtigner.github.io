import { useRef, useCallback, useEffect, useState } from 'react';
import type {
  ForceGraphMethods,
  NodeObject,
  ForceGraphProps,
} from 'react-force-graph-2d';
import type { ComponentType } from 'react';
import styled from '@emotion/styled';

import { articleGraph, type GraphNode } from '~/utils/vite/graph';

const CURRENT_NODE_COLOR = '#6edfca';
const DEFAULT_NODE_COLOR = 'rgba(248, 251, 248, 0.6)';
const LINK_COLOR = 'rgba(248, 251, 248, 0.15)';
const LABEL_COLOR = 'rgba(248, 251, 248, 0.9)';
const BG_COLOR = '#141414';

const GraphContainer = styled.div`
  width: 100%;
  border: 1px solid var(--color-border-card);
  border-radius: 8px;
  overflow: hidden;
  background-color: var(--color-black);
`;

const GraphTitle = styled.h4`
  font-weight: 400;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin: 0;
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid var(--color-border-card);
`;

type ArticleNode = NodeObject<GraphNode>;

interface ArticleGraphProps {
  currentArticlePath: string;
}

export default function ArticleGraph({
  currentArticlePath,
}: ArticleGraphProps) {
  const graphRef = useRef<ForceGraphMethods<ArticleNode> | undefined>(
    undefined
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 300 });
  const [ForceGraph2D, setForceGraph2D] = useState<ComponentType<
    ForceGraphProps<ArticleNode>
  > | null>(null);

  // Dynamically import react-force-graph-2d on the client only
  // to avoid "window is not defined" during pre-rendering
  useEffect(() => {
    import('react-force-graph-2d').then((mod) => {
      setForceGraph2D(
        () => mod.default as ComponentType<ForceGraphProps<ArticleNode>>
      );
    });
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: 300,
        });
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Zoom to fit after initial render
  useEffect(() => {
    if (graphRef.current && dimensions.width > 0) {
      setTimeout(() => {
        graphRef.current?.zoomToFit(400, 40);
      }, 500);
    }
  }, [dimensions.width]);

  const handleNodeClick = useCallback((node: ArticleNode) => {
    if (typeof node.id === 'string') {
      window.location.href = node.id;
    }
  }, []);

  const nodeColor = useCallback(
    (node: ArticleNode) => {
      return node.id === currentArticlePath
        ? CURRENT_NODE_COLOR
        : DEFAULT_NODE_COLOR;
    },
    [currentArticlePath]
  );

  const nodeVal = useCallback(
    (node: ArticleNode) => {
      return node.id === currentArticlePath ? 3 : 1.5;
    },
    [currentArticlePath]
  );

  const nodeLabel = useCallback((node: ArticleNode) => {
    return node.name || String(node.id);
  }, []);

  if (articleGraph.nodes.length === 0) {
    return null;
  }

  return (
    <GraphContainer ref={containerRef}>
      <GraphTitle>Article Connections</GraphTitle>
      {dimensions.width > 0 && ForceGraph2D && (
        <ForceGraph2D
          ref={graphRef}
          graphData={articleGraph}
          width={dimensions.width}
          height={dimensions.height}
          backgroundColor={BG_COLOR}
          nodeColor={nodeColor}
          nodeVal={nodeVal}
          nodeLabel={nodeLabel}
          linkColor={() => LINK_COLOR}
          linkWidth={1.5}
          onNodeClick={handleNodeClick}
          nodeCanvasObjectMode={() => 'after'}
          nodeCanvasObject={(node: ArticleNode, ctx, globalScale) => {
            const label = node.name || String(node.id);
            const fontSize = 12 / globalScale;
            ctx.font = `${fontSize}px Poppins, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillStyle =
              node.id === currentArticlePath ? CURRENT_NODE_COLOR : LABEL_COLOR;
            ctx.fillText(label, node.x ?? 0, (node.y ?? 0) + 6 / globalScale);
          }}
          cooldownTicks={100}
          enableZoomInteraction={true}
          enablePanInteraction={true}
          enableNodeDrag={true}
        />
      )}
    </GraphContainer>
  );
}

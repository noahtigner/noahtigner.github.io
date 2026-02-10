import styled from '@emotion/styled';
import { useMemo } from 'react';
import { Link, useLocation } from 'react-router';

interface Node {
  id: string;
  title: string;
  x?: number;
  y?: number;
}

interface Link {
  source: string;
  target: string;
  value: number;
}

interface GraphData {
  nodes: Node[];
  links: Link[];
}

export interface ForceDirectedGraphProps {
  data: GraphData;
  width: number;
  height: number;
  ariaLabel?: string;
}

const NODE_COLOR = '#2f81f7';
const CURRENT_NODE_COLOR = 'var(--color-text-primary)';
const LABEL_WIDTH = 80;
const LABEL_FONT_SIZE = 9;
const LABEL_LINE_HEIGHT = 1.2;

const StyledSVG = styled.svg`
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

const graphStyles = `
  .graph-circle {
    transition: filter 0.2s;
  }
  .graph-node circle {
    transition: fill 0.2s;
  }
  .graph-label {
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.15s;
    color: var(--color-text-primary);
    font-size: ${LABEL_FONT_SIZE}px;
    line-height: ${LABEL_LINE_HEIGHT};
    text-align: center;
    overflow-wrap: break-word;
    word-break: break-word;
    margin: 0;
    padding: 0;
  }
  .graph-nodes:has(.graph-node:hover) .graph-circle {
    filter: brightness(0.4);
  }
  :has(.graph-node:hover) .graph-links line {
    filter: brightness(0.4);
  }
  .graph-node:hover .graph-label {
    opacity: 1;
  }
`;

function ForceDirectedGraph({
  data,
  width,
  height,
  ariaLabel = 'Force-directed graph showing article connections',
}: ForceDirectedGraphProps) {
  const { pathname } = useLocation();
  const currentPath = pathname.endsWith('/') ? pathname : pathname + '/';
  const markerId = `arrow-${width}`;

  // Calculate in-degree for each node
  const inDegreeMap = useMemo(() => {
    const map = new Map<string, number>();
    data.nodes.forEach((node) => map.set(node.id, 0));
    data.links.forEach((link) => {
      map.set(link.target, (map.get(link.target) ?? 0) + 1);
    });
    return map;
  }, [data]);

  // Calculate node radius scale
  const getNodeRadius = useMemo(() => {
    const maxDegree = Math.max(...Array.from(inDegreeMap.values()));
    return (nodeId: string) => {
      const degree = inDegreeMap.get(nodeId) ?? 0;
      // Square root scale from 6 to 12 pixels
      return 6 + Math.sqrt(degree / maxDegree) * 6;
    };
  }, [inDegreeMap]);

  // Create a map for quick node lookup
  const nodeMap = useMemo(() => {
    const map = new Map<string, Node>();
    data.nodes.forEach((node) => map.set(node.id, node));
    return map;
  }, [data.nodes]);

  // Calculate link endpoints considering node radius
  const getLinkPath = (link: Link) => {
    const sourceNode = nodeMap.get(link.source);
    const targetNode = nodeMap.get(link.target);

    if (
      !sourceNode ||
      !targetNode ||
      sourceNode.x == null ||
      sourceNode.y == null ||
      targetNode.x == null ||
      targetNode.y == null
    ) {
      return { x1: 0, y1: 0, x2: 0, y2: 0 };
    }

    const dx = targetNode.x - sourceNode.x;
    const dy = targetNode.y - sourceNode.y;
    const angle = Math.atan2(dy, dx);
    const targetRadius = getNodeRadius(targetNode.id);

    return {
      x1: sourceNode.x,
      y1: sourceNode.y,
      x2: targetNode.x - Math.cos(angle) * targetRadius,
      y2: targetNode.y - Math.sin(angle) * targetRadius,
    };
  };

  return (
    <StyledSVG
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={ariaLabel}
    >
      <style>{graphStyles}</style>

      {/* Arrow marker definition */}
      <defs>
        <marker
          id={markerId}
          viewBox="0 -5 10 10"
          refX={10.5}
          refY={0}
          markerWidth={6}
          markerHeight={6}
          orient="auto"
        >
          <path fill="var(--color-border)" d="M0,-5L10,0L0,5" />
        </marker>
      </defs>

      {/* Links */}
      <g
        className="graph-links"
        stroke="var(--color-border)"
        strokeOpacity={0.6}
      >
        {data.links.map((link, i) => {
          const { x1, y1, x2, y2 } = getLinkPath(link);
          return (
            <line
              key={`link-${i}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              strokeWidth={Math.sqrt(link.value)}
              markerEnd={`url(#${markerId})`}
            />
          );
        })}
      </g>

      {/* Nodes */}
      <g className="graph-nodes">
        {/* Layer 1: Visible circles (painted first, behind labels) */}
        {data.nodes.map((node) => {
          if (node.x == null || node.y == null) return null;
          const isCurrent = node.id === currentPath;
          return (
            <circle
              key={`c-${node.id}`}
              className="graph-circle"
              cx={node.x}
              cy={node.y}
              r={getNodeRadius(node.id)}
              fill={isCurrent ? CURRENT_NODE_COLOR : NODE_COLOR}
            />
          );
        })}

        {/* Layer 2: Interactive overlays with labels (painted last, on top) */}
        {data.nodes.map((node) => {
          if (node.x == null || node.y == null) return null;

          const radius = getNodeRadius(node.id);
          const isCurrent = node.id === currentPath;

          const labelX = Math.min(
            Math.max(node.x - LABEL_WIDTH / 2, 0),
            width - LABEL_WIDTH
          );
          const labelY = Math.max(
            node.y - radius - 4 - LABEL_FONT_SIZE * LABEL_LINE_HEIGHT * 2,
            LABEL_FONT_SIZE * LABEL_LINE_HEIGHT
          );

          return (
            <Link
              key={node.id}
              to={node.id}
              aria-label={`Navigate to article: ${node.title}`}
              className={`graph-node${isCurrent ? ' graph-node--current' : ''}`}
              style={{ cursor: 'pointer', textDecoration: 'none' }}
            >
              <circle cx={node.x} cy={node.y} r={radius} fill="transparent" />
              <foreignObject
                x={labelX}
                y={labelY}
                width={LABEL_WIDTH}
                // width="auto"
                // height={LABEL_FONT_SIZE * LABEL_LINE_HEIGHT * 4}
                height="100%"
                pointerEvents="none"
              >
                <p className="graph-label">{node.title}</p>
              </foreignObject>
            </Link>
          );
        })}
      </g>
    </StyledSVG>
  );
}

export default function GraphContainer({
  data,
  height,
  width,
  ariaLabel,
}: ForceDirectedGraphProps) {
  return (
    <div
      role="region"
      aria-label={ariaLabel || 'Article connections graph'}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        border: '1px solid var(--color-divider)',
        borderRadius: '8px',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      <ForceDirectedGraph
        data={data}
        height={height}
        width={width}
        ariaLabel={ariaLabel}
      />
    </div>
  );
}

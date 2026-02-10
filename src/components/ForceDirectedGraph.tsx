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
  width?: number;
  height?: number;
  ariaLabel?: string;
}

const nodeColor = '#2f81f7';
const currentNodeColor = 'var(--color-text-primary)';

const StyledSVG = styled.svg`
  fill: ${nodeColor};
  width: 100%;
  height: auto;
`;

const graphStyles = `
  .graph-node circle {
    transition: fill 0.2s, filter 0.2s;
  }
  .graph-node text {
    opacity: 0;
    pointer-events: none;
  }
  .graph-nodes:has(.graph-node:hover) .graph-node:not(:hover) circle {
    filter: brightness(0.6);
  }
  .graph-node:hover circle {
    fill: #046dff;
    filter: brightness(1.1);
  }
  .graph-node--current:hover circle {
    fill: var(--color-text-primary);
  }
  .graph-node:hover text {
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
      // Square root scale from 6 to 16
      return 6 + Math.sqrt(degree / maxDegree) * 10;
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
      <title>{ariaLabel}</title>
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
      <g stroke="var(--color-border)" strokeOpacity={0.6}>
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
        {data.nodes.map((node) => {
          if (node.x == null || node.y == null) return null;

          const radius = getNodeRadius(node.id);
          const isCurrent = node.id === currentPath;

          return (
            <Link
              key={node.id}
              to={node.id}
              aria-label={`Navigate to article: ${node.title}`}
              className={`graph-node${isCurrent ? ' graph-node--current' : ''}`}
              style={{ cursor: 'pointer', textDecoration: 'none' }}
            >
              <circle
                cx={node.x}
                cy={node.y}
                r={radius}
                fill={isCurrent ? currentNodeColor : nodeColor}
              />
              <text
                x={node.x}
                y={node.y - radius - 4}
                fontSize={10}
                fill="var(--color-text-primary)"
                textAnchor="middle"
                pointerEvents="none"
              >
                {node.title}
              </text>
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

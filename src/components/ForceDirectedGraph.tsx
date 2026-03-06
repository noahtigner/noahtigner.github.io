// adapted from https://observablehq.com/@d3/force-directed-graph-component
// inspired by Quartz: https://quartz.jzhao.xyz/

import styled from '@emotion/styled';
import { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router';

interface GraphNode {
  id: string;
  title: string;
  x?: number;
  y?: number;
}

interface GraphLink {
  source: string;
  target: string;
  value: number;
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export interface ForceDirectedGraphProps {
  data: GraphData;
  width: number;
  height: number;
  ariaLabel?: string;
}

const ACTIVE_NODE_COLOR = '#d55017';
const DEFAULT_NODE_COLOR = '#595959';
const LABEL_AREA_HEIGHT = 36;
const LABEL_FONT_SIZE = 11;
const LABEL_LINE_HEIGHT = 1.4;

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
  .graph-label-strip {
    opacity: 0;
    transition: opacity 0.15s;
    color: var(--color-text-primary);
    font-size: ${LABEL_FONT_SIZE}px;
    line-height: ${LABEL_LINE_HEIGHT};
    white-space: normal;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    text-align: center;
    margin: 0;
    padding: 4px 4px 0;
    pointer-events: none;
  }
  .graph-label-strip.visible {
    opacity: 1;
  }
  .graph-circle--dimmed {
    filter: brightness(0.4);
  }
  .graph-links line {
    transition: filter 0.2s, opacity 0.2s, stroke 0.2s;
  }
  .graph-links line.edge-dimmed {
    filter: brightness(0.4);
    opacity: 0.6;
  }
  .graph-links line.edge-highlighted {
    stroke: ${ACTIVE_NODE_COLOR};
    filter: brightness(0.8);
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
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

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
      // Square root scale from 6 to 9 pixels
      return 6 + Math.sqrt(degree / maxDegree) * 3;
    };
  }, [inDegreeMap]);

  // Create a map for quick node lookup
  const nodeMap = useMemo(() => {
    const map = new Map<string, GraphNode>();
    data.nodes.forEach((node) => map.set(node.id, node));
    return map;
  }, [data.nodes]);

  // Compute the set of link indices connected to the hovered node
  const connectedLinkIndices = useMemo(() => {
    if (hoveredNodeId === null) return null;
    const indices = new Set<number>();
    data.links.forEach((link, i) => {
      if (link.source === hoveredNodeId || link.target === hoveredNodeId) {
        indices.add(i);
      }
    });
    return indices;
  }, [hoveredNodeId, data.links]);

  // Compute the set of node IDs directly connected to the hovered node
  const connectedNodeIds = useMemo(() => {
    if (hoveredNodeId === null) return null;
    const ids = new Set<string>();
    data.links.forEach((link) => {
      if (link.source === hoveredNodeId) ids.add(link.target);
      if (link.target === hoveredNodeId) ids.add(link.source);
    });
    return ids;
  }, [hoveredNodeId, data.links]);

  // Calculate link endpoints considering node radius
  const getLinkPath = (link: GraphLink) => {
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

  const hoveredTitle = hoveredNodeId
    ? (nodeMap.get(hoveredNodeId)?.title ?? '')
    : '';

  return (
    <StyledSVG
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height + LABEL_AREA_HEIGHT}`}
      role="img"
      aria-label={ariaLabel}
    >
      <style>{graphStyles}</style>

      {/* Arrow marker definition */}
      <defs>
        <marker
          id={markerId}
          viewBox="0 -5 10 10"
          refX={10}
          refY={0}
          markerWidth={4}
          markerHeight={4}
          orient="auto"
        >
          <path fill="context-stroke" d="M0,-5L10,0L0,5" />
        </marker>
      </defs>

      {/* Fixed label strip at top */}
      <foreignObject x={0} y={0} width={width} height={LABEL_AREA_HEIGHT}>
        <p
          className={`graph-label-strip${hoveredNodeId !== null ? ' visible' : ''}`}
        >
          {hoveredTitle}
        </p>
      </foreignObject>

      {/* Graph content pushed down by label strip height */}
      <g transform={`translate(0, ${LABEL_AREA_HEIGHT})`}>
        {/* Links */}
        <g
          className="graph-links"
          stroke="color-mix(in srgb, var(--color-border) 45%, transparent)"
        >
          {data.links.map((link, i) => {
            const { x1, y1, x2, y2 } = getLinkPath(link);
            let edgeClass = '';
            if (connectedLinkIndices !== null) {
              edgeClass = connectedLinkIndices.has(i)
                ? 'edge-highlighted'
                : 'edge-dimmed';
            }
            return (
              <line
                key={`link-${i}`}
                className={edgeClass}
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
            const isActive =
              connectedNodeIds === null ||
              node.id === hoveredNodeId ||
              connectedNodeIds.has(node.id);
            const circleClass = [
              'graph-circle',
              isCurrent ? 'graph-circle--current' : '',
              !isActive ? 'graph-circle--dimmed' : '',
            ]
              .filter(Boolean)
              .join(' ');
            return (
              <circle
                key={`c-${node.id}`}
                className={circleClass}
                cx={node.x}
                cy={node.y}
                r={getNodeRadius(node.id)}
                fill={isCurrent ? ACTIVE_NODE_COLOR : DEFAULT_NODE_COLOR}
              />
            );
          })}

          {/* Layer 2: Interactive overlays (painted last, on top) */}
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
                onMouseEnter={() => setHoveredNodeId(node.id)}
                onMouseLeave={() => setHoveredNodeId(null)}
              >
                <circle cx={node.x} cy={node.y} r={radius} fill="transparent" />
              </Link>
            );
          })}
        </g>
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

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface Node {
  id: string;
  title: string;
  group: number;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface Link {
  source: string;
  target: string;
  value: number;
}

// Extended types that include properties added by d3 simulation
interface SimulationNode extends Node {
  x: number;
  y: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

// After D3 processes links, source/target become node references
interface SimulatedLink {
  source: SimulationNode;
  target: SimulationNode;
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

function ForceDirectedGraph({
  data,
  width = 256,
  height = 256,
  ariaLabel = 'Force-directed graph showing article connections',
}: ForceDirectedGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Clear any existing content
    d3.select(svgRef.current).selectAll('*').remove();

    // Node color
    const nodeColor = '#2f81f7';
    const nodeColorFaded = '#2f81f760';
    const nodeColorSelected = '#046dff';

    // Create copies so that re-rendering produces the same result
    const links = data.links.map((d) => ({ ...d }));
    const nodes: SimulationNode[] = data.nodes.map((d) => ({
      ...d,
      x: d.x ?? Math.random() * width,
      y: d.y ?? Math.random() * height,
    }));

    // Calculate in-degree (number of incoming edges) for each node
    const inDegree = new Map<string, number>();
    nodes.forEach((node) => inDegree.set(node.id, 0));
    links.forEach((link) => {
      inDegree.set(link.target, (inDegree.get(link.target) ?? 0) + 1);
    });

    // Create a scale for node radius based on in-degree
    const maxDegree = Math.max(...Array.from(inDegree.values()));
    const radiusScale = d3.scaleSqrt().domain([0, maxDegree]).range([6, 16]); // Min radius 6px, max radius 16px

    // Add padding to keep nodes within bounds
    const padding = 20;

    // Create a simulation with several forces
    const simulation = d3
      .forceSimulation<SimulationNode>(nodes)
      .force(
        'link',
        d3
          .forceLink<SimulationNode, Link>(links)
          .id((d) => d.id)
          .distance(50)
      )
      .force('charge', d3.forceManyBody().strength(-150))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force(
        'collision',
        d3
          .forceCollide<SimulationNode>()
          .radius((d) => radiusScale(inDegree.get(d.id) ?? 0) + 10)
      )
      .force('x', d3.forceX(width / 2).strength(0.1))
      .force('y', d3.forceY(height / 2).strength(0.1))
      .on('tick', ticked);

    // Create the SVG container
    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height])
      .attr('style', 'max-width: 100%; height: auto;')
      .attr('role', 'img')
      .attr('aria-label', ariaLabel);

    // Add title for additional context
    svg.append('title').text(ariaLabel);

    // Add arrow markers for directed edges
    svg
      .append('defs')
      .selectAll('marker')
      .data(['end'])
      .join('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 15)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('fill', 'rgba(210, 210, 210, 0.745)')
      .attr('d', 'M0,-5L10,0L0,5');

    // Add a line for each link
    const link = svg
      .append('g')
      .attr('stroke', 'rgba(210, 210, 210, 0.745)')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke-width', (d) => Math.sqrt(d.value))
      .attr('marker-end', 'url(#arrow)');

    // Add a circle for each node wrapped in a link
    const nodeGroup = svg
      .append('g')
      .selectAll('a')
      .data(nodes)
      .join('a')
      .attr('href', (d) => d.id)
      .attr('cursor', 'pointer')
      .attr('aria-label', (d) => `Navigate to article: ${d.title}`);

    const node = nodeGroup
      .append('circle')
      .attr('r', (d) => radiusScale(inDegree.get(d.id) ?? 0))
      .attr('fill', nodeColor);

    // Add labels
    const label = svg
      .append('g')
      .selectAll('text')
      .data(nodes)
      .join('text')
      .text((d) => d.title)
      .attr('font-size', 10)
      .attr('fill', 'rgb(248, 251, 248)')
      .attr('text-anchor', 'middle')
      .attr('dy', (d) => -(radiusScale(inDegree.get(d.id) ?? 0) + 4))
      .attr('opacity', 0)
      .attr('pointer-events', 'none');

    // Show label and brighten node on hover
    nodeGroup
      .on('mouseover', function (_event, d) {
        // Fade all nodes
        node.attr('fill', nodeColorFaded);
        // Brighten hovered node (10% lighter using filter)
        d3.select(this)
          .select('circle')
          .attr('fill', nodeColorSelected)
          .style('filter', 'brightness(1.1)');
        // Show label
        label.filter((labelData) => labelData.id === d.id).attr('opacity', 1);
      })
      .on('mouseout', function () {
        // Reset all nodes
        node.attr('fill', nodeColor).style('filter', null);
        // Hide all labels
        label.attr('opacity', 0);
      });

    // Set the position attributes of links and nodes each time the simulation ticks
    function ticked() {
      // Constrain nodes to stay within bounds
      nodes.forEach((d) => {
        const radius = radiusScale(inDegree.get(d.id) ?? 0);
        d.x = Math.max(
          padding + radius,
          Math.min(width - padding - radius, d.x)
        );
        d.y = Math.max(
          padding + radius,
          Math.min(height - padding - radius, d.y)
        );
      });

      link.each(function (d) {
        const sourceNode = d.source as unknown as SimulatedLink['source'];
        const targetNode = d.target as unknown as SimulatedLink['target'];

        // Calculate the angle of the link
        const dx = targetNode.x - sourceNode.x;
        const dy = targetNode.y - sourceNode.y;
        const angle = Math.atan2(dy, dx);

        // Get the target node radius
        const targetRadius = radiusScale(inDegree.get(targetNode.id) ?? 0);

        // Calculate where the link should end (at the edge of the target circle)
        const targetX = targetNode.x - Math.cos(angle) * targetRadius;
        const targetY = targetNode.y - Math.sin(angle) * targetRadius;

        d3.select(this)
          .attr('x1', sourceNode.x)
          .attr('y1', sourceNode.y)
          .attr('x2', targetX)
          .attr('y2', targetY);
      });

      nodeGroup.attr('transform', (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);

      label.attr('x', (d) => d.x ?? 0).attr('y', (d) => d.y ?? 0);
    }

    // Cleanup on unmount
    return () => {
      simulation.stop();
    };
  }, [data, width, height, ariaLabel]);

  return <svg ref={svgRef} />;
}

export default function GraphContainer({
  data,
  height = 256,
  width = 256,
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

import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sliders,
  Sparkles,
  Eye,
  Filter,
  Layers,
  HelpCircle,
  Maximize2
} from 'lucide-react';
import { useKnowledgeGraph } from '../context/KnowledgeGraphContext';
import { GraphNode, GraphEdge, GraphMode, Relationship } from '../types';
import { calculatePageRank, detectCommunities } from '../utils/graphAlgorithms';

export const KnowledgeGraph: React.FC = () => {
  const {
    notes,
    relationships,
    perspectives,
    activePerspectiveId,
    filters,
    setFilters,
    graphMode,
    setGraphMode,
    setSelectedNodeId,
    setSelectedRelationshipId,
    discoveries
  } = useKnowledgeGraph();

  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const activePerspective = perspectives.find(p => p.id === activePerspectiveId) || perspectives[0];

  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<string | null>(null);
  const [zoomTransform, setZoomTransform] = useState<{ x: number; y: number; k: number }>({ x: 0, y: 0, k: 1 });

  // 1. Build Nodes & Edges from Notes & Relationships
  const { nodes, edges } = useMemo(() => {
    const nodeMap = new Map<string, GraphNode>();

    // Extract nodes from notes concepts and acronyms
    notes.forEach(note => {
      note.concepts.forEach(concept => {
        const key = concept.name.toLowerCase().trim();
        if (!nodeMap.has(key)) {
          nodeMap.set(key, {
            id: key,
            name: concept.name,
            type: concept.type || 'Concept',
            description: concept.description || '',
            importance: 1,
            sourceCount: 1,
            sourceNoteIds: [note.id],
            category: concept.category
          });
        } else {
          const existing = nodeMap.get(key)!;
          existing.sourceCount += 1;
          if (!existing.sourceNoteIds.includes(note.id)) {
            existing.sourceNoteIds.push(note.id);
          }
        }
      });

      note.acronyms.forEach(acronym => {
        const key = acronym.acronym.toLowerCase().trim();
        if (!nodeMap.has(key)) {
          nodeMap.set(key, {
            id: key,
            name: `${acronym.acronym} (${acronym.expansion})`,
            type: 'Acronym',
            description: acronym.description || acronym.expansion,
            importance: 1,
            sourceCount: 1,
            sourceNoteIds: [note.id],
            category: acronym.category
          });
        }
      });
    });

    // Also collect nodes referenced in relationships that might not be in notes
    relationships.forEach(rel => {
      const srcKey = rel.sourceName.toLowerCase().trim();
      const tgtKey = rel.targetName.toLowerCase().trim();

      if (!nodeMap.has(srcKey)) {
        nodeMap.set(srcKey, {
          id: srcKey,
          name: rel.sourceName,
          type: 'Concept',
          description: '',
          importance: 1,
          sourceCount: 1,
          sourceNoteIds: rel.sourceNoteIds || []
        });
      }
      if (!nodeMap.has(tgtKey)) {
        nodeMap.set(tgtKey, {
          id: tgtKey,
          name: rel.targetName,
          type: 'Concept',
          description: '',
          importance: 1,
          sourceCount: 1,
          sourceNoteIds: rel.sourceNoteIds || []
        });
      }
    });

    // Calculate degree importance
    const rawEdges: GraphEdge[] = [];

    relationships.forEach(rel => {
      const srcKey = rel.sourceName.toLowerCase().trim();
      const tgtKey = rel.targetName.toLowerCase().trim();

      if (srcKey === tgtKey) return;

      const srcNode = nodeMap.get(srcKey);
      const tgtNode = nodeMap.get(tgtKey);

      if (srcNode && tgtNode) {
        srcNode.importance += 1;
        tgtNode.importance += 1;

        // Calculate perspective weighted score
        let weightedScore = rel.baseScore;
        const priorityConcepts = activePerspective.priorityConcepts || [];
        const isSrcPriority = priorityConcepts.some(pc => pc.toLowerCase() === srcKey);
        const isTgtPriority = priorityConcepts.some(pc => pc.toLowerCase() === tgtKey);

        if (isSrcPriority && isTgtPriority) {
          weightedScore = Math.min(0.99, rel.baseScore * 1.2);
        } else if (isSrcPriority || isTgtPriority) {
          weightedScore = Math.min(0.98, rel.baseScore * 1.1);
        }

        rawEdges.push({
          id: rel.id,
          source: srcKey,
          target: tgtKey,
          relationshipType: rel.relationshipType,
          baseScore: rel.baseScore,
          weightedScore,
          confidence: rel.confidence,
          evidence: rel.evidence || [],
          sourceNoteIds: rel.sourceNoteIds || [],
          explanation: rel.explanation,
          userConfirmed: rel.userConfirmed
        });
      }
    });

    // Filter edges based on Filters
    let filteredEdges = rawEdges.filter(e => {
      if (e.userConfirmed === false) return false; // Rejected
      if (e.weightedScore < filters.minScore) return false;
      if (e.confidence < filters.minConfidence) return false;
      return true;
    });

    // Node search filter
    let filteredNodes = Array.from(nodeMap.values());
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filteredNodes = filteredNodes.filter(n =>
        n.name.toLowerCase().includes(term) ||
        n.description.toLowerCase().includes(term) ||
        n.type.toLowerCase().includes(term)
      );
    }

    // Apply Graph Algorithms
    calculatePageRank(filteredNodes, filteredEdges);
    detectCommunities(filteredNodes, filteredEdges);

    return { nodes: filteredNodes, edges: filteredEdges };
  }, [notes, relationships, activePerspective, filters]);

  // D3 Force Simulation Effect
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 800;
    const height = containerRef.current.clientHeight || 600;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous render

    // Main Group for Zoom
    const g = svg.append('g').attr('class', 'graph-viewport');

    // Setup D3 Zoom
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        setZoomTransform(event.transform);
      });

    svg.call(zoom as any);

    // Initial center zoom
    svg.call(zoom.transform as any, d3.zoomIdentity.translate(width / 2, height / 2).scale(0.85));

    // Nodes and Links copies for Simulation
    const simNodes = nodes.map(n => ({ ...n }));
    const simLinks = edges.map(e => ({
      ...e,
      source: typeof e.source === 'object' ? (e.source as GraphNode).id : e.source,
      target: typeof e.target === 'object' ? (e.target as GraphNode).id : e.target
    }));

    // D3 Force Simulation
    const simulation = d3.forceSimulation<any>(simNodes)
      .force('link', d3.forceLink<any, any>(simLinks).id(d => d.id).distance(120))
      .force('charge', d3.forceManyBody().strength(-380))
      .force('center', d3.forceCenter(0, 0))
      .force('collision', d3.forceCollide().radius(40))
      .force('clusterX', d3.forceX((d: any) => d.cluster !== undefined ? (d.cluster % 3 - 1) * 300 : 0).strength(0.05))
      .force('clusterY', d3.forceY((d: any) => d.cluster !== undefined ? (Math.floor(d.cluster / 3) - 1) * 300 : 0).strength(0.05));

    // Render Edges
    const linkGroup = g.append('g').attr('class', 'links');
    const link = linkGroup.selectAll('g')
      .data(simLinks)
      .enter()
      .append('g')
      .attr('class', 'edge-group')
      .style('cursor', 'pointer')
      .on('click', (event, d: any) => {
        event.stopPropagation();
        setSelectedRelationshipId(d.id);
      })
      .on('mouseover', (event, d: any) => setHoveredEdge(d.id))
      .on('mouseout', () => setHoveredEdge(null));

    // Edge Line
    const linkLine = link.append('line')
      .attr('stroke', (d: any) => {
        if (d.userConfirmed === true) return '#22C55E'; // Green for confirmed
        return d.weightedScore > 0.85 ? '#EAB308' : '#3E434B';
      })
      .attr('stroke-width', (d: any) => Math.max(1.5, d.weightedScore * 4))
      .attr('stroke-dasharray', (d: any) => d.weightedScore < 0.7 ? '4,4' : 'none')
      .attr('opacity', 0.8);

    // Edge Score Badge Text
    const linkText = link.append('text')
      .text((d: any) => `${Math.round(d.weightedScore * 100)}%`)
      .attr('font-size', '9px')
      .attr('font-weight', '600')
      .attr('fill', '#9CA3AF')
      .attr('text-anchor', 'middle')
      .attr('dy', -4)
      .attr('class', 'select-none pointer-events-none font-mono');

    // Render Nodes
    const nodeGroup = g.append('g').attr('class', 'nodes');
    const node = nodeGroup.selectAll('g')
      .data(simNodes)
      .enter()
      .append('g')
      .attr('class', 'node-group')
      .style('cursor', 'pointer')
      .call(d3.drag<any, any>()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        })
      )
      .on('click', (event, d: any) => {
        event.stopPropagation();
        setSelectedNodeId(d.id);
      })
      .on('mouseover', (event, d: any) => setHoveredNode(d.id))
      .on('mouseout', () => setHoveredNode(null));

    // Node Circle Outer Halo
    node.append('circle')
      .attr('r', (d: any) => Math.min(28, 12 + d.importance * 3))
      .attr('fill', (d: any) => getNodeColor(d.type))
      .attr('fill-opacity', 0.2)
      .attr('stroke', (d: any) => getNodeColor(d.type))
      .attr('stroke-width', 1.5);

    // Core Node Circle
    node.append('circle')
      .attr('r', (d: any) => Math.min(18, 8 + d.importance * 2))
      .attr('fill', (d: any) => getNodeColor(d.type))
      .attr('stroke', '#0B0E11')
      .attr('stroke-width', 2);

    // Node Label Below
    node.append('text')
      .text((d: any) => d.name)
      .attr('font-size', '11px')
      .attr('font-weight', '600')
      .attr('fill', '#EAECEF')
      .attr('text-anchor', 'middle')
      .attr('dy', (d: any) => Math.min(18, 8 + d.importance * 2) + 14)
      .attr('class', 'select-none pointer-events-none stroke-[#0B0E11] stroke-2 paint-order-stroke');

    // Tick Handler
    simulation.on('tick', () => {
      linkLine
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      linkText
        .attr('x', (d: any) => (d.source.x + d.target.x) / 2)
        .attr('y', (d: any) => (d.source.y + d.target.y) / 2);

      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    return () => {
      simulation.stop();
    };
  }, [nodes, edges, activePerspective, setSelectedNodeId, setSelectedRelationshipId]);

  function getNodeColor(type: string): string {
    switch (type) {
      case 'Concept': return '#EAB308'; // Yellow
      case 'Entity': return '#22C55E'; // Green
      case 'Acronym': return '#F97316'; // Orange
      case 'Technology': return '#3B82F6'; // Blue
      case 'Topic': return '#A855F7'; // Purple
      case 'Note': return '#64748B'; // Slate
      // Phase 1: hub item types
      case 'Repo': return '#22C55E';
      case 'Project': return '#6366F1';
      case 'Client': return '#10B981';
      case 'Domain': return '#F59E0B';
      case 'DnsRecord': return '#EAB308';
      case 'Server': return '#EF4444';
      case 'Service': return '#06B6D4';
      case 'Vision': return '#A855F7';
      case 'Screenshot': return '#EC4899';
      case 'Learning': return '#3B82F6';
      default: return '#EAB308';
    }
  }

  // Zoom handlers
  const handleZoomIn = () => {
    if (!svgRef.current) return;
    d3.select(svgRef.current).transition().duration(250).call(d3.zoom().scaleBy as any, 1.25);
  };

  const handleZoomOut = () => {
    if (!svgRef.current) return;
    d3.select(svgRef.current).transition().duration(250).call(d3.zoom().scaleBy as any, 0.8);
  };

  const handleResetZoom = () => {
    if (!svgRef.current || !containerRef.current) return;
    const width = containerRef.current.clientWidth || 800;
    const height = containerRef.current.clientHeight || 600;
    d3.select(svgRef.current).transition().duration(350).call(
      d3.zoom().transform as any,
      d3.zoomIdentity.translate(width / 2, height / 2).scale(0.85)
    );
  };

  return (
    <div ref={containerRef} className="relative h-full w-full bg-[#0B0E11] overflow-hidden flex flex-col select-none text-[#EAECEF]">
      {/* Top Floating Controls Bar */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Mode Selector Pills */}
        <div className="flex items-center gap-1 bg-[#161A1E]/90 backdrop-blur-md p-1 rounded border border-[#2B2F36] shadow-2xl pointer-events-auto text-xs font-mono">
          {(['GLOBAL', 'PERSPECTIVE', 'DISCOVERY', 'TIMELINE'] as GraphMode[]).map(mode => (
            <button
              key={mode}
              onClick={() => setGraphMode(mode)}
              className={`px-2.5 py-1 rounded transition-all font-bold ${
                graphMode === mode
                  ? 'bg-yellow-500 text-black shadow-xs'
                  : 'text-gray-300 hover:text-white hover:bg-[#2B2F36]'
              }`}
            >
              {mode.charAt(0) + mode.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Perspective & Strength Indicator */}
        <div className="flex items-center gap-2 bg-[#161A1E]/90 backdrop-blur-md px-3 py-1.5 rounded border border-[#2B2F36] shadow-2xl pointer-events-auto text-xs font-mono text-[#EAECEF]">
          <Eye className="w-3.5 h-3.5 text-yellow-500" />
          <span className="text-gray-400">View:</span>
          <span className="font-bold text-white" style={{ color: activePerspective.color }}>
            {activePerspective.name}
          </span>
          <span className="text-gray-600">|</span>
          <span className="text-gray-400">Edges:</span>
          <span className="font-bold text-yellow-400">{edges.length}</span>
        </div>
      </div>

      {/* Floating Filter Controls Slider Drawer */}
      <div className="absolute bottom-3 left-3 z-10 bg-[#161A1E]/90 backdrop-blur-md p-3 rounded border border-[#2B2F36] shadow-2xl pointer-events-auto text-xs font-mono text-[#EAECEF] space-y-2 max-w-xs">
        <div className="flex items-center justify-between font-bold text-white">
          <span className="flex items-center gap-1">
            <Sliders className="w-3.5 h-3.5 text-yellow-500" />
            Graph Controls
          </span>
          <span className="text-[10px] text-yellow-400 font-mono">{nodes.length} Nodes</span>
        </div>

        {/* Strength Slider */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] text-gray-400">
            <span>Min Score Cutoff:</span>
            <span className="font-mono text-yellow-400 font-bold">{Math.round(filters.minScore * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.3"
            max="0.9"
            step="0.05"
            value={filters.minScore}
            onChange={(e) => setFilters(prev => ({ ...prev, minScore: parseFloat(e.target.value) }))}
            className="w-full accent-yellow-500 bg-[#2B2F36] h-1.5 rounded cursor-pointer"
          />
        </div>

        {/* Legend */}
        <div className="pt-1.5 border-t border-[#2B2F36] flex flex-wrap gap-2 text-[10px]">
          <span className="flex items-center gap-1 text-gray-300">
            <span className="w-2 h-2 rounded-full bg-yellow-500" /> Concept
          </span>
          <span className="flex items-center gap-1 text-gray-300">
            <span className="w-2 h-2 rounded-full bg-green-500" /> Entity
          </span>
          <span className="flex items-center gap-1 text-gray-300">
            <span className="w-2 h-2 rounded-full bg-orange-500" /> Acronym
          </span>
          <span className="flex items-center gap-1 text-gray-300">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#6366F1' }} /> Project
          </span>
          <span className="flex items-center gap-1 text-gray-300">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#10B981' }} /> Client
          </span>
          <span className="flex items-center gap-1 text-gray-300">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#F59E0B' }} /> Domain
          </span>
          <span className="flex items-center gap-1 text-gray-300">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#EF4444' }} /> Server
          </span>
          <span className="flex items-center gap-1 text-gray-300">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#3B82F6' }} /> Learning
          </span>
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="absolute bottom-3 right-3 z-10 flex flex-col gap-1 bg-[#161A1E]/90 backdrop-blur-md p-1 rounded border border-[#2B2F36] shadow-2xl pointer-events-auto">
        <button
          onClick={handleZoomIn}
          className="p-1.5 text-gray-300 hover:text-white hover:bg-[#2B2F36] rounded transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-1.5 text-gray-300 hover:text-white hover:bg-[#2B2F36] rounded transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetZoom}
          className="p-1.5 text-gray-300 hover:text-white hover:bg-[#2B2F36] rounded transition-colors"
          title="Reset Graph Position"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* SVG Canvas */}
      <svg
        ref={svgRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />
    </div>
  );
};

import { GraphNode, GraphEdge } from '../types';

/**
 * Calculates PageRank for each node in the graph and updates the node.pagerank property.
 * It also blends the PageRank score into the node.importance for visual sizing.
 */
export function calculatePageRank(
  nodes: GraphNode[], 
  edges: GraphEdge[], 
  iterations: number = 20, 
  dampingFactor: number = 0.85
): void {
  const nodeMap = new Map<string, GraphNode>();
  const outDegree = new Map<string, number>();
  const inEdges = new Map<string, GraphEdge[]>();

  nodes.forEach(node => {
    nodeMap.set(node.id, node);
    node.pagerank = 1.0; // Initial PageRank
    outDegree.set(node.id, 0);
    inEdges.set(node.id, []);
  });

  edges.forEach(edge => {
    const srcId = typeof edge.source === 'object' ? edge.source.id : edge.source as string;
    const tgtId = typeof edge.target === 'object' ? edge.target.id : edge.target as string;
    
    outDegree.set(srcId, (outDegree.get(srcId) || 0) + 1);
    if (!inEdges.has(tgtId)) {
      inEdges.set(tgtId, []);
    }
    inEdges.get(tgtId)!.push(edge);
  });

  const N = nodes.length;
  if (N === 0) return;

  for (let i = 0; i < iterations; i++) {
    const newRanks = new Map<string, number>();
    
    let sinkRankSum = 0;
    nodes.forEach(node => {
      if ((outDegree.get(node.id) || 0) === 0) {
        sinkRankSum += (node.pagerank || 1.0);
      }
    });

    nodes.forEach(node => {
      let rankSum = 0;
      const incoming = inEdges.get(node.id) || [];
      incoming.forEach(edge => {
        const srcId = typeof edge.source === 'object' ? edge.source.id : edge.source as string;
        const out = outDegree.get(srcId) || 1;
        rankSum += (nodeMap.get(srcId)?.pagerank || 1.0) / out;
      });

      rankSum += sinkRankSum / N;

      const newRank = (1 - dampingFactor) / N + dampingFactor * rankSum;
      newRanks.set(node.id, newRank);
    });

    nodes.forEach(node => {
      node.pagerank = newRanks.get(node.id) || 1.0;
    });
  }

  // Normalize PageRank to sum to N, and scale importance
  const maxPR = Math.max(...nodes.map(n => n.pagerank || 0), 1);
  nodes.forEach(node => {
    // Combine degree importance and PageRank for visual sizing
    // node.importance is already populated with degree count before this is called
    const degreeImportance = node.importance;
    const prScore = (node.pagerank || 0) / maxPR * 10;
    // Blend degree and pagerank
    node.importance = (degreeImportance * 0.4) + (prScore * 0.6);
  });
}

/**
 * Detects communities using Label Propagation algorithm and sets node.cluster property.
 */
export function detectCommunities(
  nodes: GraphNode[], 
  edges: GraphEdge[], 
  iterations: number = 10
): void {
  // Initialize each node with its own unique cluster ID
  nodes.forEach((node, i) => {
    node.cluster = i;
  });

  const adjList = new Map<string, string[]>();
  nodes.forEach(node => adjList.set(node.id, []));

  edges.forEach(edge => {
    const srcId = typeof edge.source === 'object' ? edge.source.id : edge.source as string;
    const tgtId = typeof edge.target === 'object' ? edge.target.id : edge.target as string;
    // Undirected for community detection
    adjList.get(srcId)?.push(tgtId);
    adjList.get(tgtId)?.push(srcId);
  });

  for (let iter = 0; iter < iterations; iter++) {
    // Shuffle nodes for label propagation to avoid oscillation
    const shuffledNodes = [...nodes].sort(() => Math.random() - 0.5);
    
    let changed = false;
    shuffledNodes.forEach(node => {
      const neighbors = adjList.get(node.id) || [];
      if (neighbors.length === 0) return;

      const labelCounts = new Map<number, number>();
      neighbors.forEach(neighborId => {
        const neighbor = nodes.find(n => n.id === neighborId);
        if (neighbor && neighbor.cluster !== undefined) {
          labelCounts.set(neighbor.cluster, (labelCounts.get(neighbor.cluster) || 0) + 1);
        }
      });

      if (labelCounts.size > 0) {
        // Find most frequent label
        let maxCount = -1;
        let maxLabel = node.cluster!;
        for (const [label, count] of labelCounts.entries()) {
          if (count > maxCount || (count === maxCount && Math.random() > 0.5)) {
            maxCount = count;
            maxLabel = label;
          }
        }

        if (node.cluster !== maxLabel) {
          node.cluster = maxLabel;
          changed = true;
        }
      }
    });

    if (!changed) break; // Converged
  }

  // Renumber clusters to be 0, 1, 2, ...
  const uniqueClusters = Array.from(new Set(nodes.map(n => n.cluster!))).sort((a, b) => a - b);
  const clusterMap = new Map<number, number>();
  uniqueClusters.forEach((oldLabel, idx) => {
    clusterMap.set(oldLabel, idx);
  });

  nodes.forEach(node => {
    if (node.cluster !== undefined) {
      node.cluster = clusterMap.get(node.cluster);
    }
  });
}

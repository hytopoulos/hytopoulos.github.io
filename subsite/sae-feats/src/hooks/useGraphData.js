/**
 * Custom hook for loading and caching graph data
 */

import { useState, useEffect } from 'react';
import graphData from '../data.json';

/**
 * Hook to load and provide graph data
 * @returns {Object} { data, loading, error }
 */
export const useGraphData = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      // Currently loading from static import, but this allows for
      // future migration to dynamic loading or API calls
      setData(graphData);
      setLoading(false);
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  }, []);

  return { data, loading, error };
};

/**
 * Hook to get filtered nodes and links based on show clusters setting
 * @param {Object} data - Graph data
 * @param {boolean} showClusters - Whether to show cluster nodes
 * @returns {Object} { nodes, links }
 */
export const useFilteredGraph = (data, showClusters) => {
  const [filteredData, setFilteredData] = useState({ nodes: [], links: [] });

  useEffect(() => {
    if (!data) {
      setFilteredData({ nodes: [], links: [] });
      return;
    }

    if (showClusters) {
      // Show all nodes and links
      setFilteredData({
        nodes: data.nodes,
        links: data.links
      });
    } else {
      // Filter out cluster nodes and their links
      const featureNodes = data.nodes.filter(n => n.type !== 'cluster');
      const featureNodeIds = new Set(featureNodes.map(n => n.id));
      const featureLinks = data.links.filter(
        l => featureNodeIds.has(l.source.id || l.source) && 
             featureNodeIds.has(l.target.id || l.target)
      );
      
      setFilteredData({
        nodes: featureNodes,
        links: featureLinks
      });
    }
  }, [data, showClusters]);

  return filteredData;
};

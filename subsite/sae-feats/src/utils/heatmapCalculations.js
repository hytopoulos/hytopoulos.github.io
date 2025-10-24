/**
 * Heatmap calculation utilities
 * Includes hex grid generation, IDW interpolation, and activation computation
 */

import { getActivationsWithBiasSteering } from './index';
import { DEMOGRAPHICS } from '../constants';

/**
 * Generate hexagon grid centers covering node bounds
 * @param {Array} nodes - Nodes with x,y positions
 * @param {number} hexRadius - Hexagon radius
 * @param {number} padding - Padding around bounds
 * @returns {Array} Hex center points {x, y}
 */
export const generateHexGrid = (nodes, hexRadius = 35, padding = 300) => {
  if (nodes.length === 0) return [];

  const hexWidth = hexRadius * 2;
  const hexHeight = Math.sqrt(3) * hexRadius;

  // Dynamically determine grid extent based on actual node positions
  const nodeBounds = {
    minX: Math.min(...nodes.map(n => n.x)),
    maxX: Math.max(...nodes.map(n => n.x)),
    minY: Math.min(...nodes.map(n => n.y)),
    maxY: Math.max(...nodes.map(n => n.y))
  };
  
  // Add padding around node bounds for smooth edges
  const startX = nodeBounds.minX - padding;
  const endX = nodeBounds.maxX + padding;
  const startY = nodeBounds.minY - padding;
  const endY = nodeBounds.maxY + padding;
  
  const hexCenters = [];
  const startRow = Math.floor(startY / hexHeight);
  const endRow = Math.ceil(endY / hexHeight);
  const startCol = Math.floor(startX / (hexWidth * 0.75));
  const endCol = Math.ceil(endX / (hexWidth * 0.75));
  
  for (let row = startRow; row <= endRow; row++) {
    for (let col = startCol; col <= endCol; col++) {
      const x = col * hexWidth * 0.75;
      const y = row * hexHeight + (col % 2 === 0 ? 0 : hexHeight / 2);
      hexCenters.push({ x, y });
    }
  }

  return hexCenters;
};

/**
 * Inverse Distance Weighting function
 * @param {number} distance - Distance from point
 * @param {number} radius - Influence radius
 * @returns {number} Weight value [0, 1]
 */
export const inverseDistanceWeight = (distance, radius = 50) => {
  return 1 / (1 + distance / radius);
};

/**
 * Calculate activation at a point using IDW interpolation
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {Array} nodes - Nodes with activations
 * @param {Set} activeLabels - Active emotion labels
 * @param {Function} getNearbyNodes - Function to get nearby nodes
 * @param {Object} options - Additional options
 * @returns {number} Mean activation at point
 */
export const calculateActivationAtPoint = (
  x,
  y,
  nodes,
  activeLabels,
  getNearbyNodes,
  {
    debiasedActivations,
    genderBiasSteering,
    ageBiasSteering,
    useRelativeActivation,
    filterIntensity,
    maxDistance = 150,
    idwRadius = 50
  }
) => {
  let totalActivation = 0;
  let totalWeight = 0;
  
  const maxDistSq = maxDistance * maxDistance;
  const nearbyNodes = getNearbyNodes(x, y);
  
  nearbyNodes.forEach(node => {
    const dx = node.x - x;
    const dy = node.y - y;
    const distSq = dx * dx + dy * dy;
    
    // Only consider nodes within max distance
    if (distSq < maxDistSq) {
      const distance = Math.sqrt(distSq);
      const weight = inverseDistanceWeight(distance, idwRadius);
      
      activeLabels.forEach(label => {
        if (node.activations && node.activations[label] !== undefined) {
          const activations = getActivationsWithBiasSteering(
            node.activations,
            debiasedActivations?.get(node.id),
            genderBiasSteering,
            ageBiasSteering
          );
          
          let activation = activations[label] || 0;
          
          // Apply relative activation if enabled
          if (useRelativeActivation && node.activations) {
            const emotionValues = Object.entries(node.activations)
              .filter(([k]) => !DEMOGRAPHICS.includes(k))
              .map(([, v]) => v);
            const meanActivation = emotionValues.reduce((sum, val) => sum + val, 0) / emotionValues.length;
            const intensityFactor = filterIntensity / 100;
            activation = Math.max(0, activation - (meanActivation * intensityFactor));
          }
          
          totalActivation += activation * weight;
          totalWeight += weight;
        }
      });
    }
  });

  return totalWeight > 0 ? totalActivation / totalWeight : 0;
};

/**
 * Calculate activations for all hex centers
 * @param {Array} hexCenters - Hex grid centers
 * @param {Array} nodes - Nodes with activations
 * @param {Set} activeLabels - Active emotion labels
 * @param {SpatialHash} spatialHash - Spatial hash for lookups
 * @param {Object} options - Calculation options
 * @returns {Array} Bins with {x, y, meanActivation}
 */
export const calculateHexbinActivations = (
  hexCenters,
  nodes,
  activeLabels,
  spatialHash,
  options = {}
) => {
  return hexCenters.map(center => ({
    x: center.x,
    y: center.y,
    meanActivation: calculateActivationAtPoint(
      center.x,
      center.y,
      nodes,
      activeLabels,
      (x, y) => spatialHash.getNearby(x, y),
      options
    )
  }));
};

/**
 * D3 Voronoi cell rendering functions
 */

import * as d3 from 'd3';
import { 
  EMOTION_COLORS, 
  VORONOI_OPACITY, 
  MAX_FEATURES,
  DEMOGRAPHICS,
  STROKE_WIDTH 
} from '../constants';
import {
  getMaxActivationEmotion,
  calculateMeanActivation,
  calculateRelativeActivation
} from '../utils';
import { getTopNEmotions } from '../utils/emotionUtils';

/**
 * Calculate Voronoi cell opacity based on feature count or activation
 * @param {Object} node - Cluster node
 * @param {Object} state - Visualization state
 * @returns {number} Opacity value
 */
const calculateVoronoiOpacity = (node, state) => {
  const { 
    hoveredEmotion, 
    selectedEmotions, 
    showPieCharts,
    useRelativeActivation,
    filterIntensity 
  } = state;

  const hasEmotionFilter = hoveredEmotion || (selectedEmotions.size > 0 && !showPieCharts);

  if (hasEmotionFilter && node.activations) {
    const emotionsToCheck = hoveredEmotion ? [hoveredEmotion] : Array.from(selectedEmotions);
    const { maxActivation } = getMaxActivationEmotion(
      node.activations,
      emotionsToCheck,
      useRelativeActivation,
      filterIntensity
    );

    if (maxActivation > 0) {
      const amplified = Math.min(maxActivation * 10, 1);
      return VORONOI_OPACITY.ACTIVE_MIN + (amplified * (VORONOI_OPACITY.ACTIVE_MAX - VORONOI_OPACITY.ACTIVE_MIN));
    }
    return VORONOI_OPACITY.INACTIVE;
  }

  // Base opacity on feature count (log scale)
  if (node.num_features) {
    const featureRatio = Math.log(node.num_features + 1) / Math.log(MAX_FEATURES + 1);
    return VORONOI_OPACITY.MIN + (featureRatio * (VORONOI_OPACITY.MAX - VORONOI_OPACITY.MIN));
  }

  return VORONOI_OPACITY.DEFAULT;
};

/**
 * Create tooltip content for cluster
 * @param {Object} node - Cluster node
 * @returns {Object} Tooltip data
 */
const createClusterTooltip = (node) => {
  const tooltipContent = {
    type: 'cluster',
    label: node.label,
    depth: node.depth,
    num_features: node.num_features,
    primary_emotion: node.primary_emotion,
    primary_activation: node.activations?.[node.primary_emotion] || 0,
    feature_vector_b64: node.feature_vector_b64,
    activations: node.activations
  };

  // Add top 3 emotions
  if (node.activations) {
    const top3 = getTopNEmotions(node.activations, 3);
    // top3 is already an array of [emotion, value] tuples, no need to remap
    tooltipContent.top3_emotions = top3;
  }

  return tooltipContent;
};

/**
 * Render Voronoi cells for clusters
 * @param {d3.Selection} voronoiLayer - D3 selection for Voronoi layer
 * @param {Array} nodes - All graph nodes
 * @param {Object} state - Visualization state
 * @param {number} width - SVG width
 * @param {number} height - SVG height
 * @param {Function} setTooltipData - Tooltip setter
 * @param {Function} setTooltipPosition - Tooltip position setter
 * @param {Function} onNodeClick - Node click handler
 * @param {Function} applyDebiasingFn - Debiasing function
 */
export const renderVoronoi = (
  voronoiLayer,
  nodes,
  state,
  width,
  height,
  setTooltipData,
  setTooltipPosition,
  onNodeClick,
  applyDebiasingFn
) => {
  const { showVoronoi, genderBiasSteering, ageBiasSteering } = state;

  if (!showVoronoi) {
    voronoiLayer.selectAll('*').remove();
    return;
  }

  // Filter valid nodes - include both cluster and feature nodes
  // Feature nodes will be invisible but provide better spatial coverage
  const validNodes = nodes.filter(n => 
    n.x !== undefined && n.y !== undefined
  );

  if (validNodes.length === 0) {
    voronoiLayer.selectAll('*').remove();
    return;
  }

  // Compute Voronoi diagram
  const points = validNodes.map(n => [n.x, n.y]);
  const delaunay = d3.Delaunay.from(points);
  const voronoiDiagram = delaunay.voronoi([
    -10000, -10000,
    width + 10000, height + 10000
  ]);

  // Prepare data for join
  const cellData = validNodes.map((node, i) => ({
    node,
    cell: voronoiDiagram.cellPolygon(i)
  })).filter(d => d.cell);

  // Use data join to update cells without destroying hover states
  const pathEl = voronoiLayer.selectAll('path')
    .data(cellData, d => d.node ? d.node.id : d.id) // Handle both wrapped and unwrapped data
    .join(
      enter => {
        // New cells - keep full data structure
        const path = enter.append('path')
          .style('cursor', 'pointer')
          .style('pointer-events', 'all');
        return path;
      },
      update => update, // Existing cells - keep them
      exit => exit.remove() // Removed cells
    );

  // Update all cells (enter + update)
  pathEl.each(function(d) {
    const element = d3.select(this);
    const node = d.node;
    const cell = d.cell;
    
    if (!cell || !node) return;
    
    // Feature nodes should be invisible and non-interactive
    const isFeatureNode = node.type !== 'cluster';
    
    // Only update if not currently hovered
    const isHovered = element.attr('data-is-hovered') === 'true';
    
    const fillColor = node.primary_emotion 
      ? (EMOTION_COLORS[node.primary_emotion] || '#ccc')
      : '#ccc';
    
    const opacity = isFeatureNode ? 0 : calculateVoronoiOpacity(node, state);
    
    element
      .attr('d', `M${cell.join('L')}Z`)
      .attr('fill', fillColor)
      .attr('data-base-opacity', opacity)
      .attr('data-node-type', node.type)
      .style('pointer-events', isFeatureNode ? 'none' : 'all'); // Disable interaction for feature nodes
    
    // Only update opacity if not hovered
    if (!isHovered) {
      element.attr('opacity', opacity);
    }
    
    element
      .attr('stroke', isHovered ? '#000' : '#999')
      .attr('stroke-width', isHovered ? STROKE_WIDTH.VORONOI_HOVER : STROKE_WIDTH.VORONOI)
      .attr('stroke-opacity', isHovered ? 1 : (isFeatureNode ? 0 : 0.5));
  });

  // Mouse events (only for cluster nodes, feature nodes have pointer-events: none)
  pathEl
      .on('mouseover', function(event, d) {
        const node = d.node;
        // Skip if feature node (shouldn't happen due to pointer-events, but extra safety)
        if (node.type !== 'cluster') return;
        // Don't show tooltip if node is being dragged
        if (node.isDragging) return;
        
        const element = d3.select(this);
        // Stop any ongoing transitions that might interfere
        element.interrupt();
        
        // Mark as hovered
        element.attr('data-is-hovered', 'true');
        
        element
          .attr('opacity', VORONOI_OPACITY.HOVER)
          .attr('stroke', '#000')
          .attr('stroke-width', STROKE_WIDTH.VORONOI_HOVER)
          .attr('stroke-opacity', 1);

        const tooltipContent = createClusterTooltip(node);
        setTooltipData(tooltipContent);
        setTooltipPosition({ x: event.pageX, y: event.pageY });
      })
      .on('mouseout', function(event, d) {
        const node = d.node;
        // Skip if feature node
        if (node.type !== 'cluster') return;
        // Don't clear tooltip if dragging (it's already cleared)
        if (node.isDragging) return;
        
        const element = d3.select(this);
        // Unmark hover
        element.attr('data-is-hovered', null);
        
        const originalOpacity = element.attr('data-base-opacity');
        element
          .attr('opacity', originalOpacity)
          .attr('stroke', '#999')
          .attr('stroke-width', STROKE_WIDTH.VORONOI)
          .attr('stroke-opacity', 0.5);

        setTooltipData(null);
      })
      .on('click', function(event, d) {
        event.stopPropagation();
        const node = d.node;
        // Skip if feature node
        if (node.type !== 'cluster') return;
        if (onNodeClick && node.feature_vector_b64) {
          // Apply debiasing if enabled (applyDebiasingFn already includes biasReductionStrength)
          if (genderBiasSteering || ageBiasSteering) {
            const modifiedNode = applyDebiasingFn(node);
            onNodeClick(modifiedNode);
          } else {
            onNodeClick(node);
          }
        }
      });
};

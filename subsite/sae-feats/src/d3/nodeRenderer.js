/**
 * D3 node rendering functions
 * Pure functions for rendering nodes as circles or pie charts
 */

import * as d3 from 'd3';
import { 
  EMOTION_COLORS,
  NODE_SIZE, 
  STROKE_WIDTH, 
  OPACITY,
  COLORS 
} from '../constants';
import { TOP_EMOTIONS_COUNT } from '../constants/config';
import {
  calculateMeanActivation,
  calculateRelativeActivation,
  getMaxActivationEmotion,
  calculateNodeSize,
  calculateClusterSize,
  createPieChartData,
  calculateRotationToCenter
} from '../utils';

/**
 * Calculate node size based on current state and filters
 * @param {Object} node - Node data
 * @param {Object} state - Current visualization state
 * @returns {number} Calculated node size
 */
export const calculateDynamicNodeSize = (node, state) => {
  const {
    hoveredEmotion,
    selectedEmotions,
    showPieCharts,
    useRelativeActivation,
    filterIntensity,
    sizeClustersByFeatures
  } = state;

  // Check if emotions are being filtered
  const hasEmotionFilter = hoveredEmotion || (selectedEmotions.size > 0 && !showPieCharts);

  // For clusters
  if (node.type === 'cluster') {
    if (hasEmotionFilter && node.activations) {
      const emotionsToCheck = hoveredEmotion ? [hoveredEmotion] : Array.from(selectedEmotions);
      const { maxActivation } = getMaxActivationEmotion(
        node.activations,
        emotionsToCheck,
        useRelativeActivation,
        filterIntensity
      );

      return calculateNodeSize(maxActivation, NODE_SIZE.MIN, NODE_SIZE.MAX);
    } else if (sizeClustersByFeatures && node.num_features) {
      return calculateClusterSize(node.num_features);
    }
  }

  // For feature nodes with emotion filter
  if (node.type !== 'cluster' && hasEmotionFilter) {
    const emotionsToCheck = hoveredEmotion ? [hoveredEmotion] : Array.from(selectedEmotions);
    const { maxActivation } = getMaxActivationEmotion(
      node.activations,
      emotionsToCheck,
      useRelativeActivation,
      filterIntensity
    );

    return calculateNodeSize(maxActivation, NODE_SIZE.MIN, NODE_SIZE.MAX);
  }

  // Default size
  return node.size;
};

/**
 * Render cluster node as circle
 * @param {d3.Selection} nodeG - D3 selection for node group
 * @param {Object} node - Node data
 * @param {Object} state - Visualization state
 */
export const renderClusterNode = (nodeG, node, state) => {
  const {
    showPieCharts,
    hoveredEmotion,
    selectedEmotions,
    useRelativeActivation,
    filterIntensity,
    sizeClustersByFeatures,
    genderBiasSteering,
    ageBiasSteering,
    biasReductionStrength,
    showClusters
  } = state;

  const hasEmotionFilter = hoveredEmotion || (selectedEmotions.size > 0 && !showPieCharts);

  if (hasEmotionFilter && node.activations) {
    // Cluster responds to emotion filters
    const emotionsToCheck = hoveredEmotion ? [hoveredEmotion] : Array.from(selectedEmotions);
    const { maxActivation, maxEmotion } = getMaxActivationEmotion(
      node.activations,
      emotionsToCheck,
      useRelativeActivation,
      filterIntensity
    );

    const clusterSize = calculateNodeSize(maxActivation, NODE_SIZE.MIN, NODE_SIZE.MAX);
    const clusterColor = node.primary_emotion ? EMOTION_COLORS[node.primary_emotion] : COLORS.CLUSTER_DEFAULT;

    nodeG.append('circle')
      .attr('class', 'node cluster')
      .attr('r', clusterSize)
      .attr('fill', clusterColor)
      .attr('stroke', COLORS.STROKE_DEFAULT)
      .attr('stroke-width', STROKE_WIDTH.NODE)
      .style('opacity', maxActivation > 0 ? 0.6 : 0.1);
  } else {
    // Default cluster rendering
    let clusterSize = node.size;
    if (sizeClustersByFeatures && node.num_features) {
      clusterSize = calculateClusterSize(node.num_features);
    }

    const clusterColor = (sizeClustersByFeatures && node.primary_emotion)
      ? (EMOTION_COLORS[node.primary_emotion] || COLORS.CLUSTER_DEFAULT)
      : COLORS.CLUSTER_DEFAULT;

    nodeG.append('circle')
      .attr('class', 'node cluster')
      .attr('r', clusterSize)
      .attr('fill', clusterColor)
      .attr('stroke-width', STROKE_WIDTH.NODE)
      .style('opacity', showClusters ? OPACITY.CLUSTER_VISIBLE : OPACITY.CLUSTER_HIDDEN);
  }
};

/**
 * Render feature node as circle (simple mode)
 * @param {d3.Selection} nodeG - D3 selection for node group
 * @param {Object} node - Node data
 * @param {Object} state - Visualization state
 */
export const renderFeatureNodeCircle = (nodeG, node, state) => {
  const {
    hoveredEmotion,
    selectedEmotions,
    useRelativeActivation,
    filterIntensity
  } = state;

  if (hoveredEmotion) {
    // Hovering an emotion - show nodes sized by activation
    const activation = node.activations?.[hoveredEmotion] || 0;
    const adjustedActivation = useRelativeActivation
      ? calculateRelativeActivation(
          activation,
          calculateMeanActivation(node.activations),
          filterIntensity / 100
        )
      : activation;

    const scaledSize = calculateNodeSize(adjustedActivation, NODE_SIZE.MIN, NODE_SIZE.MAX);
    const nodeColor = node.primary_emotion ? EMOTION_COLORS[node.primary_emotion] : COLORS.GRAY_MEDIUM;

    nodeG.append('circle')
      .attr('class', 'node feature')
      .attr('r', scaledSize)
      .attr('fill', nodeColor)
      .attr('stroke', COLORS.STROKE_DEFAULT)
      .attr('stroke-width', STROKE_WIDTH.NODE)
      .style('opacity', adjustedActivation > 0 ? OPACITY.NODE_ACTIVE : OPACITY.NODE_INACTIVE);
  } else if (selectedEmotions.size > 0) {
    // Emotions are selected
    const { maxActivation } = getMaxActivationEmotion(
      node.activations,
      Array.from(selectedEmotions),
      useRelativeActivation,
      filterIntensity
    );

    const scaledSize = calculateNodeSize(maxActivation, NODE_SIZE.MIN, NODE_SIZE.MAX);
    const nodeColor = node.primary_emotion ? EMOTION_COLORS[node.primary_emotion] : COLORS.GRAY_MEDIUM;

    nodeG.append('circle')
      .attr('class', 'node feature')
      .attr('r', scaledSize)
      .attr('fill', nodeColor)
      .attr('stroke', COLORS.STROKE_DEFAULT)
      .attr('stroke-width', STROKE_WIDTH.NODE)
      .style('opacity', maxActivation > 0 ? OPACITY.NODE_ACTIVE : OPACITY.NODE_INACTIVE);
  } else {
    // Default: solid circles
    nodeG.append('circle')
      .attr('class', 'node feature')
      .attr('r', node.size)
      .attr('fill', EMOTION_COLORS[node.primary_emotion] || COLORS.GRAY_MEDIUM)
      .attr('stroke', COLORS.STROKE_DEFAULT)
      .attr('stroke-width', STROKE_WIDTH.NODE);
  }
};

/**
 * Render feature node as pie chart
 * @param {d3.Selection} nodeG - D3 selection for node group
 * @param {Object} node - Node data
 * @param {number} centerX - SVG center X
 * @param {number} centerY - SVG center Y
 */
export const renderFeatureNodePie = (nodeG, node, centerX, centerY) => {
  const pieChartData = createPieChartData(
    node.activations,
    node.primary_emotion,
    EMOTION_COLORS,
    TOP_EMOTIONS_COUNT
  );

  // Create pie generator
  const pie = d3.pie()
    .value(d => d.value)
    .sort(null);

  // Calculate rotation to point primary emotion toward center
  const angleToCenter = Math.atan2(centerY - node.y, centerX - node.x);
  const pieData = pie(pieChartData);
  
  let primarySliceAngle = 0;
  pieData.forEach(slice => {
    if (slice.data.isPrimary) {
      primarySliceAngle = (slice.startAngle + slice.endAngle) / 2;
    }
  });

  const rotationDegrees = (angleToCenter * 180 / Math.PI) - (primarySliceAngle * 180 / Math.PI);

  // Create arc generator
  const arc = d3.arc()
    .innerRadius(0)
    .outerRadius(node.size);

  // Create rotated pie group
  const pieGroup = nodeG.append('g')
    .attr('class', 'pie-group')
    .attr('transform', `rotate(${rotationDegrees})`);

  // Draw pie slices
  pieGroup.selectAll('path.pie-slice')
    .data(pieData)
    .join('path')
    .attr('class', 'pie-slice')
    .attr('d', arc)
    .attr('fill', d => d.data.color)
    .attr('stroke', COLORS.STROKE_DEFAULT)
    .attr('stroke-width', STROKE_WIDTH.PIE);
};

/**
 * Main render function for all nodes
 * @param {d3.Selection} nodeGroups - D3 selection of node groups
 * @param {Object} state - Visualization state
 * @param {number} width - SVG width
 * @param {number} height - SVG height
 */
export const renderNodes = (nodeGroups, state, width, height) => {
  const { showPieCharts, selectedEmotions, hoveredEmotion } = state;
  const centerX = width / 2;
  const centerY = height / 2;

  nodeGroups.each(function(d) {
    const nodeG = d3.select(this);
    nodeG.selectAll('*').remove(); // Clear existing visuals

    if (d.type === 'cluster') {
      renderClusterNode(nodeG, d, state);
    } else if (showPieCharts) {
      renderFeatureNodePie(nodeG, d, centerX, centerY);
    } else {
      renderFeatureNodeCircle(nodeG, d, state);
    }
  });
};

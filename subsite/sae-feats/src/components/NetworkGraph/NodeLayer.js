/**
 * NodeLayer - Manages node rendering and interactions
 * Separates node-specific logic from main NetworkGraph
 */

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { renderNodes, calculateDynamicNodeSize } from '../../d3/nodeRenderer';
import { useVisualization, useAnnotationContext, useTooltipContext } from '../../contexts';
import { decodeBase64Vector, encodeVectorToBase64, applyDebiasing } from '../../utils';

/**
 * NodeLayer component - renders and manages graph nodes
 * @param {Object} props
 * @param {d3.Selection} props.gSelection - Parent SVG group
 * @param {Array} props.nodes - Graph nodes
 * @param {Object} props.biasMeanVectors - Bias vectors for debiasing
 * @param {number} props.width - SVG width
 * @param {number} props.height - SVG height
 * @param {Object} props.simulation - D3 force simulation
 */
export const NodeLayer = ({ 
  gSelection, 
  nodes, 
  biasMeanVectors,
  width, 
  height,
  simulation 
}) => {
  const nodeGroupRef = useRef(null);
  
  const visualSettings = useVisualization();
  const { addAnnotation } = useAnnotationContext();
  const { setTooltipData, setTooltipPosition } = useTooltipContext();

  // Extract settings for easier access
  const {
    showNodes,
    showPieCharts,
    hoveredEmotion,
    useRelativeActivation,
    selectedEmotions,
    sizeClustersByFeatures,
    filterIntensity,
    genderBiasSteering,
    ageBiasSteering
  } = visualSettings;

  const biasReductionStrength = visualSettings.biasReductionStrength;

  // Initialize node layer
  useEffect(() => {
    if (!gSelection || !nodes || nodes.length === 0) return;

    // Create node group if it doesn't exist
    let nodeGroup = gSelection.select('g.nodes');
    if (nodeGroup.empty()) {
      nodeGroup = gSelection.append('g').attr('class', 'nodes');
    }

    // Create node groups for each node
    const nodeSelection = nodeGroup.selectAll('g.node-group')
      .data(nodes, d => d.id)
      .join('g')
      .attr('class', d => `node-group ${d.type}`)
      .call(d3.drag()
        .on('start', (event, d) => {
          if (!event.active && simulation) simulation.alphaTarget(1).restart();
          d.fx = d.x;
          d.fy = d.y;
          d.isDragging = true; // Mark as dragging
          setTooltipData(null); // Clear tooltip when drag starts
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active && simulation) simulation.alphaTarget(1);
          d.fx = null;
          d.fy = null;
          d.isDragging = false; // Unmark dragging
        }))
      .on('mouseover', (event, d) => {
        // Don't show tooltip while dragging
        if (d.isDragging) return;
        
        if (d.type === 'feature' || (d.type === 'cluster' && d.feature_vector_b64)) {
          setTooltipData(d);
          setTooltipPosition({ x: event.pageX, y: event.pageY });
        }
      })
      .on('mouseout', (event, d) => {
        // Don't clear tooltip if dragging (it's already cleared)
        if (d.isDragging) return;
        setTooltipData(null);
      })
      .on('click', (event, d) => {
        if (d.type === 'feature' || (d.type === 'cluster' && d.feature_vector_b64)) {
          event.stopPropagation();
          
          // Apply debiasing if enabled
          if (d.feature_vector_b64 && (genderBiasSteering || ageBiasSteering)) {
            const originalB64 = d.feature_vector_b64;
            const originalVector = decodeBase64Vector(originalB64);
            const debiasedVector = applyDebiasing(
              originalVector,
              biasMeanVectors,
              {
                genderBiasSteering,
                ageBiasSteering,
                biasReductionStrength: biasReductionStrength / 100
              }
            );
            const debiasedB64 = encodeVectorToBase64(debiasedVector);
            const modifiedNode = {
              ...d,
              feature_vector_b64: debiasedB64,
              original_feature_vector_b64: originalB64
            };
            addAnnotation(modifiedNode);
          } else {
            addAnnotation(d);
          }
        }
      });

    nodeGroupRef.current = nodeSelection;

    // Initial render
    const state = {
      showPieCharts,
      hoveredEmotion,
      selectedEmotions,
      useRelativeActivation,
      filterIntensity,
      sizeClustersByFeatures,
      showClusters: visualSettings.showClusters
    };
    renderNodes(nodeSelection, state, width, height);

  }, [
    gSelection,
    nodes,
    width,
    height,
    simulation,
    biasMeanVectors,
    genderBiasSteering,
    ageBiasSteering,
    biasReductionStrength
  ]);

  // Re-render when visualization settings change
  useEffect(() => {
    if (!nodeGroupRef.current) return;

    const state = {
      showPieCharts,
      hoveredEmotion,
      selectedEmotions,
      useRelativeActivation,
      filterIntensity,
      sizeClustersByFeatures,
      genderBiasSteering,
      ageBiasSteering,
      biasReductionStrength,
      showClusters: visualSettings.showClusters
    };

    renderNodes(nodeGroupRef.current, state, width, height);
  }, [
    showPieCharts,
    hoveredEmotion,
    selectedEmotions,
    useRelativeActivation,
    filterIntensity,
    sizeClustersByFeatures,
    genderBiasSteering,
    ageBiasSteering,
    biasReductionStrength,
    nodes,
    biasMeanVectors,
    visualSettings.showClusters,
    width,
    height
  ]);

  // Update node sizes on zoom (called from parent)
  useEffect(() => {
    if (!nodeGroupRef.current) return;

    const updateNodeSizes = () => {
      const state = {
        showPieCharts,
        hoveredEmotion,
        selectedEmotions,
        useRelativeActivation,
        filterIntensity,
        sizeClustersByFeatures,
        showClusters: visualSettings.showClusters
      };

      nodeGroupRef.current.each(function(d) {
        const nodeSize = calculateDynamicNodeSize(d, state);
        d3.select(this).select('circle').attr('r', nodeSize);
      });
    };

    // Expose function for zoom handler
    window.updateNodeSizes = updateNodeSizes;

    return () => {
      window.updateNodeSizes = null;
    };
  }, [
    showPieCharts,
    hoveredEmotion,
    selectedEmotions,
    useRelativeActivation,
    filterIntensity,
    sizeClustersByFeatures,
    visualSettings.showClusters
  ]);

  // Toggle node visibility based on showNodes setting
  useEffect(() => {
    if (!nodeGroupRef.current) return;

    nodeGroupRef.current.style('display', showNodes ? null : 'none');
  }, [showNodes]);

  return null; // This is a renderless component
};

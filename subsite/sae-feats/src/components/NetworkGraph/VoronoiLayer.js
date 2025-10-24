/**
 * VoronoiLayer - Manages Voronoi cell rendering
 * Provides click targets and visual clustering
 */

import { useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';
import { renderVoronoi } from '../../d3/voronoiRenderer';
import { useVisualization, useAnnotationContext, useTooltipContext } from '../../contexts';
import { decodeBase64Vector, encodeVectorToBase64, applyDebiasing } from '../../utils';

/**
 * VoronoiLayer component - renders Voronoi cells for clusters
 * @param {Object} props
 * @param {d3.Selection} props.gSelection - Parent SVG group
 * @param {Array} props.nodes - Graph nodes
 * @param {Object} props.biasMeanVectors - Bias vectors
 * @param {number} props.width - SVG width
 * @param {number} props.height - SVG height
 */
export const VoronoiLayer = ({ 
  gSelection, 
  nodes, 
  biasMeanVectors,
  width, 
  height,
  tickCount
}) => {
  const voronoiLayerRef = useRef(null);
  
  const visualSettings = useVisualization();
  const { addAnnotation } = useAnnotationContext();
  const { setTooltipData, setTooltipPosition } = useTooltipContext();

  const {
    showVoronoi,
    showPieCharts,
    hoveredEmotion,
    selectedEmotions,
    useRelativeActivation,
    filterIntensity,
    genderBiasSteering,
    ageBiasSteering,
    biasReductionStrength
  } = visualSettings;

  // Helper function to apply debiasing
  const applyDebiasingFn = useCallback((node) => {
    if (!node.feature_vector_b64) return node;
    
    const originalB64 = node.feature_vector_b64;
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
    return {
      ...node,
      feature_vector_b64: debiasedB64,
      original_feature_vector_b64: originalB64
    };
  }, [biasMeanVectors, genderBiasSteering, ageBiasSteering, biasReductionStrength]);

  // Initialize Voronoi layer
  useEffect(() => {
    if (!gSelection) return;

    // Create voronoi layer if it doesn't exist
    let voronoiLayer = gSelection.select('g.voronoi-layer');
    if (voronoiLayer.empty()) {
      voronoiLayer = gSelection.append('g')
        .attr('class', 'voronoi-layer')
        .style('pointer-events', 'none');
    }

    voronoiLayerRef.current = voronoiLayer;

    // Raise to top for proper z-index
    voronoiLayer.raise();

  }, [gSelection]);

  // Render Voronoi cells when settings or nodes change
  useEffect(() => {
    if (!voronoiLayerRef.current || !nodes || nodes.length === 0) return;

    const state = {
      showVoronoi,
      showPieCharts,
      hoveredEmotion,
      selectedEmotions,
      useRelativeActivation,
      filterIntensity,
      genderBiasSteering,
      ageBiasSteering
    };

    renderVoronoi(
      voronoiLayerRef.current,
      nodes,
      state,
      width,
      height,
      setTooltipData,
      setTooltipPosition,
      addAnnotation,
      applyDebiasingFn
    );

  }, [
    nodes,
    showVoronoi,
    showPieCharts,
    hoveredEmotion,
    selectedEmotions,
    useRelativeActivation,
    filterIntensity,
    genderBiasSteering,
    ageBiasSteering,
    biasReductionStrength,
    width,
    height,
    tickCount,
    setTooltipData,
    setTooltipPosition,
    addAnnotation,
    applyDebiasingFn
  ]);

  // Toggle pointer events based on showVoronoi
  useEffect(() => {
    if (!voronoiLayerRef.current) return;

    voronoiLayerRef.current
      .style('pointer-events', showVoronoi ? 'all' : 'none');

  }, [showVoronoi]);

  return null; // Renderless component
};

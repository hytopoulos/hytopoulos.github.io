/**
 * HeatmapLayer - Renders hexbin-based activation heatmap
 * Uses IDW interpolation for smooth gradients
 */

import { useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';
import { hexbin as d3Hexbin } from 'd3-hexbin';
import { SpatialHash } from '../../utils/spatialHash';
import { 
  generateHexGrid, 
  calculateHexbinActivations 
} from '../../utils/heatmapCalculations';

/**
 * HeatmapLayer component - renders emotion activation heatmap using selected emotions from filter
 * @param {Object} gSelection - D3 selection of main g element
 * @param {Array} nodes - Graph nodes
 * @param {boolean} showHeatmap - Show/hide heatmap
 * @param {Set} selectedEmotions - Selected emotions from filter pane
 * @param {Object} debiasedActivations - Map of debiased activations
 * @param {boolean} genderBiasSteering - Gender bias steering enabled
 * @param {boolean} ageBiasSteering - Age bias steering enabled
 * @param {boolean} useRelativeActivation - Use relative activation
 * @param {number} filterIntensity - Filter intensity percentage
 * @param {number} tickCount - Simulation tick count for updates
 */
export const HeatmapLayer = ({
  gSelection,
  nodes,
  showHeatmap,
  selectedEmotions,
  debiasedActivations,
  genderBiasSteering,
  ageBiasSteering,
  useRelativeActivation,
  filterIntensity,
  tickCount
}) => {
  const hexbinLayerRef = useRef(null);
  const hexbinGeneratorRef = useRef(null);

  // Initialize layer
  useEffect(() => {
    if (!gSelection) return;

    hexbinLayerRef.current = gSelection.select('g.hexbin-layer');

    // Setup hexbin generator
    const hexbinGenerator = d3Hexbin()
      .x(d => d.x)
      .y(d => d.y)
      .radius(35)
      .extent([[0, 0], [2000, 2000]]); // Large extent to cover all nodes
    
    hexbinGeneratorRef.current = hexbinGenerator;

  }, [gSelection]);

  // Render heatmap
  const renderHeatmap = useCallback(() => {
    if (!hexbinLayerRef.current || !hexbinGeneratorRef.current) return;
    
    if (!showHeatmap || !selectedEmotions || selectedEmotions.size === 0) {
      // Clear everything when heatmap disabled or no emotions selected
      hexbinLayerRef.current.selectAll('*').remove();
      return;
    }

    // Get all nodes with positions and activations
    const activeNodes = nodes.filter(n => 
      n.x !== undefined && n.y !== undefined && n.activations
    );

    if (activeNodes.length === 0) return;

    // Generate hex grid covering node bounds
    const hexCenters = generateHexGrid(activeNodes, 35, 300);

    // Create spatial hash for efficient lookups
    const spatialHash = new SpatialHash(activeNodes, 200);

    // Calculate activations for each hex center
    const bins = calculateHexbinActivations(
      hexCenters,
      activeNodes,
      selectedEmotions,
      spatialHash,
      {
        debiasedActivations,
        genderBiasSteering,
        ageBiasSteering,
        useRelativeActivation,
        filterIntensity
      }
    );

    // Add black background for better contrast
    hexbinLayerRef.current.selectAll('rect.heatmap-bg').remove();
    if (bins.some(b => b.meanActivation > 0)) {
      hexbinLayerRef.current.insert('rect', ':first-child')
        .attr('class', 'heatmap-bg')
        .attr('x', -10000)
        .attr('y', -10000)
        .attr('width', 20000)
        .attr('height', 20000)
        .attr('fill', '#000')
        .attr('opacity', 0.7);
    }

    // Color scale - using Plasma (better on dark backgrounds)
    const maxActivation = d3.max(bins, d => d.meanActivation) || 1;
    const colorScale = d3.scaleSequential(d3.interpolatePlasma)
      .domain([0, maxActivation]);

    // Render hexagons
    hexbinLayerRef.current.selectAll('path.hexagon')
      .data(bins)
      .join('path')
      .attr('class', 'hexagon')
      .attr('d', hexbinGeneratorRef.current.hexagon())
      .attr('transform', d => `translate(${d.x},${d.y}) rotate(30)`)
      .attr('fill', d => d.meanActivation > 0 ? colorScale(d.meanActivation) : 'rgba(0,0,0,0)')
      .attr('fill-opacity', d => {
        // Higher opacity for better visibility on black background
        if (d.meanActivation === 0) return 0;
        const normalized = d.meanActivation / maxActivation;
        return 0.7 + (normalized * 0.3); // Range: 0.7 to 1.0
      })
      .attr('stroke', 'rgba(255,255,255,0.2)')
      .attr('stroke-width', 0.5);

  }, [
    nodes,
    showHeatmap,
    selectedEmotions,
    debiasedActivations,
    genderBiasSteering,
    ageBiasSteering,
    useRelativeActivation,
    filterIntensity
  ]);

  // Trigger render on updates
  useEffect(() => {
    renderHeatmap();
  }, [renderHeatmap, tickCount]);

  return null; // Renderless component
};

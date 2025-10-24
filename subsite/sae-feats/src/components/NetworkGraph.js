/**
 * NetworkGraph
 * 
 * Orchestrator that delegates to layer components.
 */

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import './NetworkGraph.css';

// Layer components
import {
  NodeLayer,
  VoronoiLayer,
  LinkLayer,
  HeatmapLayer,
  ThumbnailLayer,
  AnnotationLineLayer
} from './NetworkGraph/index.js';
import { AnnotationWindowManager } from './AnnotationWindowManager';

// Hooks
import {
  useBiasComputation,
  useGraphData,
  useWindowDimensions,
  useForceSimulation,
  useAnnotationPositioning
} from '../hooks';
import { useVisualization, useAnnotationContext } from '../contexts';

// Constants
import { ZOOM, STROKE_WIDTH } from '../constants';

function NetworkGraph() {
  // ============================================================================
  // STATE & CONTEXT
  // ============================================================================
  
  const visualSettings = useVisualization();
  const { annotations, removeAnnotation } = useAnnotationContext();

  const {
    showClusters,
    selectedEmotions,
    showHeatmap,
    useRelativeActivation,
    filterIntensity,
    genderBiasSteering,
    ageBiasSteering,
    biasReductionStrength
  } = visualSettings;

  // Load graph data
  const { data: graphData, loading, error } = useGraphData();
  
  // Compute bias vectors
  const { biasMeanVectors, debiasedActivations } = useBiasComputation(
    graphData?.nodes || [],
    genderBiasSteering,
    ageBiasSteering,
    biasReductionStrength
  );

  // ============================================================================
  // REFS
  // ============================================================================
  
  const svgRef = useRef();
  const gRef = useRef();
  const transformRef = useRef(d3.zoomIdentity);

  // Dimensions
  const dimensions = useWindowDimensions();

  // Tick counter to trigger layer updates during simulation
  const [tickCount, setTickCount] = useState(0);

  // Annotation elements ref
  const annotationElementsRef = useRef(new Map());
  
  // Track collapsed annotations
  const collapsedAnnotationsRef = useRef(new Set());

  // ============================================================================
  // GRAPH DATA FILTERING
  // ============================================================================
  
  const getFilteredData = () => {
    if (!graphData) return { nodes: [], links: [] };

    if (showClusters) {
      return {
        nodes: graphData.nodes,
        links: graphData.links
      };
    } else {
      // Filter out cluster nodes
      const featureNodes = graphData.nodes.filter(n => n.type !== 'cluster');
      const featureNodeIds = new Set(featureNodes.map(n => n.id));
      const featureLinks = graphData.links.filter(
        l => featureNodeIds.has(l.source.id || l.source) && 
             featureNodeIds.has(l.target.id || l.target)
      );
      
      return {
        nodes: featureNodes,
        links: featureLinks
      };
    }
  };

  const { nodes, links } = getFilteredData();

  // Track collapsed annotations for line rendering
  useEffect(() => {
    const handleShowThumbnail = (e) => {
      collapsedAnnotationsRef.current.add(e.detail.annotationId);
    };
    
    const handleHideThumbnail = (e) => {
      collapsedAnnotationsRef.current.delete(e.detail);
    };
    
    const handleCleanup = (e) => {
      collapsedAnnotationsRef.current.delete(e.detail);
    };
    
    window.addEventListener('show-annotation-thumbnail', handleShowThumbnail);
    window.addEventListener('hide-annotation-thumbnail', handleHideThumbnail);
    window.addEventListener('cleanup-annotation', handleCleanup);
    
    return () => {
      window.removeEventListener('show-annotation-thumbnail', handleShowThumbnail);
      window.removeEventListener('hide-annotation-thumbnail', handleHideThumbnail);
      window.removeEventListener('cleanup-annotation', handleCleanup);
    };
  }, []);

  // Annotation positioning
  const { updatePositions, updatePositionsRef } = useAnnotationPositioning(
    annotations,
    nodes,
    svgRef,
    transformRef,
    annotationElementsRef
  );

  // ============================================================================
  // SVG SETUP & ZOOM
  // ============================================================================
  
  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;

    const { width, height } = dimensions;

    // Clear previous
    d3.select(svgRef.current).selectAll('*').remove();

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('class', 'network-svg');

    // Create main group for zoom/pan
    const g = svg.append('g').attr('class', 'main-group');
    gRef.current = g;

    // Setup zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([ZOOM.MIN_SCALE, ZOOM.MAX_SCALE])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        transformRef.current = event.transform;
        
        // Update link stroke width on zoom
        g.selectAll('line.link')
          .attr('stroke-width', STROKE_WIDTH.LINK / event.transform.k);
        
        // Update annotation positions (via hook)
        if (updatePositionsRef.current) {
          updatePositionsRef.current(event.transform);
        }
      });

    const initialScale = ZOOM.MIN_SCALE * 2;
    const centerTransform = d3.zoomIdentity
      .translate(width / 2, height / 2)
      .scale(initialScale)
      .translate(-width / 2, -height / 2);

    svg.call(zoom)
      .call(zoom.transform, centerTransform);

    // Create layer groups in correct z-order (bottom to top)
    g.append('g').attr('class', 'links-layer');
    g.append('g').attr('class', 'nodes-layer'); // Nodes visual layer (below voronoi)
    g.append('g').attr('class', 'voronoi-layer').style('pointer-events', 'all'); // On top for hit detection
    g.append('g').attr('class', 'hexbin-layer').style('pointer-events', 'none'); // Heatmap overlay
    g.append('g').attr('class', 'annotation-layer');

  }, [nodes.length, dimensions, updatePositionsRef]);

  // ============================================================================
  // FORCE SIMULATION
  // ============================================================================
  
  const simulationRef = useForceSimulation(nodes, links, gRef, dimensions, {
    onTick: (tickCounter) => {
      // Update annotation positions
      if (updatePositionsRef.current && transformRef.current) {
        updatePositionsRef.current(transformRef.current);
      }
      
      // Trigger layer updates every 15 ticks
      if (tickCounter % 15 === 0) {
        setTickCount(prev => prev + 1);
      }
    }
  });

  // ============================================================================
  // RENDER
  // ============================================================================
  
  if (loading) return <div>Loading graph...</div>;
  if (error) return <div>Error loading graph: {error.message}</div>;
  if (!graphData) return null;

  return (
    <div className="network-graph-container">
      <svg ref={svgRef} className="network-graph" />
      
      {/* Layer components handle their own rendering */}
      {gRef.current && (
        <>
          <LinkLayer
            gSelection={gRef.current}
            links={links}
            transform={transformRef.current}
            simulation={simulationRef.current}
          />
          
          <NodeLayer
            gSelection={gRef.current}
            nodes={nodes}
            biasMeanVectors={biasMeanVectors}
            width={dimensions.width}
            height={dimensions.height}
            simulation={simulationRef.current}
          />
          
          <HeatmapLayer
            gSelection={gRef.current}
            nodes={nodes}
            showHeatmap={showHeatmap}
            selectedEmotions={selectedEmotions}
            debiasedActivations={debiasedActivations}
            genderBiasSteering={genderBiasSteering}
            ageBiasSteering={ageBiasSteering}
            useRelativeActivation={useRelativeActivation}
            filterIntensity={filterIntensity}
            tickCount={tickCount}
          />
          
          <VoronoiLayer
            gSelection={gRef.current}
            nodes={nodes}
            width={dimensions.width}
            height={dimensions.height}
            tickCount={tickCount}
            transform={transformRef.current}
            onThumbnailClick={(annotationId) => {
              // Dispatch expand event when thumbnail is clicked
              window.dispatchEvent(new CustomEvent('expand-annotation', { detail: annotationId }));
            }}
          />
          
          <ThumbnailLayer
            gSelection={gRef.current}
            nodes={nodes}
            transform={transformRef.current}
            collapsedAnnotations={collapsedAnnotationsRef.current}
            onThumbnailClick={(annotationId) => {
              // Dispatch expand event when thumbnail is clicked
              window.dispatchEvent(new CustomEvent('expand-annotation', { detail: annotationId }));
            }}
          />
          
          <AnnotationLineLayer
            gSelection={gRef.current}
            annotations={annotations}
            nodes={nodes}
            collapsedAnnotations={collapsedAnnotationsRef.current}
          />
        </>
      )}

      {/* Annotation windows */}
      <AnnotationWindowManager
        annotations={annotations}
        nodes={nodes}
        svgRef={svgRef}
        onClose={removeAnnotation}
        annotationElementsRef={annotationElementsRef}
        biasMeanVectors={biasMeanVectors}
        genderBiasSteering={genderBiasSteering}
        ageBiasSteering={ageBiasSteering}
        biasReductionStrength={biasReductionStrength}
      />
    </div>
  );
}

export default NetworkGraph;

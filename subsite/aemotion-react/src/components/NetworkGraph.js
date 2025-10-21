import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { hexbin as d3Hexbin } from 'd3-hexbin';
import graphData from '../data.json';
import './NetworkGraph.css';

const COLORS = [
  '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b',
  '#e377c2', '#7f7f7f', '#bcbd22', '#17becf', '#aec7e8', '#ffbb78'
];

function NetworkGraph({ showClusters, setTooltipData, setTooltipPosition, onNodeClick, annotations, activeDemographics }) {
  const svgRef = useRef();
  const simulationRef = useRef();
  const transformRef = useRef(d3.zoomIdentity);
  const annotationsRef = useRef(annotations);
  const annotationGroupRef = useRef(null);
  const hexbinLayerRef = useRef(null);
  const hexbinGeneratorRef = useRef(null);
  const nodesDataRef = useRef([]);
  const activeDemographicsRef = useRef(activeDemographics);

  // Update refs when props change
  annotationsRef.current = annotations;
  activeDemographicsRef.current = activeDemographics;

  useEffect(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Clear previous SVG
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g');

    // Zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.1, 10])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        transformRef.current = event.transform;
        
        // Keep nodes constant size relative to zoom
        const scale = event.transform.k;
        g.selectAll('circle.node')
          .attr('r', d => d.size / scale)
          .attr('stroke-width', 1.5 / scale);
        
        g.selectAll('line.link')
          .attr('stroke-width', 1 / scale);
        
        // Heatmap stays static - doesn't scale with zoom
        
        // Scale thumbnails inversely
        const thumbnailSize = 60 / scale;
        thumbnailLayer.selectAll('image')
          .each(function() {
            const img = d3.select(this);
            const cx = parseFloat(img.attr('x')) + 30; // center x (60/2)
            const cy = parseFloat(img.attr('y')) + 30; // center y
            img.attr('x', cx - thumbnailSize/2)
               .attr('y', cy - thumbnailSize/2)
               .attr('width', thumbnailSize)
               .attr('height', thumbnailSize);
          });
        
        thumbnailLayer.selectAll('rect')
          .each(function() {
            const rect = d3.select(this);
            const cx = parseFloat(rect.attr('x')) + 30;
            const cy = parseFloat(rect.attr('y')) + 30;
            rect.attr('x', cx - thumbnailSize/2)
                .attr('y', cy - thumbnailSize/2)
                .attr('width', thumbnailSize)
                .attr('height', thumbnailSize)
                .attr('stroke-width', 3 / scale);
          });
        
        // Scale annotation boxes inversely
        annotationGroup.selectAll('g.annotation-group')
          .each(function(d) {
            const nodeData = graphData.nodes.find(n => n.id === d.nodeId);
            if (nodeData && !d.isDragging) {
              // Use custom offset if set by dragging (data space), otherwise use default
              const offsetX = d.dragOffsetX !== undefined ? d.dragOffsetX : 20 / scale;
              const offsetY = d.dragOffsetY !== undefined ? d.dragOffsetY : -300 / scale;
              
              const annotationGroup = d3.select(this);
              annotationGroup.attr('transform', `translate(${nodeData.x + offsetX}, ${nodeData.y + offsetY}) scale(${1/scale})`);
              
              // Update connector line (compensate for inverse scale of parent)
              annotationGroup.select('.connector-line')
                .attr('x2', 0)
                .attr('y2', 25)
                .attr('x1', -offsetX * scale)
                .attr('y1', -offsetY * scale)
                .attr('stroke-width', 2)
                .attr('stroke-dasharray', '4,4');
            }
          });
      });

    svg.call(zoom);

    // Filter out demographics from emotions
    const demographics = ['Male', 'Female', 'Kid', 'Adult'];
    const actualEmotions = graphData.emotions.filter(e => !demographics.includes(e));
    
    // Create emotion color map
    const emotionColors = {};
    actualEmotions.forEach((emotion, i) => {
      emotionColors[emotion] = COLORS[i % COLORS.length];
    });

    // Radial force to keep nodes at target positions
    function radialForce() {
      return () => {
        const k = 0.5;
        graphData.nodes.forEach(d => {
          const dx = d.x - (width / 2 + d.target_x);
          const dy = d.y - (height / 2 + d.target_y);
          d.vx -= dx * k;
          d.vy -= dy * k;
        });
      };
    }

    // Initialize positions
    graphData.nodes.forEach(d => {
      d.x = width / 2 + d.target_x;
      d.y = height / 2 + d.target_y;
    });

    // Create simulation
    const simulation = d3.forceSimulation(graphData.nodes)
      .force('link', d3.forceLink(graphData.links)
        .id(d => d.id)
        .distance(d => {
          const source = graphData.nodes.find(n => n.id === d.source.id);
          const target = graphData.nodes.find(n => n.id === d.target.id);
          return Math.abs(source.radius - target.radius) || 40;
        })
        .strength(0.8))
      .force('charge', d3.forceManyBody().strength(-30))
      .force('radial', radialForce())
      .force('collide', d3.forceCollide(d => d.size + 2))
      .alphaTarget(0.3)
      .velocityDecay(0.2);

    simulationRef.current = simulation;

    // Create links
    const link = g.append('g')
      .selectAll('line')
      .data(graphData.links)
      .join('line')
      .attr('class', 'link');

    // Create nodes
    const node = g.append('g')
      .selectAll('circle')
      .data(graphData.nodes)
      .join('circle')
      .attr('class', d => `node ${d.type}`)
      .attr('r', d => d.size)
      .attr('fill', d => d.type === 'cluster' ? '#ccc' : emotionColors[d.primary_emotion])
      .style('opacity', d => d.type === 'cluster' ? (showClusters ? 0.3 : 0) : 1)
      .call(d3.drag()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.5).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3);
          d.fx = null;
          d.fy = null;
        }))
      .on('mouseover', (event, d) => {
        if (d.type === 'feature') {
          setTooltipData(d);
          setTooltipPosition({ x: event.pageX, y: event.pageY });
        }
      })
      .on('mouseout', () => {
        setTooltipData(null);
      })
      .on('click', (event, d) => {
        if (d.type === 'feature' && onNodeClick) {
          event.stopPropagation();
          onNodeClick(d);
        }
      });

    // Create annotation container in D3
    const annotationGroup = g.append('g').attr('class', 'annotations');
    annotationGroupRef.current = annotationGroup;
    
    // Create hexbin layer for demographic heatmap (above nodes, below annotations)
    const hexbinLayer = g.append('g')
      .attr('class', 'hexbin-layer')
      .style('pointer-events', 'none');
    
    hexbinLayerRef.current = hexbinLayer;

    // Create hexbin generator (will be set by heatmap function based on baseHexRadius)
    const hexbin = d3Hexbin()
      .extent([[0, 0], [width, height]]);
    
    hexbinGeneratorRef.current = hexbin;
    
    // Create thumbnail layer (above nodes)
    const thumbnailLayer = g.append('g').attr('class', 'thumbnails');

    // Function to render annotations in D3
    const renderAnnotations = () => {
      const currentAnnotations = annotationsRef.current;
      console.log('Rendering annotations:', currentAnnotations.length, currentAnnotations.map(a => a.id));
      
      // Render annotation groups
      const annotationSelection = annotationGroup
        .selectAll('g.annotation-group')
        .data(currentAnnotations, d => d.id);

      // Remove old annotations
      annotationSelection.exit().remove();
      
      console.log('Enter selection size:', annotationSelection.enter().size());
      console.log('Update selection size:', annotationSelection.size());

      // Add new annotation groups
      const annotationEnter = annotationSelection.enter()
        .append('g')
        .attr('class', 'annotation-group');

      // Add connector line from node to annotation (will be updated on drag)
      annotationEnter.append('line')
        .attr('class', 'connector-line')
        .attr('x1', d => {
          const currentScale = transformRef.current.k;
          const offsetX = d.dragOffsetX !== undefined ? d.dragOffsetX : 20 / currentScale;
          return -offsetX * currentScale;
        })
        .attr('y1', d => {
          const currentScale = transformRef.current.k;
          const offsetY = d.dragOffsetY !== undefined ? d.dragOffsetY : -300 / currentScale;
          return -offsetY * currentScale;
        })
        .attr('x2', 0)
        .attr('y2', 25)
        .attr('stroke', d => emotionColors[d.featureData.primary_emotion] || '#999')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '4,4')
        .attr('opacity', 0.6)
        .style('pointer-events', 'none');

      // Add background box
      annotationEnter.append('rect')
        .attr('class', 'annotation-bg')
        .attr('width', 400)
        .attr('height', 500)
        .attr('fill', 'white')
        .attr('stroke', d => emotionColors[d.featureData.primary_emotion] || '#e0e0e0')
        .attr('stroke-width', 2)
        .attr('rx', 12)
        .attr('filter', 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))');

      // Add header
      const header = annotationEnter.append('g')
        .attr('class', 'annotation-header-svg');

      header.append('rect')
        .attr('width', 400)
        .attr('height', 50)
        .attr('fill', 'url(#headerGradient)')
        .attr('rx', 12)
        .style('cursor', 'move');

      header.append('rect')
        .attr('y', 50)
        .attr('width', 400)
        .attr('height', 2)
        .attr('fill', '#ddd');
      
      // Make header draggable
      header.call(d3.drag()
        .on('start', function(event, d) {
          d.isDragging = true;
          const currentScale = transformRef.current.k;
          // Store initial offset in data space
          if (d.dragOffsetX === undefined) d.dragOffsetX = 20 / currentScale;
          if (d.dragOffsetY === undefined) d.dragOffsetY = -300 / currentScale;
        })
        .on('drag', function(event, d) {
          const currentScale = transformRef.current.k;
          // Convert screen-space drag to data-space by dividing by scale
          d.dragOffsetX += event.dx / currentScale;
          d.dragOffsetY += event.dy / currentScale;
          
          // Update position immediately
          const nodeData = graphData.nodes.find(n => n.id === d.nodeId);
          if (nodeData) {
            const annotationGroup = d3.select(this.parentNode);
            annotationGroup.attr('transform', `translate(${nodeData.x + d.dragOffsetX}, ${nodeData.y + d.dragOffsetY}) scale(${1/currentScale})`);
            
            // Update connector line (compensate for inverse scale of parent)
            annotationGroup.select('.connector-line')
              .attr('x2', 0)
              .attr('y2', 25)
              .attr('x1', -d.dragOffsetX * currentScale)
              .attr('y1', -d.dragOffsetY * currentScale)
              .attr('stroke-width', 2)
              .attr('stroke-dasharray', '4,4');
          }
        })
        .on('end', function(event, d) {
          d.isDragging = false;
        }));

      // Add colored circle
      header.append('circle')
        .attr('cx', 18)
        .attr('cy', 25)
        .attr('r', 6)
        .attr('fill', d => emotionColors[d.featureData.primary_emotion] || '#999')
        .attr('stroke', '#000')
        .attr('stroke-width', 1.5);

      // Add text
      header.append('text')
        .attr('x', 32)
        .attr('y', 22)
        .attr('font-size', '14px')
        .attr('font-weight', '600')
        .attr('fill', '#333')
        .text(d => `Feature ${d.featureData.feature_id}`);

      header.append('text')
        .attr('x', 32)
        .attr('y', 38)
        .attr('font-size', '12px')
        .attr('fill', '#666')
        .text(d => d.featureData.primary_emotion);

      // Minimize button
      const minimizeBtn = header.append('g')
        .attr('class', 'minimize-btn')
        .attr('transform', 'translate(340, 15)')
        .style('cursor', 'pointer')
        .on('click', function(e, d) {
          e.stopPropagation();
          d.isMinimized = !d.isMinimized;
          const annotationGroup = d3.select(this.parentNode.parentNode);
          
          // Find the actual node in the graph
          const graphNode = graphData.nodes.find(n => n.id === d.nodeId);
          const nodeSelection = g.selectAll('circle.node').filter(nd => nd === graphNode);
          
          if (d.isMinimized) {
            // Hide the entire annotation
            annotationGroup.style('display', 'none');
            
            // Replace the node with thumbnail image in thumbnail layer (below nodes)
            if (d.topImageUrl && graphNode) {
              // Hide the original circle
              nodeSelection.style('display', 'none');
              
              const thumbnailSize = 60;
              
              // Add thumbnail to thumbnail layer (renders below nodes)
              thumbnailLayer.append('image')
                .attr('class', `thumbnail-node-${d.id}`)
                .attr('href', d.topImageUrl)
                .attr('x', graphNode.x - thumbnailSize/2)
                .attr('y', graphNode.y - thumbnailSize/2)
                .attr('width', thumbnailSize)
                .attr('height', thumbnailSize)
                .attr('preserveAspectRatio', 'xMidYMid slice')
                .style('cursor', 'pointer')
                .on('click', function(clickE) {
                  clickE.stopPropagation();
                  // Restore on click
                  d.isMinimized = false;
                  annotationGroup.style('display', null);
                  nodeSelection.style('display', null);
                  thumbnailLayer.selectAll(`.thumbnail-node-${d.id}`).remove();
                  thumbnailLayer.selectAll(`.thumbnail-border-${d.id}`).remove();
                });
              
              // Add border to thumbnail layer
              thumbnailLayer.append('rect')
                .attr('class', `thumbnail-border-${d.id}`)
                .attr('x', graphNode.x - thumbnailSize/2)
                .attr('y', graphNode.y - thumbnailSize/2)
                .attr('width', thumbnailSize)
                .attr('height', thumbnailSize)
                .attr('fill', 'none')
                .attr('stroke', emotionColors[d.featureData.primary_emotion] || '#999')
                .attr('stroke-width', 3)
                .attr('rx', 4)
                .style('pointer-events', 'none');
            }
          } else {
            // Restore full view
            annotationGroup.style('display', null);
            nodeSelection.style('display', null);
            
            // Remove thumbnails from thumbnail layer
            thumbnailLayer.selectAll(`.thumbnail-node-${d.id}`).remove();
            thumbnailLayer.selectAll(`.thumbnail-border-${d.id}`).remove();
          }
        });

      minimizeBtn.append('circle')
        .attr('r', 12)
        .attr('fill', 'transparent');

      minimizeBtn.append('text')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .attr('font-size', '18px')
        .attr('fill', '#666')
        .text('−');

      minimizeBtn.on('mouseenter', function() {
        d3.select(this).select('circle').attr('fill', '#e0e0e0');
      }).on('mouseleave', function() {
        d3.select(this).select('circle').attr('fill', 'transparent');
      });

      // Close button
      const closeBtn = header.append('g')
        .attr('class', 'close-btn')
        .attr('transform', 'translate(370, 15)')
        .style('cursor', 'pointer')
        .on('click', function(e, d) {
          e.stopPropagation();
          console.log('Close button clicked for annotation:', d.id);
          if (onNodeClick && onNodeClick.close) {
            onNodeClick.close(d.id);
          }
        });

      closeBtn.append('circle')
        .attr('r', 12)
        .attr('fill', 'transparent');

      closeBtn.append('text')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .attr('font-size', '20px')
        .attr('fill', '#666')
        .text('×');

      closeBtn.on('mouseenter', function() {
        d3.select(this).select('circle').attr('fill', '#e0e0e0');
      }).on('mouseleave', function() {
        d3.select(this).select('circle').attr('fill', 'transparent');
      });

      // Create clip path for scrollable area
      const clipId = annotationEnter.append('defs')
        .append('clipPath')
        .attr('id', d => `clip-${d.id}`)
        .append('rect')
        .attr('x', 0)
        .attr('y', 52)
        .attr('width', 400)
        .attr('height', 400);

      // Scrollable container
      const scrollContainer = annotationEnter.append('g')
        .attr('class', 'scroll-container')
        .attr('clip-path', d => `url(#clip-${d.id})`);

      // Image grid inside scrollable container
      const imageGrid = scrollContainer.append('g')
        .attr('class', 'image-grid-svg')
        .attr('transform', 'translate(8, 60)');

      // Add pagination container (will be populated after images load)
      annotationEnter.append('g')
        .attr('class', 'pagination-group')
        .attr('transform', 'translate(0, 465)');

      // Update all annotations (enter + update)
      const allAnnotations = annotationSelection.merge(annotationEnter);
      
      console.log('All annotations size:', allAnnotations.size());
      
      allAnnotations.each(function(d, i) {
        const nodeData = graphData.nodes.find(n => n.id === d.nodeId);
        if (nodeData && nodeData.x !== undefined && nodeData.y !== undefined) {
          // Stagger annotations if multiple are attached to same node
          const offset = i * 30; // Offset each annotation by 30px
          d3.select(this)
            .attr('transform', `translate(${nodeData.x + 20 + offset}, ${nodeData.y - 300})`);
        }
        
        // Trigger image loading for annotations that haven't loaded yet
        if (d.featureData.feature_vector_b64 && !d.imagesLoaded) {
          d.imagesLoaded = true;
          const gridGroup = d3.select(this).select('.image-grid-svg');
          if (gridGroup.size() > 0) {
            loadImagesForAnnotation(d.id, d.featureData.feature_vector_b64, gridGroup, d);
          }
        }
      });
    };

    // Update positions on tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);
      
      // Update annotation positions
      annotationGroup.selectAll('g.annotation-group')
        .each(function(d) {
          const nodeData = graphData.nodes.find(n => n.id === d.nodeId);
          if (nodeData && nodeData.x !== undefined && nodeData.y !== undefined) {
            // Skip if currently being dragged
            if (d.isDragging) return;
            
            // Apply inverse scale to keep constant size
            const currentScale = transformRef.current.k;
            // Use custom offset if set by dragging (already in data space), otherwise use default
            const offsetX = d.dragOffsetX !== undefined ? d.dragOffsetX : 20 / currentScale;
            const offsetY = d.dragOffsetY !== undefined ? d.dragOffsetY : -300 / currentScale;
            
            const annotationGroup = d3.select(this);
            annotationGroup.attr('transform', `translate(${nodeData.x + offsetX}, ${nodeData.y + offsetY}) scale(${1/currentScale})`);
            
            // Update connector line (compensate for inverse scale of parent)
            annotationGroup.select('.connector-line')
              .attr('x2', 0)
              .attr('y2', 25)
              .attr('x1', -offsetX * currentScale)
              .attr('y1', -offsetY * currentScale)
              .attr('stroke-width', 2)
              .attr('stroke-dasharray', '4,4');
            
            // Update thumbnail position if minimized
            if (d.isMinimized) {
              const thumbnailSize = 60 / currentScale;
              thumbnailLayer.select(`.thumbnail-node-${d.id}`)
                .attr('x', nodeData.x - thumbnailSize/2)
                .attr('y', nodeData.y - thumbnailSize/2)
                .attr('width', thumbnailSize)
                .attr('height', thumbnailSize);
              
              thumbnailLayer.select(`.thumbnail-border-${d.id}`)
                .attr('x', nodeData.x - thumbnailSize/2)
                .attr('y', nodeData.y - thumbnailSize/2)
                .attr('width', thumbnailSize)
                .attr('height', thumbnailSize)
                .attr('stroke-width', 3 / currentScale);
            }
          }
        });
      
      // Update hexbin heatmap
      updateHexbinHeatmap();
    });

    // Function to update hexbin heatmap based on demographics
    const updateHexbinHeatmap = () => {
      const currentDemographics = activeDemographicsRef.current;
      
      if (currentDemographics.size === 0) {
        hexbinLayer.selectAll('*').remove();
        return;
      }

      // Get only feature nodes (not clusters) with their positions
      const featureNodes = graphData.nodes
        .filter(d => d.type === 'feature' && d.x !== undefined && d.y !== undefined);

      if (featureNodes.length === 0) {
        console.warn('No feature nodes found for heatmap');
        hexbinLayer.selectAll('*').remove();
        return;
      }

      // Store for use in effect
      nodesDataRef.current = featureNodes;

      // Define hexagon size (SINGLE SOURCE OF TRUTH)
      const baseHexRadius = 100; // Adjust this value to change hexagon size
      
      // Set hexbin generator radius to match
      hexbin.radius(baseHexRadius);
      const currentHexbin = hexbin;
      
      // Create a fixed grid in data space based on node bounds (not viewport)
      // Calculate bounds from all nodes
      const xs = featureNodes.map(n => n.x);
      const ys = featureNodes.map(n => n.y);
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const minY = Math.min(...ys);
      const maxY = Math.max(...ys);
      
      // Add padding around bounds
      const padding = 500;
      const boundMinX = minX - padding;
      const boundMaxX = maxX + padding;
      const boundMinY = minY - padding;
      const boundMaxY = maxY + padding;
      
      // For perfect hexagonal tiling with no gaps (using baseHexRadius defined above)
      const dx = baseHexRadius * Math.sqrt(3); // Horizontal spacing
      const dy = baseHexRadius * 1.5; // Vertical spacing
      const gridPoints = [];
      
      let row = 0;
      for (let y = boundMinY; y <= boundMaxY; y += dy) {
        const xOffset = (row % 2) * (dx / 2); // Offset every other row for hexagonal pattern
        for (let x = boundMinX + xOffset; x <= boundMaxX; x += dx) {
          gridPoints.push([x, y]);
        }
        row++;
      }
      
      // Generate hexbins from grid points
      const bins = currentHexbin(gridPoints);

      // Build spatial index (quadtree) for fast nearest neighbor queries
      const quadtree = d3.quadtree()
        .x(d => d.x)
        .y(d => d.y)
        .addAll(featureNodes);
      
      // First pass: calculate similarities for all bins by finding nearby nodes
      const influenceRadius = baseHexRadius * 3; // Influence radius (3x hex size for smooth gradients)
      const binSimilarities = bins.map(bin => {
        // Get center of this bin
        const binCenterX = bin.x;
        const binCenterY = bin.y;
        
        let totalSimilarity = 0;
        let totalWeight = 0;

        // Use quadtree to find nodes within influence radius (much faster than iterating all nodes)
        quadtree.visit((node, x1, y1, x2, y2) => {
          // Skip if quad is entirely outside influence radius
          if (x1 > binCenterX + influenceRadius || x2 < binCenterX - influenceRadius ||
              y1 > binCenterY + influenceRadius || y2 < binCenterY - influenceRadius) {
            return true; // Skip this quad
          }
          
          // If this is a leaf node with data, check distance
          if (node.length === undefined && node.data) {
            const dx = node.data.x - binCenterX;
            const dy = node.data.y - binCenterY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < influenceRadius) {
              // Use inverse distance weighting (closer nodes have more influence)
              const weight = 1 / (1 + distance / influenceRadius);
              
              // Use unified activations field (contains all emotions + demographics)
              if (node.data.activations) {
                currentDemographics.forEach(label => {
                  const activation = node.data.activations[label] || 0;
                  totalSimilarity += activation * weight;
                  totalWeight += weight;
                });
              }
            }
          }
          
          return false; // Continue visiting children
        });

        return totalWeight > 0 ? totalSimilarity / totalWeight : 0;
      });

      // Calculate dynamic domain from actual data
      const similarities = binSimilarities.filter(s => s > 0);
      const minSim = similarities.length > 0 ? Math.min(...similarities) : 0;
      const maxSim = similarities.length > 0 ? Math.max(...similarities) : 0.01;
      
      // Use a perceptually uniform color scale (Inferno: black → purple → orange → yellow)
      // Start from 0 to show the full gradient across entire viewport
      const colorScale = d3.scaleSequential(d3.interpolateInferno)
        .domain([0, maxSim]); // Start from 0 to show black in empty areas

      // Map bins with their similarity values (keep all bins including empty ones)
      const binsWithData = bins.map((bin, i) => ({
        bin,
        similarity: binSimilarities[i]
      }));

      // Update hexagons
      const hexagons = hexbinLayer.selectAll('path')
        .data(binsWithData, d => `${d.bin.x}-${d.bin.y}`);

      hexagons.exit().remove();

      hexagons.enter()
        .append('path')
        .merge(hexagons)
        .attr('d', currentHexbin.hexagon())
        .attr('transform', d => `translate(${d.bin.x},${d.bin.y})`)
        .attr('fill', d => colorScale(d.similarity))
        .attr('opacity', 0.7)  // Slightly more transparent for better blending
        .attr('stroke', 'none');  // Remove stroke for better performance
    };

    // Store update function for external access
    window.updateHexbinHeatmap = updateHexbinHeatmap;

    // Restart simulation event listener
    const handleRestart = () => {
      simulation.alpha(1).alphaTarget(0.3).restart();
      svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
    };

    window.addEventListener('restart-simulation', handleRestart);

    // Cleanup annotation thumbnails
    const handleCleanup = (event) => {
      const annotationId = event.detail;
      thumbnailLayer.selectAll(`.thumbnail-node-${annotationId}`).remove();
      thumbnailLayer.selectAll(`.thumbnail-border-${annotationId}`).remove();
      
      // Restore the original node circle
      const annotation = annotationsRef.current.find(a => a.id === annotationId);
      if (annotation) {
        const graphNode = graphData.nodes.find(n => n.id === annotation.nodeId);
        const nodeSelection = g.selectAll('circle.node').filter(nd => nd === graphNode);
        nodeSelection.style('display', null);
      }
    };
    
    window.addEventListener('cleanup-annotation', handleCleanup);

    // Add gradient definition for header
    svg.append('defs').append('linearGradient')
      .attr('id', 'headerGradient')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '100%').attr('y2', '100%')
      .selectAll('stop')
      .data([
        {offset: '0%', color: '#f8f9fa'},
        {offset: '100%', color: '#e9ecef'}
      ])
      .enter().append('stop')
      .attr('offset', d => d.offset)
      .attr('stop-color', d => d.color);

    // Image loading function - now renders as SVG images
    const loadImagesForAnnotation = async (annotationId, vectorB64, gridGroup, annotationData) => {
      try {
        const binaryString = atob(vectorB64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const featureVector = new Float32Array(bytes.buffer);
        const vecArray = Array.from(featureVector);
        const norm = Math.sqrt(vecArray.reduce((sum, val) => sum + val * val, 0));
        const normalized = vecArray.map(v => v / (norm || 1e-8));

        const response = await fetch('https://nooscope.osmarks.net/backend', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            terms: [{ embedding: normalized, weight: 1 }],
            include_video: true,
            debug_enabled: false,
            k: 12
          })
        });

        const data = await response.json();
        const matches = (data.matches || []).map(m => ({ score: m[0], url: m[1] }));

        // Store image data
        const imagesPerPage = 9; // 3x3 grid
        const totalPages = Math.ceil(matches.length / imagesPerPage);
        
        if (annotationData) {
          annotationData.imageCount = matches.length;
          annotationData.currentPage = 0;
          annotationData.totalPages = totalPages;
          annotationData.allMatches = matches; // Store all matches
          annotationData.topImageUrl = matches.length > 0 ? matches[0].url : null; // Store top image
          annotationData.isMinimized = false;
        }

        // Function to render images for a specific page
        const renderPage = (pageNum) => {
          // Clear existing images
          gridGroup.selectAll('g').remove();
          
          const imgWidth = 120;
          const imgHeight = 100;
          const gap = 8;
          const cols = 3;
          
          // Calculate which images to show
          const startIdx = pageNum * imagesPerPage;
          const endIdx = Math.min(startIdx + imagesPerPage, matches.length);
          const pageMatches = matches.slice(startIdx, endIdx);

          pageMatches.forEach((match, idx) => {
            const col = idx % cols;
            const row = Math.floor(idx / cols);
            const x = col * (imgWidth + gap);
            const y = row * (imgHeight + gap + 20);

            const imgGroup = gridGroup.append('g')
              .attr('transform', `translate(${x}, ${y})`);

            // Background rect
            imgGroup.append('rect')
              .attr('width', imgWidth)
              .attr('height', imgHeight + 20)
              .attr('fill', '#f9f9f9')
              .attr('rx', 6);

            // Image
            imgGroup.append('image')
              .attr('href', match.url)
              .attr('width', imgWidth)
              .attr('height', imgHeight)
              .attr('preserveAspectRatio', 'xMidYMid slice')
              .style('cursor', 'pointer');

            // Score text
            imgGroup.append('text')
              .attr('x', imgWidth / 2)
              .attr('y', imgHeight + 14)
              .attr('text-anchor', 'middle')
              .attr('font-size', '11px')
              .attr('font-weight', '600')
              .attr('fill', '#1f77b4')
              .text(match.score?.toFixed(3));
          });
        };

        // Render initial page
        if (gridGroup) {
          renderPage(0);
          console.log(`Loaded ${matches.length} images (showing page 1 of ${totalPages}) for annotation ${annotationId}`);
          
          // Create pagination controls
          const paginationGroup = d3.select(gridGroup.node().parentNode.parentNode).select('.pagination-group');
          
          const updatePage = (newPage) => {
            annotationData.currentPage = newPage;
            
            // Re-render images for the new page
            renderPage(newPage);
            
            // Update page text
            paginationGroup.select('.page-text')
              .text(`Page ${newPage + 1} of ${totalPages}`);
            
            // Update button states
            paginationGroup.select('.prev-btn')
              .style('opacity', newPage === 0 ? 0.3 : 1)
              .style('cursor', newPage === 0 ? 'default' : 'pointer');
            
            paginationGroup.select('.next-btn')
              .style('opacity', newPage === totalPages - 1 ? 0.3 : 1)
              .style('cursor', newPage === totalPages - 1 ? 'default' : 'pointer');
          };

          // Previous button
          const prevBtn = paginationGroup.append('g')
            .attr('class', 'prev-btn')
            .attr('transform', 'translate(120, 0)')
            .style('cursor', 'pointer')
            .style('opacity', 0.3)
            .on('click', function(e) {
              e.stopPropagation();
              if (annotationData.currentPage > 0) {
                updatePage(annotationData.currentPage - 1);
              }
            });

          prevBtn.append('rect')
            .attr('width', 60)
            .attr('height', 28)
            .attr('rx', 4)
            .attr('fill', '#f0f0f0')
            .attr('stroke', '#ccc');

          prevBtn.append('text')
            .attr('x', 30)
            .attr('y', 14)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'central')
            .attr('font-size', '13px')
            .attr('fill', '#333')
            .text('◀ Prev');

          // Page indicator
          paginationGroup.append('text')
            .attr('class', 'page-text')
            .attr('x', 200)
            .attr('y', 14)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'central')
            .attr('font-size', '13px')
            .attr('font-weight', '500')
            .attr('fill', '#333')
            .text(`Page 1 of ${totalPages}`);

          // Next button
          const nextBtn = paginationGroup.append('g')
            .attr('class', 'next-btn')
            .attr('transform', 'translate(220, 0)')
            .style('cursor', 'pointer')
            .on('click', function(e) {
              e.stopPropagation();
              if (annotationData.currentPage < totalPages - 1) {
                updatePage(annotationData.currentPage + 1);
              }
            });

          nextBtn.append('rect')
            .attr('width', 60)
            .attr('height', 28)
            .attr('rx', 4)
            .attr('fill', '#f0f0f0')
            .attr('stroke', '#ccc');

          nextBtn.append('text')
            .attr('x', 30)
            .attr('y', 14)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'central')
            .attr('font-size', '13px')
            .attr('fill', '#333')
            .text('Next ▶');
        }
      } catch (err) {
        console.error('Error loading images:', err);
        if (gridGroup) {
          gridGroup.append('text')
            .attr('x', 200)
            .attr('y', 50)
            .attr('text-anchor', 'middle')
            .attr('fill', '#999')
            .text('Error loading images');
        }
      }
    };


    // Store render function
    window.renderAnnotations = renderAnnotations;

    // Cleanup
    return () => {
      simulation.stop();
      window.removeEventListener('restart-simulation', handleRestart);
      window.removeEventListener('cleanup-annotation', handleCleanup);
      window.renderAnnotations = null;
      window.updateHexbinHeatmap = null;
    };
  }, []); // Empty deps - only run once on mount

  // Update annotations when annotations array changes
  useEffect(() => {
    if (window.renderAnnotations) {
      window.renderAnnotations();
    }
  }, [annotations]);

  // Update cluster visibility when showClusters changes
  useEffect(() => {
    d3.select(svgRef.current)
      .selectAll('.node.cluster')
      .style('opacity', showClusters ? 0.3 : 0);
  }, [showClusters]);

  // Update hexbin heatmap when demographics change
  useEffect(() => {
    if (window.updateHexbinHeatmap) {
      window.updateHexbinHeatmap();
    }
  }, [activeDemographics]);

  return <svg ref={svgRef} className="network-graph" />;
}

export default NetworkGraph;

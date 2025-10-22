import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { hexbin as d3Hexbin } from 'd3-hexbin';
import graphData from '../data.json';
import './NetworkGraph.css';

// Culturally-aligned emotion colors
const EMOTION_COLORS = {
    'Anger': '#DC143C',           // Crimson red
    'Annoyance': '#FF6B6B',       // Light red
    'Fear': '#4A0E4E',            // Dark purple
    'Sadness': '#4A90E2',         // Blue
    'Happiness': '#FFD700',       // Gold/yellow
    'Joy': '#FFA500',             // Orange
    'Pleasure': '#FF69B4',        // Hot pink
    'Excitement': '#FF4500',      // Orange-red
    'Peace': '#87CEEB',           // Sky blue
    'Affection': '#FFB6C1',       // Light pink
    'Love': '#FF1493',            // Deep pink
    'Surprise': '#FFFF00',        // Bright yellow
    'Confidence': '#9370DB',      // Medium purple
    'Pride': '#DAA520',           // Goldenrod
    'Esteem': '#B8860B',          // Dark goldenrod
    'Anticipation': '#FFA07A',    // Light salmon
    'Engagement': '#20B2AA',      // Light sea green
    'Yearning': '#DDA0DD',        // Plum
    'Sympathy': '#98FB98',        // Pale green
    'Suffering': '#696969',       // Dim gray
    'Pain': '#8B0000',            // Dark red
    'Embarrassment': '#FFB6C1',   // Light pink
    'Sensitivity': '#E6E6FA',     // Lavender
    'Disapproval': '#A0522D',     // Sienna brown
    'Aversion': '#556B2F',        // Dark olive green
    'Disconnection': '#708090',   // Slate gray
    'Doubt/Confusion': '#D3D3D3', // Light gray
    'Disquietment': '#8B7D7B',    // Gray-brown
    'Fatigue': '#C0C0C0',         // Silver
    'Dominance': '#8B4513',       // Saddle brown
    'Arousal': '#FF6347',         // Tomato
    'Valence': '#7B68EE'          // Medium slate blue
};

function NetworkGraph({ showClusters, setTooltipData, setTooltipPosition, onNodeClick, annotations, activeDemographics, showPieCharts, hoveredEmotion, useRelativeActivation, selectedEmotions, sizeClustersByFeatures, showVoronoi, filterIntensity }) {
    const svgRef = useRef();
    const simulationRef = useRef();
    const transformRef = useRef(d3.zoomIdentity);
    const annotationsRef = useRef(annotations);
    const annotationGroupRef = useRef(null);
    const hexbinLayerRef = useRef(null);
    const hexbinGeneratorRef = useRef(null);
    const nodesDataRef = useRef([]);
    const activeDemographicsRef = useRef(activeDemographics);
    const nodeGroupRef = useRef(null);
    const showPieChartsRef = useRef(showPieCharts);
    const hoveredEmotionRef = useRef(hoveredEmotion);
    const useRelativeActivationRef = useRef(useRelativeActivation);
    const selectedEmotionsRef = useRef(selectedEmotions);
    const sizeClustersByFeaturesRef = useRef(sizeClustersByFeatures);
    const voronoiLayerRef = useRef(null);
    const showVoronoiRef = useRef(showVoronoi);
    const filterIntensityRef = useRef(filterIntensity);

    // Update refs when props change
    annotationsRef.current = annotations;
    activeDemographicsRef.current = activeDemographics;
    showPieChartsRef.current = showPieCharts;
    hoveredEmotionRef.current = hoveredEmotion;
    useRelativeActivationRef.current = useRelativeActivation;
    selectedEmotionsRef.current = selectedEmotions;
    sizeClustersByFeaturesRef.current = sizeClustersByFeatures;
    showVoronoiRef.current = showVoronoi;
    filterIntensityRef.current = filterIntensity;

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
                
                // Scale nodes (both circles and pie charts)
                const currentShowPie = showPieChartsRef.current;
                const currentSelectedEmotions = selectedEmotionsRef.current;
                const currentHoveredEmotion = hoveredEmotionRef.current;
                
                g.selectAll('g.node-group').each(function(d) {
                    const nodeG = d3.select(this);
                    
                    // Calculate appropriate size based on current state
                    let nodeSize = d.size;
                    
                    // Check if emotions are being filtered
                    const hasEmotionFilter = currentHoveredEmotion || (currentSelectedEmotions.size > 0 && !currentShowPie);
                    
                    // For clusters
                    if (d.type === 'cluster') {
                        if (hasEmotionFilter && d.activations) {
                            // Clusters respond to emotion filters
                            const targetEmotion = currentHoveredEmotion || null;
                            const emotionsToCheck = targetEmotion ? [targetEmotion] : Array.from(currentSelectedEmotions);
                            const useRelative = useRelativeActivationRef.current;
                            
                            let meanActivation = 0;
                            if (useRelative) {
                                const demographics = ['Male', 'Female', 'Kid', 'Adult', 'Teenager'];
                                const emotionValues = Object.entries(d.activations)
                                    .filter(([label]) => !demographics.includes(label))
                                    .map(([, value]) => value);
                                meanActivation = emotionValues.reduce((sum, val) => sum + val, 0) / emotionValues.length;
                            }
                            
                            let maxActivation = 0;
                            emotionsToCheck.forEach(emotion => {
                                let activation = d.activations?.[emotion] || 0;
                                if (useRelative) {
                                    const intensityFactor = filterIntensityRef.current / 100;
                                    activation = Math.max(0, activation - (meanActivation * intensityFactor));
                                }
                                if (activation > maxActivation) {
                                    maxActivation = activation;
                                }
                            });
                            
                            const minSize = 10;
                            const maxSize = 200;
                            const amplifiedActivation = Math.min(maxActivation * 10, 1);
                            nodeSize = minSize + (amplifiedActivation * (maxSize - minSize));
                        } else {
                            // No filter: check if sizing by features is enabled
                            const useSizeByFeatures = sizeClustersByFeaturesRef.current;
                            if (useSizeByFeatures && d.num_features) {
                                const minClusterSize = 10;
                                const maxClusterSize = 100;
                                const maxFeatures = 1036;
                                const scaleFactor = Math.log(d.num_features + 1) / Math.log(maxFeatures + 1);
                                nodeSize = minClusterSize + scaleFactor * (maxClusterSize - minClusterSize);
                            }
                        }
                    }
                    
                    // For feature nodes - if emotions are filtered or hovered, calculate dynamic size
                    if (d.type !== 'cluster' && hasEmotionFilter) {
                        const targetEmotion = currentHoveredEmotion || null;
                        const emotionsToCheck = targetEmotion ? [targetEmotion] : Array.from(currentSelectedEmotions);
                        const useRelative = useRelativeActivationRef.current;
                        
                        if (emotionsToCheck.length > 0) {
                            // Calculate mean if relative is enabled
                            let meanActivation = 0;
                            if (useRelative && d.activations) {
                                const demographics = ['Male', 'Female', 'Kid', 'Adult', 'Teenager'];
                                const emotionValues = Object.entries(d.activations)
                                    .filter(([label]) => !demographics.includes(label))
                                    .map(([, value]) => value);
                                meanActivation = emotionValues.reduce((sum, val) => sum + val, 0) / emotionValues.length;
                            }
                            
                            let maxActivation = 0;
                            emotionsToCheck.forEach(emotion => {
                                let activation = d.activations?.[emotion] || 0;
                                
                                // Apply relative activation with filter intensity if enabled
                                if (useRelative) {
                                    const intensityFactor = filterIntensityRef.current / 100;
                                    activation = Math.max(0, activation - (meanActivation * intensityFactor));
                                }
                                
                                if (activation > maxActivation) {
                                    maxActivation = activation;
                                }
                            });
                            
                            // Use same sizing logic as renderNodeVisuals
                            const minSize = 10;
                            const maxSize = 200;
                            const amplifiedActivation = Math.min(maxActivation * 10, 1);
                            nodeSize = minSize + (amplifiedActivation * (maxSize - minSize));
                        }
                    }
                    
                    if (d.type === 'cluster' || !currentShowPie) {
                        // Simple circles - no scale adjustment
                        nodeG.select('circle')
                            .attr('r', nodeSize)
                            .attr('stroke-width', 1.5);
                    } else {
                        // Update pie chart arc generator - no scale adjustment
                        const arc = d3.arc()
                            .innerRadius(0)
                            .outerRadius(nodeSize);
                        
                        nodeG.selectAll('path.pie-slice')
                            .attr('d', arc)
                            .attr('stroke-width', 0.5);
                    }
                });

                g.selectAll('line.link')
                    .attr('stroke-width', 1 / scale);

                // Heatmap stays static - doesn't scale with zoom

                // Scale thumbnails inversely
                const thumbnailSize = 60 / scale;
                thumbnailLayer.selectAll('image')
                    .each(function () {
                        const img = d3.select(this);
                        const cx = parseFloat(img.attr('x')) + 30; // center x (60/2)
                        const cy = parseFloat(img.attr('y')) + 30; // center y
                        img.attr('x', cx - thumbnailSize / 2)
                            .attr('y', cy - thumbnailSize / 2)
                            .attr('width', thumbnailSize)
                            .attr('height', thumbnailSize);
                    });

                thumbnailLayer.selectAll('rect')
                    .each(function () {
                        const rect = d3.select(this);
                        const cx = parseFloat(rect.attr('x')) + 30;
                        const cy = parseFloat(rect.attr('y')) + 30;
                        rect.attr('x', cx - thumbnailSize / 2)
                            .attr('y', cy - thumbnailSize / 2)
                            .attr('width', thumbnailSize)
                            .attr('height', thumbnailSize)
                            .attr('stroke-width', 3 / scale);
                    });

                // Scale annotation boxes inversely
                annotationGroup.selectAll('g.annotation-group')
                    .each(function (d) {
                        const nodeData = graphData.nodes.find(n => n.id === d.nodeId);
                        if (nodeData && !d.isDragging) {
                            // Use custom offset if set by dragging (data space), otherwise use default
                            const offsetX = d.dragOffsetX !== undefined ? d.dragOffsetX : 20 / scale;
                            const offsetY = d.dragOffsetY !== undefined ? d.dragOffsetY : -300 / scale;

                            const annotationGroup = d3.select(this);
                            annotationGroup.attr('transform', `translate(${nodeData.x + offsetX}, ${nodeData.y + offsetY}) scale(${1 / scale})`);

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
        const demographics = ['Male', 'Female', 'Kid', 'Adult', 'Teenager'];
        const actualEmotions = graphData.emotions.filter(e => !demographics.includes(e));

        // Use culturally-aligned emotion colors
        const emotionColors = EMOTION_COLORS;

        // Radial force to keep nodes at target positions
        function radialForce() {
            return () => {
                const k = 0.1; // Reduced from 0.5 to allow more freedom in node positioning
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
                .strength(0.1))
            .force('charge', d3.forceManyBody().strength(-50))
            .force('radial', radialForce())
            .force('collide', d3.forceCollide(d => d.size + 4))
            .alphaTarget(1)
            .velocityDecay(0.2);

        simulationRef.current = simulation;

        // Create links with initial scale-invariant width
        const link = g.append('g')
            .selectAll('line')
            .data(graphData.links)
            .join('line')
            .attr('class', 'link')
            .attr('stroke-width', 1); // Will be scaled inversely on zoom

        // Create pie and arc generators for pie chart nodes
        const pie = d3.pie()
            .value(d => d.value)
            .sort(null); // Don't sort, keep order

        // Create nodes as groups (to hold pie slices or circles)
        const nodeGroup = g.append('g')
            .attr('class', 'nodes');

        const node = nodeGroup.selectAll('g.node-group')
            .data(graphData.nodes)
            .join('g')
            .attr('class', d => `node-group ${d.type}`)
            .call(d3.drag()
                .on('start', (event, d) => {
                    if (!event.active) simulation.alphaTarget(1).restart();
                    d.fx = d.x;
                    d.fy = d.y;
                })
                .on('drag', (event, d) => {
                    d.fx = event.x;
                    d.fy = event.y;
                })
                .on('end', (event, d) => {
                    if (!event.active) simulation.alphaTarget(1);
                    d.fx = null;
                    d.fy = null;
                }))
            .on('mouseover', (event, d) => {
                // Show tooltip for features and clusters with vectors
                if (d.type === 'feature' || (d.type === 'cluster' && d.feature_vector_b64)) {
                    setTooltipData(d);
                    setTooltipPosition({ x: event.pageX, y: event.pageY });
                }
            })
            .on('mouseout', () => {
                setTooltipData(null);
            })
            .on('click', (event, d) => {
                // Allow clicks on features and clusters with vectors
                if (onNodeClick && (d.type === 'feature' || (d.type === 'cluster' && d.feature_vector_b64))) {
                    event.stopPropagation();
                    onNodeClick(d);
                }
            });

        // Store node group reference
        nodeGroupRef.current = node;

        // Function to render node visuals based on current mode
        const renderNodeVisuals = () => {
            const currentShowPieCharts = showPieChartsRef.current;
            const currentNode = nodeGroupRef.current;
            const currentHoveredEmotion = hoveredEmotionRef.current;
            const currentSelectedEmotions = selectedEmotionsRef.current;
            
            if (!currentNode) return;

            // Clear existing visuals
            currentNode.selectAll('*').remove();

            currentNode.each(function(d) {
                const nodeG = d3.select(this);
                
                if (d.type === 'cluster') {
                    // Check if emotions are being filtered
                    const hasEmotionFilter = currentHoveredEmotion || (currentSelectedEmotions.size > 0 && !currentShowPieCharts);
                    
                    if (hasEmotionFilter && d.activations) {
                        // When emotions are filtered, respond like feature nodes
                        const targetEmotion = currentHoveredEmotion || null;
                        const emotionsToCheck = targetEmotion ? [targetEmotion] : Array.from(currentSelectedEmotions);
                        const useRelative = useRelativeActivationRef.current;
                        
                        // Calculate mean activation if needed
                        let meanActivation = 0;
                        if (useRelative) {
                            const demographics = ['Male', 'Female', 'Kid', 'Adult', 'Teenager'];
                            const emotionValues = Object.entries(d.activations)
                                .filter(([label]) => !demographics.includes(label))
                                .map(([, value]) => value);
                            meanActivation = emotionValues.reduce((sum, val) => sum + val, 0) / emotionValues.length;
                        }
                        
                        // Find emotion with highest activation among selected
                        let maxEmotion = null;
                        let maxActivation = 0;
                        
                        emotionsToCheck.forEach(emotion => {
                            let activation = d.activations?.[emotion] || 0;
                            if (useRelative) {
                                const intensityFactor = filterIntensityRef.current / 100;
                                activation = Math.max(0, activation - (meanActivation * intensityFactor));
                            }
                            if (activation > maxActivation) {
                                maxActivation = activation;
                                maxEmotion = emotion;
                            }
                        });
                        
                        // Size based on activation
                        const minSize = 10;
                        const maxSize = 200;
                        const amplifiedActivation = Math.min(maxActivation * 10, 1);
                        const clusterSize = minSize + (amplifiedActivation * (maxSize - minSize));
                        
                        // Use cluster's primary emotion color
                        const clusterColor = d.primary_emotion ? emotionColors[d.primary_emotion] : '#ccc';
                        
                        nodeG.append('circle')
                            .attr('class', 'node cluster')
                            .attr('r', clusterSize)
                            .attr('fill', clusterColor)
                            .attr('stroke', '#fff')
                            .attr('stroke-width', 1.5)
                            .style('opacity', maxActivation > 0 ? 0.6 : 0.1);
                    } else {
                        // Default cluster rendering when no emotion filter
                        const useSizeByFeatures = sizeClustersByFeaturesRef.current;
                        
                        // Calculate size based on feature count if enabled
                        let clusterSize = d.size;
                        if (useSizeByFeatures && d.num_features) {
                            // Scale cluster size based on number of features
                            // Use log scale to prevent extreme size differences
                            const minClusterSize = 10;
                            const maxClusterSize = 100;
                            const maxFeatures = 1036; // Total features from data
                            const scaleFactor = Math.log(d.num_features + 1) / Math.log(maxFeatures + 1);
                            clusterSize = minClusterSize + scaleFactor * (maxClusterSize - minClusterSize);
                        }
                        
                        // Color by primary emotion if sizing by features
                        const clusterColor = useSizeByFeatures && d.primary_emotion 
                            ? (emotionColors[d.primary_emotion] || '#ccc')
                            : '#ccc';
                        
                        nodeG.append('circle')
                            .attr('class', 'node cluster')
                            .attr('r', clusterSize)
                            .attr('fill', clusterColor)
                            .attr('stroke-width', 1.5)
                            .style('opacity', showClusters ? 0.3 : 0);
                    }
                } else if (currentHoveredEmotion) {
                    // When hovering an emotion in legend - show nodes sized by activation
                    let emotionActivation = d.activations?.[currentHoveredEmotion] || 0;
                    
                    // Calculate relative activation if enabled
                    const useRelative = useRelativeActivationRef.current;
                    if (useRelative && d.activations) {
                        // Calculate mean activation across all emotions for this node
                        const demographics = ['Male', 'Female', 'Kid', 'Adult', 'Teenager'];
                        const emotionValues = Object.entries(d.activations)
                            .filter(([label]) => !demographics.includes(label))
                            .map(([, value]) => value);
                        
                        const meanActivation = emotionValues.reduce((sum, val) => sum + val, 0) / emotionValues.length;
                        
                        // Apply filter intensity
                        const intensityFactor = filterIntensityRef.current / 100;
                        emotionActivation = Math.max(0, emotionActivation - (meanActivation * intensityFactor));
                    }
                    
                    // Linear scaling based on emotion activation with amplification for visibility
                    const minSize = 10;
                    const maxSize = 200;
                    // Amplify activations (typically very small values like 0.01-0.1) for better visibility
                    // Use a linear multiplier to spread the range while maintaining proportional differences
                    const amplifiedActivation = Math.min(emotionActivation * 10, 1);
                    const scaledSize = minSize + (amplifiedActivation * (maxSize - minSize));
                    
                    // Use node's primary emotion color, not filtered emotion
                    const nodeColor = d.primary_emotion ? emotionColors[d.primary_emotion] : '#999';
                    
                    nodeG.append('circle')
                        .attr('class', 'node feature')
                        .attr('r', scaledSize)
                        .attr('fill', nodeColor)
                        .attr('stroke', '#fff')
                        .attr('stroke-width', 1.5)
                        .style('opacity', emotionActivation > 0 ? 1 : 0.1);
                } else if (currentSelectedEmotions.size > 0 && !currentShowPieCharts) {
                    // When emotions are selected (persistent visualization)
                    const useRelative = useRelativeActivationRef.current;
                    const demographics = ['Male', 'Female', 'Kid', 'Adult', 'Teenager'];
                    
                    // Calculate mean activation if needed
                    let meanActivation = 0;
                    if (useRelative && d.activations) {
                        const emotionValues = Object.entries(d.activations)
                            .filter(([label]) => !demographics.includes(label))
                            .map(([, value]) => value);
                        meanActivation = emotionValues.reduce((sum, val) => sum + val, 0) / emotionValues.length;
                    }
                    
                    // Find the emotion with highest activation among selected (applying relative + intensity)
                    let maxActivation = 0;
                    
                    currentSelectedEmotions.forEach(emotion => {
                        let activation = d.activations?.[emotion] || 0;
                        
                        // Apply relative activation with filter intensity if enabled
                        if (useRelative) {
                            const intensityFactor = filterIntensityRef.current / 100;
                            activation = Math.max(0, activation - (meanActivation * intensityFactor));
                        }
                        
                        if (activation > maxActivation) {
                            maxActivation = activation;
                        }
                    });
                    
                    // Size based on activation (with relative adjustment if enabled)
                    const minSize = 10;
                    const maxSize = 200;
                    const amplifiedActivation = Math.min(maxActivation * 10, 1);
                    const scaledSize = minSize + (amplifiedActivation * (maxSize - minSize));
                    
                    // Use node's primary emotion color, not filtered emotion
                    const nodeColor = d.primary_emotion ? emotionColors[d.primary_emotion] : '#999';
                    
                    nodeG.append('circle')
                        .attr('class', 'node feature')
                        .attr('r', scaledSize)
                        .attr('fill', nodeColor)
                        .attr('stroke', '#fff')
                        .attr('stroke-width', 1.5)
                        .style('opacity', maxActivation > 0 ? 1 : 0.1);
                } else if (currentShowPieCharts) {
                // Feature nodes as pie charts (when enabled)
                // Get emotion activations (exclude demographics)
                const demographics = ['Male', 'Female', 'Kid', 'Adult', 'Teenager'];
                const emotionActivations = [];
                
                if (d.activations) {
                    Object.entries(d.activations).forEach(([label, value]) => {
                        if (!demographics.includes(label)) {
                            emotionActivations.push({ 
                                label, 
                                value,
                                color: emotionColors[label] || '#999',
                                isPrimary: label === d.primary_emotion
                            });
                        }
                    });
                }
                
                // Sort by value and take top 5 for cleaner visualization
                emotionActivations.sort((a, b) => b.value - a.value);
                const topEmotions = emotionActivations.slice(0, 5);
                
                // Calculate rotation to point primary emotion toward center
                // Node position relative to center (use actual position, not target)
                const centerX = width / 2;
                const centerY = height / 2;
                const angleToCenter = Math.atan2(centerY - d.y, centerX - d.x);
                
                // Find the angle of the primary emotion slice in the pie
                let primarySliceAngle = 0;
                const pieDataForAngle = pie(topEmotions);
                pieDataForAngle.forEach(slice => {
                    if (slice.data.isPrimary) {
                        // Get the middle angle of this slice
                        primarySliceAngle = (slice.startAngle + slice.endAngle) / 2;
                    }
                });
                
                // Calculate rotation needed to align primary slice with center
                const rotationDegrees = (angleToCenter * 180 / Math.PI) - (primarySliceAngle * 180 / Math.PI);
                
                // Create arc generator with radius from node size
                const arc = d3.arc()
                    .innerRadius(0)
                    .outerRadius(d.size);
                
                // Generate pie slices
                const pieData = pie(topEmotions);
                
                // Create a group for the pie with rotation
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
                    .attr('stroke', '#fff')
                    .attr('stroke-width', 0.5);
            } else {
                // Feature nodes as solid circles (default)
                nodeG.append('circle')
                    .attr('class', 'node feature')
                    .attr('r', d.size)
                    .attr('fill', emotionColors[d.primary_emotion] || '#999')
                    .attr('stroke', '#fff')
                    .attr('stroke-width', 1.5);
                }
            });
        };

        // Initial render of nodes
        renderNodeVisuals();

        // Store function for external use
        window.renderNodeVisuals = renderNodeVisuals;

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

        // Create Voronoi layer BEFORE defining renderVoronoi so it exists when called
        const voronoiLayer = g.append('g')
            .attr('class', 'voronoi-layer')
            .style('pointer-events', 'none'); // Will be toggled by useEffect

        voronoiLayerRef.current = voronoiLayer;

        // Function to render Voronoi cells
        const renderVoronoi = () => {
            const currentShowVoronoi = showVoronoiRef.current;
            const voronoi = voronoiLayerRef.current;
            if (!voronoi) return;

            voronoi.selectAll('*').remove();

            if (!currentShowVoronoi) return;

            // Get all nodes with valid positions (both clusters and features)
            const allNodes = graphData.nodes.filter(n => 
                n.x !== undefined && 
                n.y !== undefined
            );

            if (allNodes.length === 0) return;

            // Use d3.Delaunay for Voronoi computation
            const points = allNodes.map(n => [n.x, n.y]);
            const delaunay = d3.Delaunay.from(points);
            const voronoiDiagram = delaunay.voronoi([
                -10000, -10000, // Extend bounds significantly
                width + 10000, height + 10000
            ]);

            // Get emotion filters
            const hasEmotionFilter = hoveredEmotionRef.current || (selectedEmotionsRef.current.size > 0 && !showPieChartsRef.current);

            // Render each Voronoi cell
            allNodes.forEach((node, i) => {
                const cell = voronoiDiagram.cellPolygon(i);
                if (!cell) return;

                const isCluster = node.type === 'cluster';
                
                // Only render cells for clusters
                if (!isCluster) return;

                let fillColor = '#ccc';
                let opacity = 0.2;
                
                // Color by cluster's primary emotion if available
                if (node.primary_emotion) {
                    fillColor = emotionColors[node.primary_emotion] || '#ccc';
                    
                    // Scale opacity by number of features (log scale) - only when no filter
                    if (node.num_features) {
                        const maxFeatures = 1036;
                        const featureRatio = Math.log(node.num_features + 1) / Math.log(maxFeatures + 1);
                        opacity = 0.05 + (featureRatio * 0.65); // Range: 0.05 to 0.7
                    } else {
                        opacity = 0.25;
                    }
                }
                
                // If emotion filter is active, OVERRIDE opacity based on activation
                if (hasEmotionFilter && node.activations) {
                    const targetEmotion = hoveredEmotionRef.current || null;
                    const emotionsToCheck = targetEmotion ? [targetEmotion] : Array.from(selectedEmotionsRef.current);
                    const useRelative = useRelativeActivationRef.current;

                    let meanActivation = 0;
                    if (useRelative) {
                        const demographics = ['Male', 'Female', 'Kid', 'Adult', 'Teenager'];
                        const emotionValues = Object.entries(node.activations)
                            .filter(([label]) => !demographics.includes(label))
                            .map(([, value]) => value);
                        meanActivation = emotionValues.reduce((sum, val) => sum + val, 0) / emotionValues.length;
                    }

                    let maxActivation = 0;
                    emotionsToCheck.forEach(emotion => {
                        let activation = node.activations?.[emotion] || 0;
                        if (useRelative) {
                            // Apply filter intensity as percentage of mean
                            const intensityFactor = filterIntensityRef.current / 100;
                            activation = Math.max(0, activation - (meanActivation * intensityFactor));
                        }
                        if (activation > maxActivation) {
                            maxActivation = activation;
                        }
                    });

                    // Override opacity completely based on activation
                    if (maxActivation > 0) {
                        const amplified = Math.min(maxActivation * 10, 1);
                        opacity = 0.3 + (amplified * 0.6); // Range: 0.3 to 0.9 for active
                    } else {
                        opacity = 0.02; // Almost invisible for inactive clusters
                    }
                }

                const pathEl = voronoi.append('path')
                    .datum(node) // Attach node data
                    .attr('d', `M${cell.join('L')}Z`)
                    .attr('fill', fillColor)
                    .attr('opacity', opacity)
                    .attr('data-base-opacity', opacity) // Store original opacity
                    .attr('stroke', '#999')
                    .attr('stroke-width', 1)
                    .attr('stroke-opacity', 0.5)
                    .style('cursor', 'pointer')
                    .style('pointer-events', 'all'); // Ensure the path itself can receive events
                
                pathEl.on('mouseover', function(event, d) {
                        // Focus the cell - increase opacity and highlight border
                        d3.select(this)
                            .attr('opacity', 1.0) // Full opacity on hover
                            .attr('stroke', '#000')
                            .attr('stroke-width', 3)
                            .attr('stroke-opacity', 1);
                        
                        // Show cluster tooltip
                        const tooltipContent = {
                            type: 'cluster',
                            label: d.label,
                            depth: d.depth,
                            num_features: d.num_features,
                            primary_emotion: d.primary_emotion,
                            primary_activation: d.activations?.[d.primary_emotion] || 0,
                            feature_vector_b64: d.feature_vector_b64,
                            activations: d.activations
                        };
                        
                        // Add top 3 emotions if activations available
                        if (d.activations) {
                            const demographics = ['Male', 'Female', 'Kid', 'Adult', 'Teenager'];
                            const emotionEntries = Object.entries(d.activations)
                                .filter(([label]) => !demographics.includes(label))
                                .sort((a, b) => b[1] - a[1])
                                .slice(0, 3);
                            tooltipContent.top3_emotions = emotionEntries;
                        }
                        
                        setTooltipData(tooltipContent);
                        setTooltipPosition({ x: event.pageX, y: event.pageY });
                    })
                    .on('mouseout', function(event, d) {
                        // Restore original opacity and stroke
                        const originalOpacity = d3.select(this).attr('data-base-opacity');
                        d3.select(this)
                            .attr('opacity', originalOpacity) // Restore original opacity
                            .attr('stroke', '#999')
                            .attr('stroke-width', 1)
                            .attr('stroke-opacity', 0.5);
                        
                        setTooltipData(null);
                    })
                    .on('click', function(event, d) {
                        event.stopPropagation();
                        if (onNodeClick) {
                            onNodeClick(d);
                        }
                    });
            });
        };

        // Store render function for external access
        window.renderVoronoi = renderVoronoi;

        // Create thumbnail layer (above nodes)
        const thumbnailLayer = g.append('g').attr('class', 'thumbnails');

        // Voronoi layer already created above (before renderVoronoi function)
        // Move it to the top for proper interaction
        voronoiLayerRef.current.raise();

        // Ensure thumbnails and annotations are above Voronoi
        thumbnailLayer.raise();

        // Function to render annotations in D3
        const renderAnnotations = () => {
            const currentAnnotations = annotationsRef.current;

            // Ensure annotations are above everything (including thumbnails and Voronoi)
            annotationGroup.raise();

            // Render annotation groups
            const annotationSelection = annotationGroup
                .selectAll('g.annotation-group')
                .data(currentAnnotations, d => d.id);

            // Remove old annotations
            annotationSelection.exit().remove();

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
                .on('start', function (event, d) {
                    d.isDragging = true;
                    const currentScale = transformRef.current.k;
                    // Store initial offset in data space
                    if (d.dragOffsetX === undefined) d.dragOffsetX = 20 / currentScale;
                    if (d.dragOffsetY === undefined) d.dragOffsetY = -300 / currentScale;
                })
                .on('drag', function (event, d) {
                    const currentScale = transformRef.current.k;
                    // Convert screen-space drag to data-space by dividing by scale
                    d.dragOffsetX += event.dx / currentScale;
                    d.dragOffsetY += event.dy / currentScale;

                    // Update position immediately
                    const nodeData = graphData.nodes.find(n => n.id === d.nodeId);
                    if (nodeData) {
                        const annotationGroup = d3.select(this.parentNode);
                        annotationGroup.attr('transform', `translate(${nodeData.x + d.dragOffsetX}, ${nodeData.y + d.dragOffsetY}) scale(${1 / currentScale})`);

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
                .on('end', function (event, d) {
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
                .on('click', function (e, d) {
                    e.stopPropagation();
                    d.isMinimized = !d.isMinimized;
                    const annotationGroup = d3.select(this.parentNode.parentNode);

                    // Find the actual node in the graph
                    const graphNode = graphData.nodes.find(n => n.id === d.nodeId);
                    const nodeSelection = g.selectAll('g.node-group').filter(nd => nd === graphNode);

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
                                .attr('x', graphNode.x - thumbnailSize / 2)
                                .attr('y', graphNode.y - thumbnailSize / 2)
                                .attr('width', thumbnailSize)
                                .attr('height', thumbnailSize)
                                .attr('preserveAspectRatio', 'xMidYMid slice')
                                .style('cursor', 'pointer')
                                .on('click', function (clickE) {
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
                                .attr('x', graphNode.x - thumbnailSize / 2)
                                .attr('y', graphNode.y - thumbnailSize / 2)
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

            minimizeBtn.on('mouseenter', function () {
                d3.select(this).select('circle').attr('fill', '#e0e0e0');
            }).on('mouseleave', function () {
                d3.select(this).select('circle').attr('fill', 'transparent');
            });

            // Close button
            const closeBtn = header.append('g')
                .attr('class', 'close-btn')
                .attr('transform', 'translate(370, 15)')
                .style('cursor', 'pointer')
                .on('click', function (e, d) {
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

            closeBtn.on('mouseenter', function () {
                d3.select(this).select('circle').attr('fill', '#e0e0e0');
            }).on('mouseleave', function () {
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

            allAnnotations.each(function (d, i) {
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
                .attr('transform', d => `translate(${d.x}, ${d.y})`);

            // Don't update Voronoi on every tick - it destroys hover states
            // Voronoi cells are static once created

            // Update annotation positions
            annotationGroup.selectAll('g.annotation-group')
                .each(function (d) {
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
                        annotationGroup.attr('transform', `translate(${nodeData.x + offsetX}, ${nodeData.y + offsetY}) scale(${1 / currentScale})`);

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
                                .attr('x', nodeData.x - thumbnailSize / 2)
                                .attr('y', nodeData.y - thumbnailSize / 2)
                                .attr('width', thumbnailSize)
                                .attr('height', thumbnailSize);

                            thumbnailLayer.select(`.thumbnail-border-${d.id}`)
                                .attr('x', nodeData.x - thumbnailSize / 2)
                                .attr('y', nodeData.y - thumbnailSize / 2)
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
                                    let activation = node.data.activations[label] || 0;
                                    
                                    // Apply relative activation if enabled
                                    const useRelative = useRelativeActivationRef.current;
                                    if (useRelative) {
                                        // Calculate mean activation across all emotions for this node
                                        const demographics = ['Male', 'Female', 'Kid', 'Adult', 'Teenager'];
                                        const emotionValues = Object.entries(node.data.activations)
                                            .filter(([lbl]) => !demographics.includes(lbl))
                                            .map(([, value]) => value);
                                        
                                        const meanActivation = emotionValues.reduce((sum, val) => sum + val, 0) / emotionValues.length;
                                        
                                        // Calculate difference from mean and clamp to 0 if negative
                                        activation = Math.max(0, activation - meanActivation);
                                    }
                                    
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
            simulation.alpha(1).alphaTarget(1).restart();
            svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
        };

        window.addEventListener('restart-simulation', handleRestart);

        // Cleanup annotation thumbnails
        const handleCleanup = (event) => {
            const annotationId = event.detail;
            thumbnailLayer.selectAll(`.thumbnail-node-${annotationId}`).remove();
            thumbnailLayer.selectAll(`.thumbnail-border-${annotationId}`).remove();

            // Restore the original node
            const annotation = annotationsRef.current.find(a => a.id === annotationId);
            if (annotation) {
                const graphNode = graphData.nodes.find(n => n.id === annotation.nodeId);
                const nodeSelection = g.selectAll('g.node-group').filter(nd => nd === graphNode);
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
                { offset: '0%', color: '#f8f9fa' },
                { offset: '100%', color: '#e9ecef' }
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
                        .on('click', function (e) {
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
                        .on('click', function (e) {
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

        // Set initial zoom transform (only once on mount)
        const initialScale = 0.2;
        const initialTranslate = [width / 2 - (width / 2) * initialScale, height / 2 - (height / 2) * initialScale];
        svg.call(
            zoom.transform,
            d3.zoomIdentity.translate(...initialTranslate).scale(initialScale)
        );

        // Initial Voronoi render after simulation settles
        // Also re-render periodically during early simulation
        const voronoiRenderTimes = [100, 500, 1000, 2000]; // Render at these times
        voronoiRenderTimes.forEach(time => {
            setTimeout(() => {
                if (showVoronoiRef.current) {
                    renderVoronoi();
                }
            }, time);
        });

        // Cleanup
        return () => {
            simulation.stop();
            window.removeEventListener('restart-simulation', handleRestart);
            window.removeEventListener('cleanup-annotation', handleCleanup);
            window.renderAnnotations = null;
            window.updateHexbinHeatmap = null;
            window.renderNodeVisuals = null;
            window.renderVoronoi = null;
        };
    }, []); // Empty deps - only run once on mount

    // Update node visuals when pie chart mode changes
    useEffect(() => {
        if (window.renderNodeVisuals) {
            window.renderNodeVisuals();
        }
    }, [showPieCharts]);

    // Update node visuals when cluster sizing mode changes
    useEffect(() => {
        if (window.renderNodeVisuals) {
            window.renderNodeVisuals();
        }
        if (window.renderVoronoi) {
            window.renderVoronoi();
        }
    }, [sizeClustersByFeatures]);

    // Update Voronoi when showVoronoi changes
    useEffect(() => {
        if (window.renderVoronoi) {
            window.renderVoronoi();
        }
    }, [showVoronoi]);

    // Update node visuals when hovered emotion changes
    useEffect(() => {
        if (window.renderNodeVisuals) {
            window.renderNodeVisuals();
        }
        if (window.renderVoronoi) {
            window.renderVoronoi();
        }
    }, [hoveredEmotion]);

    // Update node visuals when relative activation mode changes
    useEffect(() => {
        if (window.renderNodeVisuals && (hoveredEmotion || selectedEmotions.size > 0)) {
            window.renderNodeVisuals();
        }
        if (window.renderVoronoi) {
            window.renderVoronoi();
        }
    }, [useRelativeActivation, hoveredEmotion, selectedEmotions, filterIntensity]);

    // Update node visuals when selected emotions change
    useEffect(() => {
        if (window.renderNodeVisuals) {
            window.renderNodeVisuals();
        }
        
        // Also trigger a zoom event to update node sizes with current transform
        const svg = d3.select(svgRef.current);
        const currentTransform = transformRef.current;
        if (currentTransform && svg.size() > 0) {
            // Manually trigger zoom to update sizes
            svg.select('g').attr('transform', currentTransform);
            
            const g = svg.select('g');
            const scale = currentTransform.k;
            const currentShowPie = showPieChartsRef.current;
            const currentSelectedEmotions = selectedEmotionsRef.current;
            const currentHoveredEmotion = hoveredEmotionRef.current;
            
            g.selectAll('g.node-group').each(function(d) {
                const nodeG = d3.select(this);
                
                let nodeSize = d.size;
                
                // For clusters, check if sizing by features is enabled
                if (d.type === 'cluster') {
                    const useSizeByFeatures = sizeClustersByFeaturesRef.current;
                    if (useSizeByFeatures && d.num_features) {
                        const minClusterSize = 10;
                        const maxClusterSize = 100;
                        const maxFeatures = 1036;
                        const scaleFactor = Math.log(d.num_features + 1) / Math.log(maxFeatures + 1);
                        nodeSize = minClusterSize + scaleFactor * (maxClusterSize - minClusterSize);
                    }
                }
                
                if (d.type !== 'cluster' && (currentHoveredEmotion || (currentSelectedEmotions.size > 0 && !currentShowPie))) {
                    const targetEmotion = currentHoveredEmotion || null;
                    const emotionsToCheck = targetEmotion ? [targetEmotion] : Array.from(currentSelectedEmotions);
                    const useRelative = useRelativeActivationRef.current;
                    
                    if (emotionsToCheck.length > 0) {
                        // Calculate mean if relative is enabled
                        let meanActivation = 0;
                        if (useRelative && d.activations) {
                            const demographics = ['Male', 'Female', 'Kid', 'Adult', 'Teenager'];
                            const emotionValues = Object.entries(d.activations)
                                .filter(([label]) => !demographics.includes(label))
                                .map(([, value]) => value);
                            meanActivation = emotionValues.reduce((sum, val) => sum + val, 0) / emotionValues.length;
                        }
                        
                        let maxActivation = 0;
                        emotionsToCheck.forEach(emotion => {
                            let activation = d.activations?.[emotion] || 0;
                            
                            // Apply relative activation with filter intensity if enabled
                            if (useRelative) {
                                const intensityFactor = filterIntensityRef.current / 100;
                                activation = Math.max(0, activation - (meanActivation * intensityFactor));
                            }
                            
                            if (activation > maxActivation) {
                                maxActivation = activation;
                            }
                        });
                        
                        const minSize = 10;
                        const maxSize = 200;
                        const amplifiedActivation = Math.min(maxActivation * 10, 1);
                        nodeSize = minSize + (amplifiedActivation * (maxSize - minSize));
                    }
                }
                
                if (d.type === 'cluster' || !currentShowPie) {
                    nodeG.select('circle')
                        .attr('r', nodeSize)
                        .attr('stroke-width', 1.5);
                } else {
                    const arc = d3.arc()
                        .innerRadius(0)
                        .outerRadius(nodeSize);
                    
                    nodeG.selectAll('path.pie-slice')
                        .attr('d', arc)
                        .attr('stroke-width', 0.5);
                }
            });
        }
        
        // Update Voronoi to reflect emotion filters
        if (window.renderVoronoi) {
            window.renderVoronoi();
        }
    }, [selectedEmotions]);

    // Update annotations when annotations array changes
    useEffect(() => {
        if (window.renderAnnotations) {
            window.renderAnnotations();
        }
    }, [annotations]);

    // Update cluster visibility when showClusters changes
    useEffect(() => {
        d3.select(svgRef.current)
            .selectAll('g.node-group.cluster circle')
            .style('opacity', showClusters ? 0.3 : 0);
    }, [showClusters]);

    // Show/hide links in Voronoi mode
    useEffect(() => {
        const svg = d3.select(svgRef.current);
        
        // Hide links in Voronoi mode
        svg.selectAll('line.link')
            .style('display', showVoronoi ? 'none' : null);
        
        // Voronoi layer always accepts pointer events when visible
        svg.select('.voronoi-layer')
            .style('pointer-events', showVoronoi ? 'all' : 'none');
    }, [showVoronoi]);

    // Update hexbin heatmap when demographics or relative activation mode changes
    useEffect(() => {
        if (window.updateHexbinHeatmap) {
            window.updateHexbinHeatmap();
        }
    }, [activeDemographics, useRelativeActivation]);

    return <svg ref={svgRef} className="network-graph" />;
}

export default NetworkGraph;

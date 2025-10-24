/**
 * ThumbnailLayer - Renders annotation thumbnails on nodes
 * Thumbnails appear when annotations are collapsed
 */

import { useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';
import { EMOTION_COLORS } from '../../constants';

/**
 * ThumbnailLayer component
 * @param {Object} gSelection - D3 selection of main g element
 * @param {Array} nodes - Graph nodes
 * @param {Object} transform - Current zoom transform
 * @param {Function} onThumbnailClick - Callback when thumbnail is clicked
 */
export const ThumbnailLayer = ({
  gSelection,
  nodes,
  transform,
  onThumbnailClick
}) => {
  const thumbnailGroupRef = useRef(null);
  const activeThumbnailsRef = useRef(new Map()); // Map<annotationId, {nodeId, imageUrl}>

  // Initialize layer
  useEffect(() => {
    if (!gSelection) return;

    let thumbnailLayer = gSelection.select('g.thumbnail-layer');
    if (thumbnailLayer.empty()) {
      thumbnailLayer = gSelection.append('g')
        .attr('class', 'thumbnail-layer');
    }

    thumbnailLayer.raise();

    // Create or get thumbnails group
    let group = thumbnailLayer.select('g.annotation-thumbnails');
    if (group.empty()) {
      // Insert after voronoi layer so thumbnails appear on top
      group = thumbnailLayer.append('g')
        .attr('class', 'annotation-thumbnails')
        .style('pointer-events', 'all'); // Enable pointer events so thumbnails are selectable
    }
    
    // Always raise to ensure it's on top (in case layers are re-ordered)
    group.raise();
    
    thumbnailGroupRef.current = group;
    
    // Listen for thumbnail events
    const handleShowThumbnail = (e) => {
      const { annotationId, nodeId, imageUrl } = e.detail;
      activeThumbnailsRef.current.set(annotationId, { nodeId, imageUrl });
      renderThumbnails();
    };
    
    const handleHideThumbnail = (e) => {
      const annotationId = e.detail;
      activeThumbnailsRef.current.delete(annotationId);
      renderThumbnails();
    };
    
    const handleCleanup = (e) => {
      const annotationId = e.detail;
      activeThumbnailsRef.current.delete(annotationId);
      renderThumbnails();
    };
    
    window.addEventListener('show-annotation-thumbnail', handleShowThumbnail);
    window.addEventListener('hide-annotation-thumbnail', handleHideThumbnail);
    window.addEventListener('cleanup-annotation', handleCleanup);
    
    return () => {
      window.removeEventListener('show-annotation-thumbnail', handleShowThumbnail);
      window.removeEventListener('hide-annotation-thumbnail', handleHideThumbnail);
      window.removeEventListener('cleanup-annotation', handleCleanup);
    };
  }, [gSelection]);

  // Render thumbnails
  const renderThumbnails = useCallback(() => {
    if (!thumbnailGroupRef.current) return;
    
    const group = thumbnailGroupRef.current;
    const thumbSize = 80;
    const inverseScale = transform ? 1 / transform.k : 1;
    
    // Prepare data
    const thumbnailData = Array.from(activeThumbnailsRef.current.entries()).map(([annotationId, data]) => {
      const node = nodes.find(n => n.id === data.nodeId);
      return node ? {
        annotationId,
        node,
        imageUrl: data.imageUrl
      } : null;
    }).filter(d => d !== null);
    
    // Data join
    const thumbGroups = group.selectAll('g[data-annotation-id]')
      .data(thumbnailData, d => d.annotationId);
    
    // Enter
    thumbGroups.enter()
      .append('g')
      .attr('data-annotation-id', d => d.annotationId)
      .each(function(d) {
        const thumbGroup = d3.select(this);
        
        const foreignObject = thumbGroup.append('foreignObject')
          .attr('x', -thumbSize / 2)
          .attr('y', -thumbSize / 2)
          .attr('width', thumbSize)
          .attr('height', thumbSize);
        
        const borderColor = EMOTION_COLORS[d.node.primary_emotion] || '#1f77b4';
        
        foreignObject.append('xhtml:div')
          .style('width', thumbSize + 'px')
          .style('height', thumbSize + 'px')
          .style('border', `3px solid ${borderColor}`)
          .style('border-radius', '8px')
          .style('overflow', 'hidden')
          .style('background', 'white')
          .style('box-shadow', '0 4px 12px rgba(0,0,0,0.3)')
          .style('cursor', 'pointer')
          .style('pointer-events', 'all')
          .style('display', 'flex')
          .style('align-items', 'center')
          .style('justify-content', 'center')
          .on('click', function(event, d) {
            event.stopPropagation();
            if (onThumbnailClick) {
              onThumbnailClick(d.annotationId);
            }
          });
      });
    
    // Update (enter + update)
    group.selectAll('g[data-annotation-id]').each(function(d) {
      const thumbGroup = d3.select(this);
      
      // Update position and scale
      thumbGroup.attr('transform', `translate(${d.node.x}, ${d.node.y}) scale(${inverseScale})`);
      
      // Update image
      thumbGroup.select('div')
        .html(`<img src="${d.imageUrl}" style="width: 100%; height: 100%; object-fit: cover; display: block;" />`);
    });
    
    // Exit
    thumbGroups.exit().remove();
  }, [nodes, transform, onThumbnailClick]);

  // Re-render when transform or nodes change
  useEffect(() => {
    renderThumbnails();
    
    // Ensure thumbnails stay on top after re-render
    if (thumbnailGroupRef.current) {
      thumbnailGroupRef.current.raise();
    }
  }, [renderThumbnails]);

  return null; // Renderless component
};

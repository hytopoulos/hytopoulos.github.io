/**
 * AnnotationLineLayer - Renders lines connecting nodes to annotation windows
 */

import { useEffect, useRef, useCallback, useState } from 'react';

/**
 * AnnotationLineLayer component
 * @param {Object} gSelection - D3 selection of main g element
 * @param {Array} annotations - Array of annotations
 * @param {Array} nodes - Graph nodes
 * @param {Set} collapsedAnnotations - Set of collapsed annotation IDs
 */
export const AnnotationLineLayer = ({
  gSelection,
  annotations,
  nodes,
  collapsedAnnotations
}) => {
  const lineGroupRef = useRef(null);
  const collapsedSetRef = useRef(new Set());
  const [renderTrigger, setRenderTrigger] = useState(0);

  // Initialize layer
  useEffect(() => {
    if (!gSelection) return;
    lineGroupRef.current = gSelection.select('g.annotation-layer');
  }, [gSelection]);

  // Listen to thumbnail events to track collapsed state changes
  useEffect(() => {
    const handleShowThumbnail = (e) => {
      collapsedSetRef.current.add(e.detail.annotationId);
      setRenderTrigger(prev => prev + 1);
    };
    
    const handleHideThumbnail = (e) => {
      collapsedSetRef.current.delete(e.detail);
      setRenderTrigger(prev => prev + 1);
    };
    
    const handleCleanup = (e) => {
      collapsedSetRef.current.delete(e.detail);
      setRenderTrigger(prev => prev + 1);
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

  // Render lines
  const renderLines = useCallback(() => {
    if (!lineGroupRef.current) return;

    const group = lineGroupRef.current;
    
    // Clear previous lines
    group.selectAll('.annotation-line').remove();

    annotations.forEach((ann, index) => {
      // Skip if annotation is collapsed (showing thumbnail on node instead)
      if (collapsedSetRef.current.has(ann.id)) return;
      
      const node = nodes.find(n => n.id === ann.nodeId);
      if (!node || !node.x || !node.y) return;

      // Calculate annotation window position (must match the position calculation)
      const offsetX = 20;
      const offsetY = -300 + (index * 50);
      const annotationX = node.x + offsetX;
      const annotationY = node.y + offsetY;

      // Draw line from node to annotation window (both in SVG space)
      group.append('line')
        .attr('class', 'annotation-line')
        .attr('x1', node.x)
        .attr('y1', node.y)
        .attr('x2', annotationX)
        .attr('y2', annotationY)
        .attr('stroke', '#999')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '4,4')
        .attr('opacity', 0.6);
    });
  }, [annotations, nodes]);

  // Update lines when data changes or when collapsed state changes
  useEffect(() => {
    renderLines();
  }, [renderLines, renderTrigger]);

  return null; // Renderless component
};

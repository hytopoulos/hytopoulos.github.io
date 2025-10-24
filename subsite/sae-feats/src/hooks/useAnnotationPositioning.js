/**
 * Custom hook for managing annotation positioning
 * Handles SVG-to-screen coordinate conversion and direct DOM updates
 */

import { useCallback, useEffect, useRef } from 'react';
import { createNodeLookupMap } from '../utils/performanceUtils';

/**
 * Hook to manage annotation window positioning
 * @param {Array} annotations - Annotations array
 * @param {Array} nodes - Graph nodes
 * @param {Object} svgRef - SVG element ref
 * @param {Object} transformRef - D3 transform ref
 * @param {Object} annotationElementsRef - Map of annotation ID -> DOM element
 * @returns {Object} {updatePositions}
 */
export const useAnnotationPositioning = (
  annotations,
  nodes,
  svgRef,
  transformRef,
  annotationElementsRef
) => {
  const updatePositionsRef = useRef(null);
  const cachedRectRef = useRef(null);
  const rafIdRef = useRef(null);
  const pendingTransformRef = useRef(null);

  // Update cached rect on mount and resize
  useEffect(() => {
    const updateCachedRect = () => {
      if (svgRef.current) {
        cachedRectRef.current = svgRef.current.getBoundingClientRect();
      }
    };
    
    updateCachedRect();
    window.addEventListener('resize', updateCachedRect);
    
    return () => window.removeEventListener('resize', updateCachedRect);
  }, [svgRef]);

  // Function to update annotation positions - IMMEDIATE, SYNCHRONOUS
  const updatePositions = useCallback((transform) => {
    if (!annotationElementsRef.current) return;

    // Update cached rect if not available or stale
    if (!cachedRectRef.current && svgRef.current) {
      cachedRectRef.current = svgRef.current.getBoundingClientRect();
    }
    
    if (!cachedRectRef.current) return;

    const nodeMap = createNodeLookupMap(nodes);
    const svgRect = cachedRectRef.current;

    // IMMEDIATE synchronous updates - no RAF, no delay
    annotations.forEach((ann, index) => {
      const node = nodeMap.get(ann.nodeId);
      if (!node || node.x === undefined || node.y === undefined) return;

      const element = annotationElementsRef.current.get(ann.id);
      if (!element) return;

      // Skip if element is being dragged
      if (element.classList.contains('dragging')) return;

      // Calculate position
      const offsetX = 20;
      const offsetY = -300 + (index * 50);
      
      const screenX = (node.x + offsetX) * transform.k + transform.x + svgRect.left;
      const screenY = (node.y + offsetY) * transform.k + transform.y + svgRect.top;
      
      // IMMEDIATE DOM update - happens BEFORE React re-render
      element.style.transform = `translate3d(${screenX}px, ${screenY}px, 0)`;
      element.style.willChange = 'transform';
    });
  }, [annotations, nodes, annotationElementsRef, svgRef]);

  // Store in ref for access in closures
  updatePositionsRef.current = updatePositions;

  // Apply initial positions on mount and when annotations/nodes change
  useEffect(() => {
    // Small delay to ensure refs are set
    const timer = setTimeout(() => {
      if (transformRef.current) {
        updatePositions(transformRef.current);
      }
    }, 0);
    
    return () => clearTimeout(timer);
  }, [annotations, nodes, transformRef, updatePositions]);
  
  // Listen for force update events
  useEffect(() => {
    const handleForceUpdate = () => {
      if (transformRef.current) {
        updatePositions(transformRef.current);
      }
    };
    
    window.addEventListener('force-annotation-update', handleForceUpdate);
    return () => window.removeEventListener('force-annotation-update', handleForceUpdate);
  }, [transformRef, updatePositions]);

  return { updatePositions, updatePositionsRef };
};

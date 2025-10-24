/**
 * Custom hook to consolidate all graph-related refs
 * Reduces mental overhead and provides single source of truth
 */

import { useRef } from 'react';
import * as d3 from 'd3';

/**
 * Consolidated refs for NetworkGraph
 * @returns {Object} Ref object with all graph refs
 */
export const useGraphRefs = () => {
  const refs = useRef({
    // Core SVG elements
    svg: null,
    mainGroup: null,
    
    // D3 objects
    simulation: null,
    transform: d3.zoomIdentity,
    
    // Layer groups
    layers: {
      annotation: null
    },
    
    // Current state refs (for accessing in closures)
    current: {
      annotations: [],
      nodes: [],
      collapsedAnnotations: new Set()
    },
    
    // Function refs (for calling from event handlers)
    functions: {
      updateAnnotationPositions: null,
      updateAnnotationLines: null
    },
    
    // Element maps
    elements: {
      annotations: new Map() // annotation ID -> DOM element
    }
  });

  return refs.current;
};

/**
 * Custom hook for managing D3 zoom transform state
 */

import { useRef, useCallback } from 'react';
import * as d3 from 'd3';
import { ZOOM } from '../constants';

/**
 * Hook to manage zoom transform state
 * @returns {Object} { transform, setTransform, getScale, resetZoom }
 */
export const useZoomTransform = () => {
  const transformRef = useRef(d3.zoomIdentity);

  /**
   * Update the transform
   * @param {d3.ZoomTransform} newTransform - New transform
   */
  const setTransform = useCallback((newTransform) => {
    transformRef.current = newTransform;
  }, []);

  /**
   * Get current zoom scale
   * @returns {number} Current scale (k value)
   */
  const getScale = useCallback(() => {
    return transformRef.current.k;
  }, []);

  /**
   * Get current transform position
   * @returns {Object} { x, y } transform translation
   */
  const getPosition = useCallback(() => {
    return {
      x: transformRef.current.x,
      y: transformRef.current.y
    };
  }, []);

  /**
   * Reset zoom to identity
   */
  const resetZoom = useCallback(() => {
    transformRef.current = d3.zoomIdentity;
  }, []);

  /**
   * Calculate inverse scaled size (for zoom-independent elements)
   * @param {number} baseSize - Base size at scale 1
   * @returns {number} Scaled size
   */
  const getInverseScaledSize = useCallback((baseSize) => {
    return baseSize / transformRef.current.k;
  }, []);

  /**
   * Convert screen coordinates to data space
   * @param {number} screenX - X in screen space
   * @param {number} screenY - Y in screen space
   * @returns {Object} { x, y } in data space
   */
  const screenToDataSpace = useCallback((screenX, screenY) => {
    const k = transformRef.current.k;
    const tx = transformRef.current.x;
    const ty = transformRef.current.y;
    
    return {
      x: (screenX - tx) / k,
      y: (screenY - ty) / k
    };
  }, []);

  /**
   * Convert data coordinates to screen space
   * @param {number} dataX - X in data space
   * @param {number} dataY - Y in data space
   * @returns {Object} { x, y } in screen space
   */
  const dataToScreenSpace = useCallback((dataX, dataY) => {
    const k = transformRef.current.k;
    const tx = transformRef.current.x;
    const ty = transformRef.current.y;
    
    return {
      x: dataX * k + tx,
      y: dataY * k + ty
    };
  }, []);

  return {
    transform: transformRef.current,
    transformRef, // Expose ref for direct access in D3 callbacks
    setTransform,
    getScale,
    getPosition,
    resetZoom,
    getInverseScaledSize,
    screenToDataSpace,
    dataToScreenSpace
  };
};

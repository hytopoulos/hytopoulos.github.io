/**
 * Custom hook for managing tooltip state
 */

import { useState, useCallback } from 'react';

/**
 * Hook to manage tooltip visibility and positioning
 * @returns {Object} { tooltipData, tooltipPosition, showTooltip, hideTooltip }
 */
export const useTooltip = () => {
  const [tooltipData, setTooltipData] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  /**
   * Show tooltip with data at position
   * @param {Object} data - Data to display in tooltip
   * @param {Object} position - { x, y } screen coordinates
   */
  const showTooltip = useCallback((data, position) => {
    setTooltipData(data);
    setTooltipPosition(position);
  }, []);

  /**
   * Show tooltip with data from event
   * @param {Object} data - Data to display in tooltip
   * @param {Event} event - Mouse event containing pageX/pageY
   */
  const showTooltipFromEvent = useCallback((data, event) => {
    setTooltipData(data);
    setTooltipPosition({ x: event.pageX, y: event.pageY });
  }, []);

  /**
   * Hide tooltip
   */
  const hideTooltip = useCallback(() => {
    setTooltipData(null);
  }, []);

  /**
   * Update tooltip position from event
   * @param {Event} event - Mouse event containing pageX/pageY
   */
  const updateTooltipPosition = useCallback((event) => {
    setTooltipPosition({ x: event.pageX, y: event.pageY });
  }, []);

  return {
    tooltipData,
    tooltipPosition,
    setTooltipData,
    setTooltipPosition,
    showTooltip,
    showTooltipFromEvent,
    hideTooltip,
    updateTooltipPosition
  };
};

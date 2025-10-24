/**
 * Context for tooltip state and positioning
 * Provides access to tooltip display and control
 */

import React, { createContext, useContext } from 'react';
import { useTooltip } from '../hooks';

const TooltipContext = createContext(null);

export const TooltipProvider = ({ children }) => {
  const tooltipState = useTooltip();

  return (
    <TooltipContext.Provider value={tooltipState}>
      {children}
    </TooltipContext.Provider>
  );
};

/**
 * Hook to access tooltip state and actions from context
 * @returns {Object} { tooltipData, tooltipPosition, showTooltip, hideTooltip, ... }
 */
export const useTooltipContext = () => {
  const context = useContext(TooltipContext);
  if (!context) {
    throw new Error('useTooltipContext must be used within TooltipProvider');
  }
  return context;
};

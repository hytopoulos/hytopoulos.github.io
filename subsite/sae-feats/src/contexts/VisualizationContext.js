/**
 * Context for visualization settings
 * Eliminates prop drilling for 13+ visualization-related props
 */

import React, { createContext, useContext } from 'react';
import { useVisualizationSettings } from '../hooks';

const VisualizationContext = createContext(null);

export const VisualizationProvider = ({ children }) => {
  const settings = useVisualizationSettings();

  return (
    <VisualizationContext.Provider value={settings}>
      {children}
    </VisualizationContext.Provider>
  );
};

/**
 * Hook to access visualization settings from context
 * @returns {Object} Visualization settings and functions
 */
export const useVisualization = () => {
  const context = useContext(VisualizationContext);
  if (!context) {
    throw new Error('useVisualization must be used within VisualizationProvider');
  }
  return context;
};

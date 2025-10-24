/**
 * Central export for all contexts and providers
 */

import React from 'react';
import { VisualizationProvider } from './VisualizationContext';
import { AnnotationProvider } from './AnnotationContext';
import { TooltipProvider } from './TooltipContext';

export * from './VisualizationContext';
export * from './AnnotationContext';
export * from './TooltipContext';

/**
 * Combined provider that wraps all context providers
 * Usage: <AppProvider><App /></AppProvider>
 */
export const AppProvider = ({ children }) => {
  return (
    <VisualizationProvider>
      <AnnotationProvider>
        <TooltipProvider>
          {children}
        </TooltipProvider>
      </AnnotationProvider>
    </VisualizationProvider>
  );
};

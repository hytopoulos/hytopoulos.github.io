/**
 * Context for annotation management
 * Provides access to annotations and annotation actions
 */

import React, { createContext, useContext } from 'react';
import { useAnnotations } from '../hooks';

const AnnotationContext = createContext(null);

export const AnnotationProvider = ({ children }) => {
  const annotationState = useAnnotations();

  return (
    <AnnotationContext.Provider value={annotationState}>
      {children}
    </AnnotationContext.Provider>
  );
};

/**
 * Hook to access annotation state and actions from context
 * @returns {Object} { annotations, addAnnotation, removeAnnotation, clearAnnotations }
 */
export const useAnnotationContext = () => {
  const context = useContext(AnnotationContext);
  if (!context) {
    throw new Error('useAnnotationContext must be used within AnnotationProvider');
  }
  return context;
};

/**
 * Custom hook for managing image annotation state
 */

import { useState, useCallback } from 'react';

/**
 * Hook to manage annotations (image search results)
 * @returns {Object} { annotations, addAnnotation, removeAnnotation }
 */
export const useAnnotations = () => {
  const [annotations, setAnnotations] = useState([]);
  const [nextAnnotationId, setNextAnnotationId] = useState(0);

  /**
   * Add a new annotation for a node
   * @param {Object} nodeData - Node data to annotate
   */
  const addAnnotation = useCallback((nodeData) => {
    // Only allow annotations on feature nodes and cluster nodes with vectors
    if (nodeData.type === 'feature' || (nodeData.type === 'cluster' && nodeData.feature_vector_b64)) {
      setNextAnnotationId(prevId => {
        const newId = prevId;
        const newAnnotation = {
          id: newId,
          nodeId: nodeData.id,
          featureData: nodeData
        };

        console.log('Adding annotation:', newAnnotation.id, 'Total annotations will be:', annotations.length + 1);

        setAnnotations(prevAnnotations => [...prevAnnotations, newAnnotation]);

        return prevId + 1;
      });
    }
  }, [annotations.length]);

  /**
   * Remove an annotation by ID
   * @param {number} annotationId - ID of annotation to remove
   */
  const removeAnnotation = useCallback((annotationId) => {
    console.log('Closing annotation:', annotationId);

    // Cleanup thumbnails if annotation was minimized
    window.dispatchEvent(new CustomEvent('cleanup-annotation', { detail: annotationId }));

    setAnnotations(prevAnnotations => {
      const filtered = prevAnnotations.filter(ann => ann.id !== annotationId);
      console.log('Remaining annotations:', filtered.map(a => a.id));
      return filtered;
    });
  }, []);

  /**
   * Clear all annotations
   */
  const clearAnnotations = useCallback(() => {
    annotations.forEach(ann => {
      window.dispatchEvent(new CustomEvent('cleanup-annotation', { detail: ann.id }));
    });
    setAnnotations([]);
    setNextAnnotationId(0);
  }, [annotations]);

  return {
    annotations,
    addAnnotation,
    removeAnnotation,
    clearAnnotations
  };
};

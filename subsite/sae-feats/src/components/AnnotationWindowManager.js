/**
 * AnnotationWindowManager - Manages all floating annotation windows
 */

import React, { useEffect, useRef } from 'react';
import ImageAnnotation from './ImageAnnotation';

/**
 * Manages rendering of all annotation windows
 * @param {Array} annotations - Array of annotations
 * @param {Array} nodes - Graph nodes
 * @param {Object} svgRef - SVG element reference
 * @param {Function} onClose - Close callback
 * @param {Object} annotationElementsRef - Map to store annotation DOM elements
 */
export const AnnotationWindowManager = ({
  annotations,
  nodes,
  svgRef,
  onClose,
  annotationElementsRef,
  biasMeanVectors,
  genderBiasSteering,
  ageBiasSteering,
  biasReductionStrength
}) => {
  const mountedRef = useRef(false);
  
  // Trigger a position update after mount
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      // Force position update after refs are set
      const event = new CustomEvent('force-annotation-update');
      window.dispatchEvent(event);
    }
  }, []);
  
  return (
    <>
      {annotations.map((annotation) => {
        const node = nodes.find(n => n.id === annotation.nodeId);
        if (!node) return null;
        
        // Pass static position - hook will set actual position immediately via DOM
        return (
          <ImageAnnotation
            key={annotation.id}
            annotationId={annotation.id}
            featureData={annotation.featureData}
            position={{ x: 0, y: 0 }}
            onClose={onClose}
            biasMeanVectors={biasMeanVectors}
            genderBiasSteering={genderBiasSteering}
            ageBiasSteering={ageBiasSteering}
            biasReductionStrength={biasReductionStrength}
            ref={(el) => {
              if (el) {
                annotationElementsRef.current.set(annotation.id, el);
              } else {
                annotationElementsRef.current.delete(annotation.id);
              }
            }}
          />
        );
      })}
    </>
  );
};

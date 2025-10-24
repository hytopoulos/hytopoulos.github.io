import React, { useState, useEffect, forwardRef } from 'react';
import './ImageAnnotation.css';
import { BACKEND_URL, TOP_K } from '../constants';
import { l2norm, applyDebiasing, decodeBase64Vector } from '../utils';

const ImageAnnotation = forwardRef(({
  featureData,
  position,
  onClose,
  annotationId,
  biasMeanVectors,
  genderBiasSteering,
  ageBiasSteering,
  biasReductionStrength
}, ref) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // When collapsed, dispatch event to show thumbnail on node
  useEffect(() => {
    if (isCollapsed && images.length > 0) {
      window.dispatchEvent(new CustomEvent('show-annotation-thumbnail', {
        detail: {
          annotationId,
          nodeId: featureData.id,
          imageUrl: images[0].url
        }
      }));
    } else {
      window.dispatchEvent(new CustomEvent('hide-annotation-thumbnail', {
        detail: annotationId
      }));
    }
  }, [isCollapsed, images, annotationId, featureData.id]);

  // Listen for expand event from thumbnail clicks
  useEffect(() => {
    const handleExpand = (e) => {
      if (e.detail === annotationId) {
        setIsCollapsed(false);
      }
    };
    
    window.addEventListener('expand-annotation', handleExpand);
    return () => window.removeEventListener('expand-annotation', handleExpand);
  }, [annotationId]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [draggedPosition, setDraggedPosition] = useState(null);

  useEffect(() => {
    if (featureData && featureData.feature_vector_b64) {
      searchImages();
    }
  }, [
    featureData,
    biasMeanVectors,
    genderBiasSteering,
    ageBiasSteering,
    biasReductionStrength
  ]);

  const searchImages = async () => {
    setLoading(true);
    setError(null);

    try {
      const baseB64 = featureData.original_feature_vector_b64 || featureData.feature_vector_b64;
      const sourceVector = decodeBase64Vector(baseB64);
      const shouldDebias = (genderBiasSteering || ageBiasSteering) && !!biasMeanVectors;
      const reductionFactor = Math.max(0, Math.min(1, (biasReductionStrength ?? 100) / 100));
      const debiasedVector = shouldDebias
        ? applyDebiasing(sourceVector, biasMeanVectors, {
            genderBiasSteering,
            ageBiasSteering,
            biasReductionStrength: reductionFactor
          })
        : sourceVector;

      const normalizedVector = l2norm(Array.from(debiasedVector));

      const payload = {
        terms: [{
          embedding: normalizedVector,
          weight: 1
        }],
        include_video: true,
        debug_enabled: false,
        k: TOP_K
      };

      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      const matches = (data.matches || []).map(m => ({
        score: m[0],
        url: m[1],
        size: m[4]
      }));

      setImages(matches);
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Drag handlers
  const handleMouseDown = (e) => {
    // Don't start dragging if clicking on buttons
    if (e.target.closest('.annotation-actions')) {
      return;
    }
    
    if (e.target.closest('.annotation-header')) {
      setIsDragging(true);
      const currentPos = draggedPosition || position;
      setDragOffset({
        x: e.clientX - currentPos.x,
        y: e.clientY - currentPos.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setDraggedPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    // Keep the dragged position so annotation stays where user dragged it
    // (draggedPosition is already set by handleMouseMove)
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  // When collapsed, don't render the floating window (thumbnail will show on node instead)
  if (isCollapsed) {
    return null;
  }

  return (
    <div
      ref={ref}
      className={`image-annotation ${isDragging ? 'dragging' : ''}`}
      style={{
        // Set transform when dragging OR when user has manually positioned it
        // Otherwise, useAnnotationPositioning hook handles positioning via direct DOM manipulation
        ...(draggedPosition ? {
          transform: `translate3d(${draggedPosition.x}px, ${draggedPosition.y}px, 0)`
        } : {}),
        cursor: isDragging ? 'grabbing' : 'default'
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="annotation-header" style={{ cursor: isDragging ? 'grabbing' : 'grab' }}>
        <div className="annotation-title">
          <span className="feature-id">
            {featureData.type === 'cluster' 
              ? `Cluster ${featureData.label}${featureData.num_features ? ` (${featureData.num_features} features)` : ''}`
              : `Feature ${featureData.feature_id}`
            }
          </span>
          <span className="feature-emotion">{featureData.primary_emotion}</span>
        </div>
        <div className="annotation-actions" style={{ pointerEvents: 'auto' }}>
          <button 
            className="toggle-button" 
            onClick={(e) => {
              e.stopPropagation();
              setIsCollapsed(!isCollapsed);
            }}
            title={isCollapsed ? "Expand" : "Collapse"}
          >
            {isCollapsed ? '□' : '−'}
          </button>
          <button 
            className="close-button" 
            onClick={() => onClose(annotationId)}
            title="Close"
          >
            ×
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="annotation-body">
          {loading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading...</p>
            </div>
          )}

          {error && (
            <div className="error-state">
              <p>Error: {error}</p>
              <button onClick={searchImages}>Retry</button>
            </div>
          )}

          {!loading && !error && images.length === 0 && (
            <div className="empty-state">
              <p>No images</p>
            </div>
          )}

          {!loading && !error && images.length > 0 && (
            <div className="image-grid">
              {images.map((img, idx) => (
                <div key={idx} className="image-item">
                  <img src={img.url} alt={`Result ${idx + 1}`} />
                  <div className="image-info">
                    <span className="score">{img.score?.toFixed(3)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
});

export default ImageAnnotation;

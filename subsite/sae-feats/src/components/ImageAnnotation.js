import React, { useState, useEffect } from 'react';
import './ImageAnnotation.css';

const BACKEND_URL = 'https://nooscope.osmarks.net/backend';
const TOP_K = 12;

function ImageAnnotation({ featureData, position, onClose, annotationId }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (featureData && featureData.feature_vector_b64) {
      searchImages();
    }
  }, [featureData]);

  const base64ToFloat32Array = (base64String) => {
    const binaryString = atob(base64String);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return new Float32Array(bytes.buffer);
  };

  const l2norm = (vec) => {
    const norm = Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0));
    return vec.map(v => v / (norm || 1e-8));
  };

  const searchImages = async () => {
    setLoading(true);
    setError(null);

    try {
      const featureVector = base64ToFloat32Array(featureData.feature_vector_b64);
      const normalizedVector = l2norm(Array.from(featureVector));

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

  return (
    <div 
      className={`image-annotation ${isCollapsed ? 'collapsed' : ''}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <div className="annotation-header">
        <div className="annotation-title">
          <span className="feature-id">
            {featureData.type === 'cluster' 
              ? `Cluster ${featureData.label}${featureData.num_features ? ` (${featureData.num_features} features)` : ''}`
              : `Feature ${featureData.feature_id}`
            }
          </span>
          <span className="feature-emotion">{featureData.primary_emotion}</span>
        </div>
        <div className="annotation-actions">
          <button 
            className="toggle-button" 
            onClick={() => setIsCollapsed(!isCollapsed)}
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
}

export default ImageAnnotation;

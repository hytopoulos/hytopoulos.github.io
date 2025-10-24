import React, { useState, useEffect } from 'react';
import './ImageSearchModal.css';

const BACKEND_URL = 'https://nooscope.osmarks.net/backend';
const TOP_K = 20;

function ImageSearchModal({
  featureData,
  onClose,
  biasMeanVectors,
  genderBiasSteering,
  ageBiasSteering,
  biasReductionStrength
}) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const l2norm = (vec) => {
    const norm = Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0));
    return vec.map(v => v / (norm || 1e-8));
  };

  const searchImages = async () => {
    setLoading(true);
    setError(null);

    try {
      const baseB64 = featureData.original_feature_vector_b64 || featureData.feature_vector_b64;
      const binaryString = atob(baseB64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      let vector = new Float32Array(bytes.buffer);

      if ((genderBiasSteering || ageBiasSteering) && biasMeanVectors) {
        const reductionFactor = Math.max(0, Math.min(1, (biasReductionStrength ?? 100) / 100));
        // applyDebiasing expects Float32Array, import lazily to avoid bundle bloat
        const { applyDebiasing } = await import('../utils');
        vector = applyDebiasing(vector, biasMeanVectors, {
          genderBiasSteering,
          ageBiasSteering,
          biasReductionStrength: reductionFactor
        });
      }

      const normalizedVector = l2norm(Array.from(vector));

      // Build payload
      const payload = {
        terms: [{
          embedding: normalizedVector,
          weight: 1
        }],
        include_video: true,
        debug_enabled: false,
        k: TOP_K
      };

      // Query backend
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
      
      // Parse matches: [score, url, ?, ?, size]
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

  if (!featureData) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>Feature {featureData.feature_id}</h2>
            <p className="feature-emotion">{featureData.primary_emotion}</p>
          </div>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {loading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Searching images...</p>
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
              <p>No images found</p>
            </div>
          )}

          {!loading && !error && images.length > 0 && (
            <div className="image-grid">
              {images.map((img, idx) => (
                <div key={idx} className="image-card">
                  <img src={img.url} alt={`Result ${idx + 1}`} />
                  <div className="image-caption">
                    <span className="score">{img.score?.toFixed(4)}</span>
                    {img.size && <span className="size">{img.size}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ImageSearchModal;

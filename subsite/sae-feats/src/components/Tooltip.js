import React from 'react';
import './Tooltip.css';

function Tooltip({ data, position }) {
  if (!data) return null;

  const isCluster = data.type === 'cluster';
  const header = isCluster ? `Cluster ${data.label}` : `Feature ${data.feature_id}`;

  return (
    <div 
      className="tooltip"
      style={{
        left: `${position.x + 10}px`,
        top: `${position.y - 10}px`,
        opacity: 1
      }}
    >
      <div className="tooltip-header">
        <strong>{header}</strong>
      </div>
      <div className="tooltip-body">
        {isCluster && data.num_features && (
          <div className="tooltip-row">
            <span className="label">Features:</span>
            <span className="value">{data.num_features}</span>
          </div>
        )}
        {data.primary_emotion && (
          <>
            <div className="tooltip-row">
              <span className="label">Primary:</span>
              <span className="value">{data.primary_emotion}</span>
            </div>
            <div className="tooltip-row">
              <span className="label">Activation:</span>
              <span className="value">{data.primary_activation.toFixed(6)}</span>
            </div>
          </>
        )}
        {data.top3_emotions && (
          <div className="tooltip-section">
            <strong>Top 3 Emotions:</strong>
            {data.top3_emotions.map(([emotion, value], idx) => (
              <div key={idx} className="tooltip-row small">
                <span className="label">{emotion}:</span>
                <span className="value">{value.toFixed(6)}</span>
              </div>
            ))}
          </div>
        )}
        {isCluster && data.feature_vector_b64 && (
          <div className="tooltip-hint" style={{ marginTop: '8px', fontSize: '11px', fontStyle: 'italic', color: '#666' }}>
            Click to query images
          </div>
        )}
      </div>
    </div>
  );
}

export default Tooltip;

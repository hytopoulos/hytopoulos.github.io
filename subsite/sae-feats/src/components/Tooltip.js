import React from 'react';
import './Tooltip.css';

function Tooltip({ data, position }) {
  if (!data) return null;

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
        <strong>Feature {data.feature_id}</strong>
      </div>
      <div className="tooltip-body">
        <div className="tooltip-row">
          <span className="label">Primary:</span>
          <span className="value">{data.primary_emotion}</span>
        </div>
        <div className="tooltip-row">
          <span className="label">Activation:</span>
          <span className="value">{data.primary_activation.toFixed(6)}</span>
        </div>
        <div className="tooltip-section">
          <strong>Top 3 Emotions:</strong>
          {data.top3_emotions.map(([emotion, value], idx) => (
            <div key={idx} className="tooltip-row small">
              <span className="label">{emotion}:</span>
              <span className="value">{value.toFixed(6)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Tooltip;

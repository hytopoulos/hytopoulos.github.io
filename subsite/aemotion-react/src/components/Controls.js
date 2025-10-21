import React from 'react';
import './Controls.css';

function Controls({ onRestart, onToggleClusters, showClusters }) {
  return (
    <div className="controls">
      <h3>Feature Network</h3>
      <div className="button-group">
        <button onClick={onRestart}>Restart</button>
        <button onClick={onToggleClusters}>
          {showClusters ? 'Hide' : 'Show'} Clusters
        </button>
      </div>
    </div>
  );
}

export default Controls;

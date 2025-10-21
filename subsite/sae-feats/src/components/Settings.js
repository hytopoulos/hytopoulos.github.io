import React, { useState } from 'react';
import './Settings.css';
import graphData from '../data.json';

function Settings({ onLabelToggle, activeLabels, showPieCharts, onPieChartToggle, useRelativeActivation, onRelativeActivationToggle }) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Get all labels from data
  const allLabels = graphData.labels || [];
  
  // Categorize labels
  const demographics = ['Male', 'Female', 'Kid', 'Adult', 'Teenager'];
  const emotions = allLabels.filter(label => !demographics.includes(label));

  return (
    <>
      <button 
        className="settings-button"
        onClick={() => setIsOpen(!isOpen)}
        title="Settings"
      >
        ⚙️
      </button>
      
      {isOpen && (
        <div className="settings-panel">
          <div className="settings-header">
            <h3>Settings</h3>
            <button className="close-btn" onClick={() => setIsOpen(false)}>×</button>
          </div>
          <div className="settings-content">
            
            <h4 className="section-title">Visualization</h4>
            <label className="checkbox-item">
              <input
                type="checkbox"
                checked={showPieCharts}
                onChange={onPieChartToggle}
              />
              <span>Show Pie Charts (emotion breakdown)</span>
            </label>
            
            <label className="checkbox-item">
              <input
                type="checkbox"
                checked={useRelativeActivation}
                onChange={onRelativeActivationToggle}
              />
              <span>Use Relative Activation (vs mean)</span>
            </label>
            
            <h4 className="section-title">Heatmap Overlays</h4>
            
            <h5 className="subsection-title">Demographics</h5>
            <div className="checkbox-section">
              {demographics.map(demo => (
                <label key={demo} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={activeLabels.has(demo)}
                    onChange={() => onLabelToggle(demo)}
                  />
                  <span>{demo}</span>
                </label>
              ))}
            </div>
            
            <h5 className="subsection-title">Emotions</h5>
            <div className="checkbox-section">
              {emotions.map(emotion => (
                <label key={emotion} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={activeLabels.has(emotion)}
                    onChange={() => onLabelToggle(emotion)}
                  />
                  <span>{emotion}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Settings;

import React, { useState } from 'react';
import './Settings.css';
import graphData from '../data.json';

function Settings({ onLabelToggle, activeLabels }) {
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
            <h3>Heatmap Overlays</h3>
            <button className="close-btn" onClick={() => setIsOpen(false)}>×</button>
          </div>
          <div className="settings-content">
            <p className="settings-description">
              Visualize activation heatmaps for emotions and demographics
            </p>
            
            <h4 className="section-title">Demographics</h4>
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
            
            <h4 className="section-title">Emotions</h4>
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

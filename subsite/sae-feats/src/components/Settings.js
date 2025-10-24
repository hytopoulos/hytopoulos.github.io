import React, { useState } from 'react';
import './Settings.css';
import { useVisualization } from '../contexts';

function Settings() {
  const [isOpen, setIsOpen] = useState(false);
  
  // Get all settings from Context
  const {
    showPieCharts,
    toggleShowPieCharts,
    useRelativeActivation,
    toggleUseRelativeActivation,
    sizeClustersByFeatures,
    toggleSizeClustersByFeatures,
    showVoronoi,
    toggleShowVoronoi,
    showHeatmap,
    toggleShowHeatmap,
    filterIntensity,
    setFilterIntensity,
    showNodes,
    toggleShowNodes,
    genderBiasSteering,
    toggleGenderBiasSteering,
    ageBiasSteering,
    toggleAgeBiasSteering,
    biasReductionStrength,
    setBiasReductionStrength,
    themeMode,
    setThemeMode
  } = useVisualization();
  

  const handleThemeChange = (mode) => {
    setThemeMode(mode);
  };

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
                onChange={toggleShowPieCharts}
              />
              <span>Show Pie Charts (emotion breakdown)</span>
            </label>
            
            <label className="checkbox-item">
              <input
                type="checkbox"
                checked={useRelativeActivation}
                onChange={toggleUseRelativeActivation}
              />
              <span>Use Relative Activation (vs mean)</span>
            </label>
            
            {useRelativeActivation && (
              <div className="slider-item">
                <label>
                  <span>Filter Intensity: {filterIntensity}% of mean</span>
                  <input
                    type="range"
                    min="0"
                    max="500"
                    value={filterIntensity}
                    onChange={(e) => setFilterIntensity(Number(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </label>
              </div>
            )}
            
            <label className="checkbox-item">
              <input
                type="checkbox"
                checked={sizeClustersByFeatures}
                onChange={toggleSizeClustersByFeatures}
              />
              <span>Size Clusters by Feature Count</span>
            </label>
            
            <label className="checkbox-item">
              <input
                type="checkbox"
                checked={showVoronoi}
                onChange={toggleShowVoronoi}
              />
              <span>Show Voronoi Cells</span>
            </label>
            
            <label className="checkbox-item">
              <input
                type="checkbox"
                checked={showNodes}
                onChange={toggleShowNodes}
              />
              <span>Show Nodes</span>
            </label>
            
            <label className="checkbox-item">
              <input
                type="checkbox"
                checked={showHeatmap}
                onChange={toggleShowHeatmap}
              />
              <span>Show Heatmap (uses filter selections)</span>
            </label>
            
            <h4 className="section-title">Bias Steering</h4>
            
            <label className="checkbox-item">
              <input
                type="checkbox"
                checked={genderBiasSteering}
                onChange={toggleGenderBiasSteering}
              />
              <span>Gender Bias Steering</span>
            </label>
            
            <label className="checkbox-item">
              <input
                type="checkbox"
                checked={ageBiasSteering}
                onChange={toggleAgeBiasSteering}
              />
              <span>Age Bias Steering</span>
            </label>
            
            <div className="slider-container" style={{ opacity: (genderBiasSteering || ageBiasSteering) ? 1 : 0.5 }}>
              <label>
                <span>Reduction Strength: {biasReductionStrength}%</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={biasReductionStrength}
                  onChange={(e) => setBiasReductionStrength(parseInt(e.target.value))}
                  disabled={!genderBiasSteering && !ageBiasSteering}
                  style={{ width: '100%' }}
                />
              </label>
            </div>

            <h4 className="section-title">Theme</h4>
            <div className="theme-options">
              {[
                { value: 'system', label: 'System' },
                { value: 'light', label: 'Light' },
                { value: 'dark', label: 'Dark' }
              ].map(option => (
                <label
                  key={option.value}
                  className={`radio-item ${themeMode === option.value ? 'active' : ''}`}
                >
                  <input
                    type="radio"
                    name="theme-mode"
                    value={option.value}
                    checked={themeMode === option.value}
                    onChange={() => handleThemeChange(option.value)}
                  />
                  <span>{option.label}</span>
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

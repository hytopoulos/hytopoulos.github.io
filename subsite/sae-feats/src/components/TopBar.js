import React, { useState } from 'react';
import Settings from './Settings';
import Help from './Help';
import { EMOTION_COLORS } from '../constants';
import './TopBar.css';

function TopBar({ onLabelToggle, activeLabels, showPieCharts, onPieChartToggle }) {
    const [isLegendOpen, setIsLegendOpen] = useState(false);
    const emotions = Object.keys(EMOTION_COLORS);

    return (
        <div className={`top-bar ${isLegendOpen ? 'expanded' : 'collapsed'}`}>
            <button 
                className="legend-toggle"
                onClick={() => setIsLegendOpen(!isLegendOpen)}
            >
                <span className="toggle-arrow">{isLegendOpen ? '▼' : '▲'}</span>
                <span className="toggle-text">{isLegendOpen ? 'Hide Legend' : 'Show Legend'}</span>
            </button>
            
            {isLegendOpen && (
                <div className="legend-section">
                    <div className="legend-grid">
                        {emotions.map(emotion => (
                            <div key={emotion} className="legend-item">
                                <span 
                                    className="legend-color" 
                                    style={{ backgroundColor: EMOTION_COLORS[emotion] }}
                                />
                                <span className="legend-label">{emotion}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            <div className="controls-section">
                <Settings 
                    onLabelToggle={onLabelToggle}
                    activeLabels={activeLabels}
                    showPieCharts={showPieCharts}
                    onPieChartToggle={onPieChartToggle}
                />
                <Help />
            </div>
        </div>
    );
}

export default TopBar;

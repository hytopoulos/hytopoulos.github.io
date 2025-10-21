import React, { useState } from 'react';
import Settings from './Settings';
import Help from './Help';
import './TopBar.css';

// Culturally-aligned emotion colors (matching NetworkGraph)
const EMOTION_COLORS = {
    'Anger': '#DC143C',
    'Annoyance': '#FF6B6B',
    'Fear': '#4A0E4E',
    'Sadness': '#4A90E2',
    'Happiness': '#FFD700',
    'Joy': '#FFA500',
    'Pleasure': '#FF69B4',
    'Excitement': '#FF4500',
    'Peace': '#87CEEB',
    'Affection': '#FFB6C1',
    'Love': '#FF1493',
    'Surprise': '#FFFF00',
    'Confidence': '#9370DB',
    'Pride': '#DAA520',
    'Esteem': '#B8860B',
    'Anticipation': '#FFA07A',
    'Engagement': '#20B2AA',
    'Yearning': '#DDA0DD',
    'Sympathy': '#98FB98',
    'Suffering': '#696969',
    'Pain': '#8B0000',
    'Embarrassment': '#FFB6C1',
    'Sensitivity': '#E6E6FA',
    'Disapproval': '#A0522D',
    'Aversion': '#556B2F',
    'Disconnection': '#708090',
    'Doubt/Confusion': '#D3D3D3',
    'Disquietment': '#8B7D7B',
    'Fatigue': '#C0C0C0',
    'Dominance': '#8B4513',
    'Arousal': '#FF6347',
    'Valence': '#7B68EE'
};

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

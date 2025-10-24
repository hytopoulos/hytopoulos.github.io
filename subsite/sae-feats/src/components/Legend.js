import React, { useState } from 'react';
import './Legend.css';
import { DEMOGRAPHICS, getEmotionsOnly, EMOTION_COLORS } from '../constants';
import { useVisualization } from '../contexts';
import graphData from '../data.json';

const DEMOGRAPHIC_COLORS = {
    Male: '#4C6FFF',
    Female: '#FF6BBA',
    Kid: '#6FCF97',
    Adult: '#888888',
    Teenager: '#F2C94C'
};

const getColorForLabel = (label) => EMOTION_COLORS[label] || DEMOGRAPHIC_COLORS[label] || '#888888';

function Legend() {
    const [isOpen, setIsOpen] = useState(false);
    const { selectedEmotions, setHoveredEmotion, toggleEmotion } = useVisualization();
    
    // Get emotions that actually exist in data
    const allLabels = graphData.labels || [];
    const emotionsInData = getEmotionsOnly(allLabels);
    
    const demographics = DEMOGRAPHICS.filter(demo => allLabels.includes(demo));
    const hasActiveSelection = selectedEmotions.size > 0;

    return (
        <>
            <button 
                className="legend-toggle-bottom"
                onClick={() => setIsOpen(!isOpen)}
                title={isOpen ? 'Hide Filter' : 'Show Filter'}
            >
                <span className="toggle-text">
                    {isOpen ? 'Hide Filter' : 'Show Filter'}
                </span>
            </button>
            
            {isOpen && (
                <div className="legend-panel">
                    <div className="legend-scroll">
                        {demographics.length > 0 && (
                            <>
                                <h4 className="legend-section-title">Demographics</h4>
                                <div className="legend-items">
                                    {demographics.map(demo => {
                                        const isSelected = selectedEmotions.has(demo);
                                        const color = getColorForLabel(demo);
                                        const showColor = !hasActiveSelection || isSelected;
                                        return (
                                            <div
                                                key={demo}
                                                className={`legend-item${isSelected ? ' selected' : ''}`}
                                                onClick={() => toggleEmotion(demo)}
                                                onMouseEnter={() => setHoveredEmotion(demo)}
                                                onMouseLeave={() => setHoveredEmotion(null)}
                                                style={{
                                                    '--legend-item-color': color,
                                                    '--legend-checkbox-color': color,
                                                    '--legend-checkbox-bg': showColor ? color : 'transparent'
                                                }}
                                            >
                                                <input
                                                    type="checkbox"
                                                    className="legend-checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleEmotion(demo)}
                                                    onClick={(event) => event.stopPropagation()}
                                                />
                                                <span className="legend-label">{demo}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                        
                        <h4 className="legend-section-title">Emotions</h4>
                        <div className="legend-items">
                            {emotionsInData.map(emotion => {
                                const isSelected = selectedEmotions.has(emotion);
                                const color = getColorForLabel(emotion);
                                const showColor = !hasActiveSelection || isSelected;
                                return (
                                    <div
                                        key={emotion}
                                        className={`legend-item${isSelected ? ' selected' : ''}`}
                                        onClick={() => toggleEmotion(emotion)}
                                        onMouseEnter={() => setHoveredEmotion(emotion)}
                                        onMouseLeave={() => setHoveredEmotion(null)}
                                        style={{
                                            '--legend-item-color': color,
                                            '--legend-checkbox-color': color,
                                            '--legend-checkbox-bg': showColor ? color : 'transparent'
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            className="legend-checkbox"
                                            checked={isSelected}
                                            onChange={() => toggleEmotion(emotion)}
                                            onClick={(event) => event.stopPropagation()}
                                        />
                                        <span className="legend-label">{emotion}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default Legend;

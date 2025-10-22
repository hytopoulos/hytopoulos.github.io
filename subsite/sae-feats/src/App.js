import React, { useState } from 'react';
import NetworkGraph from './components/NetworkGraph';
import Settings from './components/Settings';
import Help from './components/Help';
import Legend from './components/Legend';
import Tooltip from './components/Tooltip';
import ImageAnnotation from './components/ImageAnnotation';
import './App.css';

function App() {
  const [showClusters, setShowClusters] = useState(true);
  const [tooltipData, setTooltipData] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [annotations, setAnnotations] = useState([]);
  const [nextAnnotationId, setNextAnnotationId] = useState(0);
  const [activeHeatmapLabels, setActiveHeatmapLabels] = useState(new Set());
  const [showPieCharts, setShowPieCharts] = useState(false);
  const [hoveredEmotion, setHoveredEmotion] = useState(null);
  const [useRelativeActivation, setUseRelativeActivation] = useState(true);
  const [selectedEmotions, setSelectedEmotions] = useState(new Set());
  const [sizeClustersByFeatures, setSizeClustersByFeatures] = useState(false);
  const [showVoronoi, setShowVoronoi] = useState(true); // Voronoi enabled by default
  const [filterIntensity, setFilterIntensity] = useState(200); // 0-500%, default 200%

  const handleLabelToggle = (label) => {
    setActiveHeatmapLabels(prev => {
      const newSet = new Set(prev);
      if (newSet.has(label)) {
        newSet.delete(label);
      } else {
        newSet.add(label);
      }
      return newSet;
    });
  };

  const handleEmotionToggle = (emotion) => {
    setSelectedEmotions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(emotion)) {
        newSet.delete(emotion);
      } else {
        newSet.add(emotion);
      }
      return newSet;
    });
  };

  const handleNodeClick = (nodeData) => {
    // Allow clicks on both feature nodes and cluster nodes (which now have vectors)
    if (nodeData.type === 'feature' || (nodeData.type === 'cluster' && nodeData.feature_vector_b64)) {
      // Use functional updates to ensure we get latest state
      setNextAnnotationId(prevId => {
        const newId = prevId;
        const newAnnotation = {
          id: newId,
          nodeId: nodeData.id,
          featureData: nodeData
        };
        
        console.log('Adding annotation:', newAnnotation.id, 'Total annotations will be:', annotations.length + 1);
        
        setAnnotations(prevAnnotations => [...prevAnnotations, newAnnotation]);
        
        return prevId + 1;
      });
    }
  };

  // Add close function to handleNodeClick
  handleNodeClick.close = (annotationId) => {
    console.log('Closing annotation:', annotationId);
    
    // Cleanup thumbnails if annotation was minimized
    window.dispatchEvent(new CustomEvent('cleanup-annotation', { detail: annotationId }));
    
    setAnnotations(prevAnnotations => {
      const filtered = prevAnnotations.filter(ann => ann.id !== annotationId);
      console.log('Remaining annotations:', filtered.map(a => a.id));
      return filtered;
    });
  };

  return (
    <div className="App">
      <Settings 
        onLabelToggle={handleLabelToggle}
        activeLabels={activeHeatmapLabels}
        showPieCharts={showPieCharts}
        onPieChartToggle={() => setShowPieCharts(!showPieCharts)}
        useRelativeActivation={useRelativeActivation}
        onRelativeActivationToggle={() => setUseRelativeActivation(!useRelativeActivation)}
        sizeClustersByFeatures={sizeClustersByFeatures}
        onSizeClustersByFeaturesToggle={() => setSizeClustersByFeatures(!sizeClustersByFeatures)}
        showVoronoi={showVoronoi}
        onShowVoronoiToggle={() => setShowVoronoi(!showVoronoi)}
        filterIntensity={filterIntensity}
        onFilterIntensityChange={setFilterIntensity}
      />
      <Help />
      <Legend 
        onEmotionHover={setHoveredEmotion}
        selectedEmotions={selectedEmotions}
        onEmotionToggle={handleEmotionToggle}
      />
      <NetworkGraph 
        showClusters={showClusters}
        setTooltipData={setTooltipData}
        setTooltipPosition={setTooltipPosition}
        onNodeClick={handleNodeClick}
        annotations={annotations}
        activeDemographics={activeHeatmapLabels}
        showPieCharts={showPieCharts}
        hoveredEmotion={hoveredEmotion}
        useRelativeActivation={useRelativeActivation}
        selectedEmotions={selectedEmotions}
        sizeClustersByFeatures={sizeClustersByFeatures}
        showVoronoi={showVoronoi}
        filterIntensity={filterIntensity}
      />
      <Tooltip 
        data={tooltipData}
        position={tooltipPosition}
      />
    </div>
  );
}

export default App;

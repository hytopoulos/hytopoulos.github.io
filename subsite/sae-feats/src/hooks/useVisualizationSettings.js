/**
 * Custom hook for managing visualization settings state
 */

import { useState, useCallback, useEffect } from 'react';
import { FILTER_DEFAULTS } from '../constants';

const getSystemTheme = () => {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return 'light';
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

/**
 * Hook to manage all visualization settings
 * @returns {Object} Settings state and toggle functions
 */
export const useVisualizationSettings = () => {
  // Display settings
  const [showClusters, setShowClusters] = useState(true);
  const [showPieCharts, setShowPieCharts] = useState(false);
  const [showVoronoi, setShowVoronoi] = useState(true);
  const [showNodes, setShowNodes] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [sizeClustersByFeatures, setSizeClustersByFeatures] = useState(false);

  // Activation settings
  const [useRelativeActivation, setUseRelativeActivation] = useState(true);
  const [filterIntensity, setFilterIntensity] = useState(FILTER_DEFAULTS.INTENSITY);

  // Bias steering settings
  const [genderBiasSteering, setGenderBiasSteering] = useState(false);
  const [ageBiasSteering, setAgeBiasSteering] = useState(false);
  const [biasReductionStrength, setBiasReductionStrength] = useState(FILTER_DEFAULTS.BIAS_STRENGTH);

  // Heatmap labels
  const [activeHeatmapLabels, setActiveHeatmapLabels] = useState(new Set());

  // Emotion selection
  const [selectedEmotions, setSelectedEmotions] = useState(new Set());
  const [hoveredEmotion, setHoveredEmotion] = useState(null);

  // Theme settings
  const [themeMode, setThemeMode] = useState(() => {
    if (typeof window === 'undefined') return 'system';
    const stored = window.localStorage.getItem('themeMode');
    return stored || 'system';
  });
  const [resolvedTheme, setResolvedTheme] = useState(getSystemTheme());

  useEffect(() => {
    if (themeMode === 'system') {
      const systemTheme = getSystemTheme();
      setResolvedTheme(systemTheme);
    }
  }, [themeMode]);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (event) => {
      if (themeMode === 'system') {
        setResolvedTheme(event.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [themeMode]);

  useEffect(() => {
    if (themeMode !== 'system') {
      setResolvedTheme(themeMode);
    }
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('themeMode', themeMode);
    }
  }, [themeMode]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', resolvedTheme);
    }
  }, [resolvedTheme]);

  // Toggle functions
  const toggleShowClusters = useCallback(() => setShowClusters(prev => !prev), []);
  const toggleShowPieCharts = useCallback(() => setShowPieCharts(prev => !prev), []);
  const toggleShowVoronoi = useCallback(() => setShowVoronoi(prev => !prev), []);
  const toggleShowNodes = useCallback(() => setShowNodes(prev => !prev), []);
  const toggleShowHeatmap = useCallback(() => setShowHeatmap(prev => !prev), []);
  const toggleSizeClustersByFeatures = useCallback(() => setSizeClustersByFeatures(prev => !prev), []);
  const toggleUseRelativeActivation = useCallback(() => setUseRelativeActivation(prev => !prev), []);
  const toggleGenderBiasSteering = useCallback(() => setGenderBiasSteering(prev => !prev), []);
  const toggleAgeBiasSteering = useCallback(() => setAgeBiasSteering(prev => !prev), []);

  /**
   * Toggle a heatmap label on/off
   * @param {string} label - Label to toggle
   */
  const toggleHeatmapLabel = useCallback((label) => {
    setActiveHeatmapLabels(prev => {
      const newSet = new Set(prev);
      if (newSet.has(label)) {
        newSet.delete(label);
      } else {
        newSet.add(label);
      }
      return newSet;
    });
  }, []);

  /**
   * Toggle an emotion selection on/off
   * @param {string} emotion - Emotion to toggle
   */
  const toggleEmotion = useCallback((emotion) => {
    setSelectedEmotions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(emotion)) {
        newSet.delete(emotion);
      } else {
        newSet.add(emotion);
      }
      return newSet;
    });
  }, []);

  /**
   * Clear all selected emotions
   */
  const clearSelectedEmotions = useCallback(() => {
    setSelectedEmotions(new Set());
  }, []);

  /**
   * Clear all active heatmap labels
   */
  const clearHeatmapLabels = useCallback(() => {
    setActiveHeatmapLabels(new Set());
  }, []);

  return {
    // Display settings
    showClusters,
    setShowClusters,
    toggleShowClusters,
    showPieCharts,
    setShowPieCharts,
    toggleShowPieCharts,
    showVoronoi,
    setShowVoronoi,
    toggleShowVoronoi,
    showNodes,
    setShowNodes,
    toggleShowNodes,
    showHeatmap,
    setShowHeatmap,
    toggleShowHeatmap,
    sizeClustersByFeatures,
    setSizeClustersByFeatures,
    toggleSizeClustersByFeatures,

    // Activation settings
    useRelativeActivation,
    setUseRelativeActivation,
    toggleUseRelativeActivation,
    filterIntensity,
    setFilterIntensity,

    // Bias steering settings
    genderBiasSteering,
    setGenderBiasSteering,
    toggleGenderBiasSteering,
    ageBiasSteering,
    setAgeBiasSteering,
    toggleAgeBiasSteering,
    biasReductionStrength,
    setBiasReductionStrength,

    // Heatmap labels
    activeHeatmapLabels,
    setActiveHeatmapLabels,
    toggleHeatmapLabel,
    clearHeatmapLabels,

    // Emotion selection
    selectedEmotions,
    setSelectedEmotions,
    toggleEmotion,
    clearSelectedEmotions,
    hoveredEmotion,
    setHoveredEmotion,

    // Theme settings
    themeMode,
    setThemeMode,
    resolvedTheme
  };
};

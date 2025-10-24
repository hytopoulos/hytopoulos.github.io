/**
 * Utility functions for emotion-related operations
 */

import { DEMOGRAPHICS } from '../constants';

/**
 * Filter out demographics from a list of labels
 * @param {Array<string>} labels - All labels
 * @returns {Array<string>} Labels excluding demographics
 */
export const filterDemographics = (labels) => {
  return labels.filter(label => !DEMOGRAPHICS.includes(label));
};

/**
 * Check if a label is a demographic
 * @param {string} label - Label to check
 * @returns {boolean} True if label is a demographic
 */
export const isDemographic = (label) => {
  return DEMOGRAPHICS.includes(label);
};

/**
 * Get emotion entries from activations (excluding demographics)
 * @param {Object} activations - Node activations
 * @returns {Array<[string, number]>} Array of [emotion, value] tuples
 */
export const getEmotionEntries = (activations) => {
  if (!activations) return [];
  
  return Object.entries(activations)
    .filter(([label]) => !isDemographic(label));
};

/**
 * Sort emotions by activation value
 * @param {Array<[string, number]>} emotionEntries - Array of [emotion, value] tuples
 * @param {boolean} ascending - Sort order (default: descending)
 * @returns {Array<[string, number]>} Sorted emotion entries
 */
export const sortEmotionsByActivation = (emotionEntries, ascending = false) => {
  return [...emotionEntries].sort((a, b) => 
    ascending ? a[1] - b[1] : b[1] - a[1]
  );
};

/**
 * Get top N emotions from activations
 * @param {Object} activations - Node activations
 * @param {number} n - Number of top emotions to return
 * @returns {Array<[string, number]>} Top N emotions as [emotion, value] tuples
 */
export const getTopNEmotions = (activations, n = 3) => {
  const emotionEntries = getEmotionEntries(activations);
  const sorted = sortEmotionsByActivation(emotionEntries);
  return sorted.slice(0, n);
};

/**
 * Create pie chart data from activations
 * @param {Object} activations - Node activations
 * @param {string} primaryEmotion - Primary emotion for the node
 * @param {Object} emotionColors - Emotion color mapping
 * @param {number} topN - Number of top emotions to include
 * @returns {Array<{label: string, value: number, color: string, isPrimary: boolean}>}
 */
export const createPieChartData = (activations, primaryEmotion, emotionColors, topN = 5) => {
  if (!activations) return [];
  
  const emotionActivations = Object.entries(activations)
    .filter(([label]) => !isDemographic(label))
    .map(([label, value]) => ({
      label,
      value,
      color: emotionColors[label] || '#999',
      isPrimary: label === primaryEmotion
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, topN);
  
  return emotionActivations;
};

/**
 * Check if any emotion filters are active
 * @param {string} hoveredEmotion - Currently hovered emotion
 * @param {Set} selectedEmotions - Set of selected emotions
 * @returns {boolean} True if emotion filters are active
 */
export const hasEmotionFilter = (hoveredEmotion, selectedEmotions) => {
  return hoveredEmotion !== null || (selectedEmotions && selectedEmotions.size > 0);
};

/**
 * Get list of emotions to check based on hover and selection
 * @param {string} hoveredEmotion - Currently hovered emotion
 * @param {Set} selectedEmotions - Set of selected emotions
 * @returns {Array<string>} Array of emotions to check
 */
export const getEmotionsToCheck = (hoveredEmotion, selectedEmotions) => {
  if (hoveredEmotion) {
    return [hoveredEmotion];
  }
  if (selectedEmotions && selectedEmotions.size > 0) {
    return Array.from(selectedEmotions);
  }
  return [];
};

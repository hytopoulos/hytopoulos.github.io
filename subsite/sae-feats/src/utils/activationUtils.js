/**
 * Utility functions for emotion activation calculations
 */

import { DEMOGRAPHICS } from '../constants';

/**
 * Calculate mean activation across all emotions for a node
 * @param {Object} activations - Node activations object
 * @returns {number} Mean activation value
 */
export const calculateMeanActivation = (activations) => {
  if (!activations) return 0;
  
  const emotionValues = Object.entries(activations)
    .filter(([label]) => !DEMOGRAPHICS.includes(label))
    .map(([, value]) => value);
  
  if (emotionValues.length === 0) return 0;
  
  return emotionValues.reduce((sum, val) => sum + val, 0) / emotionValues.length;
};

/**
 * Calculate relative activation (activation minus scaled mean)
 * @param {number} activation - Raw activation value
 * @param {number} meanActivation - Mean activation across emotions
 * @param {number} intensityFactor - Filter intensity as percentage (0-5.0)
 * @returns {number} Relative activation (non-negative)
 */
export const calculateRelativeActivation = (activation, meanActivation, intensityFactor) => {
  return Math.max(0, activation - (meanActivation * intensityFactor));
};

/**
 * Get activation value with optional relative adjustment
 * @param {Object} activations - Node activations
 * @param {string} emotion - Emotion label
 * @param {boolean} useRelative - Whether to use relative activation
 * @param {number} filterIntensity - Filter intensity percentage (0-500)
 * @returns {number} Activation value
 */
export const getActivationValue = (activations, emotion, useRelative = false, filterIntensity = 200) => {
  if (!activations || !activations[emotion]) return 0;
  
  let activation = activations[emotion];
  
  if (useRelative) {
    const meanActivation = calculateMeanActivation(activations);
    const intensityFactor = filterIntensity / 100;
    activation = calculateRelativeActivation(activation, meanActivation, intensityFactor);
  }
  
  return activation;
};

/**
 * Find the emotion with maximum activation among selected emotions
 * @param {Object} activations - Node activations
 * @param {Array<string>} emotions - List of emotions to check
 * @param {boolean} useRelative - Whether to use relative activation
 * @param {number} filterIntensity - Filter intensity percentage (0-500)
 * @returns {Object} Object with maxEmotion and maxActivation
 */
export const getMaxActivationEmotion = (
  activations,
  emotions,
  useRelative = false,
  filterIntensity = 200
) => {
  if (!activations || emotions.length === 0) {
    return { maxEmotion: null, maxActivation: 0 };
  }
  
  let maxEmotion = null;
  let maxActivation = 0;
  
  const meanActivation = useRelative ? calculateMeanActivation(activations) : 0;
  const intensityFactor = filterIntensity / 100;
  
  emotions.forEach(emotion => {
    let activation = activations[emotion] || 0;
    
    if (useRelative) {
      activation = calculateRelativeActivation(activation, meanActivation, intensityFactor);
    }
    
    if (activation > maxActivation) {
      maxActivation = activation;
      maxEmotion = emotion;
    }
  });
  
  return { maxEmotion, maxActivation };
};

/**
 * Calculate node size based on activation
 * @param {number} activation - Activation value
 * @param {number} minSize - Minimum node size
 * @param {number} maxSize - Maximum node size
 * @param {number} amplificationFactor - Factor to amplify small activation values
 * @returns {number} Calculated node size
 */
export const calculateNodeSize = (
  activation,
  minSize = 10,
  maxSize = 200,
  amplificationFactor = 10
) => {
  const amplifiedActivation = Math.min(activation * amplificationFactor, 1);
  return minSize + (amplifiedActivation * (maxSize - minSize));
};

/**
 * Calculate cluster size based on feature count
 * @param {number} numFeatures - Number of features in cluster
 * @param {number} maxFeatures - Maximum features across all clusters
 * @param {number} minSize - Minimum cluster size
 * @param {number} maxSize - Maximum cluster size
 * @returns {number} Calculated cluster size
 */
export const calculateClusterSize = (
  numFeatures,
  maxFeatures = 1036,
  minSize = 10,
  maxSize = 100
) => {
  if (!numFeatures) return minSize;
  
  // Use log scale to prevent extreme size differences
  const scaleFactor = Math.log(numFeatures + 1) / Math.log(maxFeatures + 1);
  return minSize + scaleFactor * (maxSize - minSize);
};

// NOTE: getEmotionActivations and getTopEmotions removed - use emotionUtils instead
// to avoid duplication

/**
 * Utility functions for vector operations
 */

/**
 * Decode base64 string to Float32Array
 * @param {string} base64String - Base64 encoded binary data
 * @returns {Float32Array} Decoded vector
 */
export const decodeBase64Vector = (base64String) => {
  const binaryString = atob(base64String);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return new Float32Array(bytes.buffer);
};

/**
 * Encode Float32Array to base64 string
 * @param {Float32Array} vector - Vector to encode
 * @returns {string} Base64 encoded string
 */
export const encodeVectorToBase64 = (vector) => {
  const bytes = new Uint8Array(vector.buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

/**
 * L2 normalize a vector
 * @param {Array|Float32Array} vec - Vector to normalize
 * @returns {Array} Normalized vector
 */
export const l2norm = (vec) => {
  const norm = Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0));
  return Array.from(vec).map(v => v / (norm || 1e-8));
};

/**
 * Compute dot product of two vectors
 * @param {Float32Array} vec1 - First vector
 * @param {Float32Array} vec2 - Second vector
 * @returns {number} Dot product
 */
export const dotProduct = (vec1, vec2) => {
  let sum = 0;
  for (let i = 0; i < vec1.length; i++) {
    sum += vec1[i] * vec2[i];
  }
  return sum;
};

/**
 * Compute L2 norm of a vector
 * @param {Float32Array} vec - Vector
 * @returns {number} L2 norm
 */
export const vectorNorm = (vec) => {
  return Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0));
};

/**
 * Apply debiasing to a vector by removing projection onto bias directions
 * @param {Float32Array} vector - Original vector
 * @param {Object} biasMeanVectors - Object containing genderMean and ageMean vectors
 * @param {boolean} applyGenderDebiasing - Whether to apply gender debiasing
 * @param {boolean} applyAgeDebiasing - Whether to apply age debiasing
 * @returns {Float32Array} Debiased vector
 */
export const applyDebiasing = (
  vector,
  biasMeanVectors,
  optionsOrGenderFlag = {},
  applyAge = false,
  reductionFactorArg = 1.0
) => {
  // Support both old positional args and new options object
  let applyGenderDebiasing, applyAgeDebiasing, reductionFactor;
  
  if (typeof optionsOrGenderFlag === 'object' && !Array.isArray(optionsOrGenderFlag)) {
    // New format: options object
    applyGenderDebiasing = optionsOrGenderFlag.genderBiasSteering || false;
    applyAgeDebiasing = optionsOrGenderFlag.ageBiasSteering || false;
    reductionFactor = optionsOrGenderFlag.biasReductionStrength !== undefined 
      ? optionsOrGenderFlag.biasReductionStrength 
      : 1.0;
  } else {
    // Old format: positional arguments (boolean flags)
    applyGenderDebiasing = optionsOrGenderFlag || false;
    applyAgeDebiasing = applyAge || false;
    reductionFactor = reductionFactorArg !== undefined ? reductionFactorArg : 1.0;
  }
  
  if (!biasMeanVectors) return vector;
  
  let debiased = new Float32Array(vector);
  
  // Apply gender debiasing if enabled
  if (applyGenderDebiasing && biasMeanVectors.genderMean) {
    const genderMean = biasMeanVectors.genderMean;
    const projection = dotProduct(debiased, genderMean);
    
    // Stronger debiasing - use higher reduction factor
    const strongReduction = Math.min(reductionFactor * 2, 1.0); // Up to 2x the requested strength
    
    // Subtract scaled projection: debiased = vector - (strongReduction * projection) * genderMean
    for (let i = 0; i < debiased.length; i++) {
      const change = strongReduction * projection * genderMean[i];
      debiased[i] -= change;
    }
  }
  
  // Apply age debiasing if enabled
  if (applyAgeDebiasing && biasMeanVectors.ageMean) {
    const ageMean = biasMeanVectors.ageMean;
    const projection = dotProduct(debiased, ageMean);
    
    // Stronger debiasing - use higher reduction factor
    const strongReduction = Math.min(reductionFactor * 2, 1.0); // Up to 2x the requested strength
    
    // Subtract scaled projection: debiased = vector - (strongReduction * projection) * ageMean
    for (let i = 0; i < debiased.length; i++) {
      const change = strongReduction * projection * ageMean[i];
      debiased[i] -= change;
    }
  }
  
  return debiased;
};

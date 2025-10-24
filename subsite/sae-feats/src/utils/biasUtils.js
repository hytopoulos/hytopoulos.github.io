/**
 * Utility functions for bias computation and debiasing
 */

import { VECTOR_DIM } from '../constants';
import { decodeBase64Vector, dotProduct, vectorNorm } from './vectorUtils';

/**
 * Compute mean bias vectors for gender and age from node data
 * @param {Array} nodes - Graph nodes
 * @returns {Object} Object with genderMean and ageMean vectors
 */
export const computeBiasMeanVectors = (nodes) => {
  // Collect activations for each demographic
  const genderActivations = { Male: [], Female: [] };
  const ageActivations = { Adult: [], Kid: [] };
  
  nodes.forEach(node => {
    if (node.activations) {
      if (node.activations.Male !== undefined) {
        genderActivations.Male.push(node.activations.Male);
      }
      if (node.activations.Female !== undefined) {
        genderActivations.Female.push(node.activations.Female);
      }
      if (node.activations.Adult !== undefined) {
        ageActivations.Adult.push(node.activations.Adult);
      }
      if (node.activations.Kid !== undefined) {
        ageActivations.Kid.push(node.activations.Kid);
      }
    }
  });
  
  // Compute mean activations
  const meanMale = genderActivations.Male.reduce((a, b) => a + b, 0) / genderActivations.Male.length;
  const meanFemale = genderActivations.Female.reduce((a, b) => a + b, 0) / genderActivations.Female.length;
  const meanAdult = ageActivations.Adult.reduce((a, b) => a + b, 0) / ageActivations.Adult.length;
  const meanKid = ageActivations.Kid.reduce((a, b) => a + b, 0) / ageActivations.Kid.length;
  
  // Create mean vectors
  const genderMean = new Float32Array(VECTOR_DIM);
  const ageMean = new Float32Array(VECTOR_DIM);
  
  // Accumulate weighted vectors
  nodes.forEach(node => {
    if (node.feature_vector_b64) {
      const vector = decodeBase64Vector(node.feature_vector_b64);
      const maleAct = node.activations?.Male || 0;
      const femaleAct = node.activations?.Female || 0;
      const adultAct = node.activations?.Adult || 0;
      const kidAct = node.activations?.Kid || 0;
      
      // Accumulate for gender direction
      const genderWeight = maleAct - femaleAct;
      for (let i = 0; i < VECTOR_DIM; i++) {
        genderMean[i] += vector[i] * genderWeight;
      }
      
      // Accumulate for age direction
      const ageWeight = adultAct - kidAct;
      for (let i = 0; i < VECTOR_DIM; i++) {
        ageMean[i] += vector[i] * ageWeight;
      }
    }
  });
  
  // Normalize the mean vectors
  const genderNorm = vectorNorm(genderMean);
  const ageNorm = vectorNorm(ageMean);
  
  for (let i = 0; i < VECTOR_DIM; i++) {
    genderMean[i] /= genderNorm || 1;
    ageMean[i] /= ageNorm || 1;
  }
  
  return {
    genderMean,
    ageMean,
    stats: {
      meanMale,
      meanFemale,
      meanAdult,
      meanKid,
      genderDiff: meanMale - meanFemale,
      ageDiff: meanAdult - meanKid,
      genderNorm,
      ageNorm
    }
  };
};

/**
 * Precompute debiased activations for all nodes
 * @param {Array} nodes - Graph nodes
 * @param {Object} biasMeanVectors - Bias mean vectors
 * @param {number} reductionFactor - Reduction strength (0-1)
 * @returns {Map} Map of node ID to debiased activations
 */
export const precomputeDebiasedActivations = (nodes, biasMeanVectors, reductionFactor) => {
  if (!biasMeanVectors) return new Map();
  
  const { genderMean, ageMean } = biasMeanVectors;
  const debiasedActivations = new Map();
  
  nodes.forEach(node => {
    if (!node.feature_vector_b64 || !node.activations) return;
    
    const originalVector = decodeBase64Vector(node.feature_vector_b64);
    
    // Compute projection onto bias directions
    const genderProjection = dotProduct(originalVector, genderMean);
    const ageProjection = dotProduct(originalVector, ageMean);
    const originalNorm = vectorNorm(originalVector);
    
    // Estimate debiased activations by scaling based on projection
    const debiasedActs = {
      gender: { ...node.activations },
      age: { ...node.activations },
      both: { ...node.activations }
    };
    
    // For gender debiasing: reduce Male/Female activations
    const genderReduction = Math.abs(genderProjection) / (originalNorm + 1e-8);
    debiasedActs.gender.Male = Math.max(0, node.activations.Male * (1 - genderReduction * reductionFactor));
    debiasedActs.gender.Female = Math.max(0, node.activations.Female * (1 - genderReduction * reductionFactor));
    
    // For age debiasing: reduce Kid/Adult/Teenager activations
    const ageReduction = Math.abs(ageProjection) / (originalNorm + 1e-8);
    debiasedActs.age.Kid = Math.max(0, node.activations.Kid * (1 - ageReduction * reductionFactor));
    debiasedActs.age.Adult = Math.max(0, node.activations.Adult * (1 - ageReduction * reductionFactor));
    debiasedActs.age.Teenager = Math.max(0, node.activations.Teenager * (1 - ageReduction * reductionFactor));
    
    // For both: apply both reductions
    debiasedActs.both.Male = Math.max(0, node.activations.Male * (1 - genderReduction * reductionFactor));
    debiasedActs.both.Female = Math.max(0, node.activations.Female * (1 - genderReduction * reductionFactor));
    debiasedActs.both.Kid = Math.max(0, node.activations.Kid * (1 - ageReduction * reductionFactor));
    debiasedActs.both.Adult = Math.max(0, node.activations.Adult * (1 - ageReduction * reductionFactor));
    debiasedActs.both.Teenager = Math.max(0, node.activations.Teenager * (1 - ageReduction * reductionFactor));
    
    debiasedActivations.set(node.id, debiasedActs);
  });
  
  return debiasedActivations;
};

/**
 * Get the appropriate activations based on bias steering settings
 * @param {Object} originalActivations - Original node activations
 * @param {Object} debiasedActivationsForNode - Debiased activations for this node
 * @param {boolean} genderBiasSteering - Whether gender bias steering is enabled
 * @param {boolean} ageBiasSteering - Whether age bias steering is enabled
 * @returns {Object} Activations to use
 */
export const getActivationsWithBiasSteering = (
  originalActivations,
  debiasedActivationsForNode,
  genderBiasSteering,
  ageBiasSteering
) => {
  if (!debiasedActivationsForNode) return originalActivations;
  
  if (genderBiasSteering && ageBiasSteering) {
    return debiasedActivationsForNode.both;
  } else if (genderBiasSteering) {
    return debiasedActivationsForNode.gender;
  } else if (ageBiasSteering) {
    return debiasedActivationsForNode.age;
  }
  
  return originalActivations;
};

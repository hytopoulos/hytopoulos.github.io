/**
 * Custom hook for bias vector computation and debiased activations
 */

import { useState, useEffect, useRef } from 'react';
import { computeBiasMeanVectors, precomputeDebiasedActivations } from '../utils';

/**
 * Hook to compute and manage bias steering vectors
 * @param {Array} nodes - Graph nodes
 * @param {boolean} genderBiasSteering - Whether gender bias steering is enabled
 * @param {boolean} ageBiasSteering - Whether age bias steering is enabled
 * @param {number} biasReductionStrength - Strength of bias reduction (0-100)
 * @returns {Object} { biasMeanVectors, debiasedActivations }
 */
export const useBiasComputation = (
  nodes,
  genderBiasSteering,
  ageBiasSteering,
  biasReductionStrength
) => {
  const [biasMeanVectors, setBiasMeanVectors] = useState(null);
  const [debiasedActivations, setDebiasedActivations] = useState(null);
  const hasComputedRef = useRef(false);

  // Compute mean vectors once on mount
  useEffect(() => {
    if (!nodes || nodes.length === 0 || hasComputedRef.current) return;

    const result = computeBiasMeanVectors(nodes);
    setBiasMeanVectors({
      genderMean: result.genderMean,
      ageMean: result.ageMean
    });

    console.log('Computed bias steering vectors:', result.stats);
    hasComputedRef.current = true;
  }, [nodes]);

  // Recompute debiased activations when settings change
  useEffect(() => {
    if (!biasMeanVectors || !nodes || nodes.length === 0) return;

    const reductionFactor = biasReductionStrength / 100;
    const debiased = precomputeDebiasedActivations(
      nodes,
      biasMeanVectors,
      reductionFactor
    );

    setDebiasedActivations(debiased);
    console.log(
      `Precomputed debiased activations for ${debiased.size} nodes with ${biasReductionStrength}% strength`
    );
  }, [biasMeanVectors, nodes, biasReductionStrength]);

  // Log when bias steering changes
  useEffect(() => {
    const steeringTypes = [];
    if (genderBiasSteering) steeringTypes.push('gender');
    if (ageBiasSteering) steeringTypes.push('age');

    if (steeringTypes.length > 0) {
      console.log(
        `Bias steering enabled: ${steeringTypes.join(', ')} at ${biasReductionStrength}% strength`
      );
      console.log('- Feature/cluster vectors will be debiased when clicked');
      console.log('- Heatmap shows precomputed debiased activations');
    } else {
      console.log('Bias steering disabled - using original vectors and activations');
    }
  }, [genderBiasSteering, ageBiasSteering, biasReductionStrength]);

  return {
    biasMeanVectors,
    debiasedActivations
  };
};

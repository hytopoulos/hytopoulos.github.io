/**
 * Performance optimization utilities
 * Includes caching, throttling, and efficient data structures
 */

/**
 * Cached rect provider - avoids frequent getBoundingClientRect calls
 * Already implemented in annotationPositioning.js, but exported here for consistency
 */
export { CachedRectProvider } from './annotationPositioning';

/**
 * Create a Map for O(1) node lookups by ID
 * @param {Array} nodes - Array of nodes
 * @returns {Map} Map of node ID -> node
 */
export const createNodeLookupMap = (nodes) => {
  return new Map(nodes.map(n => [n.id, n]));
};

/**
 * Throttle function execution
 * @param {Function} fn - Function to throttle
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Throttled function
 */
export const throttle = (fn, delay) => {
  let lastCall = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      return fn(...args);
    }
  };
};

/**
 * Debounce function execution
 * @param {Function} fn - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (fn, delay) => {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

/**
 * Request animation frame based throttle (60fps max)
 * @param {Function} fn - Function to throttle
 * @returns {Function} RAF-throttled function
 */
export const rafThrottle = (fn) => {
  let rafId = null;
  return function(...args) {
    if (rafId === null) {
      rafId = requestAnimationFrame(() => {
        fn(...args);
        rafId = null;
      });
    }
  };
};

/**
 * Batch DOM reads to avoid layout thrashing
 * @param {Function} readFn - Function that reads from DOM
 * @returns {Promise} Promise that resolves with read result
 */
export const batchRead = (readFn) => {
  return new Promise(resolve => {
    requestAnimationFrame(() => {
      const result = readFn();
      resolve(result);
    });
  });
};

/**
 * Batch DOM writes to avoid layout thrashing
 * @param {Function} writeFn - Function that writes to DOM
 * @returns {Promise} Promise that resolves when write is complete
 */
export const batchWrite = (writeFn) => {
  return new Promise(resolve => {
    requestAnimationFrame(() => {
      writeFn();
      resolve();
    });
  });
};

/**
 * Memoize expensive computations
 * @param {Function} fn - Function to memoize
 * @returns {Function} Memoized function
 */
export const memoize = (fn) => {
  const cache = new Map();
  return function(...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};

/**
 * Clear memoization cache
 * @param {Function} memoizedFn - Memoized function
 */
export const clearMemoCache = (memoizedFn) => {
  if (memoizedFn.cache) {
    memoizedFn.cache.clear();
  }
};

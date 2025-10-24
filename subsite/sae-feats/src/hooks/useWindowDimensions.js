/**
 * Custom hook for window dimensions
 * Tracks window size and updates on resize
 */

import { useState, useEffect } from 'react';

/**
 * Hook to get and track window dimensions
 * @returns {Object} {width, height}
 */
export const useWindowDimensions = () => {
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return dimensions;
};

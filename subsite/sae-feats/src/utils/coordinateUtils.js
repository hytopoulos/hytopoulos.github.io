/**
 * Utility functions for coordinate transformations and scaling
 */

/**
 * Calculate angle from one point to another
 * @param {number} fromX - Source X coordinate
 * @param {number} fromY - Source Y coordinate
 * @param {number} toX - Target X coordinate
 * @param {number} toY - Target Y coordinate
 * @returns {number} Angle in radians
 */
export const calculateAngle = (fromX, fromY, toX, toY) => {
  return Math.atan2(toY - fromY, toX - fromX);
};

/**
 * Convert radians to degrees
 * @param {number} radians - Angle in radians
 * @returns {number} Angle in degrees
 */
export const radiansToDegrees = (radians) => {
  return radians * 180 / Math.PI;
};

/**
 * Convert degrees to radians
 * @param {number} degrees - Angle in degrees
 * @returns {number} Angle in radians
 */
export const degreesToRadians = (degrees) => {
  return degrees * Math.PI / 180;
};

/**
 * Calculate rotation needed to point a slice toward center
 * @param {number} nodeX - Node X position
 * @param {number} nodeY - Node Y position
 * @param {number} centerX - Center X coordinate
 * @param {number} centerY - Center Y coordinate
 * @param {number} sliceAngle - Current slice angle in radians
 * @returns {number} Rotation in degrees
 */
export const calculateRotationToCenter = (nodeX, nodeY, centerX, centerY, sliceAngle) => {
  const angleToCenter = calculateAngle(nodeX, nodeY, centerX, centerY);
  return radiansToDegrees(angleToCenter) - radiansToDegrees(sliceAngle);
};

/**
 * Scale a size inversely with zoom level
 * @param {number} baseSize - Base size at scale 1
 * @param {number} scale - Current zoom scale
 * @returns {number} Scaled size
 */
export const scaleInversely = (baseSize, scale) => {
  return baseSize / scale;
};

/**
 * Calculate screen-space to data-space conversion
 * @param {number} screenDelta - Delta in screen space
 * @param {number} scale - Current zoom scale
 * @returns {number} Delta in data space
 */
export const screenToDataSpace = (screenDelta, scale) => {
  return screenDelta / scale;
};

/**
 * Calculate data-space to screen-space conversion
 * @param {number} dataDelta - Delta in data space
 * @param {number} scale - Current zoom scale
 * @returns {number} Delta in screen space
 */
export const dataToScreenSpace = (dataDelta, scale) => {
  return dataDelta * scale;
};

/**
 * Get center position of an element
 * @param {number} x - Element X position
 * @param {number} y - Element Y position
 * @param {number} width - Element width
 * @param {number} height - Element height
 * @returns {{x: number, y: number}} Center coordinates
 */
export const getElementCenter = (x, y, width, height) => {
  return {
    x: x + width / 2,
    y: y + height / 2
  };
};

/**
 * Calculate position to center an element at a point
 * @param {number} centerX - Desired center X
 * @param {number} centerY - Desired center Y
 * @param {number} width - Element width
 * @param {number} height - Element height
 * @returns {{x: number, y: number}} Top-left corner position
 */
export const centerElementAt = (centerX, centerY, width, height) => {
  return {
    x: centerX - width / 2,
    y: centerY - height / 2
  };
};

/**
 * Clamp a value between min and max
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
export const clamp = (value, min, max) => {
  return Math.max(min, Math.min(max, value));
};

/**
 * Annotation positioning utilities
 * Handles SVG <-> screen coordinate conversions and position calculations
 */

/**
 * Convert SVG coordinates to screen coordinates
 * @param {number} svgX - X coordinate in SVG space
 * @param {number} svgY - Y coordinate in SVG space
 * @param {Object} transform - D3 zoom transform {k, x, y}
 * @param {DOMRect} svgRect - SVG bounding rectangle
 * @returns {Object} Screen coordinates {x, y}
 */
export const svgToScreen = (svgX, svgY, transform, svgRect) => {
  if (!transform || !svgRect) return { x: 0, y: 0 };
  
  return {
    x: svgX * transform.k + transform.x + svgRect.left,
    y: svgY * transform.k + transform.y + svgRect.top
  };
};

/**
 * Convert screen coordinates to SVG coordinates
 * @param {number} screenX - X coordinate in screen space
 * @param {number} screenY - Y coordinate in screen space
 * @param {Object} transform - D3 zoom transform {k, x, y}
 * @param {DOMRect} svgRect - SVG bounding rectangle
 * @returns {Object} SVG coordinates {x, y}
 */
export const screenToSvg = (screenX, screenY, transform, svgRect) => {
  if (!transform || !svgRect) return { x: 0, y: 0 };
  
  return {
    x: (screenX - svgRect.left - transform.x) / transform.k,
    y: (screenY - svgRect.top - transform.y) / transform.k
  };
};

/**
 * Calculate annotation window position based on node position
 * @param {Object} node - Node with x,y coordinates
 * @param {number} index - Annotation index (for stacking)
 * @param {Object} transform - D3 zoom transform
 * @param {DOMRect} svgRect - SVG bounding rectangle
 * @param {Object} options - Position options {offsetX, offsetY, stackOffset}
 * @returns {Object} Screen position {x, y}
 */
export const calculateAnnotationPosition = (
  node,
  index,
  transform,
  svgRect,
  { offsetX = 20, offsetY = -300, stackOffset = 50 } = {}
) => {
  if (!node || node.x === undefined || node.y === undefined) {
    return { x: 0, y: 0 };
  }
  
  // Calculate SVG position with offset
  const svgX = node.x + offsetX;
  const svgY = node.y + offsetY + (index * stackOffset);
  
  // Convert to screen coordinates
  return svgToScreen(svgX, svgY, transform, svgRect);
};

/**
 * Cached rect provider to avoid frequent getBoundingClientRect calls
 */
export class CachedRectProvider {
  constructor(element) {
    this.element = element;
    this.cachedRect = null;
    this.updateRect();
    
    // Auto-update on window resize
    this.handleResize = () => this.updateRect();
    window.addEventListener('resize', this.handleResize);
  }
  
  updateRect() {
    if (this.element && typeof this.element.getBoundingClientRect === 'function') {
      this.cachedRect = this.element.getBoundingClientRect();
    }
  }
  
  getRect() {
    return this.cachedRect;
  }
  
  invalidate() {
    this.updateRect();
  }
  
  destroy() {
    window.removeEventListener('resize', this.handleResize);
  }
}

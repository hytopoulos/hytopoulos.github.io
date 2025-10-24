/**
 * Spatial Hash for O(1) neighbor lookups
 * Divides space into grid cells for efficient proximity queries
 */

export class SpatialHash {
  constructor(nodes, cellSize = 200) {
    this.cellSize = cellSize;
    this.hash = new Map();
    this.build(nodes);
  }

  /**
   * Build spatial hash from nodes
   */
  build(nodes) {
    this.hash.clear();
    
    nodes.forEach(node => {
      if (node.x === undefined || node.y === undefined) return;
      
      const cellX = Math.floor(node.x / this.cellSize);
      const cellY = Math.floor(node.y / this.cellSize);
      const key = `${cellX},${cellY}`;
      
      if (!this.hash.has(key)) {
        this.hash.set(key, []);
      }
      this.hash.get(key).push(node);
    });
  }

  /**
   * Get all nodes in nearby cells (3x3 grid around point)
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @returns {Array} Nearby nodes
   */
  getNearby(x, y) {
    const cellX = Math.floor(x / this.cellSize);
    const cellY = Math.floor(y / this.cellSize);
    const nearby = [];
    
    // Check 3x3 grid of cells around point
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const key = `${cellX + dx},${cellY + dy}`;
        if (this.hash.has(key)) {
          nearby.push(...this.hash.get(key));
        }
      }
    }
    
    return nearby;
  }

  /**
   * Get all nodes within radius of a point
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} radius - Search radius
   * @returns {Array} Nodes within radius
   */
  getWithinRadius(x, y, radius) {
    const nearby = this.getNearby(x, y);
    const radiusSq = radius * radius;
    
    return nearby.filter(node => {
      const dx = node.x - x;
      const dy = node.y - y;
      return (dx * dx + dy * dy) <= radiusSq;
    });
  }

  /**
   * Update with new nodes (rebuilds hash)
   */
  update(nodes) {
    this.build(nodes);
  }

  /**
   * Clear the hash
   */
  clear() {
    this.hash.clear();
  }

  /**
   * Get statistics about the hash
   */
  getStats() {
    const cellCount = this.hash.size;
    const nodeCounts = Array.from(this.hash.values()).map(arr => arr.length);
    const avgNodesPerCell = nodeCounts.reduce((sum, count) => sum + count, 0) / cellCount;
    const maxNodesInCell = Math.max(...nodeCounts);
    
    return {
      cellCount,
      avgNodesPerCell: avgNodesPerCell.toFixed(2),
      maxNodesInCell
    };
  }
}

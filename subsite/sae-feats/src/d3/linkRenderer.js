/**
 * D3 link rendering functions
 */

import * as d3 from 'd3';
import { STROKE_WIDTH } from '../constants';

/**
 * Create and render links between nodes
 * @param {d3.Selection} g - SVG group element
 * @param {Array} links - Link data
 * @param {d3.ZoomTransform} transform - Current zoom transform
 * @returns {d3.Selection} Link selection
 */
export const renderLinks = (g, links, transform = { k: 1 }) => {
  const linkGroup = g.append('g').attr('class', 'links');

  const linkSelection = linkGroup.selectAll('line')
    .data(links)
    .join('line')
    .attr('class', 'link')
    .attr('stroke', '#999')
    .attr('stroke-opacity', 0.6)
    .attr('stroke-width', STROKE_WIDTH.LINK / transform.k);

  return linkSelection;
};

/**
 * Update link positions (called on simulation tick)
 * @param {d3.Selection} linkSelection - D3 selection of links
 */
export const updateLinkPositions = (linkSelection) => {
  linkSelection
    .attr('x1', d => d.source.x)
    .attr('y1', d => d.source.y)
    .attr('x2', d => d.target.x)
    .attr('y2', d => d.target.y);
};

/**
 * Update link stroke width based on zoom
 * @param {d3.Selection} linkSelection - D3 selection of links
 * @param {number} scale - Zoom scale
 */
export const updateLinkStrokeWidth = (linkSelection, scale) => {
  linkSelection.attr('stroke-width', STROKE_WIDTH.LINK / scale);
};

/**
 * Show or hide links
 * @param {d3.Selection} linkSelection - D3 selection of links
 * @param {boolean} visible - Whether links should be visible
 */
export const setLinksVisibility = (linkSelection, visible) => {
  linkSelection.style('display', visible ? null : 'none');
};

/**
 * LinkLayer - Manages link rendering and updates
 * Handles connections between nodes
 */

import { useEffect, useRef } from 'react';
import { renderLinks, updateLinkPositions, updateLinkStrokeWidth, setLinksVisibility } from '../../d3/linkRenderer';
import { useVisualization } from '../../contexts';

/**
 * LinkLayer component - renders links between nodes
 * @param {Object} props
 * @param {d3.Selection} props.gSelection - Parent SVG group
 * @param {Array} props.links - Graph links
 * @param {Object} props.transform - Current zoom transform
 * @param {Object} props.simulation - D3 force simulation
 */
export const LinkLayer = ({ 
  gSelection, 
  links, 
  transform = { k: 1 },
  simulation 
}) => {
  const linkSelectionRef = useRef(null);
  const { showVoronoi } = useVisualization();

  // Initialize link layer
  useEffect(() => {
    if (!gSelection || !links || links.length === 0) return;

    // Remove existing links
    gSelection.selectAll('g.links').remove();

    // Create new links
    const linkSelection = renderLinks(gSelection, links, transform);
    linkSelectionRef.current = linkSelection;

    // Set initial visibility
    setLinksVisibility(linkSelection, !showVoronoi);

    // Update positions on simulation tick
    if (simulation) {
      const updatePositions = () => {
        if (linkSelectionRef.current) {
          updateLinkPositions(linkSelectionRef.current);
        }
      };

      simulation.on('tick.links', updatePositions);

      return () => {
        simulation.on('tick.links', null);
      };
    }

  }, [gSelection, links, simulation]);

  // Update stroke width on zoom
  useEffect(() => {
    if (!linkSelectionRef.current) return;

    updateLinkStrokeWidth(linkSelectionRef.current, transform.k);

  }, [transform]);

  // Toggle visibility based on Voronoi mode
  useEffect(() => {
    if (!linkSelectionRef.current) return;

    setLinksVisibility(linkSelectionRef.current, !showVoronoi);

  }, [showVoronoi]);

  return null; // Renderless component
};

/**
 * Custom hook for D3 force simulation
 * Manages physics simulation for network graph
 */

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { SIMULATION } from '../constants';

/**
 * Hook to create and manage force simulation
 * @param {Array} nodes - Graph nodes
 * @param {Array} links - Graph links
 * @param {Object} gRef - D3 selection reference
 * @param {Object} dimensions - {width, height}
 * @param {Object} options - Simulation options
 * @returns {Object} simulationRef
 */
export const useForceSimulation = (nodes, links, gRef, dimensions, options = {}) => {
  const simulationRef = useRef(null);
  const optionsRef = useRef(options);
  
  // Update options ref when it changes
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);
  
  useEffect(() => {
    if (!gRef.current || nodes.length === 0) return;

    const { width, height } = dimensions;

    // Initialize positions
    nodes.forEach(d => {
      d.x = width / 2 + d.target_x;
      d.y = height / 2 + d.target_y;
    });

    // Custom radial force to keep nodes near target positions
    function radialForce() {
      return () => {
        const k = SIMULATION.RADIAL_FORCE_K;
        nodes.forEach(d => {
          const dx = d.x - (width / 2 + d.target_x);
          const dy = d.y - (height / 2 + d.target_y);
          d.vx -= dx * k;
          d.vy -= dy * k;
        });
      };
    }

    // Create simulation
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links)
        .id(d => d.id)
        .distance(d => {
          const source = nodes.find(n => n.id === d.source.id);
          const target = nodes.find(n => n.id === d.target.id);
          return Math.abs(source.radius - target.radius) || 40;
        })
        .strength(SIMULATION.LINK_STRENGTH))
      .force('charge', d3.forceManyBody().strength(SIMULATION.CHARGE_STRENGTH))
      .force('radial', radialForce())
      .force('collide', d3.forceCollide(d => d.size + SIMULATION.COLLISION_PADDING))
      .alphaTarget(SIMULATION.ALPHA_TARGET)
      .velocityDecay(SIMULATION.VELOCITY_DECAY);

    // Update positions on tick
    let tickCounter = 0;
    simulation.on('tick', () => {
      // Update link positions
      gRef.current.selectAll('line.link')
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      // Update node positions
      gRef.current.selectAll('g.node-group')
        .attr('transform', d => `translate(${d.x},${d.y})`);

      // Call custom tick handler
      if (optionsRef.current.onTick) {
        optionsRef.current.onTick(tickCounter);
      }

      tickCounter++;
    });

    simulationRef.current = simulation;

    return () => {
      simulation.stop();
    };

  }, [nodes, links, dimensions]);
  
  return simulationRef;
};

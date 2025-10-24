// Backend API configuration
export const BACKEND_URL = 'https://nooscope.osmarks.net/backend';
export const TOP_K = 12;

// Node sizing constants
export const NODE_SIZE = {
  MIN: 10,
  MAX: 200,
  CLUSTER_MIN: 10,
  CLUSTER_MAX: 100,
  AMPLIFICATION_FACTOR: 10 // For activation visibility
};

// Cluster feature count
export const MAX_FEATURES = 1036;

// Filter defaults
export const FILTER_DEFAULTS = {
  INTENSITY: 200,        // Default filter intensity (0-500%)
  INTENSITY_MIN: 0,
  INTENSITY_MAX: 500,
  BIAS_STRENGTH: 50,     // Default bias reduction strength (0-100%)
  BIAS_MIN: 0,
  BIAS_MAX: 100
};

// Voronoi opacity ranges
export const VORONOI_OPACITY = {
  MIN: 0.05,
  MAX: 0.7,
  DEFAULT: 0.25,
  HOVER: 1.0,
  INACTIVE: 0.02,
  ACTIVE_MIN: 0.3,
  ACTIVE_MAX: 0.9
};

// Zoom configuration
export const ZOOM = {
  MIN_SCALE: 0.1,
  MAX_SCALE: 10,
  THUMBNAIL_SIZE: 60
};

// Force simulation parameters
export const SIMULATION = {
  ALPHA_TARGET: 1,
  VELOCITY_DECAY: 0.2,
  RADIAL_FORCE_K: 0.1,
  LINK_STRENGTH: 0.1,
  CHARGE_STRENGTH: -50,
  COLLISION_PADDING: 4
};

// Vector dimensions
export const VECTOR_DIM = 1152;

// Top emotions to display
export const TOP_EMOTIONS_COUNT = -1;
export const TOP_EMOTIONS_TOOLTIP = 3;

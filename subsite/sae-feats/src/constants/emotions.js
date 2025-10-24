export const EMOTION_COLORS = {
  'Anger': '#DC143C',           // Crimson red
  'Annoyance': '#FF6B6B',       // Light red
  'Fear': '#4A0E4E',            // Dark purple
  'Sadness': '#4A90E2',         // Blue
  'Happiness': '#FFD700',       // Gold/yellow
  'Joy': '#FFA500',             // Orange
  'Pleasure': '#FF69B4',        // Hot pink
  'Excitement': '#FF4500',      // Orange-red
  'Peace': '#87CEEB',           // Sky blue
  'Affection': '#FFB6C1',       // Light pink
  'Love': '#FF1493',            // Deep pink
  'Surprise': '#FFFF00',        // Bright yellow
  'Confidence': '#9370DB',      // Medium purple
  'Pride': '#DAA520',           // Goldenrod
  'Esteem': '#B8860B',          // Dark goldenrod
  'Anticipation': '#FFA07A',    // Light salmon
  'Engagement': '#20B2AA',      // Light sea green
  'Yearning': '#DDA0DD',        // Plum
  'Sympathy': '#98FB98',        // Pale green
  'Suffering': '#696969',       // Dim gray
  'Pain': '#8B0000',            // Dark red
  'Embarrassment': '#FFB6C1',   // Light pink
  'Sensitivity': '#E6E6FA',     // Lavender
  'Disapproval': '#A0522D',     // Sienna brown
  'Aversion': '#556B2F',        // Dark olive green
  'Disconnection': '#708090',   // Slate gray
  'Doubt/Confusion': '#D3D3D3', // Light gray
  'Disquietment': '#8B7D7B',    // Gray-brown
  'Fatigue': '#C0C0C0',         // Silver
  'Dominance': '#8B4513',       // Saddle brown
  'Arousal': '#FF6347',         // Tomato
  'Valence': '#7B68EE'          // Medium slate blue
};

// List of all emotions
export const EMOTIONS = Object.keys(EMOTION_COLORS);

// Demographics labels
export const DEMOGRAPHICS = ['Male', 'Female', 'Kid', 'Adult', 'Teenager'];

// Get emotions excluding demographics
export const getEmotionsOnly = (allLabels) => {
  return allLabels.filter(label => !DEMOGRAPHICS.includes(label));
};

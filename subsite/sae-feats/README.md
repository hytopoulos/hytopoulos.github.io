# Feature Network React App

Interactive D3.js force-directed network visualization built with React.

## Getting Started

### Installation

```bash
cd feature-network-react
npm install
```

### Running the App

```bash
npm start
```

Runs the app in development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.

### Building for Production

```bash
npm run build
```

Builds the app for production to the `build` folder.

## Features

- **Interactive Force-Directed Graph**: Radial layout with hierarchical clustering
- **Drag & Drop**: Move nodes around and watch the physics simulation adjust
- **Hover Tooltips**: See detailed feature information on hover
- **Click to Search Images**: Click any feature node to search for similar images using the nooscope backend
- **Toggle Controls**: Show/hide cluster nodes
- **Zoom & Pan**: Mouse wheel to zoom, drag to pan
- **Always Active Simulation**: Continuous gentle motion for organic feel

## Project Structure

```
src/
├── components/
│   ├── NetworkGraph.js    # Main D3 visualization component
│   ├── Controls.js         # Control panel
│   └── Tooltip.js          # Hover tooltip
├── data.json               # Graph data (nodes and links)
├── App.js                  # Main app component
└── index.js                # Entry point
```

## Technologies

- React 18
- D3.js v7
- Create React App

## Customization

To update the graph data, replace `src/data.json` with your own hierarchical network data.

The data format should include:
- `nodes`: Array of node objects with `id`, `type`, `depth`, `target_x`, `target_y`, `radius`, etc.
- `links`: Array of link objects with `source` and `target` node IDs
- `emotions`: Array of emotion names for the legend

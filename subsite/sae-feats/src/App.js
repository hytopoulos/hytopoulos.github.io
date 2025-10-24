import React from 'react';
import NetworkGraph from './components/NetworkGraph';
import Settings from './components/Settings';
import Help from './components/Help';
import Legend from './components/Legend';
import Tooltip from './components/Tooltip';
import './App.css';
import { AppProvider } from './contexts';

function App() {
  // All state is now managed by Context providers
  // No more prop drilling!

  return (
    <AppProvider>
      <div className="App">
        <Settings />
        <Help />
        <Legend />
        <NetworkGraph />
        <Tooltip />
      </div>
    </AppProvider>
  );
}

export default App;

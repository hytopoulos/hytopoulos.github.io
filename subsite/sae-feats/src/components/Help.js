import React, { useState } from 'react';
import './Help.css';

function Help() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        className="help-button"
        onClick={() => setIsOpen(!isOpen)}
        title="Help"
      >
        ?
      </button>
      
      {isOpen && (
        <div className="help-panel">
          <div className="help-header">
            <h3>What is this?</h3>
            <button className="close-btn" onClick={() => setIsOpen(false)}>×</button>
          </div>
          <div className="help-content">
            <p>
              This tool visualizes how vision-language models represent emotion. 
              Each <b>node</b> represents a distinct concept that is encoded in the AI model.
              Each <b>cluster</b> contains multiple nodes and represents a more abstract concept.
            </p>
            <p>
              These concepts were extracted using a sparse autoencoder. You can read more 
              about sparse autoencoders{' '}
              <a 
                href="https://hytopoulos.github.io/decoding-emotion/" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                here
              </a>
            </p>
          </div>
        </div>
      )}
    </>
  );
}

export default Help;

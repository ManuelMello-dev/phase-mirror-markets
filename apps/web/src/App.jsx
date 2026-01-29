import React, { useState } from 'react';
import NeuralDashboard from './NeuralDashboard';
import FractalCoherenceDashboard from './FractalCoherenceDashboard';

function App() {
  const [view, setView] = useState('oracle');

  return (
    <div>
      <div style={{
        backgroundColor: '#1f2937',
        color: 'white',
        padding: '1rem',
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Phase Mirror Markets</h1>
        <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
          <button
            onClick={() => setView('oracle')}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: view === 'oracle' ? '#3b82f6' : '#4b5563',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: view === 'oracle' ? 'bold' : 'normal'
            }}
          >
            Oracle Signal
          </button>
          <button
            onClick={() => setView('coherence')}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: view === 'coherence' ? '#3b82f6' : '#4b5563',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: view === 'coherence' ? 'bold' : 'normal'
            }}
          >
            Fractal Coherence
          </button>
        </div>
      </div>
      <div>
        {view === 'oracle' && <NeuralDashboard />}
        {view === 'coherence' && <FractalCoherenceDashboard />}
      </div>
    </div>
  );
}

export default App;

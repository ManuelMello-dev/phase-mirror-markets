import React from 'react';

function App() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Phase Mirror Markets</h1>
      <p>Welcome to the Phase Mirror Markets monorepo!</p>
      <div style={{ marginTop: '2rem' }}>
        <h2>Services:</h2>
        <ul>
          <li><strong>Frontend:</strong> Vite + React</li>
          <li><strong>Backend API:</strong> Express + TypeScript (Quant Oracle)</li>
        </ul>
      </div>
    </div>
  );
}

export default App;

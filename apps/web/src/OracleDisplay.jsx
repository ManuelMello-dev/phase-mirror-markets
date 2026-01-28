import React, { useState, useEffect } from 'react';

function OracleDisplay() {
  const [symbol, setSymbol] = useState('BTC-USD');
  const [signal, setSignal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch signal from the backend
  const fetchSignal = async () => {
    setLoading(true);
    setError(null);
    try {
      // Adjust the API URL based on your deployment environment
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/oracle/signal?symbol=${symbol}`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }
      
      const data = await response.json();
      setSignal(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching signal:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch signal on component mount and when symbol changes
  useEffect(() => {
    fetchSignal();
  }, [symbol]);

  // Helper function to format numbers
  const formatNumber = (num, decimals = 2) => {
    return typeof num === 'number' ? num.toFixed(decimals) : 'N/A';
  };

  // Helper function to format phase in degrees
  const formatPhase = (phaseRad) => {
    return typeof phaseRad === 'number' ? (phaseRad * 180 / Math.PI).toFixed(2) : 'N/A';
  };

  // Helper function to get signal color
  const getSignalColor = (sig) => {
    switch (sig) {
      case 'BUY':
        return '#10b981'; // Green
      case 'SELL':
        return '#ef4444'; // Red
      default:
        return '#6b7280'; // Gray
    }
  };

  // Helper function to get signal background color
  const getSignalBgColor = (sig) => {
    switch (sig) {
      case 'BUY':
        return '#d1fae5'; // Light green
      case 'SELL':
        return '#fee2e2'; // Light red
      default:
        return '#f3f4f6'; // Light gray
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>The Oracle - Z³ Trading Strategy</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        Real-time market analysis using Volume-Weighted Average Price (VWAP), deviation measurement, and phase analysis.
      </p>

      {/* Symbol Input */}
      <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
        <div>
          <label htmlFor="symbol-input" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Trading Pair:
          </label>
          <input
            id="symbol-input"
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            placeholder="e.g., BTC-USD, ETH-USD"
            style={{
              padding: '0.5rem',
              fontSize: '1rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              width: '200px',
            }}
          />
        </div>
        <button
          onClick={fetchSignal}
          disabled={loading}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '1rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          backgroundColor: '#fee2e2',
          border: '1px solid #fecaca',
          color: '#dc2626',
          padding: '1rem',
          borderRadius: '4px',
          marginBottom: '2rem',
        }}>
          Error: {error}
        </div>
      )}

      {/* Signal Display */}
      {signal && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}>
          {/* Main Signal Card */}
          <div style={{
            backgroundColor: getSignalBgColor(signal.signal),
            border: `2px solid ${getSignalColor(signal.signal)}`,
            borderRadius: '8px',
            padding: '1.5rem',
            textAlign: 'center',
          }}>
            <h2 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>Signal</h2>
            <div style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              color: getSignalColor(signal.signal),
              marginBottom: '0.5rem',
            }}>
              {signal.signal}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#666' }}>
              Confidence: {formatNumber(signal.confidence * 100, 1)}%
            </div>
          </div>

          {/* Equilibrium State Card */}
          <div style={{
            backgroundColor: '#f0f9ff',
            border: '1px solid #bfdbfe',
            borderRadius: '8px',
            padding: '1.5rem',
          }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#333' }}>Equilibrium State (Z')</h3>
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.25rem' }}>VWAP</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e40af' }}>
                ${formatNumber(signal.Z_prime, 2)}
              </div>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#666' }}>
              Volume-Weighted Average Price
            </div>
          </div>

          {/* Deviation Measurement Card */}
          <div style={{
            backgroundColor: '#fef3c7',
            border: '1px solid #fcd34d',
            borderRadius: '8px',
            padding: '1.5rem',
          }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#333' }}>Deviation (E)</h3>
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.25rem' }}>
                Standard Deviations from Equilibrium
              </div>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: signal.E < 0 ? '#10b981' : '#ef4444',
              }}>
                {formatNumber(signal.E, 2)}σ
              </div>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#666' }}>
              {signal.E < 0 ? '↓ Undervalued' : signal.E > 0 ? '↑ Overvalued' : '→ Neutral'}
            </div>
          </div>

          {/* Phase Position Card */}
          <div style={{
            backgroundColor: '#f5e6ff',
            border: '1px solid #d8b4fe',
            borderRadius: '8px',
            padding: '1.5rem',
          }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#333' }}>Phase Position (φ)</h3>
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.25rem' }}>
                Cycle Position
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#7c3aed' }}>
                {formatPhase(signal.phase)}°
              </div>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#666' }}>
              Time to Reversal: {formatNumber(signal.T_reversal, 1)} periods
            </div>
          </div>

          {/* Timestamp Card */}
          <div style={{
            backgroundColor: '#f3f4f6',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            padding: '1.5rem',
          }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#333' }}>Status</h3>
            <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
              {new Date(signal.timestamp).toLocaleString()}
            </div>
            <div style={{ 
              fontSize: '0.8rem', 
              fontWeight: 'bold', 
              color: signal.is_live_data ? '#059669' : '#d97706',
              display: 'inline-block',
              padding: '0.25rem 0.5rem',
              backgroundColor: signal.is_live_data ? '#d1fae5' : '#ffedd5',
              borderRadius: '4px'
            }}>
              {signal.is_live_data ? '● LIVE DATA' : '○ SIMULATED DATA'}
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && !signal && (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
          Loading signal data...
        </div>
      )}

      {/* Information Section */}
      <div style={{
        backgroundColor: '#f0fdf4',
        border: '1px solid #bbf7d0',
        borderRadius: '8px',
        padding: '1.5rem',
        marginTop: '2rem',
      }}>
        <h3 style={{ margin: '0 0 1rem 0', color: '#166534' }}>How The Oracle Works</h3>
        <div style={{ color: '#166534', lineHeight: '1.6' }}>
          <p>
            <strong>Equilibrium State (Z'):</strong> Calculated as the Volume-Weighted Average Price (VWAP) to establish the market's fair value.
          </p>
          <p>
            <strong>Deviation Measurement (E):</strong> Measures how many standard deviations the current price is from equilibrium. Negative values indicate undervaluation (BUY signal), positive values indicate overvaluation (SELL signal).
          </p>
          <p>
            <strong>Phase Position (φ):</strong> Uses Fast Fourier Transform (FFT) to analyze the dominant frequency in price movements and determine the position within the oscillatory cycle. This helps predict when a reversal is likely to occur.
          </p>
          <p>
            <strong>Trading Signal:</strong> A BUY or SELL signal is generated when the price deviates significantly from equilibrium AND the phase analysis indicates an approaching reversal.
          </p>
        </div>
      </div>
    </div>
  );
}

export default OracleDisplay;

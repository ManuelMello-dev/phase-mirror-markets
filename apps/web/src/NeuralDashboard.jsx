import React, { useState, useEffect } from 'react';

function NeuralDashboard() {
  const [symbol, setSymbol] = useState('BTC-USD');
  const [signal, setSignal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSignal = async () => {
    setLoading(true);
    setError(null);
    try {
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

  useEffect(() => {
    fetchSignal();
  }, [symbol]);

  const formatNumber = (num, decimals = 2) => {
    return typeof num === 'number' ? num.toFixed(decimals) : 'N/A';
  };

  const getSignalColor = (sig) => {
    switch (sig) {
      case 'BUY':
        return '#10b981';
      case 'SELL':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getSignalBgColor = (sig) => {
    switch (sig) {
      case 'BUY':
        return '#d1fae5';
      case 'SELL':
        return '#fee2e2';
      default:
        return '#f3f4f6';
    }
  };

  // Render a simple waveform visualization
  const renderWaveform = () => {
    if (!signal || !signal.psd || signal.psd.length === 0) return null;

    const width = 300;
    const height = 100;
    const maxPSD = Math.max(...signal.psd.slice(0, 32));
    const points = signal.psd.slice(0, 32).map((val, i) => {
      const x = (i / 32) * width;
      const y = height - (val / maxPSD) * height;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg width={width} height={height} style={{ border: '1px solid #ddd', borderRadius: '4px' }}>
        <polyline points={points} fill="none" stroke="#3b82f6" strokeWidth="2" />
      </svg>
    );
  };

  // Render attention coherence as a gauge
  const renderAttentionGauge = () => {
    if (!signal) return null;

    const coherence = signal.attention_coherence || 0;
    const normalizedCoherence = (coherence + 1) / 2; // Normalize from [-1, 1] to [0, 1]
    const percentage = Math.max(0, Math.min(100, normalizedCoherence * 100));
    const gaugeColor = percentage > 70 ? '#10b981' : percentage > 40 ? '#f59e0b' : '#ef4444';

    return (
      <div style={{ marginTop: '1rem' }}>
        <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
          Attention Coherence (Price-Volume Alignment)
        </div>
        <div style={{
          width: '100%',
          height: '24px',
          backgroundColor: '#e5e7eb',
          borderRadius: '12px',
          overflow: 'hidden',
          position: 'relative',
        }}>
          <div style={{
            width: `${percentage}%`,
            height: '100%',
            backgroundColor: gaugeColor,
            transition: 'width 0.3s ease',
          }} />
        </div>
        <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>
          {formatNumber(coherence, 3)} ({formatNumber(percentage, 1)}%)
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Market EEG Monitor - The Oracle</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        Neuroscience-inspired analysis of market dynamics. Price is the waveform, volume is attention.
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
          {loading ? 'Scanning...' : 'Scan'}
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
            <h2 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>Neural Signal</h2>
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

          {/* Market Arousal (E) */}
          <div style={{
            backgroundColor: '#fef3c7',
            border: '1px solid #fcd34d',
            borderRadius: '8px',
            padding: '1.5rem',
          }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#333' }}>Market Arousal (E)</h3>
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.25rem' }}>
                Stress Level (σ from equilibrium)
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
              {signal.E < 0 ? '↓ Calm/Undervalued' : signal.E > 0 ? '↑ Excited/Overvalued' : '→ Balanced'}
            </div>
          </div>

          {/* Coherence Anchor (Z') */}
          <div style={{
            backgroundColor: '#f0f9ff',
            border: '1px solid #bfdbfe',
            borderRadius: '8px',
            padding: '1.5rem',
          }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#333' }}>Coherence Anchor (Z')</h3>
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.25rem' }}>
                Market Equilibrium (VWAP)
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e40af' }}>
                ${formatNumber(signal.Z_prime, 2)}
              </div>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#666' }}>
              Fair value anchor
            </div>
          </div>

          {/* Phase Position */}
          <div style={{
            backgroundColor: '#f5e6ff',
            border: '1px solid #d8b4fe',
            borderRadius: '8px',
            padding: '1.5rem',
          }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#333' }}>Waveform Phase (φ)</h3>
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.25rem' }}>
                Cycle Position
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#7c3aed' }}>
                {formatNumber((signal.phase * 180 / Math.PI), 1)}°
              </div>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#666' }}>
              Reversal in: {formatNumber(signal.T_reversal, 1)} periods
            </div>
          </div>

          {/* Waveform Visualization */}
          <div style={{
            backgroundColor: '#f3f4f6',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            padding: '1.5rem',
          }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#333' }}>Power Spectrum</h3>
            {renderWaveform()}
            <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
              Frequency distribution of the market waveform
            </div>
          </div>

          {/* Attention Coherence */}
          <div style={{
            backgroundColor: '#fce7f3',
            border: '1px solid #fbcfe8',
            borderRadius: '8px',
            padding: '1.5rem',
          }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#333' }}>Attention Coherence</h3>
            {renderAttentionGauge()}
            <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
              Price-volume alignment
            </div>
          </div>

          {/* Status */}
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
              {signal.is_live_data ? '● LIVE' : '○ SIMULATED'}
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && !signal && (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
          Scanning market EEG...
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
        <h3 style={{ margin: '0 0 1rem 0', color: '#166534' }}>Market EEG Interpretation</h3>
        <div style={{ color: '#166534', lineHeight: '1.6', fontSize: '0.95rem' }}>
          <p>
            <strong>Market Arousal (E):</strong> Measures how far the market has deviated from its equilibrium. Negative values indicate a calm, undervalued state (potential BUY). Positive values indicate excitement, overvaluation (potential SELL).
          </p>
          <p>
            <strong>Coherence Anchor (Z'):</strong> The market's "resting state" or fair value, calculated as the Volume-Weighted Average Price. This is the market's baseline coherence.
          </p>
          <p>
            <strong>Waveform Phase (φ):</strong> The position of the market within its oscillatory cycle. Combined with arousal, this predicts when a phase reversal (collapse) is likely to occur.
          </p>
          <p>
            <strong>Attention Coherence:</strong> The correlation between price movements and volume. High coherence means price and volume move together (strong signal). Low coherence suggests noise or disagreement in the market.
          </p>
          <p>
            <strong>Power Spectrum:</strong> The frequency distribution of the market's waveform. Dominant frequencies reveal the market's natural rhythms and cycles.
          </p>
        </div>
      </div>
    </div>
  );
}

export default NeuralDashboard;

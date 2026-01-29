import React, { useState, useEffect } from 'react';

function ResonanceDashboard() {
  const [coherenceReport, setCoherenceReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCoherenceReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/coherence/report`);
      if (!response.ok) throw new Error(`API error: ${response.statusText}`);
      const data = await response.json();
      setCoherenceReport(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoherenceReport();
    const interval = setInterval(fetchCoherenceReport, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num, decimals = 4) => {
    return typeof num === 'number' ? num.toFixed(decimals) : 'N/A';
  };

  const getResonanceColor = (value) => {
    if (value > 0.6) return '#8b5cf6'; // Purple - High resonance (stable standing wave)
    if (value > 0.4) return '#3b82f6'; // Blue - Medium resonance
    return '#6b7280'; // Gray - Low resonance (noise)
  };

  const renderResonanceBar = (value) => {
    const percentage = Math.max(0, Math.min(100, value * 100));
    return (
      <div style={{
        width: '100%',
        height: '20px',
        backgroundColor: '#e5e7eb',
        borderRadius: '10px',
        overflow: 'hidden',
        position: 'relative',
      }}>
        <div style={{
          width: `${percentage}%`,
          height: '100%',
          backgroundColor: getResonanceColor(value),
          transition: 'width 0.3s ease',
        }} />
      </div>
    );
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif', maxWidth: '1400px', margin: '0 auto' }}>
      <h1>Faraday Resonance Monitor - Standing Waves in Markets</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        Thoughts are standing waves. Markets are collective thoughts. Detect when a "market thought" becomes stable and when it's about to collapse.
      </p>

      {/* Control Panel */}
      <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
        <button
          onClick={fetchCoherenceReport}
          disabled={loading}
          style={{
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            backgroundColor: '#8b5cf6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? 'Scanning...' : 'Refresh'}
        </button>
        {coherenceReport && (
          <div style={{ fontSize: '0.9rem', color: '#666', alignSelf: 'center' }}>
            Last updated: {new Date(coherenceReport.timestamp).toLocaleTimeString()}
          </div>
        )}
      </div>

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

      {coherenceReport && (
        <div>
          {/* Hemispheric Coupling */}
          <div style={{
            backgroundColor: '#fef3c7',
            border: '2px solid #fcd34d',
            borderRadius: '8px',
            padding: '1.5rem',
            marginBottom: '2rem',
          }}>
            <h2 style={{ margin: '0 0 1rem 0', color: '#333' }}>Hemispheric Coupling (Corpus Callosum)</h2>
            <p style={{ color: '#666', marginBottom: '1rem', fontSize: '0.95rem' }}>
              SPY vs QQQ coupling strength. High coupling = synchronized hemispheres = unified market consciousness.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                {renderResonanceBar(coherenceReport.hemispheric_coupling)}
              </div>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: getResonanceColor(coherenceReport.hemispheric_coupling),
              }}>
                {formatNumber(coherenceReport.hemispheric_coupling, 3)}
              </div>
            </div>
          </div>

          {/* Faraday Resonance - Individual Assets */}
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ marginBottom: '1rem', color: '#333' }}>Faraday Resonance Stability (Standing Waves)</h2>
            <p style={{ color: '#666', marginBottom: '1rem', fontSize: '0.95rem' }}>
              High resonance = Stable standing wave = Strong "thought" pattern. Low resonance = Noise / Unstable pattern.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
              {Object.entries(coherenceReport.faraday_resonance || {}).map(([symbol, resonance]) => (
                <div key={symbol} style={{
                  backgroundColor: '#f5e6ff',
                  border: '1px solid #d8b4fe',
                  borderRadius: '8px',
                  padding: '1rem',
                }}>
                  <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    {symbol}
                  </div>
                  {renderResonanceBar(resonance)}
                  <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
                    Stability: {formatNumber(resonance, 3)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Emotional Intelligence */}
          <div style={{
            backgroundColor: '#fce7f3',
            border: '2px solid #f472b6',
            borderRadius: '8px',
            padding: '1.5rem',
            marginBottom: '2rem',
          }}>
            <h2 style={{ margin: '0 0 1rem 0', color: '#333' }}>Global Emotional Intelligence</h2>
            <p style={{ color: '#666', marginBottom: '1rem', fontSize: '0.95rem' }}>
              Average coherence across all assets. High EI = Market is "thinking clearly" = Strong signals.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                {renderResonanceBar(coherenceReport.emotional_intelligence)}
              </div>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: getResonanceColor(coherenceReport.emotional_intelligence),
              }}>
                {formatNumber(coherenceReport.emotional_intelligence, 3)}
              </div>
            </div>
          </div>

          {/* Information Section */}
          <div style={{
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '8px',
            padding: '1.5rem',
          }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#166534' }}>Understanding Faraday Resonance</h3>
            <div style={{ color: '#166534', lineHeight: '1.6', fontSize: '0.95rem' }}>
              <p>
                <strong>Faraday Waves:</strong> In fluid dynamics, Faraday waves are standing waves that form on the surface of a vibrating fluid. They only exist at specific frequencies (mode-locking) and require a threshold of energy to form.
              </p>
              <p>
                <strong>Market Thoughts as Standing Waves:</strong> A market "thought" (trend) is a stable standing wave pattern in the collective trading behavior. High resonance means the pattern is stable and reinforced. Low resonance means the pattern is breaking down.
              </p>
              <p>
                <strong>Hemispheric Coupling:</strong> Like the corpus callosum connecting brain hemispheres, the market has "hemispheres" (buy-side and sell-side, or indices like SPY and QQQ). Strong coupling means both sides are synchronized—a unified market consciousness.
              </p>
              <p>
                <strong>Trading Insight:</strong> Enter when resonance is HIGH (stable thought) and hemispheric coupling is STRONG (unified consciousness). Exit when resonance drops (thought collapsing) or coupling weakens (fragmentation).
              </p>
            </div>
          </div>
        </div>
      )}

      {loading && !coherenceReport && (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
          Analyzing standing wave patterns...
        </div>
      )}
    </div>
  );
}

export default ResonanceDashboard;

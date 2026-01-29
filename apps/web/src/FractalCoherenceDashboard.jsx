import React, { useState, useEffect } from 'react';

function FractalCoherenceDashboard() {
  const [coherenceReport, setCoherenceReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState('macro');

  const fetchCoherenceReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/coherence/report`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }
      
      const data = await response.json();
      setCoherenceReport(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching coherence report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoherenceReport();
    const interval = setInterval(fetchCoherenceReport, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num, decimals = 4) => {
    return typeof num === 'number' ? num.toFixed(decimals) : 'N/A';
  };

  const getCoherenceColor = (value) => {
    if (value > 0.7) return '#10b981'; // Green - High coherence
    if (value > 0.4) return '#f59e0b'; // Amber - Medium coherence
    return '#ef4444'; // Red - Low coherence
  };

  const renderCoherenceBar = (value) => {
    const percentage = Math.max(0, Math.min(100, value * 100));
    return (
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
          backgroundColor: getCoherenceColor(value),
          transition: 'width 0.3s ease',
        }} />
      </div>
    );
  };

  const renderMacroLevel = () => {
    if (!coherenceReport || !coherenceReport.levels || !coherenceReport.levels.macro) {
      return <div style={{ color: '#666' }}>No macro-level data available</div>;
    }

    const macro = coherenceReport.levels.macro;
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
        {Object.entries(macro).map(([key, value]) => (
          <div key={key} style={{
            backgroundColor: '#f0f9ff',
            border: '1px solid #bfdbfe',
            borderRadius: '8px',
            padding: '1rem',
          }}>
            <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              {key}
            </div>
            {renderCoherenceBar(value)}
            <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
              Phase Coherence: {formatNumber(value, 3)}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderMesoLevel = () => {
    if (!coherenceReport || !coherenceReport.levels || !coherenceReport.levels.meso) {
      return <div style={{ color: '#666' }}>No meso-level data available</div>;
    }

    const meso = coherenceReport.levels.meso;
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
        {Object.entries(meso).map(([key, value]) => (
          <div key={key} style={{
            backgroundColor: '#fef3c7',
            border: '1px solid #fcd34d',
            borderRadius: '8px',
            padding: '1rem',
          }}>
            <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              {key}
            </div>
            {renderCoherenceBar(value)}
            <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
              Sector Synchrony: {formatNumber(value, 3)}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderMicroLevel = () => {
    if (!coherenceReport || !coherenceReport.levels || !coherenceReport.levels.micro) {
      return <div style={{ color: '#666' }}>No micro-level data available</div>;
    }

    const micro = coherenceReport.levels.micro;
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
        {Object.entries(micro).map(([sector, stocks]) => (
          <div key={sector} style={{
            backgroundColor: '#f5e6ff',
            border: '1px solid #d8b4fe',
            borderRadius: '8px',
            padding: '1rem',
          }}>
            <div style={{ fontSize: '1rem', color: '#333', marginBottom: '1rem', fontWeight: 'bold' }}>
              {sector}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {Object.entries(stocks).map(([symbol, coherence]) => (
                <div key={symbol} style={{ fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ color: '#666' }}>{symbol}</span>
                    <span style={{ color: getCoherenceColor(coherence), fontWeight: 'bold' }}>
                      {formatNumber(coherence, 3)}
                    </span>
                  </div>
                  {renderCoherenceBar(coherence)}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif', maxWidth: '1400px', margin: '0 auto' }}>
      <h1>Fractal Coherence Monitor - Attention Flow Analysis</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        Multi-scale analysis of market synchrony. Zoom in and out to find where attention is flowing.
      </p>

      {/* Control Panel */}
      <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <button
          onClick={fetchCoherenceReport}
          disabled={loading}
          style={{
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? 'Analyzing...' : 'Refresh Analysis'}
        </button>

        {coherenceReport && (
          <div style={{ fontSize: '0.9rem', color: '#666' }}>
            Last updated: {new Date(coherenceReport.timestamp).toLocaleTimeString()}
          </div>
        )}
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

      {/* Emotional Intelligence Metric */}
      {coherenceReport && (
        <div style={{
          backgroundColor: '#fce7f3',
          border: '2px solid #f472b6',
          borderRadius: '8px',
          padding: '1.5rem',
          marginBottom: '2rem',
        }}>
          <h2 style={{ margin: '0 0 1rem 0', color: '#333' }}>Emotional Intelligence (Global Coherence)</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              {renderCoherenceBar(coherenceReport.emotional_intelligence)}
            </div>
            <div style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: getCoherenceColor(coherenceReport.emotional_intelligence),
            }}>
              {formatNumber(coherenceReport.emotional_intelligence, 3)}
            </div>
          </div>
          <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '1rem' }}>
            The market's ability to "understand" and synchronize across all levels. High EI indicates strong phase-locking and attention alignment.
          </p>
        </div>
      )}

      {/* Fractal Level Selector */}
      <div style={{ marginBottom: '2rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {['macro', 'meso', 'micro'].map(level => (
          <button
            key={level}
            onClick={() => setSelectedLevel(level)}
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.95rem',
              backgroundColor: selectedLevel === level ? '#3b82f6' : '#e5e7eb',
              color: selectedLevel === level ? 'white' : '#333',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: selectedLevel === level ? 'bold' : 'normal',
            }}
          >
            {level.toUpperCase()} Level
          </button>
        ))}
      </div>

      {/* Fractal Level Content */}
      {coherenceReport && (
        <div>
          {selectedLevel === 'macro' && (
            <div>
              <h2 style={{ marginBottom: '1rem', color: '#333' }}>Macro Level - Global Market Synchrony</h2>
              {renderMacroLevel()}
            </div>
          )}
          {selectedLevel === 'meso' && (
            <div>
              <h2 style={{ marginBottom: '1rem', color: '#333' }}>Meso Level - Sector-to-Market Coherence</h2>
              {renderMesoLevel()}
            </div>
          )}
          {selectedLevel === 'micro' && (
            <div>
              <h2 style={{ marginBottom: '1rem', color: '#333' }}>Micro Level - Individual Attention Flow</h2>
              {renderMicroLevel()}
            </div>
          )}
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
        <h3 style={{ margin: '0 0 1rem 0', color: '#166534' }}>Understanding the Fractal Coherence</h3>
        <div style={{ color: '#166534', lineHeight: '1.6', fontSize: '0.95rem' }}>
          <p>
            <strong>Macro Level:</strong> Measures how different global indices (S&P 500, NASDAQ, etc.) are synchronized. High coherence indicates a unified market direction.
          </p>
          <p>
            <strong>Meso Level:</strong> Analyzes how sectors (Tech, Finance, Energy) move relative to the overall market. Identifies which sectors are "in sync" with the global trend.
          </p>
          <p>
            <strong>Micro Level:</strong> Examines individual stock attention flow (price-volume coherence). Shows which stocks have strong internal alignment between price action and trading volume.
          </p>
          <p>
            <strong>Emotional Intelligence:</strong> The weighted average coherence across all levels. A high EI score means the market is "emotionally intelligent"—all parts are synchronized and moving together.
          </p>
          <p>
            <strong>Trading Insight:</strong> Enter the attention flow when EI is high and a specific sector shows strong coherence with the macro trend. This indicates the market is "paying attention" and the signal is strong.
          </p>
        </div>
      </div>
    </div>
  );
}

export default FractalCoherenceDashboard;

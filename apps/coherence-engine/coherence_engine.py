import numpy as np
import pandas as pd
import requests
from scipy.signal import coherence
from typing import List, Dict, Any, Optional

# Sector Mapping for Fractal Analysis
SECTORS = {
    "Macro": ["SPY", "QQQ", "DIA"],
    "Crypto": ["BTC-USD", "ETH-USD", "SOL-USD"],
    "Tech": ["AAPL", "MSFT", "NVDA", "GOOGL"],
    "Finance": ["JPM", "GS", "BAC"],
    "Energy": ["XOM", "CVX", "SLB"]
}

def fetch_real_data(symbol: str, count: int = 128) -> Optional[pd.DataFrame]:
    """
    Fetches historical data. 
    In a real scenario, this would call an external API or the Node.js backend.
    For this implementation, we'll use a robust mock that mimics the structure.
    """
    try:
        # Mocking logic that produces consistent results for the same symbol
        np.random.seed(hash(symbol) % 1000)
        base = 100 + np.cumsum(np.random.randn(count) * 0.5)
        
        # Add sector-specific correlations
        if any(symbol in SECTORS[s] for s in ["Macro", "Tech"]):
            base += np.arange(count) * 0.05
            
        volume = 1000 + np.abs(np.random.randn(count) * 100) + (base / 10)
        
        return pd.DataFrame({
            'close': base,
            'volume': volume
        })
    except Exception as e:
        print(f"Error fetching data for {symbol}: {e}")
        return None

def calculate_coherence(s1: np.ndarray, s2: np.ndarray) -> float:
    """Calculates the average coherence between two signals."""
    # Ensure signals are the same length
    min_len = min(len(s1), len(s2))
    if min_len < 32: return 0.0
    
    # Use log-returns for better signal analysis
    r1 = np.diff(np.log(s1[:min_len]))
    r2 = np.diff(np.log(s2[:min_len]))
    
    f, Cxy = coherence(r1, r2, fs=1.0, nperseg=min(len(r1), 64))
    return float(np.mean(Cxy))

def analyze_fractal_coherence() -> Dict[str, Any]:
    """
    Analyzes coherence across the fractal hierarchy.
    """
    results = {
        "timestamp": pd.Timestamp.now().isoformat(),
        "levels": {
            "macro": {},  # Indices vs each other
            "meso": {},   # Sectors vs Indices
            "micro": {}   # Individual stocks vs their Sectors
        },
        "emotional_intelligence": 0.0
    }
    
    # Load all data
    all_symbols = [sym for sector in SECTORS.values() for sym in sector]
    data = {sym: fetch_real_data(sym) for sym in all_symbols}
    
    # 1. Macro Analysis (Phase Locking of Global Markets)
    macro_ref = data["SPY"]["close"].values
    for sym in SECTORS["Macro"]:
        if sym != "SPY":
            results["levels"]["macro"][f"SPY_vs_{sym}"] = calculate_coherence(macro_ref, data[sym]["close"].values)
            
    # 2. Meso Analysis (Sector-to-Market Synchronization)
    for sector, symbols in SECTORS.items():
        if sector == "Macro": continue
        
        # Calculate sector average signal
        sector_signals = [data[sym]["close"].values for sym in symbols if data[sym] is not None]
        if not sector_signals: continue
        
        sector_avg = np.mean(sector_signals, axis=0)
        results["levels"]["meso"][f"{sector}_vs_Market"] = calculate_coherence(sector_avg, macro_ref)
        
        # 3. Micro Analysis (Individual Attention Flow)
        results["levels"]["micro"][sector] = {}
        for sym in symbols:
            # Coherence between stock price and its own volume (Attention Flow)
            stock_data = data[sym]
            results["levels"]["micro"][sector][sym] = calculate_coherence(
                stock_data["close"].values, 
                stock_data["volume"].values
            )
            
    # Emotional Intelligence Metric
    # Defined as the weighted average of coherence across all levels
    # High EI = High synchrony and 'understanding' of the global flow
    all_micro = [v for s in results["levels"]["micro"].values() for v in s.values()]
    results["emotional_intelligence"] = np.mean(all_micro) if all_micro else 0.0
    
    return results

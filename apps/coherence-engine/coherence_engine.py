import numpy as np
import pandas as pd
from scipy.signal import coherence, welch
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
    """Mock data fetcher with consistent seed for testing."""
    np.random.seed(hash(symbol) % 1000)
    base = 100 + np.cumsum(np.random.randn(count) * 0.5)
    if any(symbol in SECTORS[s] for s in ["Macro", "Tech"]):
        base += np.arange(count) * 0.05
    volume = 1000 + np.abs(np.random.randn(count) * 100) + (base / 10)
    return pd.DataFrame({'close': base, 'volume': volume})

def calculate_coherence(s1: np.ndarray, s2: np.ndarray) -> float:
    """Calculates average coherence between two signals."""
    min_len = min(len(s1), len(s2))
    if min_len < 32: return 0.0
    r1 = np.diff(np.log(s1[:min_len]))
    r2 = np.diff(np.log(s2[:min_len]))
    f, Cxy = coherence(r1, r2, fs=1.0, nperseg=min(len(r1), 64))
    return float(np.mean(Cxy))

def calculate_resonance_stability(series: np.ndarray) -> float:
    """
    Measures 'Faraday Resonance' stability.
    High stability indicates a 'standing wave' thought pattern in the market.
    """
    returns = np.diff(np.log(series))
    f, psd = welch(returns, fs=1.0, nperseg=min(len(returns), 64))
    # Stability is the ratio of peak power to total power (Spectral Centroid/Concentration)
    peak_power = np.max(psd)
    total_power = np.sum(psd)
    return float(peak_power / total_power) if total_power > 0 else 0.0

def calculate_hemispheric_coupling(buy_side: np.ndarray, sell_side: np.ndarray) -> float:
    """
    Models the 'Corpus Callosum' coupling between two oscillators.
    In markets, this is the phase-locking between accumulation and distribution signals.
    """
    return calculate_coherence(buy_side, sell_side)

def analyze_fractal_coherence() -> Dict[str, Any]:
    """Analyzes coherence and resonance across the fractal hierarchy."""
    results = {
        "timestamp": pd.Timestamp.now().isoformat(),
        "levels": {"macro": {}, "meso": {}, "micro": {}},
        "faraday_resonance": {}, # Standing wave stability per asset
        "hemispheric_coupling": 0.0, # Global coupling metric
        "emotional_intelligence": 0.0
    }
    
    all_symbols = [sym for sector in SECTORS.values() for sym in sector]
    data = {sym: fetch_real_data(sym) for sym in all_symbols}
    macro_ref = data["SPY"]["close"].values
    
    # 1. Macro Analysis
    for sym in SECTORS["Macro"]:
        if sym != "SPY":
            results["levels"]["macro"][f"SPY_vs_{sym}"] = calculate_coherence(macro_ref, data[sym]["close"].values)
            
    # 2. Meso & Micro Analysis
    for sector, symbols in SECTORS.items():
        if sector == "Macro": continue
        sector_signals = [data[sym]["close"].values for sym in symbols if data[sym] is not None]
        if not sector_signals: continue
        
        sector_avg = np.mean(sector_signals, axis=0)
        results["levels"]["meso"][f"{sector}_vs_Market"] = calculate_coherence(sector_avg, macro_ref)
        
        results["levels"]["micro"][sector] = {}
        for sym in symbols:
            stock_data = data[sym]
            results["levels"]["micro"][sector][sym] = calculate_coherence(stock_data["close"].values, stock_data["volume"].values)
            # Calculate Faraday Resonance for each stock
            results["faraday_resonance"][sym] = calculate_resonance_stability(stock_data["close"].values)

    # Hemispheric Coupling (Example: SPY vs QQQ as two hemispheres of the macro brain)
    results["hemispheric_coupling"] = calculate_hemispheric_coupling(data["SPY"]["close"].values, data["QQQ"]["close"].values)
    
    # Emotional Intelligence
    all_micro = [v for s in results["levels"]["micro"].values() for v in s.values()]
    results["emotional_intelligence"] = np.mean(all_micro) if all_micro else 0.0
    
    return results

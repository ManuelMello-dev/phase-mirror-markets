"""
Market Coherence Analyzer
Provides a complete metric suite for phase-mirror market analysis.

This module implements:
- Score calculations for market states
- Phase Locking Value (PLV) for synchronization analysis
- Volatility clustering detection
- Sector synchronization analysis
- Frequency-band coherence measurements
- Dominant frequency detection
"""

import numpy as np
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass
from scipy import signal
from scipy.stats import zscore


@dataclass
class CoherenceMetrics:
    """Container for coherence analysis results."""
    plv: float
    volatility_cluster_score: float
    sector_sync_score: float
    frequency_coherence: Dict[str, float]
    dominant_frequency: float
    overall_score: float


class MarketCoherenceAnalyzer:
    """
    Analyzes phase-mirror market coherence metrics.
    
    This class provides comprehensive analysis of market synchronization,
    coherence, and phase relationships across time series data.
    """
    
    def __init__(self, sampling_rate: float = 1.0):
        """
        Initialize the analyzer.
        
        Args:
            sampling_rate: Sampling rate of the time series (default: 1.0)
        """
        self.sampling_rate = sampling_rate
        self.frequency_bands = {
            'ultra_low': (0.0, 0.01),
            'low': (0.01, 0.05),
            'medium': (0.05, 0.15),
            'high': (0.15, 0.5)
        }
    
    def calculate_plv(self, phase1: np.ndarray, phase2: np.ndarray) -> float:
        """
        Calculate Phase Locking Value (PLV) between two phase signals.
        
        PLV measures the consistency of phase differences between two signals.
        A value close to 1 indicates strong synchronization.
        
        Args:
            phase1: First phase signal (in radians)
            phase2: Second phase signal (in radians)
            
        Returns:
            PLV value between 0 and 1
        """
        if len(phase1) != len(phase2):
            raise ValueError("Phase signals must have the same length")
        
        phase_diff = phase1 - phase2
        plv = np.abs(np.mean(np.exp(1j * phase_diff)))
        return float(plv)
    
    def detect_volatility_clustering(self, returns: np.ndarray, 
                                     window: int = 20) -> float:
        """
        Detect volatility clustering using GARCH-like analysis.
        
        Args:
            returns: Array of returns
            window: Rolling window size for analysis
            
        Returns:
            Volatility clustering score (0-1, higher means more clustering)
        """
        if len(returns) < window * 2:
            return 0.0
        
        # Calculate rolling volatility
        squared_returns = returns ** 2
        rolling_vol = np.array([
            np.sqrt(np.mean(squared_returns[max(0, i-window):i+1]))
            for i in range(len(returns))
        ])
        
        # Autocorrelation of squared returns indicates clustering
        if len(squared_returns) > 1:
            autocorr = np.corrcoef(squared_returns[:-1], squared_returns[1:])[0, 1]
            autocorr = np.nan_to_num(autocorr, nan=0.0, posinf=0.0, neginf=0.0)
        else:
            autocorr = 0.0
        
        # Normalize to 0-1 range
        cluster_score = (autocorr + 1) / 2
        return float(cluster_score)
    
    def calculate_sector_synchronization(self, 
                                         sector_prices: Dict[str, np.ndarray]) -> float:
        """
        Calculate synchronization across multiple sector time series.
        
        Args:
            sector_prices: Dictionary mapping sector names to price arrays
            
        Returns:
            Sector synchronization score (0-1)
        """
        if len(sector_prices) < 2:
            return 0.0
        
        # Extract Hilbert transforms for phase calculation
        phases = {}
        for sector, prices in sector_prices.items():
            if len(prices) > 0:
                analytic_signal = signal.hilbert(prices)
                phases[sector] = np.angle(analytic_signal)
        
        # Calculate pairwise PLV
        sector_names = list(phases.keys())
        plv_values = []
        
        for i in range(len(sector_names)):
            for j in range(i + 1, len(sector_names)):
                plv = self.calculate_plv(phases[sector_names[i]], 
                                        phases[sector_names[j]])
                plv_values.append(plv)
        
        if not plv_values:
            return 0.0
        
        return float(np.mean(plv_values))
    
    def calculate_frequency_band_coherence(self, 
                                          signal1: np.ndarray, 
                                          signal2: np.ndarray) -> Dict[str, float]:
        """
        Calculate coherence in different frequency bands.
        
        Args:
            signal1: First signal
            signal2: Second signal
            
        Returns:
            Dictionary mapping frequency band names to coherence values
        """
        if len(signal1) != len(signal2):
            raise ValueError("Signals must have the same length")
        
        if len(signal1) < 4:
            return {band: 0.0 for band in self.frequency_bands.keys()}
        
        # Calculate coherence
        nperseg = min(len(signal1) // 2, 256)
        f, cxy = signal.coherence(signal1, signal2, 
                                  fs=self.sampling_rate,
                                  nperseg=nperseg)
        
        # Integrate coherence in each frequency band
        band_coherence = {}
        for band_name, (f_low, f_high) in self.frequency_bands.items():
            mask = (f >= f_low) & (f <= f_high)
            if np.any(mask):
                band_coherence[band_name] = float(np.mean(cxy[mask]))
            else:
                band_coherence[band_name] = 0.0
        
        return band_coherence
    
    def detect_dominant_frequency(self, time_series: np.ndarray) -> float:
        """
        Detect the dominant frequency in a time series using FFT.
        
        Args:
            time_series: Input time series
            
        Returns:
            Dominant frequency in Hz
        """
        if len(time_series) < 2:
            return 0.0
        
        # Apply FFT
        n = len(time_series)
        fft_vals = np.fft.fft(time_series)
        fft_mag = np.abs(fft_vals[:n//2])
        freqs = np.fft.fftfreq(n, d=1/self.sampling_rate)[:n//2]
        
        # Find dominant frequency (excluding DC component)
        if len(fft_mag) > 1:
            dominant_idx = np.argmax(fft_mag[1:]) + 1
            dominant_freq = freqs[dominant_idx]
        else:
            dominant_freq = 0.0
        
        return float(dominant_freq)
    
    def calculate_overall_score(self, 
                               plv: float,
                               volatility_cluster: float,
                               sector_sync: float,
                               freq_coherence: Dict[str, float]) -> float:
        """
        Calculate an overall coherence score from individual metrics.
        
        Args:
            plv: Phase locking value
            volatility_cluster: Volatility clustering score
            sector_sync: Sector synchronization score
            freq_coherence: Frequency band coherence dictionary
            
        Returns:
            Overall coherence score (0-1)
        """
        # Weight the different components
        weights = {
            'plv': 0.3,
            'volatility': 0.2,
            'sector': 0.2,
            'frequency': 0.3
        }
        
        # Average frequency coherence
        avg_freq_coherence = np.mean(list(freq_coherence.values()))
        
        # Calculate weighted score
        overall = (
            weights['plv'] * plv +
            weights['volatility'] * (1 - volatility_cluster) +  # Lower clustering is better
            weights['sector'] * sector_sync +
            weights['frequency'] * avg_freq_coherence
        )
        
        return float(np.clip(overall, 0, 1))
    
    def analyze(self, 
                primary_signal: np.ndarray,
                reference_signal: Optional[np.ndarray] = None,
                sector_data: Optional[Dict[str, np.ndarray]] = None) -> CoherenceMetrics:
        """
        Perform comprehensive coherence analysis.
        
        Args:
            primary_signal: Primary time series for analysis
            reference_signal: Optional reference signal for comparison
            sector_data: Optional dictionary of sector time series
            
        Returns:
            CoherenceMetrics object with all calculated metrics
        """
        # Use primary signal as reference if none provided
        if reference_signal is None:
            reference_signal = primary_signal
        
        # Calculate returns for volatility analysis
        # Use log returns to avoid division by zero and handle multiplicative returns
        if len(primary_signal) > 1:
            # Ensure all values are positive for log returns
            # Add offset if there are non-positive values
            min_val = np.min(primary_signal)
            if min_val <= 0:
                offset = abs(min_val) + 1.0
                safe_signal = primary_signal + offset
            else:
                safe_signal = primary_signal
            returns = np.diff(np.log(safe_signal))
        else:
            returns = np.array([0.0])
        
        # Calculate PLV using Hilbert transform for phase extraction
        # Normalize signals to zero mean for consistent phase extraction
        normalized_primary = primary_signal - np.mean(primary_signal)
        normalized_reference = reference_signal - np.mean(reference_signal)
        analytic1 = signal.hilbert(normalized_primary)
        analytic2 = signal.hilbert(normalized_reference)
        phase1 = np.angle(analytic1)
        phase2 = np.angle(analytic2)
        plv = self.calculate_plv(phase1, phase2)
        
        # Volatility clustering
        volatility_score = self.detect_volatility_clustering(returns)
        
        # Sector synchronization
        if sector_data and len(sector_data) > 0:
            sector_sync = self.calculate_sector_synchronization(sector_data)
        else:
            sector_sync = 0.0
        
        # Frequency coherence
        freq_coherence = self.calculate_frequency_band_coherence(
            primary_signal, reference_signal
        )
        
        # Dominant frequency
        dominant_freq = self.detect_dominant_frequency(primary_signal)
        
        # Overall score
        overall = self.calculate_overall_score(
            plv, volatility_score, sector_sync, freq_coherence
        )
        
        return CoherenceMetrics(
            plv=plv,
            volatility_cluster_score=volatility_score,
            sector_sync_score=sector_sync,
            frequency_coherence=freq_coherence,
            dominant_frequency=dominant_freq,
            overall_score=overall
        )


def calculate_market_coherence_score(prices: np.ndarray, 
                                     volumes: np.ndarray) -> float:
    """
    Convenience function to calculate a simple coherence score.
    
    Args:
        prices: Price time series
        volumes: Volume time series
        
    Returns:
        Coherence score between 0 and 1
    """
    analyzer = MarketCoherenceAnalyzer()
    metrics = analyzer.analyze(prices, volumes)
    return metrics.overall_score

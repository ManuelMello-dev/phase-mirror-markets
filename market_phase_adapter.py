"""
Market Phase Adapter
Adapts financial time series to phase-space representations and vice versa.

This module handles:
- Converting price/volume data to oscillator phases
- Extracting amplitudes and frequencies from market signals
- Converting phase-space representations back to market signals
- Phase-amplitude decomposition and reconstruction
"""

import numpy as np
from typing import Tuple, Dict, Optional
from dataclasses import dataclass
from scipy import signal
from scipy.interpolate import interp1d


@dataclass
class PhaseSpaceRepresentation:
    """Container for phase-space representation of market data."""
    phases: np.ndarray
    amplitudes: np.ndarray
    frequencies: np.ndarray
    mean_price: float
    std_price: float


@dataclass
class MarketSignal:
    """Container for reconstructed market signal."""
    prices: np.ndarray
    volumes: Optional[np.ndarray] = None
    timestamps: Optional[np.ndarray] = None


class MarketPhaseAdapter:
    """
    Adapts financial time series to phase-space representations.
    
    This class provides bidirectional conversion between traditional
    market data (price, volume) and phase-space representations
    (phase, amplitude, frequency).
    """
    
    def __init__(self, sampling_rate: float = 1.0):
        """
        Initialize the adapter.
        
        Args:
            sampling_rate: Sampling rate of the time series (default: 1.0)
        """
        self.sampling_rate = sampling_rate
    
    def price_to_phase(self, prices: np.ndarray) -> np.ndarray:
        """
        Convert price time series to phase representation using Hilbert transform.
        
        Args:
            prices: Array of price values
            
        Returns:
            Array of phase values in radians [-π, π]
        """
        if len(prices) < 2:
            return np.array([0.0])
        
        # Normalize prices to zero mean for better phase extraction
        normalized_prices = prices - np.mean(prices)
        
        # Apply Hilbert transform
        analytic_signal = signal.hilbert(normalized_prices)
        phases = np.angle(analytic_signal)
        
        return phases
    
    def price_to_amplitude(self, prices: np.ndarray) -> np.ndarray:
        """
        Extract instantaneous amplitude from price time series.
        
        Args:
            prices: Array of price values
            
        Returns:
            Array of instantaneous amplitude values
        """
        if len(prices) < 2:
            return np.array([np.std(prices) if len(prices) > 0 else 0.0])
        
        # Normalize prices
        normalized_prices = prices - np.mean(prices)
        
        # Apply Hilbert transform and extract envelope
        analytic_signal = signal.hilbert(normalized_prices)
        amplitudes = np.abs(analytic_signal)
        
        return amplitudes
    
    def price_to_frequency(self, prices: np.ndarray) -> np.ndarray:
        """
        Extract instantaneous frequency from price time series.
        
        Args:
            prices: Array of price values
            
        Returns:
            Array of instantaneous frequency values
        """
        if len(prices) < 2:
            return np.array([0.0])
        
        # Get phase
        phases = self.price_to_phase(prices)
        
        # Unwrap phase to avoid discontinuities
        unwrapped_phase = np.unwrap(phases)
        
        # Calculate instantaneous frequency as derivative of phase
        dt = 1.0 / self.sampling_rate
        frequencies = np.gradient(unwrapped_phase) / (2 * np.pi * dt)
        
        return frequencies
    
    def volume_to_phase(self, volumes: np.ndarray) -> np.ndarray:
        """
        Convert volume time series to phase representation.
        
        Args:
            volumes: Array of volume values
            
        Returns:
            Array of phase values in radians [-π, π]
        """
        if len(volumes) < 2:
            return np.array([0.0])
        
        # Apply log transform to handle volume's scale
        log_volumes = np.log1p(volumes)  # log(1 + x) to handle zeros
        
        return self.price_to_phase(log_volumes)
    
    def to_oscillator_representation(self, 
                                    prices: np.ndarray,
                                    volumes: Optional[np.ndarray] = None) -> PhaseSpaceRepresentation:
        """
        Convert market data to complete oscillator (phase-space) representation.
        
        Args:
            prices: Array of price values
            volumes: Optional array of volume values
            
        Returns:
            PhaseSpaceRepresentation object with phases, amplitudes, and frequencies
        """
        # Calculate phase-space components
        phases = self.price_to_phase(prices)
        amplitudes = self.price_to_amplitude(prices)
        frequencies = self.price_to_frequency(prices)
        
        # If volumes provided, modulate amplitude by volume
        if volumes is not None and len(volumes) == len(prices):
            # Normalize volumes to 0-1 range
            vol_normalized = (volumes - np.min(volumes)) / (np.ptp(volumes) + 1e-10)
            # Use volume as amplitude modulation factor
            amplitudes = amplitudes * (1 + vol_normalized)
        
        # Store statistics for reconstruction
        mean_price = float(np.mean(prices))
        std_price = float(np.std(prices))
        
        return PhaseSpaceRepresentation(
            phases=phases,
            amplitudes=amplitudes,
            frequencies=frequencies,
            mean_price=mean_price,
            std_price=std_price
        )
    
    def from_oscillator_representation(self, 
                                      phase_repr: PhaseSpaceRepresentation,
                                      num_points: Optional[int] = None) -> MarketSignal:
        """
        Reconstruct market signal from phase-space representation.
        
        Args:
            phase_repr: PhaseSpaceRepresentation object
            num_points: Optional number of points for reconstruction
                       (defaults to length of input phases)
            
        Returns:
            MarketSignal object with reconstructed prices
        """
        if num_points is None:
            num_points = len(phase_repr.phases)
        
        # Reconstruct signal using inverse Hilbert-like transform
        # Signal = Amplitude * cos(Phase)
        reconstructed = phase_repr.amplitudes * np.cos(phase_repr.phases)
        
        # Rescale to original price statistics
        reconstructed = reconstructed * phase_repr.std_price + phase_repr.mean_price
        
        # Interpolate if different number of points requested
        if len(reconstructed) != num_points:
            x_old = np.linspace(0, 1, len(reconstructed))
            x_new = np.linspace(0, 1, num_points)
            interpolator = interp1d(x_old, reconstructed, kind='cubic', 
                                   fill_value='extrapolate')
            reconstructed = interpolator(x_new)
        
        return MarketSignal(prices=reconstructed)
    
    def phase_to_price(self, 
                      phases: np.ndarray,
                      amplitudes: np.ndarray,
                      mean_price: float = 0.0,
                      std_price: float = 1.0) -> np.ndarray:
        """
        Convert phase and amplitude back to price series.
        
        Args:
            phases: Array of phase values
            amplitudes: Array of amplitude values
            mean_price: Mean price for denormalization
            std_price: Standard deviation for denormalization
            
        Returns:
            Array of reconstructed price values
        """
        if len(phases) != len(amplitudes):
            raise ValueError("Phases and amplitudes must have the same length")
        
        # Reconstruct normalized signal
        signal_normalized = amplitudes * np.cos(phases)
        
        # Denormalize
        prices = signal_normalized * std_price + mean_price
        
        return prices
    
    def calculate_phase_velocity(self, phases: np.ndarray) -> np.ndarray:
        """
        Calculate the rate of change of phase (phase velocity).
        
        Args:
            phases: Array of phase values
            
        Returns:
            Array of phase velocity values
        """
        if len(phases) < 2:
            return np.array([0.0])
        
        # Unwrap phases
        unwrapped = np.unwrap(phases)
        
        # Calculate velocity
        dt = 1.0 / self.sampling_rate
        velocity = np.gradient(unwrapped) / dt
        
        return velocity
    
    def decompose_by_frequency_bands(self,
                                    prices: np.ndarray,
                                    bands: Dict[str, Tuple[float, float]]) -> Dict[str, np.ndarray]:
        """
        Decompose price signal into different frequency bands.
        
        Args:
            prices: Array of price values
            bands: Dictionary mapping band names to (low_freq, high_freq) tuples
            
        Returns:
            Dictionary mapping band names to filtered signals
        """
        decomposed = {}
        
        for band_name, (f_low, f_high) in bands.items():
            # Design bandpass filter
            nyquist = self.sampling_rate / 2
            
            if f_low == 0:
                # Lowpass filter
                sos = signal.butter(4, f_high / nyquist, btype='low', output='sos')
            elif f_high >= nyquist:
                # Highpass filter
                sos = signal.butter(4, f_low / nyquist, btype='high', output='sos')
            else:
                # Bandpass filter
                sos = signal.butter(4, [f_low / nyquist, f_high / nyquist], 
                                   btype='band', output='sos')
            
            # Apply filter
            filtered = signal.sosfiltfilt(sos, prices)
            decomposed[band_name] = filtered
        
        return decomposed
    
    def extract_envelope(self, prices: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """
        Extract upper and lower envelopes of price signal.
        
        Args:
            prices: Array of price values
            
        Returns:
            Tuple of (upper_envelope, lower_envelope)
        """
        # Use Hilbert transform to get analytic signal
        analytic_signal = signal.hilbert(prices - np.mean(prices))
        envelope = np.abs(analytic_signal)
        
        # Upper and lower envelopes
        mean = np.mean(prices)
        upper = mean + envelope
        lower = mean - envelope
        
        return upper, lower
    
    def apply_phase_shift(self, 
                         prices: np.ndarray, 
                         shift_radians: float) -> np.ndarray:
        """
        Apply a phase shift to the price signal.
        
        Args:
            prices: Array of price values
            shift_radians: Phase shift in radians
            
        Returns:
            Phase-shifted price array
        """
        # Convert to phase space
        phase_repr = self.to_oscillator_representation(prices)
        
        # Apply phase shift
        shifted_phases = phase_repr.phases + shift_radians
        
        # Reconstruct
        shifted_prices = self.phase_to_price(
            shifted_phases,
            phase_repr.amplitudes,
            phase_repr.mean_price,
            phase_repr.std_price
        )
        
        return shifted_prices
    
    def calculate_phase_coherence(self, 
                                  prices1: np.ndarray, 
                                  prices2: np.ndarray) -> float:
        """
        Calculate phase coherence between two price series.
        
        Args:
            prices1: First price array
            prices2: Second price array
            
        Returns:
            Phase coherence value (0-1)
        """
        # Extract phases
        phase1 = self.price_to_phase(prices1)
        phase2 = self.price_to_phase(prices2)
        
        # Calculate phase locking value
        min_len = min(len(phase1), len(phase2))
        phase_diff = phase1[:min_len] - phase2[:min_len]
        coherence = np.abs(np.mean(np.exp(1j * phase_diff)))
        
        return float(coherence)


def convert_market_to_phase(prices: np.ndarray, 
                            volumes: Optional[np.ndarray] = None) -> PhaseSpaceRepresentation:
    """
    Convenience function to convert market data to phase representation.
    
    Args:
        prices: Price array
        volumes: Optional volume array
        
    Returns:
        PhaseSpaceRepresentation object
    """
    adapter = MarketPhaseAdapter()
    return adapter.to_oscillator_representation(prices, volumes)


def convert_phase_to_market(phase_repr: PhaseSpaceRepresentation) -> np.ndarray:
    """
    Convenience function to convert phase representation back to prices.
    
    Args:
        phase_repr: PhaseSpaceRepresentation object
        
    Returns:
        Reconstructed price array
    """
    adapter = MarketPhaseAdapter()
    market_signal = adapter.from_oscillator_representation(phase_repr)
    return market_signal.prices

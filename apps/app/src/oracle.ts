import { VWAP, SD } from 'technicalindicators';
import { fetchHistoricalData } from './dataFetcher';
// @ts-ignore
import { fft, util } from 'fft-js';

// --- Data Structures ---

export interface MarketDataPoint {
    close: number;
    high: number;
    low: number;
    volume: number;
}

export interface OracleSignal {
    symbol: string;
    signal: 'BUY' | 'SELL' | 'HOLD';
    E: number; 
    Z_prime: number; 
    phase: number; 
    T_reversal: number; 
    confidence: number; 
    timestamp: string;
    is_live_data: boolean;
}

// --- Helper Functions ---

function generateSyntheticData(count: number): MarketDataPoint[] {
    const data: MarketDataPoint[] = [];
    let price = 100000; 
    for (let i = 0; i < count; i++) {
        const change = (Math.random() - 0.5) * 500 + Math.sin(i / 5) * 200;
        price += change;
        const high = price + Math.random() * 100;
        const low = price - Math.random() * 100;
        const volume = 1000 + Math.random() * 500;
        data.push({ close: price, high, low, volume });
    }
    return data;
}

// --- Core Oracle Logic ---

export function calculateOracleSignal(symbol: string, data: MarketDataPoint[], isLive: boolean): OracleSignal {
    if (data.length < 32) {
        return {
            symbol,
            signal: 'HOLD',
            E: 0,
            Z_prime: data.length > 0 ? data[data.length - 1].close : 0,
            phase: 0,
            T_reversal: 0,
            confidence: 0,
            timestamp: new Date().toISOString(),
            is_live_data: isLive,
        };
    }

    const closes = data.map(d => d.close);
    const highs = data.map(d => d.high);
    const lows = data.map(d => d.low);
    const volumes = data.map(d => d.volume);
    
    // 1. Equilibrium State (Z_prime)
    const vwapResult = VWAP.calculate({
        high: highs,
        low: lows,
        close: closes,
        volume: volumes,
        period: data.length, 
    });
    const Z_prime = vwapResult[vwapResult.length - 1] || data[data.length - 1].close;
    const Z_current = data[data.length - 1].close;

    // 2. Deviation Measurement (E)
    const sdResult = SD.calculate({
        values: closes,
        period: data.length,
    });
    const sigma = sdResult[sdResult.length - 1] || 1; 
    const E = (Z_current - Z_prime) / sigma;

    // 3. Phase Position (Timing)
    const N = Math.pow(2, Math.floor(Math.log2(closes.length)));
    const slicedCloses = closes.slice(-N);
    const phasors = fft(slicedCloses);
    const magnitudes = util.fftMag(phasors);

    let maxMag = 0;
    let dominantIndex = 0;
    for (let i = 1; i < magnitudes.length; i++) {
        if (magnitudes[i] > maxMag) {
            maxMag = magnitudes[i];
            dominantIndex = i;
        }
    }

    const phasor = phasors[dominantIndex];
    const real = phasor[0];
    const imag = phasor[1];
    const phase = Math.atan2(imag, real); 

    const period = N / (dominantIndex || 1);
    const normalizedPhase = phase < 0 ? phase + 2 * Math.PI : phase;
    const T_reversal = (1 - normalizedPhase / (2 * Math.PI)) * period;

    // Decision Logic
    let signal: OracleSignal['signal'] = 'HOLD';
    const sigmaThreshold = 1.5; 
    const phaseThreshold = Math.PI * 1.2; 
    const isApproachingReversal = normalizedPhase > phaseThreshold;

    if (Math.abs(E) > sigmaThreshold && isApproachingReversal) {
        signal = E < 0 ? 'BUY' : 'SELL';
    }

    const confidence = Math.min(1, Math.abs(E) / 3);

    return {
        symbol,
        signal,
        E,
        Z_prime,
        phase: normalizedPhase,
        T_reversal,
        confidence,
        timestamp: new Date().toISOString(),
        is_live_data: isLive,
    };
}

export async function getOracleSignal(symbol: string): Promise<OracleSignal> {
    let historicalData = await fetchHistoricalData(symbol, 3600, 128); 
    let isLive = true;

    if (historicalData.length === 0) {
        console.log('Using synthetic data as fallback for ' + symbol);
        historicalData = generateSyntheticData(128);
        isLive = false;
    }

    return calculateOracleSignal(symbol, historicalData, isLive);
}

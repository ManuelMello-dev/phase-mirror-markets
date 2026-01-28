import axios from 'axios';
import { MarketDataPoint } from './oracle';

const COINBASE_PRO_API_URL = 'https://api.pro.coinbase.com';

export async function fetchHistoricalData(symbol: string, granularity: number = 3600, count: number = 100): Promise<MarketDataPoint[]> {
    const productId = symbol; 
    const now = Math.floor(Date.now() / 1000);
    const end = now;
    const start = end - (count * granularity); 

    try {
        const response = await axios.get(`${COINBASE_PRO_API_URL}/products/${productId}/candles`, {
            params: {
                granularity: granularity,
                start: start,
                end: end,
            }
        });

        const rawData: [number, number, number, number, number, number][] = response.data;

        const marketData: MarketDataPoint[] = rawData
            .reverse()
            .slice(-count) 
            .map(candle => ({
                low: candle[1],
                high: candle[2],
                close: candle[4], 
                volume: candle[5], 
            }));

        if (marketData.length === 0) {
            console.warn('No data returned for ' + symbol);
        }

        return marketData;

    } catch (error: any) {
        console.error('Error fetching data for ' + symbol + ': ' + error.message);
        return [];
    }
}

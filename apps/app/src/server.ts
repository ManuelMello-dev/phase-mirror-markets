import express, { Request, Response } from 'express';

import { getOracleSignal } from './oracle';

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// GET / - returns JSON with name and status
app.get('/', (_req: Request, res: Response) => {
  res.json({
    name: 'Quant Oracle API',
    status: 'running'
  });
});

// GET /health - returns 'ok'
app.get('/health', (_req: Request, res: Response) => {
  res.send('ok');
});

// GET /oracle/signal - returns The Oracle's signal data
app.get('/oracle/signal', async (req: Request, res: Response) => {
  const symbol = (req.query.symbol as string) || 'BTC-USD';
  
  // Basic input validation for symbol parameter
  const validSymbolPattern = /^[A-Z0-9]+-[A-Z0-9]+$/;
  const sanitizedSymbol = validSymbolPattern.test(symbol) ? symbol : 'BTC-USD';
  
  // Use the new Oracle logic
  const signalData = await getOracleSignal(sanitizedSymbol);

  res.json(signalData);
  
  // The actual response is now handled by the new logic above
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Quant Oracle API listening on 0.0.0.0:${PORT}`);
}).on('error', (err: Error) => {
  console.error('❌ Failed to start server:', err.message);
  process.exit(1);
});

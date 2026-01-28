import express, { Request, Response } from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

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

// GET /oracle/signal - returns placeholder signal data
app.get('/oracle/signal', (req: Request, res: Response) => {
  const symbol = (req.query.symbol as string) || 'BTC-USD';
  
  res.json({
    symbol,
    signal: 'HOLD',
    confidence: 0.5,
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Quant Oracle API listening on 0.0.0.0:${PORT}`);
});

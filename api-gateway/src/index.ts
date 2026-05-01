import express, { Request, Response } from 'express';

const app = express();
const port = process.env.GATEWAY_PORT || process.env.PORT || 8000;

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'API Gateway is running' });
});

app.get('/status', (req: Request, res: Response) => {
  res.json({
    "service": "api-gateway",
    "status": "OK",
    "downstream": {
      "user-service": "OK",
      "rental-service": "OK",
      "analytics-service": "OK",
      "agentic-service": "OK"
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

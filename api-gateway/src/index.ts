import express, { Request, Response } from 'express';
import { createProxyMiddleware, fixRequestBody } from 'http-proxy-middleware';
import axios from 'axios';

const app = express();
const port = process.env.GATEWAY_PORT || process.env.PORT || 8000;

// Service URLs from environment variables
const userServiceUrl = process.env.USER_SERVICE_URL || 'http://user-service:8001';
const rentalServiceUrl = process.env.RENTAL_SERVICE_URL || 'http://rental-service:8002';
const analyticsServiceUrl = process.env.ANALYTICS_SERVICE_URL || 'http://analytics-service:8003';
const agenticServiceUrl = process.env.AGENTIC_SERVICE_URL || 'http://agentic-service:8004';

app.use(express.json());

// Proxy routes
app.use('/users', createProxyMiddleware({
  target: userServiceUrl,
  changeOrigin: true,
  onProxyReq: fixRequestBody,
}));

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'API Gateway is running' });
});

app.get('/status', async (req: Request, res: Response) => {
  const services = [
    { name: 'user-service', url: userServiceUrl },
    { name: 'rental-service', url: rentalServiceUrl },
    { name: 'analytics-service', url: analyticsServiceUrl },
    { name: 'agentic-service', url: agenticServiceUrl },
  ];

  const results = await Promise.all(
    services.map(async (service) => {
      try {
        const response = await axios.get(`${service.url}/status`, { timeout: 2000 });
        return { name: service.name, status: response.data.status || 'OK' };
      } catch (error) {
        return { name: service.name, status: 'UNREACHABLE' };
      }
    })
  );

  const downstream: Record<string, string> = {};
  results.forEach((r) => {
    downstream[r.name] = r.status;
  });

  res.json({
    service: 'api-gateway',
    status: 'OK',
    downstream
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

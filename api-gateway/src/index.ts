import express from 'express';
import { config } from './config.js';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Custom body parser to work around Express 5 + Bun content-length mismatch
app.use((req: any, res, next) => {
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'DELETE') {
    return next();
  }
  const contentType = req.headers['content-type'] || '';
  if (!contentType.includes('json')) {
    return next();
  }
  let body = '';
  req.setEncoding('utf8');
  req.on('data', (chunk: string) => { body += chunk; });
  req.on('end', () => {
    try {
      req.body = body ? JSON.parse(body) : {};
    } catch {
      res.status(400).json({ error: 'Invalid JSON' });
      return;
    }
    next();
  });
});
app.use(express.urlencoded({ extended: true }));

// Main Router
app.use('/', routes);

// Error Handling
app.use(errorHandler);

app.listen(config.port, '0.0.0.0', () => {
  console.log(`[api-gateway] listening on 0.0.0.0:${config.port}`);
});

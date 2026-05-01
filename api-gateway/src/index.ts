import express from 'express';
import { config } from './config.js';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(express.json());

// Main Router
app.use('/', routes);

// Error Handling
app.use(errorHandler);

app.listen(config.port, '0.0.0.0', () => {
  console.log(`[api-gateway] listening on 0.0.0.0:${config.port}`);
});

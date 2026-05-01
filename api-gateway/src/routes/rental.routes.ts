import { Router } from 'express';
import { createProxyMiddleware, fixRequestBody } from 'http-proxy-middleware';
import { config } from '../config.js';

const router = Router();

router.use('/', createProxyMiddleware({
  target: config.services.rental,
  changeOrigin: true,
  pathRewrite: (path, req) => req.originalUrl,
  on: {
    proxyReq: fixRequestBody,
  },
}));

export default router;

import { Router } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { config } from '../config.js';

const router = Router();

router.use('/', createProxyMiddleware({
  target: config.services.rental,
  changeOrigin: true,
}));

export default router;

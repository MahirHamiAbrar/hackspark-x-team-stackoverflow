import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error('[api-gateway] Unhandled error:', err);
  res.status(500).json({ error: 'Internal gateway error' });
}

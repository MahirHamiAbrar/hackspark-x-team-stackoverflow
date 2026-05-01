import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import * as userServiceClient from '../services/userService.client.js';

/**
 * Helper: if the downstream threw an AxiosError, forward its status + body.
 * Otherwise rethrow so the global error handler can deal with it.
 */
function handleDownstreamError(error: unknown, next: NextFunction) {
  if (axios.isAxiosError(error) && error.response) {
    return { status: error.response.status, data: error.response.data };
  }
  next(error);
  return null;
}

/** POST /users/register */
export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await userServiceClient.register(req.body);
    res.status(201).json(result);
  } catch (error) {
    const downstream = handleDownstreamError(error, next);
    if (downstream) res.status(downstream.status).json(downstream.data);
  }
}

/** POST /users/login */
export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await userServiceClient.login(req.body);
    res.json(result);
  } catch (error) {
    const downstream = handleDownstreamError(error, next);
    if (downstream) res.status(downstream.status).json(downstream.data);
  }
}

/** GET /users/me  (requires Authorization: Bearer <token>) */
export async function me(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const token = authHeader.split(' ')[1];
  try {
    const result = await userServiceClient.me(token);
    res.json(result);
  } catch (error) {
    const downstream = handleDownstreamError(error, next);
    if (downstream) res.status(downstream.status).json(downstream.data);
  }
}

/** GET /users/:id/discount */
export async function discount(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await userServiceClient.discount(req.params.id);
    res.json(result);
  } catch (error) {
    const downstream = handleDownstreamError(error, next);
    if (downstream) res.status(downstream.status).json(downstream.data);
  }
}

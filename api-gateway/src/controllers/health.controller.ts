import { Request, Response } from 'express';
import axios from 'axios';
import { config } from '../config.js';

const serviceList = [
  { name: 'user-service',      url: config.services.user },
  { name: 'rental-service',    url: config.services.rental },
  { name: 'analytics-service', url: config.services.analytics },
  { name: 'agentic-service',   url: config.services.agentic },
] as const;

/** GET / */
export function root(_req: Request, res: Response) {
  res.json({ message: 'API Gateway is running' });
}

/** GET /status — parallel ping of all downstream services */
export async function status(_req: Request, res: Response) {
  const results = await Promise.all(
    serviceList.map(async (svc) => {
      try {
        const response = await axios.get(`${svc.url}/status`, { timeout: 2000 });
        return { name: svc.name, status: (response.data?.status as string) ?? 'OK' };
      } catch {
        return { name: svc.name, status: 'UNREACHABLE' };
      }
    })
  );

  const downstream: Record<string, string> = {};
  results.forEach((r) => { downstream[r.name] = r.status; });

  res.json({ service: 'api-gateway', status: 'OK', downstream });
}

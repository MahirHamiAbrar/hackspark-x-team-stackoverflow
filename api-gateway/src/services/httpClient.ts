import axios from 'axios';
import { config } from '../config.js';

/** Shared axios instance for user-service */
export const userHttp = axios.create({
  baseURL: config.services.user,
  timeout: 5000,
  headers: { 'Content-Type': 'application/json' },
});

/** Shared axios instance for rental-service */
export const rentalHttp = axios.create({
  baseURL: config.services.rental,
  timeout: 5000,
  headers: { 'Content-Type': 'application/json' },
});

/** Shared axios instance for analytics-service */
export const analyticsHttp = axios.create({
  baseURL: config.services.analytics,
  timeout: 5000,
  headers: { 'Content-Type': 'application/json' },
});

/** Shared axios instance for agentic-service */
export const agenticHttp = axios.create({
  baseURL: config.services.agentic,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

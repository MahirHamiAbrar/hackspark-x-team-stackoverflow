export const config = {
  port: Number(process.env.GATEWAY_PORT || process.env.PORT || 8000),

  services: {
    user:      process.env.USER_SERVICE_URL      || 'http://user-service:8001',
    rental:    process.env.RENTAL_SERVICE_URL    || 'http://rental-service:8002',
    analytics: process.env.ANALYTICS_SERVICE_URL || 'http://analytics-service:8003',
    agentic:   process.env.AGENTIC_SERVICE_URL   || 'http://agentic-service:8004',
  },
} as const;

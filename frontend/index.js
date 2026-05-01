/**
 * Root Backend Definition - RentPi Frontend
 * 
 * Centralized configuration for API endpoints, environment variables,
 * and backend connection settings.
 */

const API_CONFIG = {
  // API Gateway (Main entry point for all requests)
  BASE_URL: process.env.NUXT_PUBLIC_API_URL || 'http://localhost:8000',

  // Service Endpoints (for reference, requests go through API Gateway)
  SERVICES: {
    USER_SERVICE: 'http://user-service:8001',
    RENTAL_SERVICE: 'http://rental-service:8002',
    ANALYTICS_SERVICE: 'http://analytics-service:8003',
    AGENTIC_SERVICE: 'http://agentic-service:8004',
  },

  // Central API (Historical Data - Read Only)
  CENTRAL_API: {
    BASE_URL: process.env.NUXT_PUBLIC_CENTRAL_API_URL || 'https://technocracy.brittoo.xyz',
    TOKEN: process.env.NUXT_PUBLIC_CENTRAL_API_TOKEN,
    RATE_LIMIT: '30 req/min', // Rate limit per token
  },

  // API Routes
  ENDPOINTS: {
    // User Service
    AUTH: {
      LOGIN: '/users/login',
      REGISTER: '/users/register',
      LOGOUT: '/users/logout',
      REFRESH: '/users/refresh',
      PROFILE: '/users/me',
    },

    // Rental Service (proxied via gateway /rentals/)
    PRODUCTS: {
      LIST: '/rentals/products',
      GET: '/rentals/products/:id',
      SEARCH: '/rentals/products/search',
      CATEGORIES: '/rentals/products/categories',
      AVAILABILITY: '/rentals/products/:id/availability',
    },

    RENTALS: {
      LIST: '/rentals',
      GET: '/rentals/:id',
      CREATE: '/rentals',
      CANCEL: '/rentals/:id/cancel',
      HISTORY: '/users/rental-history',
      KTH_BUSIEST: '/rentals/kth-busiest-date',
      FREE_STREAK: '/rentals/products/:id/free-streak',
      MERGED_FEED: '/rentals/merged-feed',
      TOP_CATEGORIES: '/rentals/users/:id/top-categories',
    },

    // Analytics Service (proxied via gateway /analytics/)
    ANALYTICS: {
      PEAK_WINDOW: '/analytics/peak-window',
      SURGE_DAYS: '/analytics/surge-days',
      RECOMMENDATIONS: '/analytics/recommendations',
    },

    // Chat / Agentic Service (proxied via gateway /chat/)
    CHAT: {
      SEND: '/chat',
      SESSIONS: '/chat/sessions',
      HISTORY: '/chat/:sessionId/history',
      DELETE: '/chat/:sessionId',
    },
  },

  // Timeout configurations
  TIMEOUTS: {
    SHORT: 5000,      // 5 seconds
    MEDIUM: 10000,    // 10 seconds
    LONG: 30000,      // 30 seconds
  },

  // Retry configuration
  RETRY: {
    MAX_ATTEMPTS: 3,
    DELAY: 1000,      // 1 second
  },

  // Token management
  TOKEN_STORAGE_KEY: 'auth_token',
  REFRESH_TOKEN_KEY: 'refresh_token',
};

// Initialize configuration from environment
export const initConfig = () => {
  return API_CONFIG;
};

export default API_CONFIG;

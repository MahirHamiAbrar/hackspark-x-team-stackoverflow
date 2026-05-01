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
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register',
      LOGOUT: '/api/auth/logout',
      REFRESH: '/api/auth/refresh',
      PROFILE: '/api/users/profile',
    },

    // Rental Service
    PRODUCTS: {
      LIST: '/api/products',
      GET: '/api/products/:id',
      SEARCH: '/api/products/search',
      CATEGORIES: '/api/products/categories',
    },

    RENTALS: {
      LIST: '/api/rentals',
      GET: '/api/rentals/:id',
      CREATE: '/api/rentals',
      CANCEL: '/api/rentals/:id/cancel',
      HISTORY: '/api/users/rental-history',
    },

    // Analytics Service
    ANALYTICS: {
      TRENDS: '/api/analytics/trends',
      STATS: '/api/analytics/stats',
      RECOMMENDATIONS: '/api/analytics/recommendations',
      SURGE: '/api/analytics/surge-pricing',
    },

    // Central API (via api-gateway)
    CENTRAL: {
      CATEGORIES: '/api/central/categories',
      USERS: '/api/central/users/:id',
      PRODUCTS: '/api/central/products',
      RENTALS: '/api/central/rentals',
      RENTALS_STATS: '/api/central/rentals/stats',
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

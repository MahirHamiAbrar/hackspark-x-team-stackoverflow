/**
 * Constants - App-wide constants and configurations
 */

export const PRODUCT_CATEGORIES = [
  'ELECTRONICS',
  'FURNITURE',
  'VEHICLES',
  'TOOLS',
  'OUTDOOR',
  'SPORTS',
  'MUSIC',
  'OFFICE',
  'CAMERAS',
  'HOME_APPLIANCES',
];

export const RENTAL_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
};

export const USER_ROLES = {
  CUSTOMER: 'customer',
  OWNER: 'owner',
  ADMIN: 'admin',
};

export const SECURITY_SCORE_LEVELS = {
  VERY_LOW: { min: 0, max: 20, label: 'Very Low' },
  LOW: { min: 20, max: 40, label: 'Low' },
  MEDIUM: { min: 40, max: 60, label: 'Medium' },
  HIGH: { min: 60, max: 80, label: 'High' },
  VERY_HIGH: { min: 80, max: 100, label: 'Very High' },
};

export const DISCOUNT_TIERS = [
  { securityScore: 80, discount: 20 },
  { securityScore: 60, discount: 15 },
  { securityScore: 40, discount: 10 },
  { securityScore: 0, discount: 0 },
];

export const RENTAL_PERIODS = {
  DAILY: 1,
  WEEKLY: 7,
  MONTHLY: 30,
  QUARTERLY: 90,
};

export const DATE_FORMATS = {
  DISPLAY: 'YYYY-MM-DD',
  ISO: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
  US: 'MM/DD/YYYY',
  EU: 'DD/MM/YYYY',
};

export const TIME_FORMATS = {
  SHORT: 'HH:mm',
  LONG: 'HH:mm:ss',
  WITH_PERIOD: 'hh:mm A',
};

export const SORT_OPTIONS = {
  TRENDING: 'trending',
  NEWEST: 'newest',
  PRICE_LOW: 'price_low',
  PRICE_HIGH: 'price_high',
  RATING: 'rating',
  POPULAR: 'popular',
};

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 50,
  MAX_PAGE_SIZE: 100,
  DEFAULT_PAGE: 1,
};

export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 6,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 20,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
};

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  AUTH_REQUIRED: 'Authentication required. Please log in.',
  UNAUTHORIZED: 'You do not have permission to perform this action.',
  NOT_FOUND: 'Resource not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  RATE_LIMIT: 'Too many requests. Please wait before trying again.',
};

export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Successfully logged in.',
  LOGOUT_SUCCESS: 'Successfully logged out.',
  REGISTRATION_SUCCESS: 'Successfully registered.',
  RENTAL_CREATED: 'Rental created successfully.',
  RENTAL_CANCELLED: 'Rental cancelled successfully.',
  PROFILE_UPDATED: 'Profile updated successfully.',
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

export const API_RATE_LIMITS = {
  CENTRAL_API: '30 requests/minute',
  GENERAL_API: '1000 requests/hour',
};

export const DEFAULT_RETRY_CONFIG = {
  MAX_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // ms
  RETRY_ON_STATUS: [408, 429, 500, 502, 503, 504],
};

export const LOCAL_STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_PREFERENCES: 'user_preferences',
  CART: 'cart',
  FAVORITES: 'favorites',
};

export const FEATURE_FLAGS = {
  ANALYTICS_ENABLED: true,
  RECOMMENDATIONS_ENABLED: true,
  SURGE_PRICING_ENABLED: true,
  CHATBOT_ENABLED: true,
};

export default {
  PRODUCT_CATEGORIES,
  RENTAL_STATUS,
  PAYMENT_STATUS,
  USER_ROLES,
  SECURITY_SCORE_LEVELS,
  DISCOUNT_TIERS,
  RENTAL_PERIODS,
  DATE_FORMATS,
  TIME_FORMATS,
  SORT_OPTIONS,
  PAGINATION,
  VALIDATION,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  HTTP_STATUS,
  API_RATE_LIMITS,
  DEFAULT_RETRY_CONFIG,
  LOCAL_STORAGE_KEYS,
  FEATURE_FLAGS,
};

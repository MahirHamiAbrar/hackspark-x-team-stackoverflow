/**
 * Root Store Composable - useStore.js
 * 
 * Global state management using Vue 3 Composition API + Pinia pattern.
 * Uses baseHandle client for API calls.
 */

import { reactive, computed, ref } from 'vue';
import { baseHandle } from '../services/baseHandle.js';
import API_CONFIG from '../index.js';

// Global reactive state
const globalState = reactive({
  auth: {
    isAuthenticated: false,
    user: null,
    token: null,
  },
  products: {
    items: [],
    loading: false,
    error: null,
    total: 0,
    page: 1,
  },
  rentals: {
    items: [],
    loading: false,
    error: null,
    total: 0,
  },
  analytics: {
    trends: [],
    stats: {},
    recommendations: [],
    loading: false,
    error: null,
  },
  ui: {
    notifications: [],
    modal: null,
  },
});

/**
 * Authentication Module
 */
const useAuth = () => {
  const login = async (email, password) => {
    try {
      globalState.auth.loading = true;
      const response = await baseHandle.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
        email,
        password,
      });
      
      globalState.auth.token = response.token;
      globalState.auth.user = response.user;
      globalState.auth.isAuthenticated = true;
      baseHandle.setToken(response.token);
      
      return response;
    } catch (error) {
      globalState.auth.error = error.message;
      throw error;
    } finally {
      globalState.auth.loading = false;
    }
  };

  const register = async (userData) => {
    try {
      globalState.auth.loading = true;
      const response = await baseHandle.post(API_CONFIG.ENDPOINTS.AUTH.REGISTER, userData);
      return response;
    } catch (error) {
      globalState.auth.error = error.message;
      throw error;
    } finally {
      globalState.auth.loading = false;
    }
  };

  const logout = async () => {
    try {
      await baseHandle.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      globalState.auth.isAuthenticated = false;
      globalState.auth.user = null;
      globalState.auth.token = null;
      baseHandle.clearToken();
    }
  };

  const getProfile = async () => {
    try {
      const response = await baseHandle.get(API_CONFIG.ENDPOINTS.AUTH.PROFILE);
      globalState.auth.user = response;
      return response;
    } catch (error) {
      globalState.auth.error = error.message;
      throw error;
    }
  };

  return {
    login,
    register,
    logout,
    getProfile,
  };
};

/**
 * Products Module
 */
const useProducts = () => {
  const fetchProducts = async (params = {}) => {
    try {
      globalState.products.loading = true;
      globalState.products.error = null;
      
      const response = await baseHandle.get(API_CONFIG.ENDPOINTS.PRODUCTS.LIST, {
        page: params.page || 1,
        limit: params.limit || 50,
        category: params.category || '',
        search: params.search || '',
        ...params,
      });

      globalState.products.items = response.data || [];
      globalState.products.total = response.total || 0;
      globalState.products.page = response.page || 1;
      
      return response;
    } catch (error) {
      globalState.products.error = error.message;
      throw error;
    } finally {
      globalState.products.loading = false;
    }
  };

  const getProduct = async (id) => {
    try {
      const response = await baseHandle.get(`${API_CONFIG.ENDPOINTS.PRODUCTS.GET.replace(':id', id)}`);
      return response;
    } catch (error) {
      globalState.products.error = error.message;
      throw error;
    }
  };

  const searchProducts = async (query, filters = {}) => {
    try {
      globalState.products.loading = true;
      const response = await baseHandle.get(API_CONFIG.ENDPOINTS.PRODUCTS.SEARCH, {
        q: query,
        ...filters,
      });
      globalState.products.items = response.data || [];
      return response;
    } catch (error) {
      globalState.products.error = error.message;
      throw error;
    } finally {
      globalState.products.loading = false;
    }
  };

  const getCategories = async () => {
    try {
      const response = await baseHandle.get(API_CONFIG.ENDPOINTS.PRODUCTS.CATEGORIES);
      return response.categories || [];
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      throw error;
    }
  };

  return {
    fetchProducts,
    getProduct,
    searchProducts,
    getCategories,
  };
};

/**
 * Rentals Module
 */
const useRentals = () => {
  const fetchRentals = async (params = {}) => {
    try {
      globalState.rentals.loading = true;
      globalState.rentals.error = null;

      const response = await baseHandle.get(API_CONFIG.ENDPOINTS.RENTALS.LIST, {
        page: params.page || 1,
        limit: params.limit || 50,
        ...params,
      });

      globalState.rentals.items = response.data || [];
      globalState.rentals.total = response.total || 0;
      
      return response;
    } catch (error) {
      globalState.rentals.error = error.message;
      throw error;
    } finally {
      globalState.rentals.loading = false;
    }
  };

  const getRental = async (id) => {
    try {
      const response = await baseHandle.get(`${API_CONFIG.ENDPOINTS.RENTALS.GET.replace(':id', id)}`);
      return response;
    } catch (error) {
      globalState.rentals.error = error.message;
      throw error;
    }
  };

  const createRental = async (rentalData) => {
    try {
      globalState.rentals.loading = true;
      const response = await baseHandle.post(API_CONFIG.ENDPOINTS.RENTALS.CREATE, rentalData);
      globalState.rentals.items.unshift(response);
      return response;
    } catch (error) {
      globalState.rentals.error = error.message;
      throw error;
    } finally {
      globalState.rentals.loading = false;
    }
  };

  const cancelRental = async (id) => {
    try {
      const response = await baseHandle.post(`${API_CONFIG.ENDPOINTS.RENTALS.CANCEL.replace(':id', id)}`);
      globalState.rentals.items = globalState.rentals.items.filter(r => r.id !== id);
      return response;
    } catch (error) {
      globalState.rentals.error = error.message;
      throw error;
    }
  };

  return {
    fetchRentals,
    getRental,
    createRental,
    cancelRental,
  };
};

/**
 * Analytics Module
 */
const useAnalytics = () => {
  const fetchTrends = async (timeRange = 'month') => {
    try {
      globalState.analytics.loading = true;
      const response = await baseHandle.get(API_CONFIG.ENDPOINTS.ANALYTICS.TRENDS, {
        range: timeRange,
      });
      globalState.analytics.trends = response.data || [];
      return response;
    } catch (error) {
      globalState.analytics.error = error.message;
      throw error;
    } finally {
      globalState.analytics.loading = false;
    }
  };

  const fetchStats = async () => {
    try {
      const response = await baseHandle.get(API_CONFIG.ENDPOINTS.ANALYTICS.STATS);
      globalState.analytics.stats = response;
      return response;
    } catch (error) {
      globalState.analytics.error = error.message;
      throw error;
    }
  };

  const fetchRecommendations = async () => {
    try {
      const response = await baseHandle.get(API_CONFIG.ENDPOINTS.ANALYTICS.RECOMMENDATIONS);
      globalState.analytics.recommendations = response.recommendations || [];
      return response;
    } catch (error) {
      globalState.analytics.error = error.message;
      throw error;
    }
  };

  return {
    fetchTrends,
    fetchStats,
    fetchRecommendations,
  };
};

/**
 * Main useStore composable - combines all modules
 */
export const useStore = () => {
  return {
    state: globalState,
    auth: useAuth(),
    products: useProducts(),
    rentals: useRentals(),
    analytics: useAnalytics(),
  };
};

export default useStore;

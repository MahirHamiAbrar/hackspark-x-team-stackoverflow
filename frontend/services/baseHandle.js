/**
 * Base HTTP Client - baseHandle.js
 * 
 * Handles all HTTP requests to the backend.
 * Features: interceptors, auth tokens, error handling, retry logic, logging.
 */

import API_CONFIG from '../index.js';

class BaseHandle {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUTS.MEDIUM;
    this.retryCount = 0;
    this.token = this.getToken();
  }

  /**
   * Get stored authentication token
   */
  getToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(API_CONFIG.TOKEN_STORAGE_KEY);
    }
    return null;
  }

  /**
   * Set authentication token
   */
  setToken(token) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem(API_CONFIG.TOKEN_STORAGE_KEY, token);
    }
  }

  /**
   * Clear authentication token
   */
  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem(API_CONFIG.TOKEN_STORAGE_KEY);
    }
  }

  /**
   * Build request headers with auth token
   */
  buildHeaders(customHeaders = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  /**
   * Request interceptor - preprocess request
   */
  async requestInterceptor(config) {
    console.log(`[BaseHandle] REQUEST: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  }

  /**
   * Response interceptor - process response
   */
  async responseInterceptor(response) {
    console.log(`[BaseHandle] RESPONSE: Successfully received data`);
    return response;
  }

  /**
   * Error interceptor - handle errors
   */
  async errorInterceptor(error) {
    console.error('[BaseHandle] ERROR:', error.message);

    // Handle 401 Unauthorized - Token expired
    if (error.status === 401) {
      console.warn('[BaseHandle] Token expired, clearing auth');
      this.clearToken();
      // Could trigger refresh token logic here
    }

    // Handle 429 Too Many Requests
    if (error.status === 429) {
      console.warn('[BaseHandle] Rate limited');
    }

    throw error;
  }

  /**
   * Retry logic with exponential backoff
   */
  async retryRequest(config, attempt = 1) {
    try {
      return await this.makeRequest(config);
    } catch (error) {
      if (attempt < API_CONFIG.RETRY.MAX_ATTEMPTS && error.status >= 500) {
        const delay = API_CONFIG.RETRY.DELAY * Math.pow(2, attempt - 1);
        console.log(`[BaseHandle] Retrying in ${delay}ms... (Attempt ${attempt}/${API_CONFIG.RETRY.MAX_ATTEMPTS})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.retryRequest(config, attempt + 1);
      }
      throw error;
    }
  }

  /**
   * Make actual HTTP request
   */
  async makeRequest(config) {
    let url = config.url.startsWith('http') ? config.url : `${this.baseURL}${config.url}`;
    
    const fetchConfig = {
      method: config.method || 'GET',
      headers: this.buildHeaders(config.headers),
      timeout: config.timeout || this.timeout,
    };

    if (config.data) {
      fetchConfig.body = JSON.stringify(config.data);
    }

    if (config.params) {
      const queryString = new URLSearchParams(config.params).toString();
      url = `${url}?${queryString}`;
    }

    try {
      const response = await fetch(url, fetchConfig);

      // Handle non-2xx responses
      if (!response.ok) {
        const error = new Error(`HTTP Error: ${response.status}`);
        error.status = response.status;
        error.response = await response.json().catch(() => ({}));
        throw error;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      await this.errorInterceptor(error);
      throw error;
    }
  }

  /**
   * Generic request method
   */
  async request(config) {
    try {
      await this.requestInterceptor(config);
      const response = await this.retryRequest(config);
      return await this.responseInterceptor(response);
    } catch (error) {
      throw error;
    }
  }

  /**
   * GET request
   */
  get(url, params = {}, config = {}) {
    return this.request({
      method: 'GET',
      url,
      params,
      ...config,
    });
  }

  /**
   * POST request
   */
  post(url, data = {}, config = {}) {
    return this.request({
      method: 'POST',
      url,
      data,
      ...config,
    });
  }

  /**
   * PUT request
   */
  put(url, data = {}, config = {}) {
    return this.request({
      method: 'PUT',
      url,
      data,
      ...config,
    });
  }

  /**
   * PATCH request
   */
  patch(url, data = {}, config = {}) {
    return this.request({
      method: 'PATCH',
      url,
      data,
      ...config,
    });
  }

  /**
   * DELETE request
   */
  delete(url, config = {}) {
    return this.request({
      method: 'DELETE',
      url,
      ...config,
    });
  }
}

// Create singleton instance
export const baseHandle = new BaseHandle();

export default BaseHandle;

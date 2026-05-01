/**
 * User Controller
 * 
 * Handles user authentication and profile management.
 */

import { useStore } from '../store/useStore.js';
import API_CONFIG from '../index.js';

export class UserController {
  constructor() {
    this.store = useStore();
  }

  /**
   * User login
   */
  async login(email, password) {
    try {
      const result = await this.store.auth.login(email, password);
      console.log('[UserController] User logged in:', email);
      return result;
    } catch (error) {
      console.error('[UserController] Login failed:', error);
      throw error;
    }
  }

  /**
   * User registration
   */
  async register(userData) {
    try {
      this.validateRegistrationData(userData);
      const result = await this.store.auth.register(userData);
      console.log('[UserController] User registered:', userData.email);
      return result;
    } catch (error) {
      console.error('[UserController] Registration failed:', error);
      throw error;
    }
  }

  /**
   * User logout
   */
  async logout() {
    try {
      await this.store.auth.logout();
      console.log('[UserController] User logged out');
    } catch (error) {
      console.error('[UserController] Logout failed:', error);
      throw error;
    }
  }

  /**
   * Get user profile
   */
  async getProfile() {
    try {
      const profile = await this.store.auth.getProfile();
      console.log('[UserController] Profile fetched:', profile.id);
      return profile;
    } catch (error) {
      console.error('[UserController] Failed to fetch profile:', error);
      throw error;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return this.store.state.auth.isAuthenticated;
  }

  /**
   * Get current user
   */
  getCurrentUser() {
    return this.store.state.auth.user;
  }

  /**
   * Get auth token
   */
  getToken() {
    return this.store.state.auth.token;
  }

  /**
   * Set token (for restoration from storage)
   */
  setToken(token) {
    this.store.state.auth.token = token;
    const { baseHandle } = require('../services/baseHandle.js');
    baseHandle.setToken(token);
  }

  /**
   * Validate registration data
   */
  validateRegistrationData(data) {
    if (!data.email) throw new Error('Email is required');
    if (!data.password) throw new Error('Password is required');
    if (!data.name) throw new Error('Name is required');

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new Error('Invalid email format');
    }

    // Password strength check
    if (data.password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    return true;
  }

  /**
   * Get auth state
   */
  getAuthState() {
    return this.store.state.auth;
  }

  /**
   * Get loading state
   */
  isLoading() {
    return this.store.state.auth.loading;
  }

  /**
   * Get error message
   */
  getError() {
    return this.store.state.auth.error;
  }

  /**
   * Clear error
   */
  clearError() {
    this.store.state.auth.error = null;
  }
}

// Export singleton instance
export const userController = new UserController();
export default UserController;

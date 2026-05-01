/**
 * Product Controller
 * 
 * Handles all product-related business logic and API calls.
 * Bridges between UI components and the store/baseHandle client.
 */

import { useStore } from '../store/useStore.js';
import API_CONFIG from '../index.js';

export class ProductController {
  constructor() {
    this.store = useStore();
  }

  /**
   * Fetch all products with pagination
   */
  async getAllProducts(page = 1, limit = 50, filters = {}) {
    try {
      await this.store.products.fetchProducts({
        page,
        limit,
        category: filters.category,
        search: filters.search,
        sortBy: filters.sortBy,
        ...filters,
      });
      return this.store.state.products;
    } catch (error) {
      console.error('[ProductController] Failed to fetch products:', error);
      throw error;
    }
  }

  /**
   * Get single product by ID
   */
  async getProductById(productId) {
    try {
      const product = await this.store.products.getProduct(productId);
      return product;
    } catch (error) {
      console.error(`[ProductController] Failed to fetch product ${productId}:`, error);
      throw error;
    }
  }

  /**
   * Search products
   */
  async searchProducts(query, filters = {}) {
    try {
      const results = await this.store.products.searchProducts(query, filters);
      return results;
    } catch (error) {
      console.error('[ProductController] Search failed:', error);
      throw error;
    }
  }

  /**
   * Get all product categories
   */
  async getCategories() {
    try {
      const categories = await this.store.products.getCategories();
      return categories;
    } catch (error) {
      console.error('[ProductController] Failed to fetch categories:', error);
      throw error;
    }
  }

  /**
   * Filter products by category
   */
  async filterByCategory(category, page = 1) {
    try {
      return await this.getAllProducts(page, 50, { category });
    } catch (error) {
      console.error(`[ProductController] Failed to filter by category ${category}:`, error);
      throw error;
    }
  }

  /**
   * Get trending products
   */
  async getTrendingProducts() {
    try {
      return await this.getAllProducts(1, 10, { sortBy: 'trending' });
    } catch (error) {
      console.error('[ProductController] Failed to fetch trending products:', error);
      throw error;
    }
  }

  /**
   * Get new products
   */
  async getNewProducts() {
    try {
      return await this.getAllProducts(1, 10, { sortBy: 'newest' });
    } catch (error) {
      console.error('[ProductController] Failed to fetch new products:', error);
      throw error;
    }
  }

  /**
   * Get state
   */
  getState() {
    return this.store.state.products;
  }

  /**
   * Get loading state
   */
  isLoading() {
    return this.store.state.products.loading;
  }

  /**
   * Get error message
   */
  getError() {
    return this.store.state.products.error;
  }

  /**
   * Clear error
   */
  clearError() {
    this.store.state.products.error = null;
  }
}

// Export singleton instance
export const productController = new ProductController();
export default ProductController;

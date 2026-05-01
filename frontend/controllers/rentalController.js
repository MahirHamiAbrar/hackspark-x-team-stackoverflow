/**
 * Rental Controller
 * 
 * Handles all rental-related business logic and API calls.
 */

import { useStore } from '../store/useStore.js';
import API_CONFIG from '../index.js';

export class RentalController {
  constructor() {
    this.store = useStore();
  }

  /**
   * Fetch all rentals with pagination
   */
  async getAllRentals(page = 1, limit = 50, filters = {}) {
    try {
      await this.store.rentals.fetchRentals({
        page,
        limit,
        productId: filters.productId,
        renterId: filters.renterId,
        status: filters.status,
        ...filters,
      });
      return this.store.state.rentals;
    } catch (error) {
      console.error('[RentalController] Failed to fetch rentals:', error);
      throw error;
    }
  }

  /**
   * Get single rental by ID
   */
  async getRentalById(rentalId) {
    try {
      const rental = await this.store.rentals.getRental(rentalId);
      return rental;
    } catch (error) {
      console.error(`[RentalController] Failed to fetch rental ${rentalId}:`, error);
      throw error;
    }
  }

  /**
   * Create new rental
   */
  async createRental(rentalData) {
    try {
      // Validate rental data
      this.validateRentalData(rentalData);

      const rental = await this.store.rentals.createRental({
        productId: rentalData.productId,
        rentalStart: rentalData.startDate,
        rentalEnd: rentalData.endDate,
        notes: rentalData.notes,
        ...rentalData,
      });

      return rental;
    } catch (error) {
      console.error('[RentalController] Failed to create rental:', error);
      throw error;
    }
  }

  /**
   * Cancel a rental
   */
  async cancelRental(rentalId, reason = '') {
    try {
      const result = await this.store.rentals.cancelRental(rentalId);
      console.log(`[RentalController] Rental ${rentalId} cancelled`);
      return result;
    } catch (error) {
      console.error(`[RentalController] Failed to cancel rental ${rentalId}:`, error);
      throw error;
    }
  }

  /**
   * Get user rental history
   */
  async getUserRentalHistory(userId = null) {
    try {
      const rentals = await this.store.rentals.fetchRentals({
        renterId: userId,
        limit: 100,
      });
      return rentals.items;
    } catch (error) {
      console.error('[RentalController] Failed to fetch rental history:', error);
      throw error;
    }
  }

  /**
   * Get active rentals
   */
  async getActiveRentals() {
    try {
      return await this.getAllRentals(1, 50, { status: 'active' });
    } catch (error) {
      console.error('[RentalController] Failed to fetch active rentals:', error);
      throw error;
    }
  }

  /**
   * Get completed rentals
   */
  async getCompletedRentals() {
    try {
      return await this.getAllRentals(1, 50, { status: 'completed' });
    } catch (error) {
      console.error('[RentalController] Failed to fetch completed rentals:', error);
      throw error;
    }
  }

  /**
   * Calculate rental cost
   */
  calculateRentalCost(pricePerDay, startDate, endDate, discountPercent = 0) {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      
      if (days <= 0) {
        throw new Error('End date must be after start date');
      }

      const baseAmount = pricePerDay * days;
      const discount = (baseAmount * discountPercent) / 100;
      const total = baseAmount - discount;

      return {
        days,
        pricePerDay,
        baseAmount,
        discountPercent,
        discount,
        total,
      };
    } catch (error) {
      console.error('[RentalController] Failed to calculate rental cost:', error);
      throw error;
    }
  }

  /**
   * Validate rental data
   */
  validateRentalData(data) {
    if (!data.productId) throw new Error('Product ID is required');
    if (!data.startDate) throw new Error('Start date is required');
    if (!data.endDate) throw new Error('End date is required');

    const start = new Date(data.startDate);
    const end = new Date(data.endDate);

    if (end <= start) {
      throw new Error('End date must be after start date');
    }

    return true;
  }

  /**
   * Get state
   */
  getState() {
    return this.store.state.rentals;
  }

  /**
   * Get loading state
   */
  isLoading() {
    return this.store.state.rentals.loading;
  }

  /**
   * Get error message
   */
  getError() {
    return this.store.state.rentals.error;
  }

  /**
   * Clear error
   */
  clearError() {
    this.store.state.rentals.error = null;
  }
}

// Export singleton instance
export const rentalController = new RentalController();
export default RentalController;

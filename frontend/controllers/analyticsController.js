/**
 * Analytics Controller
 * 
 * Handles all analytics and data insights.
 */

import { useStore } from '../store/useStore.js';
import API_CONFIG from '../index.js';

export class AnalyticsController {
  constructor() {
    this.store = useStore();
  }

  /**
   * Fetch trending products
   */
  async getTrends(timeRange = 'month') {
    try {
      const trends = await this.store.analytics.fetchTrends(timeRange);
      console.log('[AnalyticsController] Trends fetched for:', timeRange);
      return trends;
    } catch (error) {
      console.error('[AnalyticsController] Failed to fetch trends:', error);
      throw error;
    }
  }

  /**
   * Fetch analytics statistics
   */
  async getStats() {
    try {
      const stats = await this.store.analytics.fetchStats();
      console.log('[AnalyticsController] Stats fetched');
      return stats;
    } catch (error) {
      console.error('[AnalyticsController] Failed to fetch stats:', error);
      throw error;
    }
  }

  /**
   * Fetch product recommendations
   */
  async getRecommendations() {
    try {
      const recommendations = await this.store.analytics.fetchRecommendations();
      console.log('[AnalyticsController] Recommendations fetched');
      return recommendations;
    } catch (error) {
      console.error('[AnalyticsController] Failed to fetch recommendations:', error);
      throw error;
    }
  }

  /**
   * Get category statistics
   */
  async getCategoryStats() {
    try {
      const stats = await this.getStats();
      return stats.byCategory || [];
    } catch (error) {
      console.error('[AnalyticsController] Failed to fetch category stats:', error);
      throw error;
    }
  }

  /**
   * Get pricing insights
   */
  async getPricingInsights() {
    try {
      const stats = await this.getStats();
      return stats.pricing || {};
    } catch (error) {
      console.error('[AnalyticsController] Failed to fetch pricing insights:', error);
      throw error;
    }
  }

  /**
   * Get user activity stats
   */
  async getUserActivityStats() {
    try {
      const stats = await this.getStats();
      return stats.userActivity || {};
    } catch (error) {
      console.error('[AnalyticsController] Failed to fetch user activity stats:', error);
      throw error;
    }
  }

  /**
   * Get security score metrics
   */
  async getSecurityScoreMetrics() {
    try {
      const stats = await this.getStats();
      return stats.securityScore || {};
    } catch (error) {
      console.error('[AnalyticsController] Failed to fetch security score metrics:', error);
      throw error;
    }
  }

  /**
   * Get surge pricing information
   */
  async getSurgePricingInfo() {
    try {
      // This might be a separate API call depending on backend implementation
      const stats = await this.getStats();
      return stats.surgePricing || null;
    } catch (error) {
      console.error('[AnalyticsController] Failed to fetch surge pricing:', error);
      throw error;
    }
  }

  /**
   * Generate report data
   */
  generateReport(timeRange = 'month') {
    return {
      timeRange,
      generatedAt: new Date().toISOString(),
      trends: this.store.state.analytics.trends,
      stats: this.store.state.analytics.stats,
      recommendations: this.store.state.analytics.recommendations,
    };
  }

  /**
   * Get state
   */
  getState() {
    return this.store.state.analytics;
  }

  /**
   * Get loading state
   */
  isLoading() {
    return this.store.state.analytics.loading;
  }

  /**
   * Get error message
   */
  getError() {
    return this.store.state.analytics.error;
  }

  /**
   * Clear error
   */
  clearError() {
    this.store.state.analytics.error = null;
  }
}

// Export singleton instance
export const analyticsController = new AnalyticsController();
export default AnalyticsController;

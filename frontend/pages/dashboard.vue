<template>
  <div class="dashboard-container">
    <!-- Header -->
    <header class="dashboard-header">
      <div class="header-content">
        <h1>Dashboard</h1>
        <div class="header-actions">
          <NuxtLink to="/products" class="btn-primary">Browse Products</NuxtLink>
          <button @click="handleLogout" class="btn-secondary">Logout</button>
        </div>
      </div>
    </header>

    <div class="dashboard-content">
      <!-- Welcome Section -->
      <div v-if="user" class="welcome-section">
        <h2>Welcome back, {{ user.name }}! 👋</h2>
        <p class="subtitle">{{ getGreetingMessage() }}</p>
      </div>

      <div class="dashboard-grid">
        <!-- User Profile Card -->
        <section class="card profile-card">
          <div class="card-header">
            <h2>Profile</h2>
            <span class="badge" :class="{ 'badge-high': user?.securityScore >= 80, 'badge-mid': user?.securityScore >= 60, 'badge-low': user?.securityScore < 60 }">
              Score: {{ user?.securityScore || 0 }}
            </span>
          </div>
          <div v-if="user" class="user-details">
            <div class="detail-row">
              <span class="label">Name</span>
              <span class="value">{{ user.name }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Email</span>
              <span class="value">{{ user.email }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Security Score</span>
              <span class="value score-bar">
                <div class="score-fill" :style="{ width: user.securityScore + '%' }"></div>
                <span class="score-text">{{ user.securityScore }}%</span>
              </span>
            </div>
          </div>
          <div v-else class="no-data">
            <p>Loading profile...</p>
          </div>
        </section>

        <!-- Rentals Card -->
        <section class="card rentals-card">
          <div class="card-header">
            <h2>Active Rentals</h2>
            <span class="count-badge">{{ rentals.length }}</span>
          </div>
          <div v-if="isLoadingRentals" class="loading">
            <div class="spinner"></div>
            <p>Loading rentals...</p>
          </div>
          <div v-else-if="rentals.length === 0" class="no-data">
            <p>No active rentals yet</p>
            <NuxtLink to="/products" class="link-btn">Browse and rent products →</NuxtLink>
          </div>
          <div v-else class="rentals-list">
            <div v-for="rental in rentals.slice(0, 3)" :key="rental.id" class="rental-item">
              <div class="rental-header">
                <h4>Product #{{ rental.productId }}</h4>
                <span class="badge badge-active">Active</span>
              </div>
              <p class="rental-date">From: {{ formatDate(rental.rentalStart) }}</p>
              <p class="rental-date">To: {{ formatDate(rental.rentalEnd) }}</p>
            </div>
            <NuxtLink v-if="rentals.length > 3" to="/rental-history" class="view-all-link">View all rentals →</NuxtLink>
          </div>
        </section>

        <!-- Quick Stats Card -->
        <section class="card stats-card">
          <h2>Quick Stats</h2>
          <div class="stats">
            <div class="stat">
              <span class="stat-value">{{ totalRentals }}</span>
              <span class="stat-label">Total Rentals</span>
            </div>
            <div class="stat">
              <span class="stat-value">${{ totalSpent }}</span>
              <span class="stat-label">Total Spent</span>
            </div>
          </div>
        </section>

        <!-- Recommendations Card -->
        <section class="card recommendations-card">
          <h2>Trending Now</h2>
          <div v-if="isLoadingRecommendations" class="loading">
            <div class="spinner"></div>
            <p>Loading recommendations...</p>
          </div>
          <div v-else-if="recommendations.length === 0" class="no-data">
            <p>No recommendations available</p>
          </div>
          <div v-else class="recommendations-list">
            <div v-for="item in recommendations.slice(0, 3)" :key="item.id" class="recommendation-item">
              <div class="rec-icon">📦</div>
              <div class="rec-content">
                <h4>{{ item.name }}</h4>
                <p class="rec-category">{{ item.category }}</p>
                <p class="price">${{ item.pricePerDay }}/day</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Quick Links -->
        <section class="card quick-links-card">
          <h2>Quick Links</h2>
          <div class="quick-links">
            <NuxtLink to="/products" class="quick-link">
              <span class="icon">🛍️</span>
              <span>Browse Products</span>
            </NuxtLink>
            <NuxtLink to="/availability" class="quick-link">
              <span class="icon">📅</span>
              <span>Check Availability</span>
            </NuxtLink>
            <NuxtLink to="/chat" class="quick-link">
              <span class="icon">💬</span>
              <span>Chat Support</span>
            </NuxtLink>
          </div>
        </section>
      </div>
    </div>

    <footer class="footer">
      <p>&copy; 2026 RentPi. All rights reserved.</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { userController } from '@/controllers/userController.js';
import { rentalController } from '@/controllers/rentalController.js';
import { analyticsController } from '@/controllers/analyticsController.js';
import { formatDate } from '@/utils/formatters.js';

// Use auth middleware to protect this page
definePageMeta({
  middleware: 'auth',
});

const user = ref(null);
const rentals = ref([]);
const recommendations = ref([]);
const isLoadingRentals = ref(false);
const isLoadingRecommendations = ref(false);

const totalRentals = computed(() => rentals.value.length);
const totalSpent = computed(() => {
  return rentals.value.reduce((sum, rental) => sum + (rental.totalCost || 0), 0).toFixed(2);
});

const getGreetingMessage = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning! Time to explore our latest rentals.';
  if (hour < 18) return 'Good afternoon! Check out what\'s trending today.';
  return 'Good evening! Discover something new to rent.';
};

const handleLogout = async () => {
  try {
    await userController.logout();
    await navigateTo('/auth/login');
  } catch (error) {
    console.error('Logout failed:', error);
  }
};

onMounted(async () => {
  // Load user profile
  try {
    user.value = userController.getCurrentUser();
    if (!user.value) {
      await userController.getProfile();
      user.value = userController.getCurrentUser();
    }
  } catch (error) {
    console.error('Failed to load profile:', error);
    user.value = null;
  }

  // Load rentals
  try {
    isLoadingRentals.value = true;
    const rentalState = await rentalController.getActiveRentals();
    rentals.value = rentalState.items || [];
  } catch (error) {
    console.error('Failed to load rentals:', error);
    rentals.value = [];
  } finally {
    isLoadingRentals.value = false;
  }

  // Load recommendations
  try {
    isLoadingRecommendations.value = true;
    const recs = await analyticsController.getRecommendations();
    recommendations.value = recs.recommendations || [];
  } catch (error) {
    console.error('Failed to load recommendations:', error);
    recommendations.value = [];
  } finally {
    isLoadingRecommendations.value = false;
  }
});
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, rgba(0, 20, 40, 0.8) 0%, rgba(0, 10, 30, 0.9) 100%);
}

.dashboard-header {
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--glass-border);
  padding: 20px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.header-content h1 {
  color: var(--text-main);
  margin: 0;
  font-size: 28px;
  font-weight: 800;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.btn-primary {
  padding: 10px 20px;
  background: linear-gradient(135deg, var(--neon-cyan), var(--neon-purple));
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  text-decoration: none;
  display: inline-block;
  transition: all var(--transition-normal);
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 25px rgba(0, 255, 255, 0.5);
}

.btn-secondary {
  padding: 10px 20px;
  background: transparent;
  color: var(--text-main);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all var(--transition-normal);
}

.btn-secondary:hover {
  border-color: var(--neon-cyan);
  color: var(--neon-cyan);
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.2);
}

.dashboard-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  width: 100%;
  flex: 1;
}

.welcome-section {
  margin-bottom: 40px;
  animation: fadeInDown 0.6s ease-out;
}

.welcome-section h2 {
  color: var(--text-main);
  margin: 0 0 8px 0;
  font-size: 32px;
  font-weight: 800;
}

.welcome-section .subtitle {
  color: var(--text-dim);
  margin: 0;
  font-size: 16px;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
}

.card {
  background: rgba(20, 30, 50, 0.6);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  padding: 28px;
  border-radius: 16px;
  border: 1px solid var(--glass-border);
  transition: all var(--transition-normal);
  animation: fadeIn 0.6s ease-out;
}

.card:hover {
  transform: translateY(-4px);
  border-color: rgba(0, 255, 255, 0.4);
  box-shadow: 0 15px 40px rgba(0, 255, 255, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid var(--glass-border);
  padding-bottom: 16px;
}

.card h2 {
  margin: 0;
  color: var(--text-main);
  font-weight: 700;
  font-size: 20px;
}

.badge {
  display: inline-block;
  padding: 4px 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-dim);
  text-transform: uppercase;
}

.badge-high {
  color: #00ff00;
  border-color: #00ff00;
  background: rgba(0, 255, 0, 0.1);
}

.badge-mid {
  color: var(--neon-cyan);
  border-color: var(--neon-cyan);
  background: rgba(0, 255, 255, 0.1);
}

.badge-low {
  color: #ff6b6b;
  border-color: #ff6b6b;
  background: rgba(255, 107, 107, 0.1);
}

.badge-active {
  color: var(--neon-cyan);
  border-color: var(--neon-cyan);
  background: rgba(0, 255, 255, 0.15);
}

.count-badge {
  display: inline-block;
  background: rgba(0, 255, 255, 0.2);
  color: var(--neon-cyan);
  border: 1px solid var(--neon-cyan);
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: 700;
  font-size: 14px;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
  border: 1px solid var(--glass-border);
}

.detail-row .label {
  color: var(--text-dim);
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
}

.detail-row .value {
  color: var(--text-main);
  font-weight: 600;
}

.score-bar {
  position: relative;
  display: inline-block;
  width: 100%;
  height: 24px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--glass-border);
}

.score-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(90deg, var(--neon-cyan), var(--neon-purple));
  transition: width 0.5s ease;
}

.score-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: var(--text-main);
  font-weight: 700;
  font-size: 12px;
}

.no-data {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-dim);
}

.link-btn {
  display: inline-block;
  margin-top: 16px;
  color: var(--neon-cyan);
  text-decoration: none;
  font-weight: 600;
  transition: all var(--transition-fast);
}

.link-btn:hover {
  text-shadow: 0 0 8px var(--neon-cyan);
}

.rentals-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rental-item {
  padding: 16px;
  background: rgba(0, 255, 255, 0.05);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 12px;
  transition: all var(--transition-fast);
}

.rental-item:hover {
  border-color: var(--neon-cyan);
  background: rgba(0, 255, 255, 0.1);
  transform: translateX(4px);
}

.rental-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.rental-item h4 {
  margin: 0;
  color: var(--text-main);
  font-size: 15px;
  font-weight: 600;
}

.rental-date {
  margin: 4px 0;
  color: var(--text-dim);
  font-size: 13px;
}

.view-all-link {
  display: inline-block;
  margin-top: 12px;
  color: var(--neon-cyan);
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
}

.stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.stat {
  padding: 20px;
  background: rgba(0, 255, 255, 0.05);
  border: 1px solid rgba(0, 255, 255, 0.15);
  border-radius: 12px;
  text-align: center;
  transition: all var(--transition-fast);
}

.stat:hover {
  border-color: var(--neon-cyan);
  background: rgba(0, 255, 255, 0.1);
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.15);
}

.stat-value {
  font-size: 28px;
  font-weight: 800;
  color: var(--neon-cyan);
  margin-bottom: 8px;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.3);
}

.stat-label {
  font-size: 12px;
  color: var(--text-dim);
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.1em;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: var(--text-dim);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(0, 255, 255, 0.2);
  border-top-color: var(--neon-cyan);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.recommendations-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.recommendation-item {
  padding: 16px;
  background: rgba(0, 255, 255, 0.05);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  gap: 12px;
  align-items: flex-start;
  transition: all var(--transition-fast);
}

.recommendation-item:hover {
  border-color: var(--neon-cyan);
  background: rgba(0, 255, 255, 0.1);
  transform: translateX(4px);
}

.rec-icon {
  font-size: 24px;
  min-width: 32px;
  text-align: center;
}

.rec-content {
  flex: 1;
}

.rec-content h4 {
  margin: 0 0 4px 0;
  color: var(--text-main);
  font-size: 15px;
  font-weight: 600;
}

.rec-category {
  margin: 0 0 4px 0;
  color: var(--text-dim);
  font-size: 12px;
  text-transform: uppercase;
}

.price {
  margin: 0;
  color: var(--neon-cyan);
  font-weight: 700;
  font-size: 14px;
}

.quick-links {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.quick-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: rgba(0, 255, 255, 0.05);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 12px;
  color: var(--text-main);
  text-decoration: none;
  font-weight: 600;
  transition: all var(--transition-fast);
}

.quick-link:hover {
  border-color: var(--neon-cyan);
  background: rgba(0, 255, 255, 0.1);
  transform: translateX(4px);
}

.quick-link .icon {
  font-size: 20px;
  min-width: 24px;
  text-align: center;
}

.footer {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  border-top: 1px solid var(--glass-border);
  color: var(--text-dim);
  text-align: center;
  padding: 32px;
  margin-top: auto;
}

.footer p {
  margin: 0;
  font-size: 14px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
  }

  .btn-primary, .btn-secondary {
    flex: 1;
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  .stats {
    grid-template-columns: 1fr;
  }

  .welcome-section h2 {
    font-size: 24px;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .badge, .count-badge {
    margin-top: 8px;
  }
}
</style>

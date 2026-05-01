<template>
  <div class="dashboard-container">
    <div class="dashboard-content">
      <h1>Dashboard</h1>

      <div class="dashboard-grid">
        <!-- User Profile Card -->
        <section class="card profile-card">
          <h2>Profile</h2>
          <div v-if="user" class="user-details">
            <p><strong>Name:</strong> {{ user.name }}</p>
            <p><strong>Email:</strong> {{ user.email }}</p>
            <p v-if="user.securityScore"><strong>Security Score:</strong> {{ user.securityScore }}</p>
          </div>
        </section>

        <!-- Rentals Card -->
        <section class="card rentals-card">
          <h2>Active Rentals</h2>
          <div v-if="isLoadingRentals" class="loading">
            <p>Loading rentals...</p>
          </div>
          <div v-else-if="rentals.length === 0" class="no-data">
            <p>No active rentals. <NuxtLink to="/products">Rent something!</NuxtLink></p>
          </div>
          <div v-else class="rentals-list">
            <div v-for="rental in rentals" :key="rental.id" class="rental-item">
              <h4>Product #{{ rental.productId }}</h4>
              <p>From: {{ formatDate(rental.rentalStart) }}</p>
              <p>To: {{ formatDate(rental.rentalEnd) }}</p>
            </div>
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
              <span class="stat-value">{{ totalSpent }}</span>
              <span class="stat-label">Total Spent</span>
            </div>
          </div>
        </section>

        <!-- Recommendations Card -->
        <section class="card recommendations-card">
          <h2>Recommended For You</h2>
          <div v-if="isLoadingRecommendations" class="loading">
            <p>Loading recommendations...</p>
          </div>
          <div v-else-if="recommendations.length === 0" class="no-data">
            <p>No recommendations available</p>
          </div>
          <div v-else class="recommendations-list">
            <div v-for="item in recommendations.slice(0, 3)" :key="item.id" class="recommendation-item">
              <p>📦 {{ item.name }}</p>
              <p class="price">${{ item.pricePerDay }}/day</p>
            </div>
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
import { useRouter } from 'vue-router';
import { userController } from '@/controllers/userController.js';
import { rentalController } from '@/controllers/rentalController.js';
import { analyticsController } from '@/controllers/analyticsController.js';
import { formatDate } from '@/utils/formatters.js';

const router = useRouter();
const user = ref(null);
const rentals = ref([]);
const recommendations = ref([]);
const isLoadingRentals = ref(false);
const isLoadingRecommendations = ref(false);

const totalRentals = computed(() => rentals.value.length);
const totalSpent = computed(() => {
  return rentals.value.reduce((sum, rental) => sum + (rental.totalCost || 0), 0).toFixed(2);
});

onMounted(async () => {
  // Load user profile
  try {
    user.value = userController.getCurrentUser() || { name: 'Guest User', email: 'guest@rentpi.com' };
  } catch (error) {
    console.error('Failed to load profile:', error);
    user.value = { name: 'Guest User', email: 'guest@rentpi.com' };
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
}

.dashboard-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 60px 20px;
  width: 100%;
  flex: 1;
}

.dashboard-content h1 {
  color: var(--text-main);
  margin-bottom: 40px;
  font-size: 36px;
  font-weight: 800;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  gap: 32px;
}

.card {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  padding: 32px;
  border-radius: 24px;
  border: 1px solid var(--glass-border);
  transition: all var(--transition-normal);
}

.card:hover {
  transform: translateY(-8px);
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 20px 40px -20px rgba(0,0,0,0.5);
}

.card h2 {
  margin-top: 0;
  color: var(--text-main);
  border-bottom: 1px solid var(--glass-border);
  padding-bottom: 20px;
  margin-bottom: 24px;
  font-weight: 700;
  font-size: 20px;
}

.user-details p {
  margin: 12px 0;
  color: var(--text-dim);
  font-size: 15px;
}

.user-details strong {
  color: var(--text-main);
  margin-right: 8px;
}

.no-data {
  color: var(--text-dim);
  text-align: center;
  padding: 40px 20px;
}

.no-data a {
  color: var(--neon-cyan);
  text-decoration: none;
  font-weight: 600;
  transition: text-shadow var(--transition-fast);
}

.no-data a:hover {
  text-shadow: 0 0 8px var(--neon-cyan-glow);
}

.rentals-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.rental-item {
  padding: 20px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  border-left: 4px solid var(--neon-cyan);
  transition: all var(--transition-fast);
}

.rental-item:hover {
  background: rgba(255, 255, 255, 0.05);
  transform: translateX(5px);
}

.rental-item h4 {
  margin: 0 0 8px 0;
  color: var(--text-main);
  font-size: 16px;
}

.rental-item p {
  margin: 4px 0;
  color: var(--text-dim);
  font-size: 14px;
}

.stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  transition: all var(--transition-fast);
}

.stat:hover {
  border-color: var(--neon-cyan);
  box-shadow: 0 0 15px var(--neon-cyan-glow);
}

.stat-value {
  font-size: 32px;
  font-weight: 800;
  color: var(--neon-cyan);
  margin-bottom: 8px;
  text-shadow: 0 0 10px var(--neon-cyan-glow);
}

.stat-label {
  font-size: 12px;
  color: var(--text-dim);
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.1em;
}

.loading {
  text-align: center;
  padding: 40px;
  color: var(--text-dim);
}

.recommendations-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.recommendation-item {
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all var(--transition-fast);
}

.recommendation-item:hover {
  border-color: var(--neon-cyan);
  box-shadow: 0 0 10px var(--neon-cyan-glow);
}

.recommendation-item p {
  margin: 0;
  color: var(--text-main);
  font-weight: 500;
}

.price {
  color: var(--neon-cyan);
  font-weight: 700;
  font-size: 16px;
}

.footer {
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(5px);
  border-top: 1px solid var(--glass-border);
  color: var(--text-dim);
  text-align: center;
  padding: 40px;
  margin-top: auto;
}

.footer p {
  margin: 0;
}

@media (max-width: 768px) {
  .nav-links {
    gap: 16px;
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  .stats {
    grid-template-columns: 1fr;
  }
}
</style>

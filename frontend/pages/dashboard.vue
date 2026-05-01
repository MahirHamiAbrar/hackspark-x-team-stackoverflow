<template>
  <div class="dashboard-container">
    <nav class="navbar">
      <div class="nav-content">
        <h1 class="logo">RentPi</h1>
        <div class="nav-links">
          <NuxtLink to="/">Home</NuxtLink>
          <NuxtLink to="/products">Products</NuxtLink>
          <span class="user-info">{{ user?.name }}</span>
          <button @click="handleLogout" class="btn-logout">Logout</button>
        </div>
      </div>
    </nav>

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

const handleLogout = async () => {
  try {
    await userController.logout();
    await router.push('/');
  } catch (error) {
    console.error('Logout failed:', error);
  }
};
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.navbar {
  background: white;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 24px;
  font-weight: 700;
  color: #667eea;
  margin: 0;
}

.nav-links {
  display: flex;
  gap: 20px;
  align-items: center;
}

.nav-links a {
  text-decoration: none;
  color: #333;
  font-weight: 500;
  transition: color 0.3s;
}

.nav-links a:hover {
  color: #667eea;
}

.user-info {
  color: #666;
  font-weight: 500;
}

.btn-logout {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 5px;
  cursor: pointer;
  transition: transform 0.2s;
}

.btn-logout:hover {
  transform: translateY(-2px);
}

.dashboard-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  width: 100%;
  flex: 1;
}

.dashboard-content h1 {
  color: #333;
  margin-bottom: 30px;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.card {
  background: white;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.card h2 {
  margin-top: 0;
  color: #333;
  border-bottom: 2px solid #667eea;
  padding-bottom: 10px;
}

.user-details p {
  margin: 10px 0;
  color: #666;
}

.no-data {
  color: #999;
  text-align: center;
  padding: 20px;
}

.no-data a {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
}

.rentals-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.rental-item {
  padding: 12px;
  background: #f9f9f9;
  border-radius: 5px;
  border-left: 3px solid #667eea;
}

.rental-item h4 {
  margin: 0 0 8px 0;
  color: #333;
}

.rental-item p {
  margin: 4px 0;
  color: #666;
  font-size: 14px;
}

.stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  padding-top: 10px;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 5px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #667eea;
}

.stat-label {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
  text-transform: uppercase;
}

.loading {
  text-align: center;
  padding: 20px;
  color: #999;
}

.recommendations-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.recommendation-item {
  padding: 12px;
  background: #f9f9f9;
  border-radius: 5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.recommendation-item p {
  margin: 0;
  color: #333;
}

.price {
  color: #667eea;
  font-weight: 600;
  font-size: 14px;
}

.footer {
  background: #333;
  color: white;
  text-align: center;
  padding: 20px;
  margin-top: auto;
}

.footer p {
  margin: 0;
}

@media (max-width: 768px) {
  .nav-links {
    gap: 10px;
    flex-wrap: wrap;
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  .stats {
    grid-template-columns: 1fr;
  }
}
</style>

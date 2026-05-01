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
  background: #FFFFE3;
  display: flex;
  flex-direction: column;
}

.navbar {
  background: #ffffff;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 10px 0;
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
  font-size: 28px;
  font-weight: 800;
  color: #6D81D3;
  margin: 0;
  letter-spacing: -0.05em;
}

.nav-links {
  display: flex;
  gap: 20px;
  align-items: center;
}

.nav-links a {
  text-decoration: none;
  color: #4A4A4A;
  font-weight: 500;
  transition: color 0.3s;
}

.nav-links a:hover {
  color: #6D81D3;
}

.user-info {
  color: #4A4A4A;
  font-weight: 500;
}

.btn-logout {
  background: linear-gradient(135deg, #6D81D3 0%, #4A4A4A 100%);
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
  color: #4A4A4A;
  margin-bottom: 30px;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 30px;
}

.card {
  background: #ffffff;
  padding: 30px;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.02);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.08);
}

.card h2 {
  margin-top: 0;
  color: #4A4A4A;
  border-bottom: 2px solid rgba(109, 129, 211, 0.2);
  padding-bottom: 15px;
  margin-bottom: 20px;
  font-weight: 700;
}

.user-details p {
  margin: 10px 0;
  color: #4A4A4A;
}

.no-data {
  color: #999;
  text-align: center;
  padding: 20px;
}

.no-data a {
  color: #6D81D3;
  text-decoration: none;
  font-weight: 600;
}

.rentals-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.rental-item {
  padding: 16px;
  background: #ffffff;
  border: 1px solid #eaeaea;
  border-radius: 8px;
  border-left: 4px solid #6D81D3;
  transition: all 0.2s ease;
}

.rental-item:hover {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.rental-item h4 {
  margin: 0 0 8px 0;
  color: #4A4A4A;
  font-size: 16px;
}

.rental-item p {
  margin: 4px 0;
  color: #888;
  font-size: 14px;
}

.stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  padding-top: 10px;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: #ffffff;
  border: 1px solid #eaeaea;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.02);
}

.stat-value {
  font-size: 32px;
  font-weight: 800;
  color: #6D81D3;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 13px;
  color: #888;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.05em;
}

.loading {
  text-align: center;
  padding: 30px;
  color: #888;
}

.recommendations-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.recommendation-item {
  padding: 16px;
  background: #ffffff;
  border: 1px solid #eaeaea;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s ease;
}

.recommendation-item:hover {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.recommendation-item p {
  margin: 0;
  color: #4A4A4A;
  font-weight: 500;
}

.price {
  color: #6D81D3;
  font-weight: 700;
  font-size: 16px;
}

.footer {
  background: #4A4A4A;
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

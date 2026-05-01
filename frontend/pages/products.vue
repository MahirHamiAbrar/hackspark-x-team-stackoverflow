<template>
  <div class="products-container">
    <nav class="navbar">
      <div class="nav-content">
        <h1 class="logo">RentPi</h1>
        <div class="nav-links">
          <NuxtLink to="/">Home</NuxtLink>
          <NuxtLink to="/products">Products</NuxtLink>
          <NuxtLink to="/auth/login" class="btn-login">Login</NuxtLink>
        </div>
      </div>
    </nav>

    <div class="products-header">
      <h1>Rental Products</h1>
      <p>Browse our wide selection of rental items</p>
    </div>

    <div class="products-section">
      <aside class="filters">
        <h3>Filters</h3>
        
        <div class="filter-group">
          <h4>Category</h4>
          <div class="categories">
            <button
              v-for="category in categories"
              :key="category"
              @click="selectedCategory = category"
              :class="{ active: selectedCategory === category }"
              class="category-btn"
            >
              {{ category }}
            </button>
          </div>
        </div>

        <div class="filter-group">
          <h4>Price Range</h4>
          <input
            v-model="priceRange"
            type="range"
            min="0"
            max="500"
            class="price-slider"
          />
          <p>Up to ${{ priceRange }}/day</p>
        </div>

        <button @click="clearFilters" class="btn-clear">Clear Filters</button>
      </aside>

      <main class="products-main">
        <div v-if="isLoading" class="loading">
          <p>Loading products...</p>
        </div>

        <div v-else-if="products.length === 0" class="no-products">
          <p>No products found. Try adjusting your filters.</p>
        </div>

        <div v-else class="products-grid">
          <div v-for="product in products" :key="product.id" class="product-card">
            <div class="product-image">
              <div class="placeholder">📦</div>
            </div>
            <div class="product-info">
              <h3>{{ product.name }}</h3>
              <p class="category">{{ product.category }}</p>
              <p class="price">${{ product.pricePerDay }}/day</p>
              <NuxtLink :to="`/products/${product.id}`" class="btn-details">
                View Details
              </NuxtLink>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="pagination">
          <button
            @click="previousPage"
            :disabled="currentPage === 1"
            class="btn-pagination"
          >
            Previous
          </button>
          <span class="page-info">Page {{ currentPage }} of {{ totalPages }}</span>
          <button
            @click="nextPage"
            :disabled="currentPage === totalPages"
            class="btn-pagination"
          >
            Next
          </button>
        </div>
      </main>
    </div>

    <footer class="footer">
      <p>&copy; 2026 RentPi. All rights reserved.</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { productController } from '@/controllers/productController.js';
import { PRODUCT_CATEGORIES } from '@/utils/constants.js';

const products = ref([]);
const isLoading = ref(false);
const currentPage = ref(1);
const totalPages = ref(1);
const selectedCategory = ref('');
const priceRange = ref(500);
const categories = ref(PRODUCT_CATEGORIES);

// Load products when component mounts
onMounted(async () => {
  await loadProducts();
});

const loadProducts = async () => {
  try {
    isLoading.value = true;
    const state = await productController.getAllProducts(
      currentPage.value,
      50,
      { category: selectedCategory.value }
    );
    
    products.value = state.items;
    totalPages.value = Math.ceil(state.total / 50);
  } catch (error) {
    console.error('Failed to load products:', error);
    // Show sample products if API fails
    products.value = [
      { id: 1, name: 'Premium Camera Kit', category: 'ELECTRONICS', pricePerDay: 49.99 },
      { id: 2, name: 'Mountain Bike', category: 'SPORTS', pricePerDay: 29.99 },
      { id: 3, name: 'Laptop Stand', category: 'OFFICE', pricePerDay: 9.99 },
      { id: 4, name: 'Power Drill', category: 'TOOLS', pricePerDay: 19.99 },
      { id: 5, name: 'Tent 4-Person', category: 'OUTDOOR', pricePerDay: 39.99 },
      { id: 6, name: 'Electric Guitar', category: 'MUSIC', pricePerDay: 34.99 },
    ];
    totalPages.value = 1;
  } finally {
    isLoading.value = false;
  }
};

const nextPage = async () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    await loadProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

const previousPage = async () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    await loadProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

const clearFilters = async () => {
  selectedCategory.value = '';
  priceRange.value = 500;
  currentPage.value = 1;
  await loadProducts();
};

// Watch for category changes
watch(() => selectedCategory.value, async () => {
  currentPage.value = 1;
  await loadProducts();
});
</script>

<style scoped>
.products-container {
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
  gap: 30px;
  align-items: center;
}

.nav-links a {
  text-decoration: none;
  color: #4A4A4A;
  font-weight: 600;
  transition: color 0.3s;
}

.nav-links a:hover {
  color: #6D81D3;
}

.btn-login {
  background: #6D81D3;
  color: white !important;
  padding: 10px 24px;
  border-radius: 8px;
  font-weight: 600;
  box-shadow: 0 4px 10px rgba(109, 129, 211, 0.2);
  transition: all 0.3s ease;
}

.btn-login:hover {
  background: #5a6eb8;
  transform: translateY(-2px);
}

.products-header {
  background: linear-gradient(135deg, #6D81D3 0%, #4A4A4A 100%);
  color: white;
  padding: 60px 20px;
  text-align: center;
}

.products-header h1 {
  font-size: 42px;
  margin-bottom: 15px;
  font-weight: 800;
}

.products-header p {
  font-size: 20px;
  opacity: 0.9;
}

.products-section {
  max-width: 1200px;
  margin: 50px auto;
  padding: 0 20px;
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 40px;
  width: 100%;
  flex: 1;
}

.filters {
  background: #ffffff;
  padding: 30px;
  border-radius: 12px;
  height: fit-content;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.02);
}

.filters h3 {
  margin-top: 0;
  color: #4A4A4A;
}

.filter-group {
  margin-bottom: 25px;
}

.filter-group h4 {
  color: #4A4A4A;
  margin-bottom: 10px;
  font-size: 14px;
}

.categories {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.category-btn {
  background: #f0f0f0;
  border: 1px solid #ddd;
  padding: 8px 12px;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
  text-align: left;
  font-size: 14px;
}

.category-btn:hover {
  background: #e0e0e0;
}

.category-btn.active {
  background: #6D81D3;
  color: white;
  border-color: #6D81D3;
}

.price-slider {
  width: 100%;
  cursor: pointer;
}

.btn-clear {
  width: 100%;
  padding: 10px;
  background: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-clear:hover {
  background: #e0e0e0;
}

.products-main {
  display: flex;
  flex-direction: column;
}

.loading,
.no-products {
  background: #ffffff;
  padding: 60px;
  border-radius: 12px;
  text-align: center;
  color: #4A4A4A;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 30px;
  margin-bottom: 40px;
}

.product-card {
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.02);
  display: flex;
  flex-direction: column;
}

.product-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.08);
}

.product-image {
  height: 200px;
  background: linear-gradient(135deg, rgba(109,129,211,0.1) 0%, rgba(74,74,74,0.05) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder {
  font-size: 64px;
  opacity: 0.8;
}

.product-info {
  padding: 24px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.product-info h3 {
  margin: 0 0 10px 0;
  font-size: 18px;
  color: #4A4A4A;
  font-weight: 700;
}

.category {
  color: #888;
  font-size: 12px;
  margin: 0 0 15px 0;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.05em;
}

.price {
  color: #6D81D3;
  font-weight: 800;
  margin: auto 0 20px 0;
  font-size: 20px;
}

.btn-details {
  display: block;
  background: white;
  color: #6D81D3;
  border: 1.5px solid #6D81D3;
  padding: 12px;
  border-radius: 8px;
  text-align: center;
  text-decoration: none;
  font-size: 15px;
  font-weight: 700;
  transition: all 0.3s ease;
}

.btn-details:hover {
  background: #6D81D3;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(109, 129, 211, 0.2);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  background: #FFFFE3;
  padding: 20px;
  border-radius: 10px;
}

.btn-pagination {
  padding: 10px 20px;
  background: #6D81D3;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-pagination:hover:not(:disabled) {
  background: #4A4A4A;
}

.btn-pagination:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.page-info {
  color: #4A4A4A;
  font-weight: 600;
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
  .products-section {
    grid-template-columns: 1fr;
  }

  .filters {
    display: none;
  }

  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }

  .pagination {
    flex-wrap: wrap;
  }
}
</style>

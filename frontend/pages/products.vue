<template>
  <div class="products-container">
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
              <NuxtLink :to="`/availability?productId=${product.id}`" class="btn-details">
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
  display: flex;
  flex-direction: column;
}

.products-header {
  padding: 80px 20px;
  text-align: center;
  position: relative;
}

.products-header h1 {
  font-size: 48px;
  margin-bottom: 16px;
  font-weight: 800;
  color: var(--text-main);
}

.products-header p {
  font-size: 20px;
  color: var(--text-dim);
}

.products-section {
  max-width: 1200px;
  margin: 40px auto;
  padding: 0 20px;
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 40px;
  width: 100%;
  flex: 1;
}

.filters {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  padding: 32px;
  border-radius: 24px;
  height: fit-content;
  border: 1px solid var(--glass-border);
}

.filters h3 {
  margin-top: 0;
  color: var(--text-main);
  margin-bottom: 24px;
  font-size: 20px;
}

.filter-group {
  margin-bottom: 32px;
}

.filter-group h4 {
  color: var(--text-dim);
  margin-bottom: 16px;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.categories {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.category-btn {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--glass-border);
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all var(--transition-fast);
  text-align: left;
  font-size: 14px;
  color: var(--text-dim);
}

.category-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-main);
}

.category-btn.active {
  background: rgba(34, 211, 238, 0.1);
  color: var(--neon-cyan);
  border-color: var(--neon-cyan);
  box-shadow: 0 0 10px var(--neon-cyan-glow);
}

.price-slider {
  width: 100%;
  cursor: pointer;
  accent-color: var(--neon-cyan);
}

.btn-clear {
  width: 100%;
  padding: 12px;
  background: transparent;
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  cursor: pointer;
  transition: all var(--transition-fast);
  color: var(--text-dim);
  font-weight: 600;
}

.btn-clear:hover {
  border-color: var(--neon-cyan);
  color: var(--neon-cyan);
  text-shadow: 0 0 8px var(--neon-cyan-glow);
}

.products-main {
  display: flex;
  flex-direction: column;
}

.loading,
.no-products {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  padding: 80px;
  border-radius: 24px;
  text-align: center;
  color: var(--text-dim);
  border: 1px solid var(--glass-border);
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 32px;
  margin-bottom: 48px;
}

.product-card {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border-radius: 24px;
  overflow: hidden;
  border: 1px solid var(--glass-border);
  transition: all var(--transition-normal);
  display: flex;
  flex-direction: column;
}

.product-card:hover {
  transform: translateY(-10px);
  border-color: var(--neon-cyan);
  box-shadow: 0 0 30px var(--neon-cyan-glow);
}

.product-image {
  height: 220px;
  background: linear-gradient(135deg, rgba(34, 211, 238, 0.05), rgba(244, 114, 182, 0.05));
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid var(--glass-border);
}

.placeholder {
  font-size: 72px;
  filter: drop-shadow(0 0 15px rgba(255,255,255,0.2));
}

.product-info {
  padding: 28px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.product-info h3 {
  margin: 0 0 12px 0;
  font-size: 20px;
  color: var(--text-main);
  font-weight: 700;
}

.category {
  color: var(--text-dim);
  font-size: 12px;
  margin: 0 0 16px 0;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.1em;
}

.price {
  color: var(--neon-cyan);
  font-weight: 800;
  margin: auto 0 24px 0;
  font-size: 22px;
  text-shadow: 0 0 8px var(--neon-cyan-glow);
}

.btn-details {
  display: block;
  background: transparent;
  color: var(--text-main);
  border: 1px solid var(--glass-border);
  padding: 14px;
  border-radius: 12px;
  text-align: center;
  text-decoration: none;
  font-size: 15px;
  font-weight: 700;
  transition: all var(--transition-normal);
}

.btn-details:hover {
  background: var(--neon-cyan);
  color: var(--bg-secondary);
  border-color: var(--neon-cyan);
  box-shadow: 0 0 20px var(--neon-cyan);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 24px;
  padding: 32px;
}

.btn-pagination {
  padding: 12px 24px;
  background: var(--glass-bg);
  color: var(--text-main);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  cursor: pointer;
  transition: all var(--transition-fast);
  font-weight: 600;
}

.btn-pagination:hover:not(:disabled) {
  border-color: var(--neon-cyan);
  color: var(--neon-cyan);
  box-shadow: 0 0 15px var(--neon-cyan-glow);
}

.btn-pagination:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.page-info {
  color: var(--text-dim);
  font-weight: 600;
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

@media (max-width: 1024px) {
  .products-section {
    grid-template-columns: 1fr;
  }

  .filters {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 20px;
  }

  .filter-group {
    margin-bottom: 0;
    flex: 1;
    min-width: 200px;
  }
}

@media (max-width: 768px) {
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  }
}
</style>

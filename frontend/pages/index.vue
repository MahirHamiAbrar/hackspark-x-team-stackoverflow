<template>
  <div class="home-container">
    <section class="hero">
      <div class="hero-content">
        <h1>Welcome to RentPi</h1>
        <p>Rent anything. Anytime. Anywhere.</p>
        <NuxtLink to="/products" class="btn-primary">Browse Products</NuxtLink>
      </div>
    </section>

    <section class="features">
      <h2>Why Choose RentPi?</h2>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">📦</div>
          <h3>Wide Selection</h3>
          <p>Choose from thousands of rental items across multiple categories</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">💰</div>
          <h3>Affordable Pricing</h3>
          <p>Get great deals on rental items with flexible pricing options</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">🔒</div>
          <h3>Secure Transactions</h3>
          <p>Safe and secure rental process with verified users</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">⚡</div>
          <h3>Fast Delivery</h3>
          <p>Quick rental process and fast delivery to your location</p>
        </div>
      </div>
    </section>

    <!-- P18: What's Trending Today? Widget -->
    <section class="trending-widget">
      <div class="trending-header">
        <h2>🔥 What's Trending Today?</h2>
        <button @click="refreshTrending" :disabled="trendingLoading" class="trending-refresh-btn">
          <span v-if="trendingLoading" class="trending-spinner"></span>
          <span v-else>🔄 Refresh</span>
        </button>
      </div>

      <!-- Skeleton Loading -->
      <div v-if="trendingLoading" class="trending-grid">
        <div v-for="i in 6" :key="'skel-'+i" class="trending-skeleton">
          <div class="skel-badge"></div>
          <div class="skel-name"></div>
          <div class="skel-score"></div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="trendingError" class="trending-error">
        <p>⚠️ {{ trendingError }}</p>
        <button @click="refreshTrending" class="trending-retry">Try Again</button>
      </div>

      <!-- Results -->
      <div v-else-if="trendingItems.length > 0" class="trending-grid">
        <div
          v-for="(item, idx) in trendingItems"
          :key="item.productId"
          class="trending-item"
          :style="{ animationDelay: `${idx * 0.1}s` }"
        >
          <div class="trending-rank" :class="idx < 3 ? 'top-rank' : ''">{{ idx + 1 }}</div>
          <span class="trending-category">{{ item.category }}</span>
          <h4>{{ item.name }}</h4>
          <div class="trending-score-bar">
            <div class="trending-score-fill" :style="{ width: getTrendScoreWidth(item.score) + '%' }"></div>
          </div>
          <span class="trending-score-val">Score: {{ item.score }}</span>
        </div>
      </div>

      <div v-else class="trending-empty">
        <p>No trending items available right now.</p>
      </div>

      <div class="trending-cta">
        <NuxtLink to="/trending" class="trending-see-all">View All Trending →</NuxtLink>
      </div>
    </section>

    <section class="cta">
      <h2>Ready to rent?</h2>
      <p>Create an account to get started</p>
      <NuxtLink to="/auth/register" class="btn-secondary">Sign Up Now</NuxtLink>
    </section>

    <footer class="footer">
      <p>&copy; 2026 RentPi. All rights reserved.</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { baseHandle } from '@/services/baseHandle.js';

definePageMeta({
  layout: 'default'
});

// P18: Trending Widget State
const trendingItems = ref([]);
const trendingLoading = ref(false);
const trendingError = ref('');

function getTodayDate() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getTrendScoreWidth(score) {
  if (!trendingItems.value.length) return 0;
  const maxScore = Math.max(...trendingItems.value.map(r => r.score));
  return maxScore > 0 ? (score / maxScore) * 100 : 0;
}

async function refreshTrending() {
  trendingError.value = '';
  trendingLoading.value = true;
  try {
    const data = await baseHandle.makeRequest({
      method: 'GET',
      url: `/analytics/recommendations?date=${getTodayDate()}&limit=6`,
    });
    trendingItems.value = data.recommendations || [];
  } catch (e) {
    trendingError.value = e.response?.error || e.message || 'Unable to load trending products';
    trendingItems.value = [];
  } finally {
    trendingLoading.value = false;
  }
}

onMounted(refreshTrending);
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.hero {
  position: relative;
  padding: 160px 20px;
  text-align: center;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.hero::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, var(--neon-cyan-glow) 0%, transparent 70%);
  filter: blur(80px);
  z-index: -1;
  opacity: 0.15; /* Reduced opacity to let background show through */
  mix-blend-mode: overlay; /* Use overlay for better integration with background image */
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
  z-index: 1;
}

.hero h1 {
  font-size: 72px;
  margin-bottom: 24px;
  font-weight: 900;
  background: linear-gradient(to bottom, #fff, #94a3b8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -2px;
}

.hero p {
  font-size: 24px;
  margin-bottom: 48px;
  color: var(--text-dim);
  font-weight: 400;
}

.btn-primary {
  display: inline-block;
  background: transparent;
  color: var(--neon-cyan);
  padding: 16px 40px;
  border-radius: 16px;
  text-decoration: none;
  font-weight: 700;
  font-size: 18px;
  border: 1px solid var(--neon-cyan);
  box-shadow: 0 0 15px var(--neon-cyan-glow);
  transition: all var(--transition-normal);
  backdrop-filter: var(--glass-blur);
}

.btn-primary:hover {
  transform: translateY(-5px);
  background: var(--neon-cyan);
  color: var(--bg-secondary);
  box-shadow: 0 0 30px var(--neon-cyan);
}

.features {
  max-width: 1200px;
  margin: 100px auto;
  padding: 0 20px;
  width: 100%;
}

.features h2 {
  font-size: 42px;
  text-align: center;
  margin-bottom: 64px;
  color: var(--text-main);
  font-weight: 800;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 32px;
}

.feature-card {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  padding: 48px 32px;
  border-radius: 24px;
  text-align: center;
  border: 1px solid var(--glass-border);
  transition: all var(--transition-normal);
}

.feature-card:hover {
  transform: translateY(-12px);
  border-color: var(--neon-cyan);
  box-shadow: 0 10px 40px -10px var(--neon-cyan-glow);
}

.feature-icon {
  font-size: 56px;
  margin-bottom: 24px;
  filter: drop-shadow(0 0 10px rgba(255,255,255,0.3));
}

.feature-card h3 {
  color: var(--text-main);
  margin-bottom: 16px;
  font-size: 24px;
}

.feature-card p {
  color: var(--text-dim);
  font-size: 16px;
  line-height: 1.6;
}

.cta {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  padding: 80px 40px;
  text-align: center;
  margin: 60px 20px;
  border-radius: 32px;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  position: relative;
  overflow: hidden;
}

.cta::after {
  content: '';
  position: absolute;
  bottom: -50px;
  right: -50px;
  width: 200px;
  height: 200px;
  background: var(--neon-cyan-glow);
  filter: blur(60px);
  z-index: -1;
}

.cta h2 {
  font-size: 48px;
  margin-bottom: 24px;
  color: var(--text-main);
  font-weight: 800;
}

.cta p {
  font-size: 20px;
  margin-bottom: 40px;
  color: var(--text-dim);
}

.btn-secondary {
  display: inline-block;
  background: var(--neon-cyan);
  color: var(--bg-secondary);
  padding: 16px 48px;
  border-radius: 16px;
  text-decoration: none;
  font-weight: 700;
  font-size: 18px;
  transition: all var(--transition-normal);
  box-shadow: 0 0 20px var(--neon-cyan-glow);
}

.btn-secondary:hover {
  transform: translateY(-5px) scale(1.05);
  box-shadow: 0 0 35px var(--neon-cyan);
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
  font-size: 14px;
}

@media (max-width: 768px) {
  .hero {
    padding: 100px 20px;
  }

  .hero h1 {
    font-size: 48px;
  }

  .hero p {
    font-size: 18px;
  }

  .nav-links {
    gap: 15px;
  }

  .features h2,
  .cta h2 {
    font-size: 32px;
  }
}

/* ── P18: Trending Widget ── */
.trending-widget {
  max-width: 1200px;
  margin: 60px auto;
  padding: 0 20px;
  width: 100%;
}

.trending-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.trending-header h2 {
  font-size: 36px;
  color: var(--text-main);
  font-weight: 800;
  margin: 0;
}

.trending-refresh-btn {
  background: transparent;
  border: 1px solid var(--neon-cyan);
  border-radius: 12px;
  padding: 10px 20px;
  color: var(--neon-cyan);
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.trending-refresh-btn:hover:not(:disabled) {
  background: rgba(34, 211, 238, 0.1);
  box-shadow: 0 0 15px var(--neon-cyan-glow);
}

.trending-refresh-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.trending-spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid transparent;
  border-top-color: currentColor;
  border-radius: 50%;
  animation: trendSpin 0.6s linear infinite;
}

.trending-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.trending-item {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  padding: 24px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
  animation: trendSlideUp 0.5s ease forwards;
  opacity: 0;
}

.trending-item:hover {
  transform: translateY(-8px);
  border-color: var(--neon-cyan);
  box-shadow: 0 10px 40px -10px var(--neon-cyan-glow);
}

.trending-rank {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 14px;
  background: rgba(255,255,255,0.05);
  color: var(--text-dim);
  border: 1px solid var(--glass-border);
}

.trending-rank.top-rank {
  background: rgba(250, 204, 21, 0.15);
  color: #facc15;
  border-color: rgba(250, 204, 21, 0.4);
}

.trending-category {
  display: inline-block;
  background: rgba(34, 211, 238, 0.1);
  color: var(--neon-cyan);
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 10px;
}

.trending-item h4 {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-main);
  margin: 0 0 14px 0;
  padding-right: 40px;
}

.trending-score-bar {
  height: 5px;
  background: rgba(255,255,255,0.05);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 8px;
}

.trending-score-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--neon-cyan), #a78bfa);
  border-radius: 3px;
  transition: width 1s ease;
}

.trending-score-val {
  font-size: 13px;
  font-weight: 700;
  color: var(--neon-cyan);
}

.trending-error {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 16px;
  padding: 24px;
  text-align: center;
}

.trending-error p { color: #fca5a5; margin: 0 0 12px; }

.trending-retry {
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.4);
  border-radius: 8px;
  padding: 8px 20px;
  color: #fca5a5;
  font-weight: 600;
  cursor: pointer;
}

.trending-empty {
  text-align: center;
  padding: 40px;
  color: var(--text-dim);
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
}

.trending-cta {
  text-align: center;
  margin-top: 24px;
}

.trending-see-all {
  color: var(--neon-cyan);
  text-decoration: none;
  font-weight: 700;
  font-size: 16px;
  transition: all 0.2s;
}

.trending-see-all:hover {
  text-shadow: 0 0 10px var(--neon-cyan-glow);
}

/* Skeleton Loading */
.trending-skeleton {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  padding: 24px;
  animation: trendPulse 1.5s ease-in-out infinite;
}

.skel-badge {
  width: 60px;
  height: 16px;
  background: rgba(255,255,255,0.03);
  border-radius: 6px;
  margin-bottom: 10px;
}

.skel-name {
  width: 70%;
  height: 18px;
  background: rgba(255,255,255,0.03);
  border-radius: 6px;
  margin-bottom: 14px;
}

.skel-score {
  width: 100%;
  height: 5px;
  background: rgba(255,255,255,0.03);
  border-radius: 3px;
}

@keyframes trendSlideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes trendPulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.15; }
}

@keyframes trendSpin {
  to { transform: rotate(360deg); }
}
</style>

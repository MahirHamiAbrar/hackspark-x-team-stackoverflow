<template>
  <div class="trending-container">
    <div class="trending-content">
      <div class="page-header">
        <h1>🔥 What's Trending Today</h1>
        <p>Products people are renting right now, powered by seasonal data</p>
      </div>

      <!-- Controls -->
      <div class="controls">
        <span class="date-badge">📅 {{ todayFormatted }}</span>
        <button @click="fetchTrending" :disabled="isLoading" class="refresh-btn">
          <span v-if="isLoading" class="spinner"></span>
          <span v-else>🔄 Refresh</span>
        </button>
      </div>

      <!-- Error State -->
      <div v-if="error" class="error-card">
        <span>⚠️</span>
        <p>{{ error }}</p>
        <button @click="fetchTrending" class="retry-btn">Try Again</button>
      </div>

      <!-- Skeleton Loading -->
      <div v-if="isLoading" class="trending-grid">
        <div v-for="i in 6" :key="i" class="skeleton-card">
          <div class="skeleton-badge"></div>
          <div class="skeleton-title"></div>
          <div class="skeleton-subtitle"></div>
          <div class="skeleton-score"></div>
        </div>
      </div>

      <!-- Results -->
      <div v-if="!isLoading && recommendations.length > 0" class="trending-grid">
        <div
          v-for="(item, idx) in recommendations"
          :key="item.productId"
          class="trending-card"
          :style="{ animationDelay: `${idx * 0.08}s` }"
        >
          <div class="card-rank" :class="getRankClass(idx)">
            {{ idx + 1 }}
          </div>
          <div class="card-content">
            <span class="category-badge">{{ item.category }}</span>
            <h3>{{ item.name }}</h3>
            <div class="score-bar">
              <div class="score-fill" :style="{ width: getScoreWidth(item.score) + '%' }"></div>
            </div>
            <div class="card-footer">
              <span class="score-label">Seasonal Score</span>
              <span class="score-value">{{ item.score }}</span>
            </div>
          </div>
          <div class="card-glow" :class="getRankClass(idx)"></div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="!isLoading && !error && recommendations.length === 0 && hasFetched" class="empty-state">
        <span class="empty-icon">📭</span>
        <h3>No Trending Items</h3>
        <p>No seasonal recommendations available for today. Check back later!</p>
      </div>
    </div>

    <footer class="footer">
      <p>&copy; 2026 RentPi. All rights reserved.</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { baseHandle } from '@/services/baseHandle.js';

definePageMeta({ layout: 'default' });

const recommendations = ref([]);
const isLoading = ref(false);
const error = ref('');
const hasFetched = ref(false);

const todayFormatted = computed(() => {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
});

const today = computed(() => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
});

function getRankClass(idx) {
  if (idx === 0) return 'gold';
  if (idx === 1) return 'silver';
  if (idx === 2) return 'bronze';
  return '';
}

function getScoreWidth(score) {
  if (!recommendations.value.length) return 0;
  const maxScore = Math.max(...recommendations.value.map(r => r.score));
  return maxScore > 0 ? (score / maxScore) * 100 : 0;
}

async function fetchTrending() {
  error.value = '';
  isLoading.value = true;

  try {
    const data = await baseHandle.makeRequest({
      method: 'GET',
      url: `/analytics/recommendations?date=${today.value}&limit=6`,
    });
    recommendations.value = data.recommendations || [];
  } catch (e) {
    error.value = e.response?.error || e.message || 'Failed to load trending products';
    recommendations.value = [];
  } finally {
    isLoading.value = false;
    hasFetched.value = true;
  }
}

onMounted(fetchTrending);
</script>

<style scoped>
.trending-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.trending-content {
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 20px;
  width: 100%;
  flex: 1;
}

.page-header {
  text-align: center;
  margin-bottom: 32px;
}

.page-header h1 {
  font-size: 36px;
  font-weight: 800;
  color: var(--text-main);
  margin-bottom: 8px;
}

.page-header p {
  color: var(--text-dim);
  font-size: 16px;
}

.controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.date-badge {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  padding: 10px 18px;
  font-size: 14px;
  color: var(--text-main);
  font-weight: 600;
}

.refresh-btn {
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

.refresh-btn:hover:not(:disabled) {
  background: rgba(34, 211, 238, 0.1);
  box-shadow: 0 0 15px var(--neon-cyan-glow);
}

.refresh-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.error-card {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.error-card p { color: #fca5a5; margin: 0; flex: 1; }

.retry-btn {
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.4);
  border-radius: 8px;
  padding: 8px 16px;
  color: #fca5a5;
  font-weight: 600;
  cursor: pointer;
}

.trending-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.trending-card {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  padding: 24px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
  animation: slideUp 0.5s ease forwards;
  opacity: 0;
}

.trending-card:hover {
  transform: translateY(-8px);
  border-color: var(--neon-cyan);
  box-shadow: 0 10px 40px -10px var(--neon-cyan-glow);
}

.card-rank {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 16px;
  background: rgba(255,255,255,0.05);
  color: var(--text-dim);
  border: 1px solid var(--glass-border);
}

.card-rank.gold {
  background: rgba(250, 204, 21, 0.15);
  color: #facc15;
  border-color: rgba(250, 204, 21, 0.4);
  box-shadow: 0 0 12px rgba(250, 204, 21, 0.2);
}

.card-rank.silver {
  background: rgba(148, 163, 184, 0.15);
  color: #94a3b8;
  border-color: rgba(148, 163, 184, 0.4);
}

.card-rank.bronze {
  background: rgba(217, 119, 6, 0.15);
  color: #d97706;
  border-color: rgba(217, 119, 6, 0.4);
}

.card-content {
  position: relative;
  z-index: 1;
}

.category-badge {
  display: inline-block;
  background: rgba(34, 211, 238, 0.1);
  color: var(--neon-cyan);
  padding: 4px 12px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 12px;
}

.card-content h3 {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-main);
  margin: 0 0 16px 0;
  padding-right: 40px;
}

.score-bar {
  height: 6px;
  background: rgba(255,255,255,0.05);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 12px;
}

.score-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--neon-cyan), #a78bfa);
  border-radius: 3px;
  transition: width 1s ease;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.score-label {
  font-size: 12px;
  color: var(--text-dim);
  font-weight: 600;
}

.score-value {
  font-size: 20px;
  font-weight: 800;
  color: var(--neon-cyan);
  text-shadow: 0 0 10px var(--neon-cyan-glow);
}

.card-glow {
  position: absolute;
  bottom: -30px;
  right: -30px;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  filter: blur(40px);
  opacity: 0.1;
  pointer-events: none;
}

.card-glow.gold { background: #facc15; }
.card-glow.silver { background: #94a3b8; }
.card-glow.bronze { background: #d97706; }

.empty-state {
  text-align: center;
  padding: 80px 40px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 24px;
}

.empty-icon { font-size: 64px; }

.empty-state h3 {
  font-size: 24px;
  color: var(--text-main);
  margin: 16px 0 8px;
}

.empty-state p {
  color: var(--text-dim);
}

/* Skeletons */
.skeleton-card {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  padding: 24px;
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-badge {
  width: 80px;
  height: 20px;
  background: rgba(255,255,255,0.03);
  border-radius: 8px;
  margin-bottom: 12px;
}

.skeleton-title {
  width: 70%;
  height: 20px;
  background: rgba(255,255,255,0.03);
  border-radius: 6px;
  margin-bottom: 16px;
}

.skeleton-subtitle {
  width: 100%;
  height: 6px;
  background: rgba(255,255,255,0.03);
  border-radius: 3px;
  margin-bottom: 12px;
}

.skeleton-score {
  width: 40px;
  height: 24px;
  background: rgba(255,255,255,0.03);
  border-radius: 6px;
  margin-left: auto;
}

.spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid transparent;
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes pulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.15; }
}

@keyframes spin {
  to { transform: rotate(360deg); }
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

.footer p { margin: 0; }

@media (max-width: 768px) {
  .trending-grid {
    grid-template-columns: 1fr;
  }

  .controls {
    flex-direction: column;
    gap: 12px;
  }
}
</style>

<template>
  <div class="surge-container">
    <div class="surge-content">
      <div class="page-header">
        <h1>⚡ Surge Calendar</h1>
        <p>Visualize rental activity spikes and plan ahead</p>
      </div>

      <!-- Month Picker -->
      <div class="picker-card">
        <div class="picker-row">
          <div class="form-group">
            <label>Month</label>
            <input v-model="selectedMonth" type="month" class="form-input" />
          </div>
          <button @click="fetchSurgeData" :disabled="isLoading || !selectedMonth" class="fetch-btn">
            <span v-if="isLoading" class="spinner"></span>
            <span v-else>Analyze</span>
          </button>
        </div>
      </div>

      <!-- Error State -->
      <div v-if="error" class="error-card">
        <span>⚠️</span>
        <p>{{ error }}</p>
      </div>

      <!-- Loading Skeleton -->
      <div v-if="isLoading" class="skeleton-grid">
        <div v-for="i in 35" :key="i" class="skeleton-cell"></div>
      </div>

      <!-- Calendar Grid -->
      <div v-if="surgeData && !isLoading" class="calendar-section">
        <div class="calendar-header">
          <h3>{{ monthName }}</h3>
          <div class="legend">
            <span class="legend-item"><span class="dot low"></span> Low</span>
            <span class="legend-item"><span class="dot medium"></span> Medium</span>
            <span class="legend-item"><span class="dot high"></span> High</span>
            <span class="legend-item"><span class="dot peak"></span> Peak</span>
          </div>
        </div>

        <div class="weekday-headers">
          <span v-for="day in weekDays" :key="day">{{ day }}</span>
        </div>

        <div class="calendar-grid">
          <!-- Empty cells for offset -->
          <div v-for="i in dayOffset" :key="'offset-'+i" class="calendar-cell empty"></div>

          <!-- Day cells -->
          <div
            v-for="day in surgeData"
            :key="day.date"
            class="calendar-cell"
            :class="getIntensityClass(day.count)"
            @click="selectedDay = day"
          >
            <span class="day-number">{{ getDayNumber(day.date) }}</span>
            <span class="day-count">{{ day.count }}</span>
            <div v-if="day.nextSurgeDate" class="surge-indicator" :title="`Next surge in ${day.daysUntil}d`">
              ↗ {{ day.daysUntil }}d
            </div>
          </div>
        </div>

        <!-- Day Detail -->
        <div v-if="selectedDay" class="detail-card">
          <div class="detail-header">
            <h3>📊 {{ formatDate(selectedDay.date) }}</h3>
            <button @click="selectedDay = null" class="close-btn">×</button>
          </div>
          <div class="detail-stats">
            <div class="detail-stat">
              <span class="stat-value neon">{{ selectedDay.count }}</span>
              <span class="stat-label">Rentals</span>
            </div>
            <div class="detail-stat" v-if="selectedDay.nextSurgeDate">
              <span class="stat-value">{{ selectedDay.daysUntil }}</span>
              <span class="stat-label">Days to next surge</span>
            </div>
            <div class="detail-stat" v-if="selectedDay.nextSurgeDate">
              <span class="stat-value">{{ formatDate(selectedDay.nextSurgeDate) }}</span>
              <span class="stat-label">Next surge date</span>
            </div>
            <div class="detail-stat" v-else>
              <span class="stat-value dim">—</span>
              <span class="stat-label">No future surge</span>
            </div>
          </div>
        </div>

        <!-- Summary Stats -->
        <div class="summary-grid">
          <div class="summary-card">
            <span class="summary-icon">📈</span>
            <span class="summary-value">{{ maxCount }}</span>
            <span class="summary-label">Peak Day Rentals</span>
          </div>
          <div class="summary-card">
            <span class="summary-icon">📉</span>
            <span class="summary-value">{{ minCount }}</span>
            <span class="summary-label">Lowest Day</span>
          </div>
          <div class="summary-card">
            <span class="summary-icon">📊</span>
            <span class="summary-value">{{ avgCount }}</span>
            <span class="summary-label">Daily Average</span>
          </div>
          <div class="summary-card">
            <span class="summary-icon">🔥</span>
            <span class="summary-value">{{ totalCount }}</span>
            <span class="summary-label">Monthly Total</span>
          </div>
        </div>
      </div>
    </div>

    <footer class="footer">
      <p>&copy; 2026 RentPi. All rights reserved.</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { baseHandle } from '@/services/baseHandle.js';

definePageMeta({ layout: 'default' });

const selectedMonth = ref('');
const surgeData = ref(null);
const selectedDay = ref(null);
const isLoading = ref(false);
const error = ref('');

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const monthName = computed(() => {
  if (!selectedMonth.value) return '';
  const [y, m] = selectedMonth.value.split('-');
  return new Date(y, m - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
});

const dayOffset = computed(() => {
  if (!surgeData.value || surgeData.value.length === 0) return 0;
  return new Date(surgeData.value[0].date).getDay();
});

const maxCount = computed(() => {
  if (!surgeData.value) return 0;
  return Math.max(...surgeData.value.map(d => d.count));
});

const minCount = computed(() => {
  if (!surgeData.value) return 0;
  return Math.min(...surgeData.value.map(d => d.count));
});

const avgCount = computed(() => {
  if (!surgeData.value || surgeData.value.length === 0) return 0;
  const sum = surgeData.value.reduce((s, d) => s + d.count, 0);
  return Math.round(sum / surgeData.value.length);
});

const totalCount = computed(() => {
  if (!surgeData.value) return 0;
  return surgeData.value.reduce((s, d) => s + d.count, 0).toLocaleString();
});

function getDayNumber(dateStr) {
  return new Date(dateStr).getDate();
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getIntensityClass(count) {
  if (!surgeData.value) return 'low';
  const max = maxCount.value;
  if (max === 0) return 'low';
  const ratio = count / max;
  if (ratio >= 0.85) return 'peak';
  if (ratio >= 0.6) return 'high';
  if (ratio >= 0.3) return 'medium';
  return 'low';
}

async function fetchSurgeData() {
  if (!selectedMonth.value) return;
  error.value = '';
  surgeData.value = null;
  selectedDay.value = null;
  isLoading.value = true;

  try {
    const data = await baseHandle.makeRequest({
      method: 'GET',
      url: `/analytics/surge-days?month=${selectedMonth.value}`,
    });
    surgeData.value = data.data || [];
  } catch (e) {
    error.value = e.response?.error || e.message || 'Failed to load surge data';
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>
.surge-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.surge-content {
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 20px;
  width: 100%;
  flex: 1;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
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

.picker-card {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 32px;
}

.picker-row {
  display: flex;
  gap: 16px;
  align-items: flex-end;
}

.form-group { flex: 1; }

.form-group label {
  display: block;
  font-size: 12px;
  font-weight: 700;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  background: rgba(255,255,255,0.03);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  padding: 12px 16px;
  color: var(--text-main);
  font-size: 15px;
  outline: none;
  transition: all 0.2s;
}

.form-input:focus {
  border-color: var(--neon-cyan);
  box-shadow: 0 0 10px var(--neon-cyan-glow);
}

.fetch-btn {
  padding: 12px 32px;
  background: var(--neon-cyan);
  color: var(--bg-secondary);
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 100px;
}

.fetch-btn:hover:not(:disabled) {
  box-shadow: 0 0 20px var(--neon-cyan-glow);
}

.fetch-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.error-card {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 16px;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.error-card p { color: #fca5a5; margin: 0; }

.calendar-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.calendar-header h3 {
  font-size: 24px;
  color: var(--text-main);
  margin: 0;
}

.legend {
  display: flex;
  gap: 16px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: var(--text-dim);
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 3px;
}

.dot.low { background: #334155; }
.dot.medium { background: #0d9488; }
.dot.high { background: #f59e0b; }
.dot.peak { background: #ef4444; }

.weekday-headers {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
  text-align: center;
}

.weekday-headers span {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-dim);
  text-transform: uppercase;
  padding: 8px;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
}

.calendar-cell {
  aspect-ratio: 1;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  border: 1px solid transparent;
  min-height: 70px;
}

.calendar-cell.empty {
  cursor: default;
  background: transparent;
}

.calendar-cell.low {
  background: rgba(51, 65, 85, 0.3);
  border-color: rgba(51, 65, 85, 0.5);
}

.calendar-cell.medium {
  background: rgba(13, 148, 136, 0.15);
  border-color: rgba(13, 148, 136, 0.4);
}

.calendar-cell.high {
  background: rgba(245, 158, 11, 0.15);
  border-color: rgba(245, 158, 11, 0.4);
}

.calendar-cell.peak {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.4);
  box-shadow: 0 0 10px rgba(239, 68, 68, 0.2);
}

.calendar-cell:not(.empty):hover {
  transform: scale(1.08);
  z-index: 2;
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
}

.day-number {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-main);
}

.day-count {
  font-size: 11px;
  color: var(--text-dim);
  font-weight: 600;
}

.surge-indicator {
  font-size: 9px;
  color: var(--neon-cyan);
  font-weight: 600;
  margin-top: 2px;
}

.detail-card {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  border: 1px solid var(--neon-cyan);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 0 20px var(--neon-cyan-glow);
  animation: fadeIn 0.3s ease;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.detail-header h3 { margin: 0; color: var(--text-main); }

.close-btn {
  background: transparent;
  border: none;
  color: var(--text-dim);
  font-size: 24px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
}

.close-btn:hover { color: var(--text-main); background: rgba(255,255,255,0.05); }

.detail-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
}

.detail-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  background: rgba(255,255,255,0.02);
  border-radius: 12px;
  border: 1px solid var(--glass-border);
}

.stat-value {
  font-size: 24px;
  font-weight: 800;
  color: var(--text-main);
}

.stat-value.neon {
  color: var(--neon-cyan);
  text-shadow: 0 0 10px var(--neon-cyan-glow);
}

.stat-value.dim { color: var(--text-dim); }

.stat-label {
  font-size: 11px;
  color: var(--text-dim);
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.05em;
  margin-top: 4px;
  text-align: center;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.summary-card {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: all 0.2s;
}

.summary-card:hover {
  border-color: var(--neon-cyan);
  transform: translateY(-4px);
}

.summary-icon { font-size: 28px; margin-bottom: 8px; }

.summary-value {
  font-size: 28px;
  font-weight: 800;
  color: var(--neon-cyan);
  text-shadow: 0 0 10px var(--neon-cyan-glow);
}

.summary-label {
  font-size: 11px;
  color: var(--text-dim);
  text-transform: uppercase;
  font-weight: 600;
  margin-top: 4px;
}

.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
}

.skeleton-cell {
  aspect-ratio: 1;
  background: rgba(255,255,255,0.03);
  border-radius: 12px;
  animation: pulse 1.5s ease-in-out infinite;
}

.spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
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
  .summary-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .picker-row {
    flex-direction: column;
  }

  .calendar-cell {
    min-height: 50px;
  }
}
</style>

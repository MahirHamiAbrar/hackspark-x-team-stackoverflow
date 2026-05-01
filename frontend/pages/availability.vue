<template>
  <div class="availability-container">
    <div class="availability-content">
      <div class="page-header">
        <h1>📅 Check Availability</h1>
        <p>Find out when a product is available for rental</p>
      </div>

      <!-- Search Form -->
      <div class="search-card">
        <div class="form-row">
          <div class="form-group">
            <label for="productId">Product ID</label>
            <input
              id="productId"
              v-model="productId"
              type="number"
              min="1"
              placeholder="e.g. 42"
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label for="fromDate">From Date</label>
            <input
              id="fromDate"
              v-model="fromDate"
              type="date"
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label for="toDate">To Date</label>
            <input
              id="toDate"
              v-model="toDate"
              type="date"
              class="form-input"
            />
          </div>
          <button @click="checkAvailability" :disabled="isLoading || !isFormValid" class="check-btn">
            <span v-if="isLoading" class="spinner"></span>
            <span v-else>Check</span>
          </button>
        </div>
      </div>

      <!-- Error State -->
      <div v-if="error" class="error-card">
        <span class="error-icon">⚠️</span>
        <p>{{ error }}</p>
      </div>

      <!-- Results -->
      <div v-if="result && !isLoading" class="results-section">
        <!-- Availability Status -->
        <div class="status-card" :class="result.available ? 'status-available' : 'status-busy'">
          <div class="status-icon">{{ result.available ? '✅' : '❌' }}</div>
          <div class="status-text">
            <h3>{{ result.available ? 'Available!' : 'Not Available' }}</h3>
            <p>Product #{{ result.productId }} from {{ result.from }} to {{ result.to }}</p>
          </div>
        </div>

        <!-- Busy Periods -->
        <div v-if="result.busyPeriods && result.busyPeriods.length > 0" class="period-card">
          <h3>🔴 Busy Periods</h3>
          <div class="period-list">
            <div v-for="(period, idx) in result.busyPeriods" :key="'busy-'+idx" class="period-item busy">
              <div class="period-dates">
                <span class="date-label">{{ formatDate(period.start) }}</span>
                <span class="date-arrow">→</span>
                <span class="date-label">{{ formatDate(period.end) }}</span>
              </div>
              <span class="period-days">{{ daysBetween(period.start, period.end) }} days</span>
            </div>
          </div>
        </div>

        <!-- Free Windows -->
        <div v-if="result.freeWindows && result.freeWindows.length > 0" class="period-card">
          <h3>🟢 Free Windows</h3>
          <div class="period-list">
            <div v-for="(period, idx) in result.freeWindows" :key="'free-'+idx" class="period-item free">
              <div class="period-dates">
                <span class="date-label">{{ formatDate(period.start) }}</span>
                <span class="date-arrow">→</span>
                <span class="date-label">{{ formatDate(period.end) }}</span>
              </div>
              <span class="period-days">{{ daysBetween(period.start, period.end) }} days</span>
            </div>
          </div>
        </div>

        <!-- Timeline Visualization -->
        <div class="timeline-card">
          <h3>📊 Timeline</h3>
          <div class="timeline">
            <div class="timeline-bar">
              <div
                v-for="(segment, idx) in timelineSegments"
                :key="idx"
                class="timeline-segment"
                :class="segment.type"
                :style="{ width: segment.width + '%' }"
                :title="segment.label"
              ></div>
            </div>
            <div class="timeline-labels">
              <span>{{ result.from }}</span>
              <span>{{ result.to }}</span>
            </div>
          </div>
          <div class="timeline-legend">
            <span class="legend-item"><span class="legend-dot busy"></span> Busy</span>
            <span class="legend-item"><span class="legend-dot free"></span> Free</span>
          </div>
        </div>
      </div>

      <!-- Loading skeleton -->
      <div v-if="isLoading" class="results-section">
        <div class="skeleton-card"></div>
        <div class="skeleton-card tall"></div>
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
import API_CONFIG from '@/index.js';

definePageMeta({ layout: 'default' });

const productId = ref('');
const fromDate = ref('');
const toDate = ref('');
const result = ref(null);
const isLoading = ref(false);
const error = ref('');

const isFormValid = computed(() => {
  return productId.value && fromDate.value && toDate.value;
});

const timelineSegments = computed(() => {
  if (!result.value) return [];

  const from = new Date(result.value.from);
  const to = new Date(result.value.to);
  const totalDays = (to - from) / (1000 * 60 * 60 * 24);
  if (totalDays <= 0) return [];

  const segments = [];
  const busyPeriods = (result.value.busyPeriods || []).map(p => ({
    start: new Date(p.start),
    end: new Date(p.end),
  }));

  let current = new Date(from);
  for (const bp of busyPeriods) {
    const bpStart = bp.start < from ? from : bp.start;
    const bpEnd = bp.end > to ? to : bp.end;

    if (current < bpStart) {
      const freeDays = (bpStart - current) / (1000 * 60 * 60 * 24);
      segments.push({ type: 'free', width: (freeDays / totalDays) * 100, label: `Free: ${freeDays} days` });
    }
    const busyDays = (bpEnd - bpStart) / (1000 * 60 * 60 * 24);
    if (busyDays > 0) {
      segments.push({ type: 'busy', width: (busyDays / totalDays) * 100, label: `Busy: ${busyDays} days` });
    }
    current = new Date(bpEnd);
  }

  if (current < to) {
    const freeDays = (to - current) / (1000 * 60 * 60 * 24);
    segments.push({ type: 'free', width: (freeDays / totalDays) * 100, label: `Free: ${freeDays} days` });
  }

  return segments;
});

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function daysBetween(start, end) {
  return Math.round((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24));
}

async function checkAvailability() {
  if (!isFormValid.value) return;
  error.value = '';
  result.value = null;
  isLoading.value = true;

  try {
    const url = `/rentals/products/${productId.value}/availability?from=${fromDate.value}&to=${toDate.value}`;
    const data = await baseHandle.makeRequest({ method: 'GET', url });
    result.value = data;
  } catch (e) {
    error.value = e.response?.error || e.message || 'Failed to check availability. Please try again.';
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>
.availability-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.availability-content {
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

.search-card {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  padding: 28px;
  margin-bottom: 32px;
}

.form-row {
  display: flex;
  gap: 16px;
  align-items: flex-end;
  flex-wrap: wrap;
}

.form-group {
  flex: 1;
  min-width: 140px;
}

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

.check-btn {
  padding: 12px 32px;
  background: var(--neon-cyan);
  color: var(--bg-secondary);
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s;
  height: fit-content;
  min-width: 100px;
}

.check-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 0 20px var(--neon-cyan-glow);
}

.check-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

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

.error-icon { font-size: 24px; }

.error-card p {
  color: #fca5a5;
  margin: 0;
}

.results-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.status-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 28px;
  border-radius: 20px;
  backdrop-filter: var(--glass-blur);
}

.status-available {
  background: rgba(34, 197, 94, 0.08);
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.status-busy {
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.status-icon { font-size: 48px; }

.status-text h3 {
  font-size: 24px;
  margin: 0 0 4px 0;
  color: var(--text-main);
}

.status-text p {
  margin: 0;
  color: var(--text-dim);
  font-size: 14px;
}

.period-card {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  padding: 24px;
}

.period-card h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
  color: var(--text-main);
}

.period-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.period-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
  border-radius: 12px;
  border-left: 4px solid;
}

.period-item.busy {
  background: rgba(239, 68, 68, 0.06);
  border-left-color: #ef4444;
}

.period-item.free {
  background: rgba(34, 197, 94, 0.06);
  border-left-color: #22c55e;
}

.period-dates {
  display: flex;
  align-items: center;
  gap: 10px;
}

.date-label {
  color: var(--text-main);
  font-weight: 600;
  font-size: 14px;
}

.date-arrow {
  color: var(--text-dim);
  font-size: 12px;
}

.period-days {
  color: var(--text-dim);
  font-size: 13px;
  font-weight: 600;
}

.timeline-card {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  padding: 24px;
}

.timeline-card h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
  color: var(--text-main);
}

.timeline-bar {
  display: flex;
  height: 24px;
  border-radius: 12px;
  overflow: hidden;
  background: rgba(255,255,255,0.03);
}

.timeline-segment {
  transition: width 0.5s ease;
}

.timeline-segment.busy {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

.timeline-segment.free {
  background: linear-gradient(135deg, #22c55e, #16a34a);
}

.timeline-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 12px;
  color: var(--text-dim);
}

.timeline-legend {
  display: flex;
  gap: 24px;
  margin-top: 12px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-dim);
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.legend-dot.busy { background: #ef4444; }
.legend-dot.free { background: #22c55e; }

.skeleton-card {
  height: 100px;
  background: rgba(255,255,255,0.03);
  border-radius: 20px;
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-card.tall { height: 200px; }

.spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
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
  .form-row {
    flex-direction: column;
  }
}
</style>

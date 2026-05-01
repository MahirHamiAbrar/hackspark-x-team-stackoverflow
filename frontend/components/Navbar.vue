<template>
  <div class="navbar-container">
    <nav class="full-navbar">
      <!-- Left side: Navigation Links (Left-aligned) -->
      <div class="nav-side left-side">
        <div class="nav-group pages-group">
          <NuxtLink to="/" class="nav-link">Home</NuxtLink>
          <NuxtLink to="/products" class="nav-link">Products</NuxtLink>
          <NuxtLink v-if="isAuthenticated" to="/dashboard" class="nav-link">Dashboard</NuxtLink>
        </div>
      </div>

      <!-- Center Notch Spacer -->
      <div class="notch-spacer"></div>

      <!-- Center Notch -->
      <div class="notch-center">
        <div class="notch-border-outer">
          <div class="notch-shape">
            <NuxtLink to="/" class="logo neon-text-cyan">RentPi</NuxtLink>
          </div>
        </div>
      </div>

      <!-- Right side: Actions/Theme (Right-aligned) -->
      <div class="nav-side right-side">
        <div class="nav-group actions-group">
          <button @click="toggleTheme" class="theme-toggle" :title="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'">
            {{ isDark ? '🌙' : '☀️' }}
          </button>
          <template v-if="!isAuthenticated">
            <NuxtLink to="/auth/login" class="nav-link">Login</NuxtLink>
          </template>
          <template v-else>
            <button @click="handleLogout" class="logout-btn">Logout</button>
          </template>
        </div>
      </div>
    </nav>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from '@/store/useStore.js';
import { useTheme } from '@/utils/theme.js';

const router = useRouter();
const store = useStore();
const { isDark, toggleTheme } = useTheme();

const isAuthenticated = computed(() => store.state.auth.isAuthenticated);
const user = computed(() => store.state.auth.user);

const handleLogout = async () => {
  await store.auth.logout();
  router.push('/');
};
</script>

<style scoped>
.navbar-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  width: 100%;
}

.full-navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 54px;
  width: 100%;
  background: transparent;
  padding: 0 40px;
  position: relative;
}

.nav-side {
  flex: 1;
  display: flex;
  align-items: center;
}

.left-side {
  justify-content: flex-start;
}

.right-side {
  justify-content: flex-end;
}

.notch-spacer {
  flex: 0 0 340px; /* Ensure links never go below the notch */
  height: 1px;
}

.nav-group {
  display: flex;
  align-items: center;
  gap: 24px;
}

.notch-center {
  position: absolute;
  left: 50%;
  top: 0;
  transform: translateX(-50%);
  z-index: 10;
  filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.4));
}

/* The "Angled" and "Pointy" Notch Geometry with slight rounding */
.notch-border-outer {
  background: var(--glass-border);
  padding: 0 0 1px 0;
  clip-path: polygon(0 0, 100% 0, 88% 90%, 85% 100%, 15% 100%, 12% 90%);
}

.notch-shape {
  background: var(--notch-bg);
  width: 280px;
  height: 48px;
  /* Trapezoid shape with intermediate points for simulated rounding */
  clip-path: polygon(0 0, 100% 0, 88% 90%, 85% 100%, 15% 100%, 12% 90%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: background-color var(--transition-normal);
}

/* Internal shadow/overlay update */
.notch-shape::after {
  content: '';
  position: absolute;
  inset: 1px 0 0 0;
  background: var(--notch-bg);
  clip-path: polygon(0 0, 100% 0, 88% 90%, 85% 100%, 15% 100%, 12% 90%);
  z-index: -1;
}

.logo {
  font-size: 22px;
  font-weight: 950;
  text-decoration: none;
  letter-spacing: -1.5px;
  color: var(--neon-cyan);
  text-shadow: 0 0 15px var(--neon-cyan-glow);
  text-transform: uppercase;
  margin-top: -4px; /* Center adjustment for trapezoid */
}

.nav-link {
  text-decoration: none;
  color: var(--text-main);
  font-weight: 700;
  font-size: 14px;
  transition: all var(--transition-fast);
  opacity: 0.6;
}

.nav-link:hover {
  color: var(--neon-cyan);
  opacity: 1;
  text-shadow: 0 0 10px var(--neon-cyan-glow);
}

.nav-link.router-link-active {
  color: var(--neon-cyan);
  opacity: 1;
}

.theme-toggle {
  background: transparent;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 0;
  color: var(--text-main);
  transition: transform var(--transition-fast);
}

.theme-toggle:hover {
  transform: scale(1.15) rotate(15deg);
}

.logout-btn {
  background: transparent;
  color: var(--neon-cyan);
  font-size: 11px;
  font-weight: 900;
  border: 1.5px solid var(--neon-cyan);
  border-radius: 8px;
  padding: 4px 12px;
  cursor: pointer;
  transition: all var(--transition-fast);
  text-transform: uppercase;
}

.logout-btn:hover {
  background: var(--neon-cyan);
  color: var(--bg-secondary);
  box-shadow: 0 0 15px var(--neon-cyan-glow);
}

@media (max-width: 1200px) {
  .full-navbar {
    padding: 0 20px;
  }
}

@media (max-width: 950px) {
  .notch-spacer {
    flex: 0 0 260px;
  }
  .notch-shape {
    width: 220px;
  }
}

@media (max-width: 850px) {
  .nav-group.pages-group {
    display: none;
  }
  .notch-spacer {
    display: none;
  }
}
</style>

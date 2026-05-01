<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
import { useTheme } from '@/utils/theme.js';
import { useStore } from '@/store/useStore.js';

// Initialize theme on app load
useTheme();

// Initialize auth store from localStorage on app load
const store = useStore();
store.initializeStore();
</script>

<template>
  <div class="store-provider">
    <!-- Root Store Provider Component -->
    <!-- This component provides the global store to all child components -->
    <slot :store="store" :state="state"></slot>
  </div>
</template>

<script setup>
/**
 * Store Provider Component - store.vue
 * 
 * Root component that provides global store state to all child components.
 * Uses Vue 3 Composition API and provide/inject for global state management.
 */

import { provide, computed } from 'vue';
import { useStore } from './useStore.js';

// Initialize the store
const store = useStore();
const state = computed(() => store.state);

// Provide store to all child components
provide('store', store);
provide('state', state);

// Expose store for parent component access
defineExpose({
  store,
  state,
});
</script>

<style scoped>
.store-provider {
  width: 100%;
  height: 100%;
}
</style>

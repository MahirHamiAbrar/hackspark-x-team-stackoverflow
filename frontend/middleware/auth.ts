/**
 * Auth Middleware
 * 
 * Protects routes that require authentication.
 * Redirects to login if user is not authenticated.
 */

import { useStore } from '@/store/useStore.js';

export default defineNuxtRouteMiddleware((to, from) => {
  // Get store instance to check auth state
  const store = useStore();
  
  // Check if user is authenticated
  const isAuthenticated = store.state.auth.isAuthenticated || store.state.auth.token;

  // List of protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/rental-history', '/profile', '/availability', '/chat'];
  
  // Check if the route being accessed is protected
  const isProtectedRoute = protectedRoutes.some(route => to.path.startsWith(route));

  if (isProtectedRoute && !isAuthenticated) {
    // Redirect to login if not authenticated
    return navigateTo('/auth/login');
  }
});

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // Nuxt 4 changed the default srcDir to `app/`, but this project's
  // pages/, layouts/, store/, services/, utils/ are all at the root level.
  // Setting srcDir: '.' restores the Nuxt 3 directory convention.
  srcDir: '.',

  // Expose gateway URL to the browser via useRuntimeConfig().public.apiUrl
  runtimeConfig: {
    // Private (server-side only)
    gatewayUrlInternal: process.env.GATEWAY_URL_INTERNAL || 'http://api-gateway:8000',
    // Public (available on both client and server)
    public: {
      apiUrl: process.env.NUXT_PUBLIC_API_URL || 'http://localhost:8000',
    },
  },
})

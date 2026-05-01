// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // Nuxt 4 changed the default srcDir to `app/`, but this project's
  // pages/, layouts/, store/, services/, utils/ are all at the root level.
  // Setting srcDir: '.' restores the Nuxt 3 directory convention.
  srcDir: '.',
})

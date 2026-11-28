export default defineNuxtConfig({
  compatibilityDate: '2026-11-24',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  modules: ['@nuxt/image'],
  typescript: { strict: true, typeCheck: false },

  image: {
    provider: 'ipx',
    domains: ['images.unsplash.com'],
    presets: {
      thumbnail: { modifiers: { width: 400, height: 300, fit: 'cover' } },
      card:      { modifiers: { width: 600, height: 400, fit: 'cover' } },
      hero:      { modifiers: { width: 1400, height: 900, fit: 'cover' } },
      detail:    { modifiers: { width: 1200, height: 800, fit: 'cover' } }
    }
  },

  //Jangan prerender route admin
  routeRules: {
    '/admin/**': { ssr: true },
    '/api/admin/**': { cors: true }
  },

  nitro: {
    preset: 'cloudflare_module',
    cloudflare: {
      deployConfig: true,
      nodeCompat: true,
    },
  },
})
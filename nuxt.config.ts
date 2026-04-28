import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  // Nuxt 4 utiliza la carpeta app/ por defecto
  future: {
    compatibilityVersion: 4,
  },
  compatibilityDate: '2026-01-30',

  css: [
    '~/assets/css/app.css'
  ],

  vite: {
    plugins: [tailwindcss() as any],
    build: { modulePreload: false }
  },

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8000/api',
    }
  },
  app: {
    head: {
      link: [
        { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/@mdi/font@7.4.47/css/materialdesignicons.min.css' }
      ]
    }
  },

  devtools: { enabled: true }
})

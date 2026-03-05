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
      apiBase: 'http://localhost:8000',
      laravelUrl: 'http://localhost:8000'
    }
  },
  devtools: { enabled: true }
})

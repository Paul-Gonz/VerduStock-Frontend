export default defineNuxtConfig({
  // Nuxt 4 utiliza la carpeta app/ por defecto
  future: {
    compatibilityVersion: 4,
  },
  compatibilityDate: '2026-01-30',

  modules: ['vuetify-nuxt-module'],

  vuetify: {
    moduleOptions: {

    },
    vuetifyOptions: {
      theme: {
        defaultTheme: 'light',
      },
    },
  },

  runtimeConfig: {
    public: {
      apiBase: 'http://verdustock-backend.test',
      laravelUrl: 'http://localhost:8000'
    }
  },

  devtools: { enabled: true }
})
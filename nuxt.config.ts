export default defineNuxtConfig({
  // Nuxt 4 utiliza la carpeta app/ por defecto
  future: {
    compatibilityVersion: 4,
  },
  compatibilityDate: '2026-01-30',
  modules: ['vuetify-nuxt-module'],
  css: ['~/assets/css/main.css'],

  vuetify: {
    moduleOptions: {},
    vuetifyOptions: {
      theme: {
        defaultTheme: 'light',
        themes: {
          light: {
            dark: false,
            colors: {
              primary: '#1b8f63',
              secondary: '#2aa876',
              background: '#f3faf6',
              surface: '#ffffff',
              surfaceVariant: '#e9f3ee',
              onSurface: '#0b2f1f',
              onBackground: '#0b2f1f',
              success: '#16a34a',
              warning: '#d97706',
              error: '#dc2626',
              info: '#22c55e'
            }
          },
          dark: {
            dark: true,
            colors: {
              primary: '#6fbf9c',
              secondary: '#84d4b1',
              background: '#07120d',
              surface: '#0b1c14',
              surfaceVariant: '#10241b',
              onSurface: '#ecfdf6',
              onBackground: '#ecfdf6',
              success: '#22c55e',
              warning: '#b45309',
              error: '#b91c1c',
              info: '#38bdf8'
            }
          }
        }
      }
    }
  },
  runtimeConfig: {
    public: {
      apiBase: 'http://verdustock-backend.test',
      laravelUrl: 'http://localhost:8000'
    }
  },
  devtools: { enabled: true }
})

export default defineNuxtConfig({
  // Nuxt 4 utiliza la carpeta app/ por defecto
  future: {
    compatibilityVersion: 4,
  },

  modules: ['vuetify-nuxt-module'],

  vuetify: {
    moduleOptions: {
      /* Aquí puedes agregar estilos específicos si quieres */
    },
    vuetifyOptions: {
      theme: {
        defaultTheme: 'light',
      },
    },
  },

  devtools: { enabled: true }
})
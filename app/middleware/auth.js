// middleware/auth.js
export default defineNuxtRouteMiddleware(async (to, from) => {
    console.log(`Middleware ejecutándose: ${from.path} -> ${to.path}`)

    const config = useRuntimeConfig()

    // Rutas públicas
    const publicRoutes = ['/', '/login', '/register', '/forgot-password', '/api-test']

    if (publicRoutes.includes(to.path)) {
        console.log(`Ruta pública: ${to.path}`)
        return
    }

    try {
        console.log('Verificando autenticación...')
        console.log('Cookies actuales:', document.cookie)

        // Hacer una prueba de sesión primero
        const apiUrl1 = `${config.public.apiBase}/session-test`
        const sessionTest = await $fetch(apiUrl1, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            }
        }).catch(err => {
            console.error('Error en session-test:', err)
            return null
        })

        console.log('Resultado session-test:', sessionTest)

        // Ahora verificar autenticación
        const apiUrl2 = `${config.public.apiBase}/check-auth`
        const response = await $fetch(apiUrl2, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            }
        })

        console.log('Respuesta check-auth:', response)

        if (!response.authenticated) {
            console.log('No autenticado, redirigiendo a login')
            return navigateTo('/login')
        }

        console.log('Autenticado, permitiendo acceso')
        return

    } catch (error) {
        console.error('Error en middleware:', error)
        console.error('Detalles:', {
            status: error.status,
            message: error.message
        })

        return navigateTo('/login')
    }
})
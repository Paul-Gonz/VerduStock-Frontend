// middleware/auth.js
export default defineNuxtRouteMiddleware(async (to, from) => {
    if (process.server) return

    const config = useRuntimeConfig()

    // Rutas que no requieren autenticación
    const publicRoutes = ['/', '/login', '/register', '/forgot-password', '/api-test']

    if (publicRoutes.includes(to.path)) {
        return
    }

    try {
        // Verificamos el estado de la sesión en el servidor de Render
        const response = await $fetch(`${config.public.apiBase}/check-auth`, {
            method: 'GET',
            credentials: 'include', // Vital para enviar las cookies de sesión
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            }
        })

        // Si el backend dice que no estás autenticado, directo al login
        if (!response.authenticated) {
            console.warn('Sesión no válida, redirigiendo...')
            return navigateTo('/login')
        }

        // Si llegamos aquí, todo bien. El usuario puede entrar.
        console.log('Autenticación confirmada')

    } catch (error) {
        console.error('Error de conexión en el middleware:', error.message)
        // Si hay un error de red o el servidor responde mal, mejor mandarlo al login por seguridad
        return navigateTo('/login')
    }
})
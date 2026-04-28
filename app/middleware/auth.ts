// middleware/auth.ts
export default defineNuxtRouteMiddleware((to) => {
    // 1. Evitamos ejecución en el servidor (SSR) para que no haya líos de hidratación
    if (import.meta.server) return

    // 2. Obtenemos el token de la cookie manual
    const token = useCookie<string | null>('auth_token')

    // 3. Definimos las rutas que no necesitan protección
    const publicRoutes = ['/login', '/register', '/forgot-password', '/api-test']
    const isPublicRoute = publicRoutes.includes(to.path) || to.path === '/'

    // 4. Lógica de redirección proactiva

    // Caso A: Tiene token e intenta ir al login -> Pa' la casa (Home)
    if (token.value && to.path === '/login') {
        return navigateTo('/home')
    }

    // Caso B: No tiene token y la ruta es privada -> Pa'l login
    if (!token.value && !isPublicRoute) {
        console.warn('🚫 Acceso denegado: No se encontró el auth_token')
        return navigateTo('/login')
    }

    // Si pasa estas validaciones, Nuxt permite la carga de la página
    if (token.value) {
        console.log('🔑 Token validado en middleware')
    }
})
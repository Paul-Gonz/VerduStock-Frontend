// plugins/api.js (o .ts)
export default defineNuxtPlugin(() => {
    const config = useRuntimeConfig()
    
    const api = $fetch.create({
        baseURL: config.public.apiBase || 'http://localhost:8000', // Ajusta tu URL de Laravel
        credentials: 'include', // Importante para cookies de sesión
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        },
        async onResponse({ response }) {
            // Puedes agregar lógica adicional aquí
        },
        async onResponseError({ response }) {
            // Manejo de errores global
            if (response.status === 401) {
                // Redirigir al login si no está autenticado
                const router = useRouter()
                await router.push('/login')
            }
        }
    })
    
    return {
        provide: {
            api
        }
    }
})
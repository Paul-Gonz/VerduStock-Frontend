// app/composables/useApi.ts
export const useApi = () => {
    const config = useRuntimeConfig()

    // Creamos una instancia de fetch personalizada
    const api = $fetch.create({
        baseURL: config.public.apiBase as string,
        // Descomentar la linea 9 si se necesitan cookies en las peticiones
        //credentials: 'include',
        headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        },
        // Interceptor para manejar errores globalmente
        async onResponseError({ response }) {
            if (response.status === 419) {
                console.error('Sesión expirada o falta token CSRF')
            }
        }
    })

    // Función para obtener la cookie CSRF (Sanctum)
    const getCsrfCookie = async () => {
        return await api('/sanctum/csrf-cookie', {
            baseURL: config.public.laravelUrl as string // URL base sin el prefijo /api
        })
    }

    // Helper para peticiones que requieren protección
    const secureRequest = async (endpoint: string, options: any = {}) => {
        const isPost = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(options.method?.toUpperCase() || '')

        if (isPost) {
            await getCsrfCookie()
        }

        return api(endpoint, options)
    }

    return {
        api,
        getCsrfCookie,
        secureRequest
    }
}
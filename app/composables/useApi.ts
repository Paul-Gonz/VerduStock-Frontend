import { url } from "inspector/promises";

export const useApi = () => {
    const config = useRuntimeConfig()
    const token = useCookie('auth_token')

    const api = $fetch.create({
        baseURL: config.public.apiBase as string,
        // ESTA LÍNEA ES CLAVE: Evita el conflicto de CORS con cookies
        credentials: 'omit',

        async onRequest({ options }) {
            const headers = new Headers(options.headers);

            if (token.value) {
                headers.set('Authorization', `Bearer ${token.value}`);
                headers.set('Accept', 'application/json');
            }

            options.headers = headers;

            // Consol log para depuración: muestra la URL y si el token se inyectó correctamente
            // es temporal, eliminar antes de entregar el producto
            console.log('🚀 Petición saliente a:', options.baseURL + '' + url)
            if (token.value) {
                console.log('✅ Token inyectado:', token.value.substring(0, 10) + '...')
            } else {
                console.warn('❌ No hay token en la cookie')
            }
        },
        async onResponseError({ response }) {
            if (response.status === 401) {
                token.value = null
                // Usamos window.location para un reset limpio en caso de error de auth
                window.location.href = '/login'
            }
        }
    })

    return { api }
}
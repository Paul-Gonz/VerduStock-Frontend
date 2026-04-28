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
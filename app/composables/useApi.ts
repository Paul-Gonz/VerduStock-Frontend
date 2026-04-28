export const useApi = () => {
    const config = useRuntimeConfig()
    // Usamos una cookie para que el token persista al recargar la página
    const token = useCookie('auth_token')

    const api = $fetch.create({
        baseURL: config.public.apiBase as string,
        async onRequest({ options }) {
            // Creamos un objeto de cabeceras usando el estándar nativo
            const headers = new Headers(options.headers);

            if (token.value) {
                // Usamos .set() que es el método oficial y seguro para TS
                headers.set('Authorization', `Bearer ${token.value}`);
                headers.set('Accept', 'application/json');
            }

            // Asignamos las cabeceras de vuelta a las opciones
            options.headers = headers;
        },
        async onResponseError({ response }) {
            // Si el backend nos dice que el token expiró o es inválido (401)
            if (response.status === 401) {
                token.value = null
                navigateTo('/login')
            }
        }
    })

    return { api }
}
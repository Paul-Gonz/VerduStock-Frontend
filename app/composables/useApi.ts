export const useApi = () => {
    const config = useRuntimeConfig()

    const api = $fetch.create({
        baseURL: config.public.apiBase as string,
        credentials: 'include',
        headers: {
            'Accept': 'application/json',
        }
    })
    const secureRequest = async (endpoint: string, options: any = {}) => {
        return api(endpoint, options)
    }

    return {
        api,
        secureRequest
    }
}
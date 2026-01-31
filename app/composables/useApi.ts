export const useApi = () => {
    const config = useRuntimeConfig()

    const api = $fetch.create({
        baseURL: config.public.apiBase as string,
        headers: {
            'Accept': 'application/json',
        }
    })

    // Simplificamos secureRequest: ahora es solo un alias de api 
    // ya que no hay pasos previos de seguridad
    const secureRequest = async (endpoint: string, options: any = {}) => {
        return api(endpoint, options)
    }

    return {
        api,
        secureRequest
    }
}
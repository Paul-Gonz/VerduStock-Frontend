import { ref, computed } from 'vue'

export function usePerfil() {
    const { api } = useApi()

    // Estado del perfil
    const perfil = ref<any>(null)
    const loading = ref(false)
    const error = ref<string | null>(null)

    // Getter computado para saber si el perfil está cargado
    const isLoaded = computed(() => !!perfil.value)

    const fetchMyProfile = async () => {
        loading.value = true
        error.value = null
        try {
            const res: any = await api('/usuarios/profile/me', {
                method: 'GET'
            })

            // Laravel Resources suelen envolver la data en un objeto 'data'
            // Manejamos ambos casos por si acaso
            perfil.value = res?.data || res

            return { success: true, data: perfil.value }
        } catch (err: any) {
            console.error('Error al obtener perfil:', err)
            error.value = err.response?._data?.message || 'No se pudo cargar el perfil'
            return { success: false, error: error.value }
        } finally {
            loading.value = false
        }
    }

    // Para actualizar el perfil (opcional, si tienes el endpoint listo)
    const updateMyProfile = async (formData: any) => {
        loading.value = true
        error.value = null
        try {
            const res: any = await api('/usuarios/profile', {
                method: 'PUT',
                body: formData
            })
            perfil.value = res?.data || res
            return { success: true, message: 'Perfil actualizado' }
        } catch (err: any) {
            error.value = err.response?._data?.message || 'Error al actualizar'
            return { success: false, error: error.value }
        } finally {
            loading.value = false
        }
    }

    return {
        perfil,
        loading,
        error,
        isLoaded,
        fetchMyProfile,
        updateMyProfile
    }
}
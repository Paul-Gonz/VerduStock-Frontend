import { ref } from 'vue'

const config = useRuntimeConfig()

export function useProveedores() {
    const proveedores = ref<any[]>([])
    const loading = ref(false)
    const saving = ref(false)
    const deleting = ref(false)

    const fetchProveedores = async () => {
        loading.value = true
        try {
            const apiUrl = `${config.public.apiBase}/proveedores`
            const data: any = await $fetch(apiUrl, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
            proveedores.value = Array.isArray(data) ? data : (data.data || [])
        } catch (e) {
            console.error('Error al cargar datos', e)
        } finally {
            loading.value = false
        }
    }

    const saveProveedor = async (isEditing: boolean, form: any) => {
        if (!form.nombre) return false

        saving.value = true
        try {
            const apiUrl = isEditing ? `${config.public.apiBase}/proveedores/${form.id}` : `${config.public.apiBase}/proveedores`
            await $fetch(apiUrl, {
                method: isEditing ? 'PUT' : 'POST',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: form
            })
            await fetchProveedores()
            return true
        } catch (e) {
            console.error('Error al guardar', e)
            return false
        } finally {
            saving.value = false
        }
    }

    const deleteProveedor = async (id: number | string) => {
        if (!id) return false
        deleting.value = true
        try {
            const apiUrl = `${config.public.apiBase}/proveedores/${id}`
            await $fetch(apiUrl, {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
            await fetchProveedores()
            return true
        } catch (e) {
            console.error('Error eliminando', e)
            return false
        } finally {
            deleting.value = false
        }
    }

    return {
        proveedores,
        loading,
        saving,
        deleting,
        fetchProveedores,
        saveProveedor,
        deleteProveedor
    }
}

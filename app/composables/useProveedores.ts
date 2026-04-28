import { ref } from 'vue'

export function useProveedores() {
    // Inyectamos el motor central
    const { api } = useApi()

    const proveedores = ref<any[]>([])
    const loading = ref(false)
    const saving = ref(false)
    const deleting = ref(false)

    const fetchProveedores = async () => {
        loading.value = true
        try {
            const data: any = await api('/proveedores', {
                method: 'GET'
            })
            proveedores.value = Array.isArray(data) ? data : (data.data || [])
        } catch (e) {
            console.error('Error al cargar proveedores:', e)
        } finally {
            loading.value = false
        }
    }

    const saveProveedor = async (isEditing: boolean, form: any) => {
        if (!form.nombre) return false

        saving.value = true
        try {
            const url = isEditing ? `/proveedores/${form.id}` : '/proveedores'
            await api(url, {
                method: isEditing ? 'PUT' : 'POST',
                body: form
            })
            await fetchProveedores()
            return true
        } catch (e) {
            console.error('Error al guardar proveedor:', e)
            return false
        } finally {
            saving.value = false
        }
    }

    const deleteProveedor = async (id: number | string) => {
        if (!id) return false
        deleting.value = true
        try {
            await api(`/proveedores/${id}`, {
                method: 'DELETE'
            })
            await fetchProveedores()
            return true
        } catch (e) {
            console.error('Error eliminando proveedor:', e)
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
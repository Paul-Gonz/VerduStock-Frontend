import { ref } from 'vue'

export interface Gasto {
    id?: number;
    categoria: string;
    monto: number;
    fecha_gasto?: string;
    descripcion?: string;
    fecha?: string;
}

export const useGastos = () => {
    const { api } = useApi()

    const gastos = ref<Gasto[]>([])
    const totalGastos = ref<number>(0)
    const loading = ref<boolean>(false)
    const error = ref<string | null>(null)

    // 1. Cargar lista y total
    const fetchGastos = async (): Promise<void> => {
        loading.value = true
        error.value = null
        try {
            const [listaRes, totalRes]: any = await Promise.all([
                api('/gastos', { method: 'GET' }),
                api('/gastos/total', { method: 'GET' })
            ])

            gastos.value = listaRes.data || listaRes
            totalGastos.value = Number(totalRes?.total_gastos) || 0
        } catch (err: any) {
            error.value = err.data?.message || 'Error al obtener gastos'
        } finally {
            loading.value = false
        }
    }

    // 2. Guardar (Crear o Actualizar)
    const saveGasto = async (form: Gasto) => {
        loading.value = true
        const isUpdate = !!form.id
        const url = isUpdate ? `/gastos/${form.id}` : '/gastos'
        const method = isUpdate ? 'PUT' : 'POST'

        try {
            await api(url, { method, body: form })
            await fetchGastos() // Refrescar la tabla automáticamente
            return { success: true }
        } catch (err: any) {
            return {
                success: false,
                errors: err.data?.errors || { message: 'Error al procesar el gasto' }
            }
        } finally {
            loading.value = false
        }
    }

    // 3. Eliminar (Soft Delete)
    const deleteGasto = async (id: number): Promise<void> => {
        if (!confirm('¿Seguro que quieres eliminar este gasto?')) return

        try {
            await api(`/gastos/${id}`, { method: 'DELETE' })
            await fetchGastos()
        } catch (err) {
            console.error('Error al eliminar:', err)
        }
    }

    return {
        gastos,
        totalGastos,
        loading,
        error,
        fetchGastos,
        saveGasto,
        deleteGasto
    }
}
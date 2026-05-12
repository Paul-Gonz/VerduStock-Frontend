import { ref } from 'vue'

export interface Gasto {
    id?: number;
    categoria: string;
    monto: number;
    fecha_gasto: string; // Unificado
    descripcion?: string;
}

export const useGastos = () => {
    const { api } = useApi()
    const gastos = ref<Gasto[]>([])
    const totalGastos = ref<number>(0)
    const loading = ref<boolean>(false)
    const error = ref<string | null>(null)

    const fetchGastos = async (): Promise<void> => {
        loading.value = true
        error.value = null
        try {
            const [listaRes, totalRes]: any = await Promise.all([
                api('/gastos', { method: 'GET' }),
                api('/gastos/total', { method: 'GET' })
            ])

            // Mapeo de seguridad para asegurar que el campo se llame fecha_gasto
            const rawData = listaRes.data || listaRes
            gastos.value = rawData.map((g: any) => ({
                ...g,
                fecha_gasto: g.fecha_gasto || g.fecha // Soporta ambos nombres del server
            }))

            totalGastos.value = Number(totalRes?.total_gastos) || 0
        } catch (err: any) {
            error.value = err.data?.message || 'Error al obtener gastos'
        } finally {
            loading.value = false
        }
    }

    const saveGasto = async (form: Gasto) => {
        loading.value = true
        const isUpdate = !!form.id
        const url = isUpdate ? `/gastos/${form.id}` : '/gastos'
        const method = isUpdate ? 'PUT' : 'POST'
        try {
            await api(url, { method, body: form })
            await fetchGastos()
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

    const deleteGasto = async (id: number): Promise<void> => {
        try {
            await api(`/gastos/${id}`, { method: 'DELETE' })
            await fetchGastos()
        } catch (err) {
            console.error('Error al eliminar:', err)
        }
    }

    return { gastos, totalGastos, loading, error, fetchGastos, saveGasto, deleteGasto }
}
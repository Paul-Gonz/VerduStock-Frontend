import { ref, computed } from 'vue'

const config = useRuntimeConfig()
const API_URL = `${config.public.apiBase}/productos`

export function useProducts() {
    const productos = ref<any[]>([])
    const loading = ref(false)
    const searchQuery = ref('')
    const filterCondition = ref('todos') // Can be 'todos', 'por_vencer', 'vencidos', 'stock_bajo'

    const fetchProductos = async () => {
        loading.value = true
        try {
            const apiUrl = `${config.public.apiBase}/productos`
            const response: any = await $fetch(apiUrl, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
            // Handle if laravel returns data wrapped in data property
            productos.value = (Array.isArray(response.data) ? response.data : (response?.data?.data || response || [])); if (!Array.isArray(productos.value)) productos.value = [];
        } catch (error) {
            console.error('Error fetching products:', error)
        } finally {
            loading.value = false
        }
    }

    const createProducto = async (payload: any) => {
        try {
            const apiUrl = `${config.public.apiBase}/productos`
            const response: any = await $fetch(apiUrl, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: payload
            })
            await fetchProductos()
            return response
        } catch (error) {
            console.error('Error al crear producto:', error)
            throw error
        }
    }

    const updateProducto = async (id: number, payload: any) => {
        try {
            const apiUrl = `${config.public.apiBase}/productos/${id}`
            const response: any = await $fetch(apiUrl, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: payload
            })
            await fetchProductos()
            return response
        } catch (error) {
            console.error(`Error al actualizar producto ${id}:`, error)
            throw error
        }
    }

    const deleteProducto = async (id: number) => {
        try {
            const apiUrl = `${config.public.apiBase}/productos/${id}`
            await $fetch(apiUrl, {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
            await fetchProductos()
        } catch (error) {
            console.error(`Error al eliminar producto ${id}:`, error)
            throw error
        }
    }

    const tableRows = computed(() => {
        let filtered = productos.value.filter(p => {
            const provName = p.proveedor_nombre || p.proveedor?.nombre || p.proveedores?.nombre || ''
            const matchesSearch =
                (p.nombre || '').toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                provName.toLowerCase().includes(searchQuery.value.toLowerCase())

            if (!matchesSearch) return false

            let detalleObj = p.detalle || {}
            if (typeof detalleObj === 'string') {
                try { detalleObj = JSON.parse(detalleObj) } catch { detalleObj = {} }
            }

            const now = new Date()
            const expiryDateStr = detalleObj.fecha_vencimiento
            const isVencido = expiryDateStr && new Date(expiryDateStr) < now
            // Por vencer: within 7 days
            const isPorVencer = expiryDateStr && new Date(expiryDateStr) > now &&
                (new Date(expiryDateStr).getTime() - now.getTime()) < (7 * 24 * 60 * 60 * 1000)

            // Get threshold from localStorage if available, or fallback to default
            let stockThresholds: Record<string, number> = {}
            if (typeof window !== 'undefined') {
                try {
                    stockThresholds = JSON.parse(localStorage.getItem('inventory.stockThresholds') || '{}')
                } catch { stockThresholds = {} }
            }
            const stockMinimo = stockThresholds[p.id] || p.stock_minimo || 5

            const stockActualParaFiltro = detalleObj.stock_actual !== undefined ? Number(detalleObj.stock_actual) : Number(p.kilogramos || 0)
            const isStockBajo = stockActualParaFiltro <= stockMinimo

            if (filterCondition.value === 'vencidos' && !isVencido) return false
            if (filterCondition.value === 'por_vencer' && !isPorVencer) return false
            if (filterCondition.value === 'stock_bajo' && !isStockBajo) return false

            return true
        })

        return filtered.map(p => {
            const pCompra = Number(p.precio_compra) || 0
            const pVenta = Number(p.precio_venta_kg) || 0
            const kg = Number(p.kilogramos) || 0

            let detalleObj = p.detalle || {}
            if (typeof detalleObj === 'string') {
                try { detalleObj = JSON.parse(detalleObj) } catch { detalleObj = {} }
            }

            let stockThresholds: Record<string, number> = {}
            if (typeof window !== 'undefined') {
                try {
                    stockThresholds = JSON.parse(localStorage.getItem('inventory.stockThresholds') || '{}')
                } catch { stockThresholds = {} }
            }
            const stockMinimo = stockThresholds[p.id] || p.stock_minimo || 5

            const stockActual = detalleObj.stock_actual !== undefined ? Number(detalleObj.stock_actual) : kg;

            return {
                id: p.id,
                raw: p, // <-- añadido para disponer del ID de categoría y demás si se ocupa al editar
                nombre: p.nombre,
                categoria: p.categoria_nombre || p.categoria?.nombre || p.categorias?.nombre || 'N/A',
                proveedor: p.proveedor_nombre || p.proveedor?.nombre || p.proveedores?.nombre || 'N/A',
                stock_minimo: stockMinimo,
                cantidad_disponible: kg,
                stock_actual: stockActual,
                desperdicio: Number(p.desperdicio) || 0,
                precio_compra: pCompra,
                precio_venta: pVenta,
                ganancia_por_kg: pVenta - pCompra,
                ganancia_total: (pVenta - pCompra) * stockActual,
                fecha_registro: p.created_at,
                fecha_vencimiento: detalleObj.fecha_vencimiento || 'N/A'
            }
        })
    })

    return {
        productos,
        loading,
        searchQuery,
        filterCondition,
        fetchProductos,
        createProducto,
        updateProducto,
        deleteProducto,
        tableRows
    }
}

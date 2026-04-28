import { ref, computed } from 'vue'

export function useProducts() {
    const { api } = useApi() // <--- El motor central

    const productos = ref<any[]>([])
    const loading = ref(false)
    const searchQuery = ref('')
    const filterCondition = ref('todos')

    const fetchProductos = async () => {
        loading.value = true
        try {
            const response: any = await api('/productos', { method: 'GET' })

            // Simplificamos la asignación de data
            productos.value = Array.isArray(response.data)
                ? response.data
                : (response?.data?.data || response || [])

            if (!Array.isArray(productos.value)) productos.value = []
        } catch (error) {
            console.error('Error fetching products:', error)
        } finally {
            loading.value = false
        }
    }

    const createProducto = async (payload: any) => {
        try {
            const response = await api('/productos', {
                method: 'POST',
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
            const response = await api(`/productos/${id}`, {
                method: 'PUT',
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
            await api(`/productos/${id}`, { method: 'DELETE' })
            await fetchProductos()
        } catch (error) {
            console.error(`Error al eliminar producto ${id}:`, error)
            throw error
        }
    }

    // --- LÓGICA DE TABLA (Mantenida igual pero limpia) ---
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
            const isPorVencer = expiryDateStr && new Date(expiryDateStr) > now &&
                (new Date(expiryDateStr).getTime() - now.getTime()) < (7 * 24 * 60 * 60 * 1000)

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

            const stockActual = detalleObj.stock_actual !== undefined ? Number(detalleObj.stock_actual) : kg;

            return {
                id: p.id,
                raw: p,
                nombre: p.nombre,
                categoria: p.categoria_nombre || p.categoria?.nombre || p.categorias?.nombre || 'N/A',
                proveedor: p.proveedor_nombre || p.proveedor?.nombre || p.proveedores?.nombre || 'N/A',
                cantidad_disponible: kg,
                stock_actual: stockActual,
                precio_compra: pCompra,
                precio_venta: pVenta,
                ganancia_total: (pVenta - pCompra) * stockActual,
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
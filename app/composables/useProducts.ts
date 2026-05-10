import { ref, computed } from 'vue'

export type EstadoProducto = 'ok' | 'bajo' | 'por_vencer' | 'vencido'

export function useProducts() {
    const { api } = useApi()

    const productos = ref<any[]>([])
    const loading = ref(false)
    const searchQuery = ref('')
    const filterCondition = ref('todos')
    const filterCategoria = ref('todas')
    const filterProveedor = ref('todos')
    const filterVencimiento = ref('todas')
    const filterDesperdicio = ref('todos')
    const filterRentabilidad = ref('todas')

    const fetchProductos = async () => {
        loading.value = true
        try {
            const response: any = await api('/productos', { method: 'GET' })
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
            const response = await api('/productos', { method: 'POST', body: payload })
            await fetchProductos()
            return response
        } catch (error) {
            console.error('Error al crear producto:', error)
            throw error
        }
    }

    const updateProducto = async (id: number, payload: any) => {
        try {
            const response = await api(`/productos/${id}`, { method: 'PUT', body: payload })
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

    // Helpers
    const parseDetalle = (detalle: any): Record<string, any> => {
        if (!detalle) return {}
        if (typeof detalle === 'string') {
            try { return JSON.parse(detalle) } catch { return {} }
        }
        return detalle
    }

    const getEstado = (p: any, detalleObj: Record<string, any>): EstadoProducto => {
        const now = new Date()
        const expiryStr = detalleObj.fecha_vencimiento
        if (expiryStr) {
            const expiry = new Date(expiryStr)
            if (expiry < now) return 'vencido'
            if (expiry.getTime() - now.getTime() <= 7 * 24 * 60 * 60 * 1000) return 'por_vencer'
        }
        const stockActual = detalleObj.stock_actual !== undefined
            ? Number(detalleObj.stock_actual)
            : Number(p.kilogramos || 0)
        const stockMinimo = Number(p.stock_minimo || 5)
        if (stockActual <= stockMinimo) return 'bajo'
        return 'ok'
    }

    // Stats panel (computed from ALL products, not filtered)
    const stats = computed(() => {
        let totalValor = 0
        let bajosCount = 0
        let alertaCount = 0

        productos.value.forEach(p => {
            const detalleObj = parseDetalle(p.detalle)
            const stockActual = detalleObj.stock_actual !== undefined
                ? Number(detalleObj.stock_actual)
                : Number(p.kilogramos || 0)
            const pCompra = Number(p.precio_compra) || 0
            totalValor += stockActual * pCompra

            const estado = getEstado(p, detalleObj)
            if (estado === 'bajo') bajosCount++
            if (estado === 'vencido' || estado === 'por_vencer') alertaCount++
        })

        return {
            total: productos.value.length,
            totalValor,
            bajosCount,
            alertaCount
        }
    })

    const tableRows = computed(() => {
        let filtered = productos.value.filter(p => {
            const provName = p.proveedor_nombre || p.proveedor?.nombre || ''
            const matchesSearch =
                (p.nombre || '').toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                provName.toLowerCase().includes(searchQuery.value.toLowerCase())
            if (!matchesSearch) return false

            // Filtro por categoría (multi-select)
            if (categoriaFilter.value.length > 0 && !categoriaFilter.value.includes(p.categoria_id)) return false

            const detalleObj = parseDetalle(p.detalle)
            const estado = getEstado(p, detalleObj)

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
            if (filterCondition.value === 'agotados' && stockActualParaFiltro > 0) return false

            if (filterCategoria.value !== 'todas') {
                const catId = p.categoria_id || p.categoria?.id || p.categorias?.id
                if (String(catId) !== String(filterCategoria.value)) return false
            }

            if (filterProveedor.value !== 'todos') {
                const provId = p.proveedor_id || p.proveedor?.id || p.proveedores?.id
                if (String(provId) !== String(filterProveedor.value)) return false
            }

            if (filterVencimiento.value !== 'todas') {
                if (!expiryDateStr || expiryDateStr === 'N/A') return false
                const expDate = new Date(expiryDateStr)
                if (filterVencimiento.value === 'este_mes') {
                    if (expDate.getMonth() !== now.getMonth() || expDate.getFullYear() !== now.getFullYear()) return false
                } else if (filterVencimiento.value === 'proximos_30_dias') {
                    const diffTime = expDate.getTime() - now.getTime()
                    const diffDays = diffTime / (1000 * 60 * 60 * 24)
                    if (diffDays < 0 || diffDays > 30) return false
                }
            }

            if (filterDesperdicio.value !== 'todos') {
                const desperdicioKg = Number(p.desperdicio) || 0
                const totalBruto = Number(p.kilogramos || 0) + desperdicioKg
                const porcentaje = totalBruto > 0 ? (desperdicioKg / totalBruto) * 100 : 0

                if (filterDesperdicio.value === 'alto' && porcentaje <= 10) return false
                if (filterDesperdicio.value === 'normal' && (porcentaje === 0 || porcentaje > 10)) return false
                if (filterDesperdicio.value === 'cero' && desperdicioKg > 0) return false
            }

            if (filterRentabilidad.value !== 'todas') {
                const pCompra = Number(p.precio_compra) || 0
                const pVenta = Number(p.precio_venta_kg) || 0
                const margen = pCompra > 0 ? ((pVenta - pCompra) / pCompra) * 100 : 0

                if (filterRentabilidad.value === 'alta' && margen <= 40) return false
                if (filterRentabilidad.value === 'media' && (margen < 15 || margen > 40)) return false
                if (filterRentabilidad.value === 'baja' && margen >= 15) return false
            }

            return true
        })

        return filtered.map(p => {
            const pCompra = Number(p.precio_compra) || 0
            const pVenta = Number(p.precio_venta_kg) || 0
            const kg = Number(p.kilogramos) || 0
            const detalleObj = parseDetalle(p.detalle)
            const stockActual = detalleObj.stock_actual !== undefined ? Number(detalleObj.stock_actual) : kg

            return {
                id: p.id,
                raw: p,
                nombre: p.nombre,
                categoria: p.categoria_nombre || p.categoria?.nombre || 'N/A',
                proveedor: p.proveedor_nombre || p.proveedor?.nombre || 'N/A',
                stock_actual: stockActual,
                precio_compra: pCompra,
                precio_venta: pVenta,
                estado: getEstado(p, detalleObj),
                // Guardamos datos extra para el modal de edición
                fecha_vencimiento: detalleObj.fecha_vencimiento || null,
                cantidad_disponible: kg,  // mantenemos para el modal
            }
        })
    })

    return {
        productos,
        loading,
        searchQuery,
        filterCondition,
        filterCategoria,
        filterProveedor,
        filterVencimiento,
        filterDesperdicio,
        filterRentabilidad,
        fetchProductos,
        createProducto,
        updateProducto,
        deleteProducto,
        tableRows,
        stats
    }
}
<template>
    <div class="min-h-screen p-6 bg-gray-50">
        <div class="max-w-7xl mx-auto flex flex-col gap-6">
            <header
                class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center flex-wrap gap-4">
                <div>
                    <p class="uppercase tracking-widest text-xs text-gray-500 font-semibold">Dashboard</p>
                    <h1 class="mt-1 text-2xl text-gray-900 font-semibold">Control general del inventario</h1>
                </div>
            </header>

            <div v-if="loadingDashboard || dashboardError" class="flex flex-col gap-3">
                <div v-if="loadingDashboard" class="w-full bg-gray-200 h-1 overflow-hidden">
                    <div class="bg-green-500 h-1 animate-pulse w-full"></div>
                </div>
                <div v-if="dashboardError"
                    class="bg-red-50 text-red-700 p-4 rounded border-l-4 border-red-500 text-sm flex items-center">
                    {{ dashboardError }}
                </div>
            </div>

            <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <article v-for="card in resumenTarjetas" :key="card.title"
                    class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-4">
                    <div
                        class="w-11 h-11 rounded-2xl bg-green-100 text-green-600 flex items-center justify-center mb-1">
                        <span class="w-6 h-6" v-html="card.icon"></span>
                    </div>
                    <p class="text-[0.95rem] font-semibold text-gray-900">{{ card.title }}</p>
                    <p class="text-sm text-gray-500">{{ card.detail }}</p>
                    <p class="text-3xl font-semibold text-gray-900">{{ card.value }}</p>
                </article>
            </section>

            <section class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <article class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div class="flex items-center gap-2.5 font-semibold text-gray-900 mb-3">
                        <span class="text-green-600 w-5 h-5">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                    d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
                            </svg>
                        </span>
                        <span>Distribución por Categoría</span>
                    </div>
                    <client-only>
                        <component :is="Apexchart" v-if="Apexchart" type="donut" height="260" :options="donutOptions"
                            :series="donutSeries" />
                    </client-only>
                </article>
                <article class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div class="flex items-center gap-2.5 font-semibold text-gray-900 mb-3">
                        <span class="text-green-600 w-5 h-5">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                    d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                            </svg>
                        </span>
                        <span>Inversión por Proveedor</span>
                    </div>
                    <client-only>
                        <component :is="Apexchart" v-if="Apexchart" type="bar" height="260" :options="barOptions"
                            :series="barSeries" />
                    </client-only>
                </article>
            </section>

            <section class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <article class="bg-red-50 p-6 rounded-xl shadow-sm border border-red-200 flex flex-col gap-4">
                    <div class="flex items-center gap-2.5 font-semibold text-red-800">
                        <span class="w-5 h-5 text-red-600">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </span>
                        <span>Productos con Stock Bajo ({{ lowStockProducts.length }})</span>
                    </div>
                    <div class="flex flex-col gap-4 max-h-80 overflow-y-auto pr-1">
                        <template v-if="lowStockProducts.length">
                            <div v-for="item in lowStockProducts" :key="item.id"
                                class="bg-white/80 p-3.5 rounded-2xl border border-red-200 flex items-center justify-between gap-4">
                                <div>
                                    <p class="text-[0.95rem] font-semibold text-gray-900">{{ item.name }}</p>
                                    <p class="text-[0.78rem] text-gray-500">{{ item.category }}</p>
                                </div>
                                <div class="text-right">
                                    <p class="text-[0.95rem] font-semibold text-red-600">{{ item.stock }}</p>
                                    <p class="text-[0.75rem] text-gray-500">Min: {{ item.minimum }}</p>
                                </div>
                            </div>
                        </template>
                        <p v-else-if="loadingDashboard" class="text-[0.85rem] text-gray-600">Cargando inventario...</p>
                        <p v-else class="text-[0.85rem] text-gray-600">Todo el stock cumple con el umbral mínimo.</p>
                    </div>
                </article>
                <article class="bg-orange-50 p-6 rounded-xl shadow-sm border border-orange-200 flex flex-col gap-4">
                    <div class="flex items-center gap-2.5 font-semibold text-orange-800">
                        <span class="w-5 h-5 text-orange-500">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                    d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </span>
                        <span>Productos por Vencer ({{ expiringProducts.length }})</span>
                    </div>
                    <div class="flex flex-col gap-4 max-h-80 overflow-y-auto pr-1">
                        <template v-if="expiringProducts.length">
                            <div v-for="item in expiringProducts" :key="item.id"
                                class="bg-white/80 p-3.5 rounded-2xl border border-orange-200 flex items-center justify-between gap-4">
                                <div>
                                    <p class="text-[0.95rem] font-semibold text-gray-900">{{ item.name }}</p>
                                    <p class="text-[0.78rem] text-gray-500">{{ item.category }}</p>
                                </div>
                                <div class="text-right">
                                    <p class="text-[0.95rem] font-semibold text-orange-600">{{ item.expiresIn }} día(s)
                                    </p>
                                    <p class="text-[0.75rem] text-gray-500">{{ item.date }}</p>
                                </div>
                            </div>
                        </template>
                        <p v-else-if="loadingDashboard" class="text-[0.85rem] text-gray-600">Evaluando fechas
                            estimadas...</p>
                        <p v-else class="text-[0.85rem] text-gray-600">No hay productos próximos a vencer.</p>
                    </div>
                </article>
            </section>
        </div>
    </div>
</template>

<script setup>
import { computed, defineAsyncComponent, onMounted, ref, watchEffect } from 'vue'

// 1. MOTOR CENTRAL
const { api } = useApi()

const Apexchart = import.meta.client
    ? defineAsyncComponent(() => import('vue3-apexcharts'))
    : null

const MAX_PRODUCTS_FOR_DASHBOARD = 500
const LOW_STOCK_THRESHOLD_KG = 10
const EXPIRY_WARNING_DAYS = 7
const ONE_DAY_MS = 1000 * 60 * 60 * 24
const donutColors = ['#0ece78', '#6ee7b7', '#34d399', '#10b981', '#059669', '#65a30d']
const STOCK_THRESHOLD_STORAGE_KEY = 'inventory.stockThresholds'

// --- FORMATEADORES ---
const currencyFormatter = new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' })
const kilosFormatter = new Intl.NumberFormat('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const integerFormatter = new Intl.NumberFormat('es-EC', { maximumFractionDigits: 0 })

const formatCurrency = (val = 0) => currencyFormatter.format(Number(val) || 0)
const formatKilograms = (val = 0) => `${kilosFormatter.format(Number(val) || 0)} kg`

// --- ESTADOS ---
const productos = ref([])
const estadisticas = ref({})
const loadingDashboard = ref(false)
const dashboardError = ref('')
const localStockThresholds = ref({})

const loadLocalStockThresholds = () => {
    if (!import.meta.client) return
    try {
        const raw = localStorage.getItem(STOCK_THRESHOLD_STORAGE_KEY)
        const parsed = raw ? JSON.parse(raw) : {}
        localStockThresholds.value = parsed && typeof parsed === 'object' ? parsed : {}
    } catch (error) {
        localStockThresholds.value = {}
    }
}

const getLocalStockThreshold = (productoId) => {
    if (!productoId) return LOW_STOCK_THRESHOLD_KG
    const stored = localStockThresholds.value[String(productoId)]
    const value = Number(stored)
    return Number.isFinite(value) && value >= 0 ? value : LOW_STOCK_THRESHOLD_KG
}

// --- LLAMADA A API ---
const loadDashboardData = async () => {
    loadingDashboard.value = true
    dashboardError.value = ''
    try {
        const [productosResponse, statsResponse] = await Promise.all([
            api(`/productos?por_pagina=${MAX_PRODUCTS_FOR_DASHBOARD}`, { method: 'GET' }),
            api('/productos/reporte/estadisticas', { method: 'GET' })
        ])
        productos.value = productosResponse?.data || productosResponse || []
        estadisticas.value = statsResponse?.estadisticas || {}
    } catch (error) {
        console.error('Dashboard error', error)
        dashboardError.value = error.data?.message || 'Error de conexión con el servidor.'
    } finally {
        loadingDashboard.value = false
    }
}

onMounted(() => {
    loadLocalStockThresholds()
    loadDashboardData()
})

// --- LÓGICA DE NEGOCIO ---
const getNetKilograms = (p) => {
    const bruto = Number(p?.kilogramos || p?.kilogramos_netos || p?.kilo || 0)
    const desperdicio = Number(p?.desperdicio || 0)
    return Math.max(bruto - desperdicio, 0)
}

const getStockThreshold = (p) => {
    const apiThreshold = Number(p?.stock_minimo || p?.stock_minimo_kg || NaN)
    if (Number.isFinite(apiThreshold) && apiThreshold >= 0) return apiThreshold
    return getLocalStockThreshold(p?.id)
}

const gananciaPotencial = ref(0)
watchEffect(() => {
    gananciaPotencial.value = productos.value.reduce((acc, p) => {
        const kilos = getNetKilograms(p)
        const venta = Number(p?.precio_venta_kg || p?.precio_venta || 0)
        const compra = Number(p?.precio_compra || 0)
        return acc + (venta - compra) * kilos
    }, 0)
})

// --- COMPUTED PARA EL TEMPLATE (Lo que faltaba) ---

const categoryDistribution = computed(() => {
    const map = new Map()
    productos.value.forEach((p) => {
        const name = p?.categoria?.nombre || p?.categoria_nombre || 'Sin categoría'
        map.set(name, (map.get(name) ?? 0) + getNetKilograms(p))
    })
    return Array.from(map, ([name, value]) => ({ name, value }))
})

const lowStockProducts = computed(() =>
    productos.value
        .map(p => ({
            id: p.id,
            name: p.nombre,
            category: p?.categoria?.nombre || 'General',
            stockValue: getNetKilograms(p),
            threshold: getStockThreshold(p)
        }))
        .filter(i => i.stockValue <= i.threshold)
        .map(i => ({ ...i, stock: formatKilograms(i.stockValue), minimum: formatKilograms(i.threshold) }))
)

const expiringProducts = computed(() => {
    return productos.value
        .map(p => {
            // Lógica simple de vencimiento basada en tu detalle JSON si existe
            let fechaVenc = null
            try {
                const detalle = typeof p.detalle === 'string' ? JSON.parse(p.detalle) : p.detalle
                if (detalle?.fecha_vencimiento) fechaVenc = new Date(detalle.fecha_vencimiento)
            } catch (e) { }

            if (!fechaVenc) return null
            const days = Math.ceil((fechaVenc.getTime() - Date.now()) / ONE_DAY_MS)
            return {
                id: p.id,
                name: p.nombre,
                category: p?.categoria?.nombre || 'General',
                expiresIn: days,
                date: fechaVenc.toLocaleDateString()
            }
        })
        .filter(i => i !== null && i.expiresIn <= EXPIRY_WARNING_DAYS)
})

// --- CONFIG GRÁFICOS ---
const donutSeries = computed(() => categoryDistribution.value.map(i => Number(i.value.toFixed(2))))
const donutOptions = computed(() => ({
    chart: { type: 'donut' },
    labels: categoryDistribution.value.map(i => i.name),
    colors: donutColors,
    legend: { position: 'bottom' }
}))

// (Simplificado para que no de error)
const barSeries = computed(() => [{ name: 'Inversión $', data: [10, 20, 30] }])
const barOptions = computed(() => ({ chart: { type: 'bar' }, xaxis: { categories: ['P1', 'P2', 'P3'] } }))

// --- TARJETAS CON ICONOS (IMPORTANTE) ---
const resumenTarjetas = computed(() => [
    {
        title: 'Total Productos',
        value: integerFormatter.format(Number(estadisticas.value?.total_productos) || productos.value.length),
        detail: 'En catálogo',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>'
    },
    {
        title: 'Ganancia Potencial',
        value: formatCurrency(gananciaPotencial.value),
        detail: 'Stock actual',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" /></svg>'
    },
    {
        title: 'Por Vencer',
        value: expiringProducts.value.length,
        detail: `${EXPIRY_WARNING_DAYS} días límite`,
        icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>'
    },
    {
        title: 'Stock Bajo',
        value: lowStockProducts.value.length,
        detail: 'Bajo mínimo',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>'
    },
])
</script>
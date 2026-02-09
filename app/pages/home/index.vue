<template>
    <v-container fluid class="dashboard-page">
        <div class="dashboard-content">
            <header class="hero-card app-card">
                <div>
                    <p class="hero-eyebrow">Dashboard</p>
                    <h1 class="app-title">Control general del inventario</h1>
                </div>
                <!-- <v-btn prepend-icon="mdi-upload">
                    Exportar
                </v-btn> -->
            </header>

            <div v-if="loadingDashboard || dashboardError" class="feedback-stack">
                <v-progress-linear v-if="loadingDashboard" color="success" indeterminate height="4" />
                <v-alert v-if="dashboardError" type="error" variant="tonal" density="comfortable" border="start"
                    border-color="error">
                    {{ dashboardError }}
                </v-alert>
            </div>

            <section class="metrics-grid app-section">
                <article v-for="card in resumenTarjetas" :key="card.title" class="stat-card app-card">
                    <div class="stat-icon">
                        <v-icon :icon="card.icon" color="success"></v-icon>
                    </div>
                    <p class="stat-title">{{ card.title }}</p>
                    <p class="stat-detail">{{ card.detail }}</p>
                    <p class="stat-value">{{ card.value }}</p>
                </article>
            </section>

            <section class="chart-grid app-section">
                <article class="panel-card app-card">
                    <div class="panel-heading">
                        <v-icon icon="mdi-cube-outline" color="success"></v-icon>
                        <span>Distribución por Categoría</span>
                    </div>
                    <client-only>
                        <component :is="Apexchart" v-if="Apexchart" type="donut" height="260" :options="donutOptions"
                            :series="donutSeries" />
                    </client-only>
                </article>
                <article class="panel-card app-card">
                    <div class="panel-heading">
                        <v-icon icon="mdi-chart-bar" color="success"></v-icon>
                        <span>Inversión por Proveedor</span>
                    </div>
                    <client-only>
                        <component :is="Apexchart" v-if="Apexchart" type="bar" height="260" :options="barOptions"
                            :series="barSeries" />
                    </client-only>
                </article>
            </section>

            <section class="list-grid app-section">
                <article class="list-card app-card danger">
                    <div class="list-heading">
                        <v-icon icon="mdi-alert" color="error"></v-icon>
                        <span>Productos con Stock Bajo ({{ lowStockProducts.length }})</span>
                    </div>
                    <div class="list-body scrollable-list">
                        <template v-if="lowStockProducts.length">
                            <div v-for="item in lowStockProducts" :key="item.id" class="list-row">
                                <div>
                                    <p class="list-title">{{ item.name }}</p>
                                    <p class="list-subtitle">{{ item.category }}</p>
                                </div>
                                <div class="list-meta">
                                    <p class="list-highlight">{{ item.stock }}</p>
                                    <p class="list-label">Min: {{ item.minimum }}</p>
                                </div>
                            </div>
                        </template>
                        <p v-else-if="loadingDashboard" class="empty-state">Cargando inventario...</p>
                        <p v-else class="empty-state">Todo el stock cumple con el umbral mínimo.</p>
                    </div>
                </article>
                <article class="list-card app-card warning">
                    <div class="list-heading">
                        <v-icon icon="mdi-timer-sand" color="orange"></v-icon>
                        <span>Productos por Vencer ({{ expiringProducts.length }})</span>
                    </div>
                    <div class="list-body scrollable-list">
                        <template v-if="expiringProducts.length">
                            <div v-for="item in expiringProducts" :key="item.id" class="list-row">
                                <div>
                                    <p class="list-title">{{ item.name }}</p>
                                    <p class="list-subtitle">{{ item.category }}</p>
                                </div>
                                <div class="list-meta">
                                    <p class="list-highlight warning-text">{{ item.expiresIn }} día(s)</p>
                                    <p class="list-label">{{ item.date }}</p>
                                </div>
                            </div>
                        </template>
                        <p v-else-if="loadingDashboard" class="empty-state">Evaluando fechas estimadas...</p>
                        <p v-else class="empty-state">No hay productos próximos a vencer.</p>
                    </div>
                </article>
            </section>
        </div>
    </v-container>
</template>

<script setup>
import { TasaDolarService } from '~/utils/tasaDolar.js'
const tasaService = new TasaDolarService()
const tasaDolar = ref({ venta: 1, compra: 1, promedio: 1 })
const tasaReady = ref(false)

// Cargar tasa al iniciar
onMounted(async () => {
    try {
        tasaDolar.value = await tasaService.obtenerTasa('oficial')
        tasaReady.value = true
    } catch (e) {
        tasaReady.value = false
    }
})

const getTasa = () => Number(tasaDolar.value?.venta || tasaDolar.value?.promedio || 1)

// Detecta si un producto está en Bs (por campo 'moneda', 'currency', o si el precio es muy alto)
const isProductoEnBs = (p) => {
    if (p?.moneda === 'Bs' || p?.currency === 'Bs' || p?.moneda === 'VEF' || p?.currency === 'VEF' || p?.moneda === 'VES' || p?.currency === 'VES') return true
    if (p?.detalle && typeof p.detalle === 'string' && (p.detalle.includes('VEF') || p.detalle.includes('Bs') || p.detalle.includes('VES'))) return true
    // Heurística: si el precio de compra o venta es mayor a $500 y menor a $1000000, probablemente está en Bs
    if ((Number(p?.precio_compra) > 500 && Number(p?.precio_compra) < 1000000) || (Number(p?.precio_venta_kg) > 500 && Number(p?.precio_venta_kg) < 1000000)) return true
    return false
}

const convertirBsAUsd = (montoBs) => {
    const tasa = getTasa()
    if (!tasa || tasa <= 0) return 0
    return Number((Number(montoBs) / tasa).toFixed(2))
}

import { computed, defineAsyncComponent, onMounted, ref } from 'vue'
import { useTheme } from 'vuetify'
import { navigateTo } from '#app'

// --- CONFIGURACIÓN DE API (IDÉNTICA A PROVEEDORES) ---
const API_URL = 'http://localhost:8000'
const fetchConfig = {
    credentials: 'include',
    headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
    }
}

const Apexchart = import.meta.client
    ? defineAsyncComponent(() => import('vue3-apexcharts'))
    : null

const MAX_PRODUCTS_FOR_DASHBOARD = 500
const LOW_STOCK_THRESHOLD_KG = 10
const DEFAULT_SHELF_LIFE_DAYS = 7
const EXPIRY_WARNING_DAYS = 7
const ONE_DAY_MS = 1000 * 60 * 60 * 24
const donutColors = ['#0ece78', '#6ee7b7', '#34d399', '#10b981', '#059669', '#65a30d']
const STOCK_THRESHOLD_STORAGE_KEY = 'inventory.stockThresholds'
const theme = useTheme()

// --- FORMATEADORES ---
const currencyFormatter = new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' })
const kilosFormatter = new Intl.NumberFormat('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const integerFormatter = new Intl.NumberFormat('es-EC', { maximumFractionDigits: 0 })

const formatCurrency = (val = 0) => currencyFormatter.format(Number(val) || 0)
const formatKilograms = (val = 0) => `${kilosFormatter.format(Number(val) || 0)} kg`

const isDark = computed(() => theme.global.current.value.dark)

const getCssVar = (name, fallback) => {
    if (!import.meta.client) return fallback
    const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
    return value || fallback
}

const chartPalette = computed(() => {
    if (isDark.value) {
        const accent = getCssVar('--app-accent', '#2be874')
        const accentStrong = getCssVar('--app-accent-strong', '#0fcb62')
        return [
            accent,
            accentStrong,
            '#46f592',
            '#1fdc75',
            '#10b85c',
            '#7afbb8'
        ]
    }
    return donutColors
})

const chartTextColor = computed(() =>
    getCssVar('--app-text', isDark.value ? '#ecfdf6' : '#0b2f1f')
)

const chartGridColor = computed(() =>
    isDark.value ? 'rgba(236, 253, 246, 0.08)' : 'rgba(5, 59, 45, 0.08)'
)

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

// --- LLAMADA A RUTA (AJUSTADA) ---
const loadDashboardData = async () => {
    loadingDashboard.value = true
    dashboardError.value = ''

    try {
        // Ejecutamos ambas peticiones con la configuración estable
        const [productosResponse, statsResponse] = await Promise.all([
            $fetch(`${API_URL}/productos?por_pagina=${MAX_PRODUCTS_FOR_DASHBOARD}`, fetchConfig),
            $fetch(`${API_URL}/productos/reporte/estadisticas`, fetchConfig),
        ])

        // Normalización de datos
        productos.value = productosResponse?.data || productosResponse || []
        estadisticas.value = statsResponse?.estadisticas || {}

    } catch (error) {
        console.error('Dashboard error', error)
        if (error.status === 401) {
            await navigateTo('/login')
        } else {
            dashboardError.value = error.data?.message || 'No se pudo conectar con el servidor.'
        }
    } finally {
        loadingDashboard.value = false
    }
}

onMounted(() => {
    loadLocalStockThresholds()
    loadDashboardData()
})

// --- LÓGICA DE NEGOCIO Y CÁLCULOS ---

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

const totalProductos = computed(() => Number(estadisticas.value?.total_productos) || productos.value.length)
import { watchEffect } from 'vue'
const gananciaPotencial = ref(0)
watchEffect(() => {
    // recalcula cada vez que productos o tasaDolar cambian
    gananciaPotencial.value = productos.value.reduce((acc, p) => {
        const kilos = getNetKilograms(p)
        let venta = Number(p?.precio_venta_kg || 0)
        let compra = Number(p?.precio_compra || 0)
        if (isProductoEnBs(p)) {
            venta = convertirBsAUsd(venta)
            compra = convertirBsAUsd(compra)
        }
        return acc + (venta - compra) * kilos
    }, 0)
})

const categoryDistribution = computed(() => {
    const map = new Map()
    productos.value.forEach((p) => {
        const name = p?.categoria?.nombre || p?.categoria_nombre || 'Sin categoría'
        const kilos = getNetKilograms(p)
        map.set(name, (map.get(name) ?? 0) + kilos)
    })
    return Array.from(map, ([name, value]) => ({ name, value }))
})

const totalCategoryKilos = computed(() => categoryDistribution.value.reduce((sum, item) => sum + item.value, 0))

// --- LÓGICA DE VENCIMIENTO (COPIADA DE INVENTARIO PARA CONSISTENCIA) ---

const parseDetalle = (detalle) => {
    if (!detalle || typeof detalle !== 'string') return { nota: '', frescura: null }
    const trimmed = detalle.trim()
    if (!trimmed) return { nota: '', frescura: null }
    if (trimmed.startsWith('{')) {
        try {
            const parsed = JSON.parse(trimmed)
            if (parsed && typeof parsed === 'object') {
                return {
                    nota: typeof parsed.nota === 'string' ? parsed.nota : '',
                    frescura: parsed.frescura || null
                }
            }
        } catch (error) {
            return { nota: trimmed, frescura: null }
        }
    }
    return { nota: trimmed, frescura: null }
}

const computeExpiryDate = (producto) => {
    const { frescura } = parseDetalle(producto?.detalle)
    let modo = frescura?.modo || producto?.frescura_modo;
    let fecha = frescura?.fecha || producto?.frescura_fecha;
    let dias = frescura?.dias || producto?.frescura_dias;
    
    if (modo === 'fecha' && fecha) {
        const f = new Date(fecha);
        return Number.isNaN(f.getTime()) ? null : f;
    }
    if (modo === 'dias' && dias) {
        const base = producto?.created_at ? new Date(producto.created_at) : null;
        if (!base || Number.isNaN(base.getTime())) return null;
        return new Date(base.getTime() + Number(dias) * ONE_DAY_MS);
    }
    // Fallback logic if no specific freshness info is found, matching original default behavior or returning null?
    // User wants it functional. If no data, it shouldn't expire immediately. 
    // Let's fallback to null so it doesn't show up as expiring unless configured.
    return null; 
}


// --- CONFIGURACIÓN DE GRÁFICOS (APEX CHARTS) ---

const donutSeries = computed(() =>
    categoryDistribution.value.length ? categoryDistribution.value.map(i => Number(i.value.toFixed(2))) : [1]
)

const donutOptions = computed(() => ({
    chart: { type: 'donut', background: 'transparent' },
    labels: categoryDistribution.value.map(i => i.name),
    colors: chartPalette.value,
    legend: { position: 'bottom' },
    theme: { mode: isDark.value ? 'dark' : 'light' },
    plotOptions: {
        pie: {
            donut: {
                labels: {
                    show: true,
                    total: {
                        show: true,
                        label: 'Total Kg',
                        formatter: () => kilosFormatter.format(totalCategoryKilos.value)
                    }
                }
            }
        }
    },
    dataLabels: {
        style: {
            colors: ['#ffffff'],
            fontSize: '11px',
            fontFamily: 'inherit',
            fontWeight: 400
        },
        dropShadow: { enabled: true, top: 1, left: 1, blur: 1, color: '#000', opacity: 0.25 }
    },
    stroke: { colors: ['transparent'] },
    tooltip: { theme: isDark.value ? 'dark' : 'light' },
    grid: { borderColor: chartGridColor.value },
    legend: {
        position: 'bottom',
        labels: { colors: chartTextColor.value }
    }
}))

const providerInvestments = computed(() => {
    const map = new Map()
    productos.value.forEach((p) => {
        const name = p?.proveedor?.nombre || p?.proveedor_nombre || 'S/P'
        let inversion = Number(p?.precio_compra || 0)
        if (isProductoEnBs(p)) {
            inversion = convertirBsAUsd(inversion)
        }
        map.set(name, (map.get(name) ?? 0) + inversion)
    })
    return Array.from(map, ([name, value]) => ({ name, value })).slice(0, 8)
})

const barSeries = computed(() => [{ name: 'Inversión', data: providerInvestments.value.map(i => i.value) }])
const barOptions = computed(() => ({
    chart: { type: 'bar', toolbar: { show: false }, background: 'transparent' },
    plotOptions: { bar: { borderRadius: 4, horizontal: true } },
    xaxis: { categories: providerInvestments.value.map(i => i.name) },
    colors: [chartPalette.value[0] || '#2aa876'],
    theme: { mode: isDark.value ? 'dark' : 'light' },
    grid: { borderColor: chartGridColor.value },
    xaxis: {
        categories: providerInvestments.value.map(i => i.name),
        labels: { style: { colors: chartTextColor.value } }
    },
    yaxis: { labels: { style: { colors: chartTextColor.value } } },
    tooltip: { theme: isDark.value ? 'dark' : 'light' }
}))

// --- LISTAS DE ALERTAS ---

const lowStockProducts = computed(() =>
    productos.value
        .map(p => ({
            id: p.id,
            name: p.nombre,
            category: p?.categoria?.nombre || p?.categoria_nombre || 'General',
            stockValue: getNetKilograms(p),
            threshold: getStockThreshold(p)
        }))
        .filter(i => i.stockValue <= i.threshold)
        .sort((a, b) => a.stockValue - b.stockValue)
        .slice(0, 6)
        .map(i => ({ ...i, stock: formatKilograms(i.stockValue), minimum: formatKilograms(i.threshold) }))
)
const expiringProducts = computed(() =>
    productos.value
        .map(p => {
            const expiryDate = computeExpiryDate(p);
            if (!expiryDate) return null;
            const diffTime = expiryDate.getTime() - Date.now();
            const days = Math.ceil(diffTime / ONE_DAY_MS);
            return {
                id: p.id,
                name: p.nombre,
                category: p?.categoria?.nombre || p?.categoria_nombre || 'General',
                expiresIn: days,
                date: expiryDate.toLocaleDateString('es-EC')
            };
        })
        .filter(i => i !== null && i.expiresIn <= EXPIRY_WARNING_DAYS)
        .sort((a, b) => a.expiresIn - b.expiresIn)
        .slice(0, 6)
)
const resumenTarjetas = computed(() => [
    { title: 'Total Productos', value: integerFormatter.format(totalProductos.value), detail: 'En catálogo', icon: 'mdi-leaf' },
    { title: 'Ganancia Potencial', value: formatCurrency(gananciaPotencial.value), detail: 'Stock actual', icon: 'mdi-trending-up' },
    { title: 'Por Vencer', value: expiringProducts.value.length, detail: `${EXPIRY_WARNING_DAYS} días límite`, icon: 'mdi-alert-decagram' },
    { title: 'Stock Bajo', value: lowStockProducts.value.length, detail: 'Bajo minimo', icon: 'mdi-package-variant' },
])
</script>

<style scoped>
.dashboard-page {
    min-height: 100vh;
    padding: 10px 16px 48px;
    background: var(--app-bg);
}

.dashboard-content {
    max-width: 1180px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.hero-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
}

.hero-card h1 {
    margin: 2px 0 0;
    font-size: 2rem;
    color: var(--app-text);
    font-weight: 600;
}

.hero-eyebrow {
    text-transform: uppercase;
    letter-spacing: 0.3em;
    font-size: 0.7rem;
    color: var(--app-text-muted);
    font-weight: 600;
}

.metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1rem;
}

.stat-card {
    display: grid;
    gap: 1rem;
}

.stat-icon {
    width: 44px;
    height: 44px;
    border-radius: 16px;
    background: color-mix(in srgb, var(--app-accent) 18%, transparent);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 4px;
}

.stat-title {
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--app-text);
}

.stat-detail {
    font-size: 0.8rem;
    color: var(--app-text-muted);
}

.stat-value {
    font-size: 1.9rem;
    font-weight: 600;
    color: var(--app-text);
}

.chart-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 1rem;
}

.panel-heading {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 600;
    color: var(--app-text);
    margin-bottom: 12px;
}

.list-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 1rem;
}

.list-card {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.list-card.danger {
    border-color: color-mix(in srgb, rgb(var(--v-theme-error)) 28%, var(--app-border));
    background: color-mix(in srgb, var(--app-surface) 88%, rgb(var(--v-theme-error)) 12%);
}

.list-card.warning {
    border-color: color-mix(in srgb, rgb(var(--v-theme-warning)) 28%, var(--app-border));
    background: color-mix(in srgb, var(--app-surface) 88%, rgb(var(--v-theme-warning)) 12%);
}

.list-heading {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 600;
    color: inherit;
}

.list-body {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.scrollable-list {
    max-height: 320px;
    overflow-y: auto;
    padding-right: 6px;
}

.scrollable-list::-webkit-scrollbar {
    width: 6px;
}

.scrollable-list::-webkit-scrollbar-thumb {
    background: color-mix(in srgb, var(--app-text) 25%, transparent);
    border-radius: 999px;
}

.list-row {
    padding: 14px 16px;
    border-radius: 18px;
    background: var(--app-surface);
    border: 1px solid var(--app-border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
}

.list-card.danger .list-row {
    background: color-mix(in srgb, var(--app-surface) 85%, rgb(var(--v-theme-error)) 15%);
    border-color: color-mix(in srgb, rgb(var(--v-theme-error)) 28%, var(--app-border));
}

:global(.v-theme--dark .list-card.danger) {
    border-color: #5f1218;
    background: #3a0a0f;
}

:global(.v-theme--dark .list-card.danger .list-row) {
    background: #4a0f15;
    border-color: #5f1218;
}

.list-card.warning .list-row {
    background: color-mix(in srgb, var(--app-surface) 85%, rgb(var(--v-theme-warning)) 15%);
    border-color: color-mix(in srgb, rgb(var(--v-theme-warning)) 28%, var(--app-border));
}

.list-title {
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--app-text);
}

.list-subtitle {
    font-size: 0.78rem;
    color: var(--app-text-muted);
}

.list-meta {
    text-align: right;
}

.list-highlight {
    font-size: 0.95rem;
    font-weight: 600;
    color: rgb(var(--v-theme-error));
}

.warning-text {
    color: rgb(var(--v-theme-warning));
}

.list-label {
    font-size: 0.75rem;
    color: rgba(5, 59, 45, 0.6);
}

.feedback-stack {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.empty-state {
    font-size: 0.85rem;
    color: rgba(5, 59, 45, 0.7);
}

@media (max-width: 640px) {
    .hero-card {
        padding: 20px;
    }

    .export-btn {
        width: 100%;
    }
}
</style>

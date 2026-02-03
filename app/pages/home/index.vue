<template>
    <v-container fluid class="dashboard-page">
        <div class="dashboard-content">
            <header class="hero-card">
                <div>
                    <p class="hero-eyebrow">Dashboard</p>
                    <h1>Control general del inventario</h1>
                </div>
                <v-btn color="success" class="export-btn" prepend-icon="mdi-upload">
                    Exportar
                </v-btn>
            </header>

            <div v-if="loadingDashboard || dashboardError" class="feedback-stack">
                <v-progress-linear
                    v-if="loadingDashboard"
                    color="success"
                    indeterminate
                    height="4"
                />
                <v-alert
                    v-if="dashboardError"
                    type="error"
                    variant="tonal"
                    density="comfortable"
                    border="start"
                    border-color="error"
                >
                    {{ dashboardError }}
                </v-alert>
            </div>

            <section class="metrics-grid">
                <article v-for="card in resumenTarjetas" :key="card.title" class="stat-card">
                    <div class="stat-icon">
                        <v-icon :icon="card.icon" color="success"></v-icon>
                    </div>
                    <p class="stat-title">{{ card.title }}</p>
                    <p class="stat-detail">{{ card.detail }}</p>
                    <p class="stat-value">{{ card.value }}</p>
                </article>
            </section>

            <section class="chart-grid">
                <article class="panel-card">
                    <div class="panel-heading">
                        <v-icon icon="mdi-cube-outline" color="success"></v-icon>
                        <span>Distribución por Categoría</span>
                    </div>
                    <client-only>
                        <component :is="Apexchart" v-if="Apexchart" type="donut" height="260" :options="donutOptions" :series="donutSeries" />
                    </client-only>
                </article>
                <article class="panel-card">
                    <div class="panel-heading">
                        <v-icon icon="mdi-chart-bar" color="success"></v-icon>
                        <span>Inversión por Proveedor</span>
                    </div>
                    <client-only>
                        <component :is="Apexchart" v-if="Apexchart" type="bar" height="260" :options="barOptions" :series="barSeries" />
                    </client-only>
                </article>
            </section>

            <section class="list-grid">
                <article class="list-card danger">
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
                <article class="list-card warning">
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
import { computed, defineAsyncComponent, onMounted, ref } from 'vue'

const { secureRequest } = useApi()

const Apexchart = import.meta.client
    ? defineAsyncComponent(() => import('vue3-apexcharts'))
    : null

const MAX_PRODUCTS_FOR_DASHBOARD = 500
const LOW_STOCK_THRESHOLD_KG = 10
const DEFAULT_SHELF_LIFE_DAYS = 7
const EXPIRY_WARNING_DAYS = 3
const ONE_DAY_MS = 1000 * 60 * 60 * 24
const donutColors = ['#0ece78', '#6ee7b7', '#34d399', '#10b981', '#059669', '#65a30d']

const currencyFormatter = new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
})

const kilosFormatter = new Intl.NumberFormat('es-EC', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
})

const integerFormatter = new Intl.NumberFormat('es-EC', {
    maximumFractionDigits: 0,
})

const productos = ref([])
const estadisticas = ref({})
const loadingDashboard = ref(false)
const dashboardError = ref('')

const toNumber = (value, fallback = 0) => {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : fallback
}

const formatCurrency = (value = 0) => currencyFormatter.format(toNumber(value))
const formatKilograms = (value = 0) => `${kilosFormatter.format(toNumber(value))} kg`

const getNetKilograms = (producto) => {
    if (producto?.kilogramos_netos != null) return toNumber(producto.kilogramos_netos)
    if (producto?.kilogramos != null) return toNumber(producto.kilogramos)
    if (producto?.kilo != null) return toNumber(producto.kilo)
    if (producto?.cantidad != null) return toNumber(producto.cantidad)
    return 0
}

const normalizeCollection = (payload) => {
    const data = payload?.data ?? payload
    if (Array.isArray(data)) return data
    if (Array.isArray(data?.data)) return data.data
    return []
}

const loadDashboardData = async () => {
    loadingDashboard.value = true
    dashboardError.value = ''

    try {
        const params = new URLSearchParams({ por_pagina: String(MAX_PRODUCTS_FOR_DASHBOARD) })
        const [productosResponse, statsResponse] = await Promise.all([
            secureRequest(`/productos?${params.toString()}`),
            secureRequest('/productos/reporte/estadisticas'),
        ])

        productos.value = normalizeCollection(productosResponse?.data ?? productosResponse)
        estadisticas.value = statsResponse?.estadisticas ?? {}
    } catch (error) {
        console.error('Dashboard error', error)
        dashboardError.value = error?.data?.message ?? error?.message ?? 'No se pudo cargar el dashboard.'
    } finally {
        loadingDashboard.value = false
    }
}

onMounted(loadDashboardData)

const totalProductos = computed(() => {
    const total = toNumber(estadisticas.value?.total_productos)
    return total || productos.value.length
})

const gananciaPotencial = computed(() => toNumber(estadisticas.value?.total_ganancia_potencial))

const categoryDistribution = computed(() => {
    const map = new Map()
    productos.value.forEach((producto) => {
        const name = producto?.categoria_nombre ?? 'Sin categoría'
        const kilos = getNetKilograms(producto)
        map.set(name, (map.get(name) ?? 0) + kilos)
    })
    return Array.from(map, ([name, value]) => ({ name, value }))
})

const totalCategoryKilos = computed(() =>
    categoryDistribution.value.reduce((sum, item) => sum + item.value, 0)
)

const donutSeries = computed(() =>
    categoryDistribution.value.length
        ? categoryDistribution.value.map((item) => Number(item.value.toFixed(2)))
        : [1]
)

const donutLabels = computed(() => {
    if (!categoryDistribution.value.length) {
        return ['Sin datos']
    }

    return categoryDistribution.value.map((item) => {
        const percent = totalCategoryKilos.value
            ? Math.round((item.value / totalCategoryKilos.value) * 100)
            : 0
        return `${item.name} ${percent}%`
    })
})

const donutOptions = computed(() => {
    const hasCategoryData = categoryDistribution.value.length > 0

    return {
        chart: { type: 'donut', toolbar: { show: false } },
        labels: donutLabels.value,
        colors: donutColors,
        legend: { position: 'bottom', fontSize: '14px', labels: { colors: '#065f46' } },
        dataLabels: { enabled: false },
        stroke: { colors: ['#eafbf0'] },
        plotOptions: {
            pie: {
                donut: {
                    size: '70%',
                    labels: {
                        show: true,
                        value: {
                            color: '#065f46',
                            fontSize: '28px',
                            fontWeight: 600,
                            formatter: (val) =>
                                hasCategoryData ? `${Number(val).toFixed(1)} kg` : formatKilograms(0),
                        },
                        total: {
                            show: true,
                            label: 'Kg netos',
                            color: '#0f5132',
                            fontSize: '14px',
                            formatter: () => formatKilograms(totalCategoryKilos.value),
                        },
                    },
                },
            },
        },
    }
})

const providerInvestments = computed(() => {
    const map = new Map()
    productos.value.forEach((producto) => {
        const name = producto?.proveedor_nombre ?? 'Sin proveedor'
        const inversion = toNumber(producto?.precio_compra)
        map.set(name, (map.get(name) ?? 0) + inversion)
    })
    return Array.from(map, ([name, value]) => ({ name, value }))
})

const barSeries = computed(() => [
    {
        name: 'Inversión ($)',
        data: providerInvestments.value.length
            ? providerInvestments.value.map((item) => Number(item.value.toFixed(2)))
            : [0],
    },
])

const barOptions = computed(() => ({
    chart: { type: 'bar', toolbar: { show: false } },
    colors: ['#1dd07c'],
    plotOptions: { bar: { borderRadius: 8, columnWidth: '45%' } },
    dataLabels: { enabled: false },
    xaxis: {
        categories: providerInvestments.value.length
            ? providerInvestments.value.map((item) => item.name)
            : ['Sin datos'],
        labels: {
            style: {
                colors: providerInvestments.value.length
                    ? providerInvestments.value.map(() => '#065f46')
                    : ['#9ca3af'],
                fontSize: '12px',
            },
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
    },
    yaxis: {
        labels: { style: { colors: ['#047857'], fontSize: '12px' } },
    },
    grid: {
        borderColor: '#d1fae5',
        strokeDashArray: 4,
    },
    tooltip: {
        theme: 'light',
        y: {
            formatter: (val) => formatCurrency(val),
        },
    },
}))

const lowStockProducts = computed(() =>
    productos.value
        .map((producto) => {
            const stockValue = getNetKilograms(producto)
            return {
                id: producto.id,
                name: producto.nombre,
                category: producto?.categoria_nombre ?? 'Sin categoría',
                stockValue,
            }
        })
        .filter((item) => item.stockValue > 0 && item.stockValue <= LOW_STOCK_THRESHOLD_KG)
        .sort((a, b) => a.stockValue - b.stockValue)
        .slice(0, 5)
        .map((item) => ({
            id: item.id,
            name: item.name,
            category: item.category,
            stock: formatKilograms(item.stockValue),
            minimum: formatKilograms(LOW_STOCK_THRESHOLD_KG),
        }))
)

const expiringProducts = computed(() =>
    productos.value
        .map((producto) => {
            if (!producto?.created_at) return null
            const createdAt = new Date(producto.created_at)
            if (Number.isNaN(createdAt.getTime())) return null
            const expirationDate = new Date(createdAt)
            expirationDate.setDate(expirationDate.getDate() + DEFAULT_SHELF_LIFE_DAYS)
            const daysLeft = Math.ceil((expirationDate.getTime() - Date.now()) / ONE_DAY_MS)
            return {
                id: producto.id,
                name: producto.nombre,
                category: producto?.categoria_nombre ?? 'Sin categoría',
                expiresIn: Math.max(daysLeft, 0),
                date: expirationDate.toLocaleDateString('es-EC'),
            }
        })
        .filter(Boolean)
        .filter((item) => item.expiresIn <= EXPIRY_WARNING_DAYS)
        .sort((a, b) => a.expiresIn - b.expiresIn)
        .slice(0, 5)
)

const resumenTarjetas = computed(() => [
    { title: 'Total Productos', value: integerFormatter.format(totalProductos.value), detail: 'Inventario activo', icon: 'mdi-leaf' },
    {
        title: 'Ganancia Potencial',
        value: formatCurrency(gananciaPotencial.value),
        detail: 'Basado en stock actual',
        icon: 'mdi-trending-up',
    },
    {
        title: `Por vencer (${EXPIRY_WARNING_DAYS} días)`,
        value: integerFormatter.format(expiringProducts.value.length),
        detail: 'Revisar próximos días',
        icon: 'mdi-alert-decagram',
    },
    {
        title: 'Stock Bajo',
        value: integerFormatter.format(lowStockProducts.value.length),
        detail: `Menos de ${formatKilograms(LOW_STOCK_THRESHOLD_KG)}`,
        icon: 'mdi-package-variant',
    },
])
</script>

<style scoped>
.dashboard-page {
    min-height: 100vh;
    padding: 32px 16px 48px;
    background: linear-gradient(180deg, #e8faf0 0%, #d4f6df 100%);
}

.dashboard-content {
    max-width: 1180px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.hero-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
    padding: 28px 32px;
    border-radius: 28px;
    background: #f8fffb;
    border: 1px solid #c4f0d7;
    box-shadow: 0 8px 18px rgba(6, 95, 70, 0.08);
}

.hero-card h1 {
    margin: 2px 0 0;
    font-size: 2rem;
    color: #053b2d;
    font-weight: 600;
}

.hero-eyebrow {
    text-transform: uppercase;
    letter-spacing: 0.3em;
    font-size: 0.7rem;
    color: #0f9b63;
    font-weight: 600;
}

.export-btn {
    border-radius: 16px;
    padding-inline: 28px;
    font-weight: 600;
}

.metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 16px;
}

.stat-card {
    padding: 20px;
    border-radius: 24px;
    background: #ffffff;
    border: 1px solid #c4f0d7;
    box-shadow: 0 8px 16px rgba(4, 120, 87, 0.08);
    display: grid;
    gap: 6px;
}

.stat-icon {
    width: 44px;
    height: 44px;
    border-radius: 16px;
    background: #e6fbf1;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 4px;
}

.stat-title {
    font-size: 0.95rem;
    font-weight: 600;
    color: #064f38;
}

.stat-detail {
    font-size: 0.8rem;
    color: #198754;
}

.stat-value {
    font-size: 1.9rem;
    font-weight: 600;
    color: #042e22;
}

.chart-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 24px;
}

.panel-card {
    padding: 24px;
    border-radius: 28px;
    background: #ffffff;
    border: 1px solid #c4f0d7;
    box-shadow: 0 12px 20px rgba(6, 95, 70, 0.08);
}

.panel-heading {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 600;
    color: #064f38;
    margin-bottom: 12px;
}

.list-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 24px;
}

.list-card {
    padding: 24px;
    border-radius: 28px;
    background: #ffffff;
    border: 1px solid #c4f0d7;
    box-shadow: 0 12px 20px rgba(6, 95, 70, 0.08);
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.list-card.danger {
    border-color: #ffd7dd;
    background: #fff7f8;
}

.list-card.warning {
    border-color: #ffe2c2;
    background: #fff9f0;
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
    gap: 12px;
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
    background: rgba(4, 46, 34, 0.2);
    border-radius: 999px;
}

.list-row {
    padding: 14px 16px;
    border-radius: 18px;
    background: #ffffff;
    border: 1px solid rgba(5, 59, 45, 0.06);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
}

.list-card.danger .list-row {
    background: #fff1f3;
    border-color: #ffd7dd;
}

.list-card.warning .list-row {
    background: #fff4e6;
    border-color: #ffe2c2;
}

.list-title {
    font-size: 0.95rem;
    font-weight: 600;
    color: #053b2d;
}

.list-subtitle {
    font-size: 0.78rem;
    color: #1b5e46;
}

.list-meta {
    text-align: right;
}

.list-highlight {
    font-size: 0.95rem;
    font-weight: 600;
    color: #d7263d;
}

.warning-text {
    color: #e98603;
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

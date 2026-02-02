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
                    <div class="list-body">
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
                    </div>
                </article>
                <article class="list-card warning">
                    <div class="list-heading">
                        <v-icon icon="mdi-timer-sand" color="orange"></v-icon>
                        <span>Productos por Vencer ({{ expiringProducts.length }})</span>
                    </div>
                    <div class="list-body">
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
                    </div>
                </article>
            </section>
        </div>
    </v-container>
</template>

<script setup>
import { computed, defineAsyncComponent } from 'vue'

const Apexchart = import.meta.client
    ? defineAsyncComponent(() => import('vue3-apexcharts'))
    : null

const resumenTarjetas = [
    { title: 'Total Productos', value: '7', detail: 'Inventario activo', icon: 'mdi-leaf' },
    { title: 'Ganancia Potencial', value: '$149,00', detail: 'Mes en curso', icon: 'mdi-trending-up' },
    { title: 'Por vencer (3 días)', value: '1', detail: 'Revisar antes de 72h', icon: 'mdi-alert-decagram' },
    { title: 'Stock Bajo', value: '2', detail: 'Priorizar reposición', icon: 'mdi-package-variant' },
]

const lowStockProducts = [
    { id: 1, name: 'Manzana', category: 'Frutas', stock: '8 kg', minimum: '15 kg' },
    { id: 2, name: 'Cebolla', category: 'Verduras', stock: '5 kg', minimum: '8 kg' },
]

const expiringProducts = [
    { id: 1, name: 'Lechuga', category: 'Verduras', date: '18/01/2026', expiresIn: 3 },
]

const proveedores = [
    { nombre: 'Mercado Central', valor: 45 },
    { nombre: 'Frutales del Sur', valor: 48 },
    { nombre: 'Huerta Local', valor: 32 },
    { nombre: 'Importadora Tropical', valor: 46 },
]

const donutSeries = [53, 47]
const donutOptions = computed(() => ({
    chart: { type: 'donut', toolbar: { show: false } },
    labels: ['Verduras 53%', 'Frutas 47%'],
    colors: ['#0ece78', '#6ee7b7'],
    legend: { position: 'bottom', fontSize: '14px', labels: { colors: '#065f46' } },
    dataLabels: { enabled: false },
    stroke: { colors: ['#eafbf0'] },
    plotOptions: {
        pie: {
            donut: {
                size: '70%',
                labels: {
                    show: true,
                    value: { color: '#065f46', fontSize: '28px', fontWeight: 600 },
                    total: {
                        show: true,
                        label: 'Productos',
                        color: '#0f5132',
                        fontSize: '14px',
                    },
                },
            },
        },
    },
}))

const barSeries = [{ name: 'Valor Total ($)', data: proveedores.map((p) => p.valor) }]
const barOptions = computed(() => ({
    chart: { type: 'bar', toolbar: { show: false } },
    colors: ['#1dd07c'],
    plotOptions: { bar: { borderRadius: 8, columnWidth: '45%' } },
    dataLabels: { enabled: false },
    xaxis: {
        categories: proveedores.map((p) => p.nombre),
        labels: {
            style: {
                colors: proveedores.map(() => '#065f46'),
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
            formatter: (val) => `$${val.toFixed(2)}k`,
        },
    },
}))
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

@media (max-width: 640px) {
    .hero-card {
        padding: 20px;
    }

    .export-btn {
        width: 100%;
    }
}
</style>

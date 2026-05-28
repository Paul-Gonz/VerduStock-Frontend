<template>
    <div class="min-h-screen bg-[#0f1522] text-slate-300 p-6 font-sans">

        <header class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
                <h1 class="text-2xl font-bold text-white tracking-wide">Registro Diario</h1>
                <p class="text-sm text-slate-400 mt-1">Gestión de ingresos y gastos de la jornada</p>
            </div>

            <div class="flex gap-3">
                <button @click="generarReporte"
                    class="flex items-center gap-2 px-4 py-2 bg-[#1e293b] hover:bg-[#334155] border border-slate-700 rounded-lg text-sm font-medium transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
                        </path>
                    </svg>
                    Generar Reporte
                </button>

                <button @click="terminarDia"
                    class="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white text-sm font-medium shadow-[0_0_15px_rgba(5,150,105,0.3)] transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Terminar Día
                </button>
            </div>
        </header>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="bg-[#151e2f] border border-slate-800 rounded-xl p-5 shadow-lg">
                <div class="flex justify-between items-start mb-4">
                    <div class="p-2 bg-emerald-500/10 rounded-lg">
                        <svg class="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                        </svg>
                    </div>
                    <span
                        class="text-xs font-medium px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full">Hoy</span>
                </div>
                <p class="text-sm text-slate-400 uppercase tracking-wider mb-1">Ingresos Totales</p>
                <h2 class="text-3xl font-bold text-white">${{ totalIngresos.toFixed(2) }}</h2>
            </div>

            <div class="bg-[#151e2f] border border-slate-800 rounded-xl p-5 shadow-lg">
                <div class="flex justify-between items-start mb-4">
                    <div class="p-2 bg-red-500/10 rounded-lg">
                        <svg class="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"></path>
                        </svg>
                    </div>
                </div>
                <p class="text-sm text-slate-400 uppercase tracking-wider mb-1">Gastos Totales</p>
                <h2 class="text-3xl font-bold text-white">${{ totalGastos.toFixed(2) }}</h2>
            </div>

            <div class="bg-[#151e2f] border border-slate-800 rounded-xl p-5 shadow-lg">
                <div class="flex justify-between items-start mb-4">
                    <div class="p-2 bg-blue-500/10 rounded-lg">
                        <svg class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3">
                            </path>
                        </svg>
                    </div>
                </div>
                <p class="text-sm text-slate-400 uppercase tracking-wider mb-1">Balance Neto</p>
                <h2 class="text-3xl font-bold" :class="balance >= 0 ? 'text-emerald-400' : 'text-red-400'">
                    ${{ balance.toFixed(2) }}
                </h2>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

            <div class="bg-[#151e2f] border border-slate-800 rounded-xl p-6 shadow-lg h-fit">
                <h3 class="text-lg font-semibold text-white mb-6">Nuevo Movimiento</h3>
                <form @submit.prevent="registrarMovimiento" class="space-y-4">

                    <div>
                        <label class="block text-sm text-slate-400 mb-2">Tipo de operación</label>
                        <div class="flex bg-[#0f1522] rounded-lg p-1 border border-slate-700">
                            <button type="button" @click="form.tipo = 'ingreso'"
                                class="flex-1 py-2 text-sm font-medium rounded-md transition"
                                :class="form.tipo === 'ingreso' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'">Ingreso</button>
                            <button type="button" @click="form.tipo = 'gasto'"
                                class="flex-1 py-2 text-sm font-medium rounded-md transition"
                                :class="form.tipo === 'gasto' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'">Gasto</button>
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm text-slate-400 mb-2">Concepto / Descripción</label>
                        <input v-model="form.concepto" type="text" required
                            class="w-full bg-[#0f1522] border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition"
                            placeholder="Ej. Venta en mostrador, Pago a proveedor...">
                    </div>

                    <div>
                        <label class="block text-sm text-slate-400 mb-2">Monto ($)</label>
                        <input v-model.number="form.monto" type="number" step="0.01" min="0.01" required
                            class="w-full bg-[#0f1522] border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition"
                            placeholder="0.00">
                    </div>

                    <button type="submit"
                        class="w-full mt-4 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-medium transition-colors">
                        Registrar {{ form.tipo === 'ingreso' ? 'Ingreso' : 'Gasto' }}
                    </button>
                </form>
            </div>

            <div class="lg:col-span-2 bg-[#151e2f] border border-slate-800 rounded-xl shadow-lg flex flex-col">
                <div class="p-6 border-b border-slate-800 flex justify-between items-center">
                    <h3 class="text-lg font-semibold text-white">Últimos Movimientos</h3>
                    <span class="text-sm text-slate-400">Hoy, {{ fechaActual }}</span>
                </div>

                <div class="overflow-x-auto">
                    <table class="w-full text-left text-sm">
                        <thead class="bg-[#0f1522]/50 text-slate-400">
                            <tr>
                                <th class="px-6 py-4 font-medium">Hora</th>
                                <th class="px-6 py-4 font-medium">Concepto</th>
                                <th class="px-6 py-4 font-medium text-right">Monto</th>
                                <th class="px-6 py-4 font-medium text-center">Tipo</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-800/50">
                            <tr v-if="movimientos.length === 0">
                                <td colspan="4" class="px-6 py-8 text-center text-slate-500">
                                    No hay movimientos registrados hoy.
                                </td>
                            </tr>
                            <tr v-for="(mov, index) in movimientos" :key="index"
                                class="hover:bg-slate-800/20 transition">
                                <td class="px-6 py-4 text-slate-400">{{ mov.hora }}</td>
                                <td class="px-6 py-4 font-medium text-slate-200">{{ mov.concepto }}</td>
                                <td class="px-6 py-4 text-right font-mono"
                                    :class="mov.tipo === 'ingreso' ? 'text-emerald-400' : 'text-red-400'">
                                    {{ mov.tipo === 'ingreso' ? '+' : '-' }}${{ mov.monto.toFixed(2) }}
                                </td>
                                <td class="px-6 py-4 text-center">
                                    <span class="px-2.5 py-1 rounded-full text-xs font-medium"
                                        :class="mov.tipo === 'ingreso' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'">
                                        {{ mov.tipo === 'ingreso' ? 'Ingreso' : 'Gasto' }}
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// --- Estado y Datos ---
const fechaActual = ref(new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }))

const form = ref({
    tipo: 'ingreso',
    concepto: '',
    monto: null
})

const movimientos = ref([
    // Data de ejemplo, borrar al integrar con backend/Supabase/Laravel
    { hora: '08:30 AM', concepto: 'Caja inicial', monto: 150.00, tipo: 'ingreso' },
    { hora: '09:45 AM', concepto: 'Pago proveedor empaques', monto: 45.50, tipo: 'gasto' },
])

// --- Computados ---
const totalIngresos = computed(() => {
    return movimientos.value
        .filter(m => m.tipo === 'ingreso')
        .reduce((acc, curr) => acc + curr.monto, 0)
})

const totalGastos = computed(() => {
    return movimientos.value
        .filter(m => m.tipo === 'gasto')
        .reduce((acc, curr) => acc + curr.monto, 0)
})

const balance = computed(() => totalIngresos.value - totalGastos.value)

// --- Funciones ---
const registrarMovimiento = () => {
    if (!form.value.concepto || !form.value.monto) return

    const ahora = new Date()
    const horaFormat = ahora.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true })

    movimientos.value.unshift({
        hora: horaFormat,
        concepto: form.value.concepto,
        monto: form.value.monto,
        tipo: form.value.tipo
    })

    // Resetear formulario
    form.value.concepto = ''
    form.value.monto = null
}

const terminarDia = () => {
    // Lógica para cerrar caja en la base de datos
    alert(`Cierre de caja iniciado.\nBalance final: $${balance.value.toFixed(2)}`)
}

const generarReporte = () => {
    // Lógica para exportar a PDF/Excel
    alert('Generando reporte del día...')
}
</script>
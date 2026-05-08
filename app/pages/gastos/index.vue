<template>
    <div class="gastos-page p-6">
        <div class="flex flex-col gap-4 mb-6">
            <div class="flex justify-between items-center">
                <div>
                    <h1 class="text-2xl font-bold text-gray-800">Gastos</h1>
                    <p class="text-sm text-gray-500">Total acumulado: <span class="font-bold text-red-600">{{
                        formatCurrency(totalGastos) }}</span></p>
                </div>
                <button @click="openModal()"
                    class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm active:scale-95">
                    Registrar Pago
                </button>
            </div>

            <div class="flex flex-wrap gap-4 items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div class="flex-1 min-w-250px">
                    <BaseSearch v-model="search" placeholder="Buscar por descripción..." @search="setFilter" />
                </div>

                <select v-model="selectedCategory"
                    class="p-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-green-500 outline-none bg-gray-50/50">
                    <option value="Todas">Todas las categorías</option>
                    <option v-for="cat in categoriasLista" :key="cat" :value="cat">{{ cat }}</option>
                </select>
            </div>
        </div>

        <div v-if="error"
            class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
            <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
            </svg>
            {{ error }}
            <button @click="fetchGastos" class="ml-auto underline hover:text-red-900">Reintentar</button>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <BaseTable :columns="columns" :rows="gastosFiltrados" :loading="loading" :selectable="false"
                :searchable="false" empty-text="No hay gastos registrados aún.">

                <template #fecha="{ value }">
                    <span class="text-gray-600 text-sm">{{ value }}</span>
                </template>

                <template #categoria="{ value }">
                    <span
                        class="px-2.5 py-1 rounded-lg text-[0.65rem] font-black uppercase tracking-tighter bg-blue-50 text-blue-600 border border-blue-100">
                        {{ value }}
                    </span>
                </template>

                <template #descripcion="{ value }">
                    <span class="text-gray-500 text-sm italic line-clamp-1">{{ value || 'Sin detalle' }}</span>
                </template>

                <template #monto="{ value }">
                    <span class="font-bold text-gray-900">{{ formatCurrency(Number(value)) }}</span>
                </template>

                <template #acciones="{ row }">
                    <div class="flex items-center gap-3">
                        <button @click="openModal(row)" class="text-blue-600 hover:text-blue-800 p-1 transition-colors"
                            title="Editar">
                            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </button>
                        <button @click="confirmDelete(row.id!)" :disabled="loading"
                            class="text-red-600 hover:text-red-800 p-1 transition-colors disabled:opacity-50"
                            title="Eliminar">
                            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                </template>
            </BaseTable>
        </div>

        <BaseModal :isOpen="isModalOpen" :title="form.id ? 'Editar Gasto' : 'Nuevo Gasto'" @close="isModalOpen = false">
            <div class="p-6">
                <form @submit.prevent="handleSubmit" class="flex flex-col gap-5">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="flex flex-col gap-1">
                            <label class="text-sm font-medium text-gray-700">Categoría</label>
                            <select v-model="form.categoria" required
                                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none bg-gray-50/50">
                                <option value="" disabled>Seleccionar...</option>
                                <option v-for="cat in categoriasLista" :key="cat" :value="cat">{{ cat }}</option>
                            </select>
                        </div>
                        <div class="flex flex-col gap-1">
                            <label class="text-sm font-medium text-gray-700">Monto ($)</label>
                            <input v-model="form.monto" type="number" step="0.01" required placeholder="0.00"
                                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none font-bold" />
                        </div>
                    </div>

                    <div class="flex flex-col gap-1">
                        <label class="text-sm font-medium text-gray-700">Fecha del Pago</label>
                        <input v-model="form.fecha_gasto" type="date" required
                            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none" />
                    </div>

                    <div class="flex flex-col gap-1">
                        <label class="text-sm font-medium text-gray-700">Nota / Descripción</label>
                        <textarea v-model="form.descripcion" rows="3" placeholder="Ej: Pago flete de mercancía"
                            class="w-full border border-gray-300 rounded-lg px-3 py-2 resize-none focus:ring-2 focus:ring-green-500 outline-none italic text-sm"></textarea>
                    </div>
                </form>
            </div>

            <template #footer>
                <div class="flex gap-3 justify-end w-full border-t border-gray-100 p-4">
                    <button type="button" @click="isModalOpen = false"
                        class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors">Cancelar</button>
                    <button @click="handleSubmit" :disabled="loading"
                        class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2">
                        <span v-if="loading"
                            class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        {{ form.id ? 'Actualizar' : 'Confirmar Gasto' }}
                    </button>
                </div>
            </template>
        </BaseModal>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'

const { gastos, totalGastos, loading, error, fetchGastos, saveGasto, deleteGasto } = useGastos()

// --- ESTADOS DE FILTROS ---
const search = ref('')
const selectedCategory = ref('Todas')
const isModalOpen = ref(false)

const form = ref<any>({
    id: undefined,
    categoria: '',
    monto: 0,
    fecha_gasto: new Date().toISOString().split('T')[0],
    descripcion: ''
})

const categoriasLista = ['Alquiler', 'Bolsas', 'Nómina', 'Servicios', 'Transporte', 'Otros']

const columns = [
    { key: 'fecha', label: 'Fecha' },
    { key: 'categoria', label: 'Categoría' },
    { key: 'descripcion', label: 'Descripción' },
    { key: 'monto', label: 'Monto', align: 'right' as const },
    { key: 'acciones', label: 'Acciones', align: 'left' as const }
]

// --- LÓGICA DE FILTRADO LOCAL ---
const gastosFiltrados = computed(() => {
    return gastos.value.filter(g => {
        const textMatch = g.descripcion?.toLowerCase().includes(search.value.toLowerCase()) ||
            g.categoria.toLowerCase().includes(search.value.toLowerCase())
        const categoryMatch = selectedCategory.value === 'Todas' || g.categoria === selectedCategory.value
        return textMatch && categoryMatch
    })
})

const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }).format(val)
}

const openModal = (gasto: any = null) => {
    if (gasto) {
        form.value = {
            ...gasto,
            monto: Number(gasto.monto)
        }
    } else {
        form.value = {
            id: undefined,
            categoria: '',
            monto: 0,
            fecha_gasto: new Date().toISOString().split('T')[0],
            descripcion: ''
        }
    }
    isModalOpen.value = true
}

const handleSubmit = async () => {
    const payload = {
        ...form.value,
        fecha_gasto: form.value.fecha_gasto || new Date().toISOString().split('T')[0]
    }
    const res = await saveGasto(payload)
    if (res.success) isModalOpen.value = false
}

const confirmDelete = async (id: number) => {
    if (confirm('¿Estás seguro de eliminar este registro?')) {
        await deleteGasto(id)
    }
}

const setFilter = (val: string) => {
    search.value = val
}

watch(search, (val) => {
    setFilter(val)
})

onMounted(() => fetchGastos())
</script>
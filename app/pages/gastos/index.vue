<template>
    <div class="gastos-page p-6">
        <div v-if="error"
            class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
            <span class="mdi mdi-alert-circle text-lg"></span>
            <span class="flex-1">{{ error }}</span>
            <button @click="fetchGastos" class="ml-auto underline hover:text-red-900 font-medium">Reintentar</button>
        </div>

        <div
            class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 flex flex-col overflow-hidden">

            <div
                class="p-4 sm:p-5 flex flex-col gap-5 border-b border-gray-100 dark:border-slate-800/60 bg-gray-50/30 dark:bg-transparent">

                <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div class="w-full lg:max-w-md">
                        <BaseSearch v-model="search" placeholder="Buscar por descripción..." class="w-full" />
                    </div>

                    <div class="flex items-center gap-3 w-full lg:w-auto justify-end">
                        <div
                            class="flex items-center gap-2 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 rounded-lg shadow-sm">
                            <span
                                class="text-[10px] text-red-600 dark:text-red-400 font-bold uppercase tracking-wider">Total
                                Filtrado:</span>
                            <span class="font-bold text-red-700 dark:text-red-300 text-sm">{{
                                formatCurrency(totalFiltrado) }}</span>
                        </div>

                        <button @click="openModal()"
                            class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 text-sm shadow-sm active:scale-95">
                            <span class="mdi mdi-plus-box text-lg"></span>
                            Registrar Pago
                        </button>
                    </div>
                </div>

                <div class="flex flex-col md:flex-row items-end gap-4">
                    <div class="flex flex-col gap-1.5 w-full md:w-56 relative z-30">
                        <span
                            class="text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wide px-1">Categoría</span>
                        <BaseMultiSelect v-model="selectedCategory" :options="categoryOptions" placeholder="Todas"
                            class="w-full" />
                    </div>
                </div>
            </div>

            <BaseTable class="border-0 shadow-none bg-transparent! pt-4" :columns="columns" :rows="gastosFiltrados"
                :loading="loading" :selectable="false" :searchable="false" :sort-by="sortBy" :sort-order="sortOrder"
                @sort="handleSort" empty-text="No hay gastos registrados.">

                <template #fecha_gasto="{ value }">
                    <span class="text-gray-600 dark:text-slate-400 text-sm font-medium">{{ value }}</span>
                </template>

                <template #categoria="{ value }">
                    <span
                        class="px-2.5 py-1 rounded-lg text-[0.65rem] font-black uppercase tracking-tighter bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800/50">
                        {{ value }}
                    </span>
                </template>

                <template #monto="{ value }">
                    <span class="font-bold text-gray-900 dark:text-slate-200">{{ formatCurrency(Number(value)) }}</span>
                </template>

                <template #descripcion="{ value }">
                    <span class="text-gray-500 dark:text-slate-400 text-sm italic line-clamp-1 max-w-xs" :title="value">
                        {{ value || 'Sin detalle' }}
                    </span>
                </template>

                <template #acciones="{ row }">
                    <div class="flex items-center gap-3">
                        <button @click.stop="openModal(row)"
                            class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 p-1 transition-colors"
                            title="Editar">
                            <span class="mdi mdi-pencil text-xl"></span>
                        </button>
                        <button @click.stop="confirmDelete(row.id!)" :disabled="loading"
                            class="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-1 transition-colors disabled:opacity-50"
                            title="Eliminar">
                            <span class="mdi mdi-trash-can text-xl"></span>
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
                            <label class="text-sm font-medium text-gray-700 dark:text-slate-300">Categoría</label>
                            <select v-model="form.categoria" required
                                class="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none bg-gray-50/50 dark:bg-slate-800 dark:text-white transition-all">
                                <option value="" disabled>Seleccionar...</option>
                                <option v-for="cat in categoriasLista" :key="cat" :value="cat">{{ cat }}</option>
                            </select>
                        </div>
                        <div class="flex flex-col gap-1">
                            <label class="text-sm font-medium text-gray-700 dark:text-slate-300">Monto ($)</label>
                            <input v-model="form.monto" type="number" min="0" step="0.01" required placeholder="0.00"
                                class="w-full border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none font-bold" />
                        </div>
                    </div>

                    <div class="flex flex-col gap-1">
                        <label class="text-sm font-medium text-gray-700 dark:text-slate-300">Fecha del Pago</label>
                        <input v-model="form.fecha_gasto" type="date" required
                            class="w-full border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none transition-all" />
                    </div>

                    <div class="flex flex-col gap-1">
                        <label class="text-sm font-medium text-gray-700 dark:text-slate-300">Nota / Descripción</label>
                        <textarea v-model="form.descripcion" rows="3" placeholder="Ej: Pago flete de mercancía"
                            class="w-full border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg px-3 py-2 resize-none focus:ring-2 focus:ring-green-500 outline-none italic text-sm"></textarea>
                    </div>
                </form>
            </div>

            <template #footer>
                <div class="flex gap-3 justify-end w-full border-t border-gray-100 dark:border-slate-800 p-4">
                    <button type="button" @click="isModalOpen = false"
                        class="px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-gray-700 dark:text-slate-300 font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                        Cancelar
                    </button>
                    <button @click="handleSubmit" :disabled="loading"
                        class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50">
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
import { ref, computed, onMounted } from 'vue'
import { type TableColumn } from '~/components/BaseTable.vue'

const { gastos, loading, error, fetchGastos, saveGasto, deleteGasto } = useGastos()

// UI States y Filtros Básicos
const search = ref('')
const selectedCategory = ref<string[]>([])
const isModalOpen = ref(false)

// Ordenamiento
const sortBy = ref('fecha_gasto')
const sortOrder = ref('desc')

const columns: TableColumn[] = [
    { key: 'fecha_gasto', label: 'Fecha', sortable: true },
    { key: 'categoria', label: 'Categoría', sortable: true },
    { key: 'monto', label: 'Monto', align: 'left', sortable: true },
    { key: 'descripcion', label: 'Descripción', sortable: false },
    { key: 'acciones', label: 'Acciones', align: 'left' }
]

const form = ref<Gasto>({
    id: undefined,
    categoria: '',
    monto: null as any,
    fecha_gasto: new Date().toISOString().split('T')[0] as string,
    descripcion: ''
})

const categoriasLista = ['Alquiler', 'Bolsas', 'Nómina', 'Servicios', 'Transporte', 'Otros']
const categoryOptions = computed(() => categoriasLista.map(cat => ({ id: cat, nombre: cat })))

const gastosFiltrados = computed(() => {
    let data = [...gastos.value]

    // Filtro de Búsqueda
    if (search.value) {
        const s = search.value.toLowerCase()
        data = data.filter(g =>
            (g.descripcion?.toLowerCase().includes(s)) ||
            (g.categoria?.toLowerCase().includes(s))
        )
    }

    // Filtro de Categoría
    if (selectedCategory.value.length > 0) {
        data = data.filter(g => selectedCategory.value.includes(g.categoria))
    }

    // Lógica de Ordenamiento
    data.sort((a, b) => {
        let valA: any = a[sortBy.value as keyof Gasto]
        let valB: any = b[sortBy.value as keyof Gasto]

        if (sortBy.value === 'monto') {
            valA = Number(valA); valB = Number(valB)
        } else {
            valA = valA?.toString().toLowerCase() || ''
            valB = valB?.toString().toLowerCase() || ''
        }

        if (valA < valB) return sortOrder.value === 'asc' ? -1 : 1
        if (valA > valB) return sortOrder.value === 'asc' ? 1 : -1
        return 0
    })

    return data
})

const totalFiltrado = computed(() =>
    gastosFiltrados.value.reduce((acc, curr) => acc + (Number(curr.monto) || 0), 0)
)

const handleSort = (key: string) => {
    if (sortBy.value === key) {
        sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
    } else {
        sortBy.value = key
        sortOrder.value = 'asc'
    }
}

const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val)
}

const openModal = (gasto: any = null) => {
    if (gasto) {
        form.value = { ...gasto, monto: Number(gasto.monto) }
    } else {
        form.value = {
            id: undefined,
            categoria: '',
            monto: null as any,
            fecha_gasto: new Date().toISOString().split('T')[0] as string,
            descripcion: ''
        }
    }
    isModalOpen.value = true
}

const handleSubmit = async () => {
    const res = await saveGasto(form.value)
    if (res.success) isModalOpen.value = false
}

const confirmDelete = async (id: number) => {
    if (confirm('¿Estás seguro de eliminar este registro?')) {
        await deleteGasto(id)
    }
}

onMounted(() => fetchGastos())
</script>
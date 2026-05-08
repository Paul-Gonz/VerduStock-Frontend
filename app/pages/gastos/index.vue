<template>
    <div class="min-h-screen p-6 bg-gray-50">
        <div class="max-w-7xl mx-auto flex flex-col gap-6">

            <header
                class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center flex-wrap gap-4">
                <div>
                    <p class="uppercase tracking-widest text-[0.65rem] text-gray-500 font-bold italic">Administración
                    </p>
                    <h1 class="mt-1 text-2xl text-gray-900 font-semibold tracking-tight">Egresos y Gastos</h1>
                </div>

                <div class="flex items-center gap-6">
                    <div class="text-right border-r pr-6 border-gray-100 hidden sm:block">
                        <p class="text-xs text-gray-400 font-bold uppercase tracking-tighter">Gasto Mensual</p>
                        <p class="text-2xl font-bold text-red-600">{{ formatCurrency(totalGastos) }}</p>
                    </div>

                    <button @click="openModal()"
                        class="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-green-100 flex items-center gap-2 active:scale-95">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor" stroke-width="3">
                            <path d="M12 4v16m8-8H4" />
                        </svg>
                        Registrar Pago
                    </button>
                </div>
            </header>

            <div v-if="error"
                class="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl text-red-700 text-sm flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {{ error }}
            </div>

            <section class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div v-if="loading && !gastos.length" class="p-12 text-center">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                    <p class="mt-4 text-gray-500 text-sm italic">Cargando registros financieros...</p>
                </div>

                <table v-else class="w-full text-left border-collapse">
                    <thead class="bg-gray-50/50 text-gray-500">
                        <tr>
                            <th class="px-6 py-4 text-[0.7rem] font-black uppercase tracking-widest">Fecha</th>
                            <th class="px-6 py-4 text-[0.7rem] font-black uppercase tracking-widest">Categoría</th>
                            <th class="px-6 py-4 text-[0.7rem] font-black uppercase tracking-widest">Descripción</th>
                            <th class="px-6 py-4 text-[0.7rem] font-black uppercase tracking-widest text-right">Monto
                            </th>
                            <th class="px-6 py-4 text-[0.7rem] font-black uppercase tracking-widest text-center">
                                Opciones</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-50">
                        <tr v-for="gasto in gastos" :key="gasto.id" class="hover:bg-gray-50/80 transition-colors group">
                            <td class="px-6 py-4 text-sm font-medium text-gray-600">{{ gasto.fecha }}</td>
                            <td class="px-6 py-4">
                                <span
                                    class="px-3 py-1 rounded-lg text-[0.65rem] font-black uppercase tracking-tighter bg-blue-50 text-blue-600 border border-blue-100">
                                    {{ gasto.categoria }}
                                </span>
                            </td>
                            <td class="px-6 py-4 text-sm text-gray-500 italic max-w-xs truncate">{{ gasto.descripcion ||
                                'N/A' }}</td>
                            <td class="px-6 py-4 text-sm text-right font-black text-gray-900">{{
                                formatCurrency(Number(gasto.monto)) }}</td>
                            <td class="px-6 py-4">
                                <div
                                    class="flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button @click="openModal(gasto)"
                                        class="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition" title="Editar">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none"
                                            viewBox="0 0 24 24" stroke="currentColor">
                                            <path
                                                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                        </svg>
                                    </button>
                                    <button @click="confirmDelete(gasto.id!)"
                                        class="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                        title="Eliminar">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none"
                                            viewBox="0 0 24 24" stroke="currentColor">
                                            <path
                                                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                        </svg>
                                    </button>
                                </div>
                            </td>
                        </tr>
                        <tr v-if="!gastos.length && !loading">
                            <td colspan="5" class="py-20 text-center">
                                <div class="text-gray-300 mb-2 font-bold uppercase tracking-widest text-xs">Sin
                                    movimientos</div>
                                <p class="text-gray-400 text-sm italic">Registra un nuevo gasto para comenzar el
                                    control.</p>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </section>
        </div>

        <Teleport to="body">
            <div v-if="isModalOpen"
                class="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-100 p-4 animate-in fade-in duration-300">
                <div
                    class="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200">
                    <div class="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                        <h3 class="text-xl font-black text-gray-800 tracking-tighter">
                            {{ form.id ? 'Actualizar Registro' : 'Nuevo Gasto Operativo' }}
                        </h3>
                        <button @click="isModalOpen = false"
                            class="text-gray-400 hover:text-gray-800 transition-colors p-2 hover:bg-white rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <form @submit.prevent="handleSubmit" class="p-8 space-y-5">
                        <div>
                            <label
                                class="block text-[0.6rem] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Categoría</label>
                            <select v-model="form.categoria" required
                                class="w-full p-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all font-medium text-gray-700">
                                <option value="" disabled>Selecciona una opción</option>
                                <option v-for="cat in categorias" :key="cat" :value="cat">{{ cat }}</option>
                            </select>
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label
                                    class="block text-[0.6rem] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Monto
                                    ($)</label>
                                <input v-model="form.monto" type="number" step="0.01" required placeholder="0.00"
                                    class="w-full p-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all font-bold text-gray-900" />
                            </div>
                            <div>
                                <label
                                    class="block text-[0.6rem] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Fecha</label>
                                <input v-model="form.fecha_gasto" type="date" required
                                    class="w-full p-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all font-medium text-gray-700 text-sm" />
                            </div>
                        </div>

                        <div>
                            <label
                                class="block text-[0.6rem] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Detalles
                                (Opcional)</label>
                            <textarea v-model="form.descripcion" rows="3" placeholder="Ej: Pago de flete semanal..."
                                class="w-full p-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all text-sm text-gray-700 italic"></textarea>
                        </div>

                        <button type="submit" :disabled="loading"
                            class="w-full bg-green-600 hover:bg-green-700 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-green-100 disabled:opacity-50 active:scale-95 mt-2 tracking-tight uppercase text-sm">
                            {{ loading ? 'Procesando...' : (form.id ? 'Guardar Cambios' : 'Confirmar Gasto') }}
                        </button>
                    </form>
                </div>
            </div>
        </Teleport>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

// 1. Cargamos el motor de finanzas (Composable .ts)
const { gastos, totalGastos, loading, error, fetchGastos, saveGasto, deleteGasto } = useGastos()

// --- ESTADOS LOCALES ---
const isModalOpen = ref(false)
const form = ref({
    id: undefined as number | undefined,
    categoria: '',
    monto: 0,
    fecha_gasto: new Date().toISOString().split('T')[0],
    descripcion: ''
})

// --- FORMATEADORES ---
const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }).format(val)
}

// --- LÓGICA DEL MODAL ---
const openModal = (gasto: any = null) => {
    if (gasto) {
        form.value = {
            id: gasto.id,
            categoria: gasto.categoria,
            monto: Number(gasto.monto),
            fecha_gasto: gasto.fecha_gasto, // Viene y/m/d del backend
            descripcion: gasto.descripcion
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
    const res = await saveGasto(form.value)
    if (res.success) {
        isModalOpen.value = false
    } else {
        alert('Error al procesar el gasto. Verifica los campos.')
    }
}

const confirmDelete = async (id: number) => {
    if (confirm('¿Estás seguro de que deseas eliminar este gasto?')) {
        await deleteGasto(id)
    }
}

const categorias = ['Alquiler', 'Bolsas', 'Nómina', 'Servicios', 'Transporte', 'Otros']

onMounted(() => fetchGastos())
</script>
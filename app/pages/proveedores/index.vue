<template>
    <div class="p-6">
        <div class="flex flex-col gap-4 mb-6">
            <div class="flex justify-between items-center">
                <h1 class="text-2xl font-bold text-gray-800">Directorio de Proveedores</h1>
                <button @click="openNewDialog"
                    class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                    Nuevo Proveedor
                </button>
            </div>

            <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4">
                <BaseSearch v-model="search" placeholder="Buscar por nombre, teléfono o dirección..." class="flex-1" />
            </div>
        </div>

        <!-- Main Table -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <BaseTable :columns="columns" :rows="proveedoresFiltrados" :searchable="false" :loading="loading"
                emptyText="No se encontraron proveedores">
                <template #acciones="{ row }">
                    <div class="flex items-center gap-3">
                        <button @click.stop="editProveedor(row)"
                            class="text-blue-600 hover:text-blue-800 p-1 transition-colors" title="Editar">
                            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </button>
                        <button @click.stop="confirmDelete(row)"
                            class="text-red-600 hover:text-red-800 p-1 transition-colors" title="Eliminar">
                            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                </template>
            </BaseTable>
        </div>

        <!-- Modal Form -->
        <BaseModal :isOpen="dialog" @close="closeDialog" :title="isEditing ? 'Editar Proveedor' : 'Nuevo Proveedor'">
            <div class="p-4">
                <form @submit.prevent="saveProveedor" class="flex flex-col gap-4">
                    <div class="flex flex-col gap-1">
                        <label class="text-sm font-medium text-gray-700">Nombre *</label>
                        <input v-model="form.nombre" type="text" required
                            class="border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-green-500" />
                    </div>
                    <div class="flex flex-col gap-1">
                        <label class="text-sm font-medium text-gray-700">Teléfono</label>
                        <input v-model="form.telefono" type="text"
                            class="border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-green-500" />
                    </div>
                    <div class="flex flex-col gap-1">
                        <label class="text-sm font-medium text-gray-700">Dirección</label>
                        <input v-model="form.direccion" type="text"
                            class="border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-green-500" />
                    </div>
                    <div class="flex flex-col gap-1">
                        <label class="text-sm font-medium text-gray-700">Notas adicionales</label>
                        <textarea v-model="form.detalle" rows="3"
                            class="border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-green-500"></textarea>
                    </div>
                </form>
            </div>

            <template #footer>
                <div class="flex gap-3 justify-end w-full border-t border-gray-100 p-4">
                    <button type="button" @click="closeDialog"
                        class="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">Cancelar</button>
                    <button @click="saveProveedor" :disabled="saving"
                        class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2">
                        <span v-if="saving"
                            class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        {{ isEditing ? 'Actualizar' : 'Guardar' }}
                    </button>
                </div>
            </template>
        </BaseModal>

        <!-- Modal Delete -->
        <BaseModal :isOpen="deleteDialog" @close="deleteDialog = false" title="¿Eliminar este proveedor?">
            <div class="p-4">
                <p class="text-gray-700">Esta acción eliminará a <b>{{ proveedorToDelete?.nombre }}</b>. Los datos no
                    podrán
                    recuperarse.</p>
            </div>
            <template #footer>
                <div class="flex gap-3 justify-end w-full border-t border-gray-100 p-4">
                    <button type="button" @click="deleteDialog = false"
                        class="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">Cancelar</button>
                    <button @click="deleteProveedor" :disabled="deleting"
                        class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2">
                        <span v-if="deleting"
                            class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        Eliminar
                    </button>
                </div>
            </template>
        </BaseModal>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useProveedores } from '~/composables/useProveedores'

const {
    proveedores,
    loading,
    saving,
    deleting,
    fetchProveedores,
    saveProveedor: saveProveedorApi,
    deleteProveedor: deleteProveedorApi
} = useProveedores()

const search = ref('')

const dialog = ref(false)
const deleteDialog = ref(false)
const isEditing = ref(false)

const form = ref({ id: null, nombre: '', telefono: '', direccion: '', detalle: '' })
const proveedorToDelete = ref(null)

const columns = [
    { key: 'nombre', label: 'Nombre' },
    { key: 'telefono', label: 'Teléfono' },
    { key: 'direccion', label: 'Dirección' },
    { key: 'detalle', label: 'Detalles' },
    { key: 'acciones', label: 'Acciones', sortable: false }
]

const proveedoresFiltrados = computed(() => {
    if (!search.value) return proveedores.value
    const s = search.value.toLowerCase()
    return proveedores.value.filter(p =>
        p.nombre?.toLowerCase().includes(s) ||
        p.telefono?.includes(s) ||
        p.direccion?.toLowerCase().includes(s)
    )
})

const saveProveedor = async () => {
    const result = await saveProveedorApi(isEditing.value, form.value)
    if (result) {
        closeDialog()
    }
}

const deleteProveedor = async () => {
    if (!proveedorToDelete.value) return
    const result = await deleteProveedorApi(proveedorToDelete.value.id)
    if (result) {
        deleteDialog.value = false
    }
}

const openNewDialog = () => {
    isEditing.value = false
    form.value = { id: null, nombre: '', telefono: '', direccion: '', detalle: '' }
    dialog.value = true
}

const editProveedor = (p) => {
    isEditing.value = true
    form.value = { ...p }
    dialog.value = true
}

const confirmDelete = (p) => {
    proveedorToDelete.value = p
    deleteDialog.value = true
}

const closeDialog = () => {
    dialog.value = false
}

onMounted(fetchProveedores)
</script>
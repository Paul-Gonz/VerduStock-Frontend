<template>
  <div class="p-6">
    <!-- Integrated Table Card -->
    <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 flex flex-col overflow-hidden">
      
      <!-- Unified Header Section -->
      <div class="p-4 sm:p-5 flex flex-col gap-4 border-b border-gray-100 dark:border-slate-800/60 bg-gray-50/30 dark:bg-transparent">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div class="w-full flex-1">
            <BaseSearch v-model="search" placeholder="Buscar por nombre, teléfono o dirección..." class="w-full" />
          </div>

          <div class="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button @click="openNewDialog"
              class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm">
              <span class="mdi mdi-plus-box"></span>
              Nuevo Proveedor
            </button>
          </div>
        </div>
      </div>

      <BaseTable class="border-0 shadow-none !bg-transparent pt-4" :columns="columns" :rows="proveedoresFiltrados" :searchable="false" :loading="loading"
        emptyText="No se encontraron proveedores">
        <template #acciones="{ row }">
          <div class="flex items-center gap-3">
            <button @click.stop="editProveedor(row)" class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 p-1 transition-colors"
              title="Editar">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button @click.stop="confirmDelete(row)" class="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-1 transition-colors"
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

    <!-- Modal Form -->
    <BaseModal :isOpen="dialog" @close="closeDialog" :title="isEditing ? 'Editar Proveedor' : 'Nuevo Proveedor'">
      <div class="p-4">
        <form @submit.prevent="saveProveedor" class="flex flex-col gap-4">
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-gray-700 dark:text-slate-300">Nombre *</label>
            <input v-model="form.nombre" type="text" required
              class="border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg px-3 py-2 outline-none focus:border-green-500 dark:focus:border-green-400 focus:ring-1 focus:ring-green-500" />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-gray-700 dark:text-slate-300">Teléfono</label>
            <input v-model="form.telefono" type="text"
              class="border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg px-3 py-2 outline-none focus:border-green-500 dark:focus:border-green-400 focus:ring-1 focus:ring-green-500" />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-gray-700 dark:text-slate-300">Dirección</label>
            <input v-model="form.direccion" type="text"
              class="border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg px-3 py-2 outline-none focus:border-green-500 dark:focus:border-green-400 focus:ring-1 focus:ring-green-500" />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-gray-700 dark:text-slate-300">Notas adicionales</label>
            <textarea v-model="form.detalle" rows="3"
              class="border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg px-3 py-2 outline-none focus:border-green-500 dark:focus:border-green-400 focus:ring-1 focus:ring-green-500"></textarea>
          </div>
        </form>
      </div>

      <template #footer>
        <div class="flex gap-3 justify-end w-full border-t border-gray-100 dark:border-slate-800 p-4">
          <button type="button" @click="closeDialog"
            class="px-4 py-2 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">Cancelar</button>
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
        <p class="text-gray-700 dark:text-slate-400">Esta acción eliminará a <b class="text-gray-900 dark:text-slate-200">{{ proveedorToDelete?.nombre }}</b>. Los datos no podrán
          recuperarse.</p>
      </div>
      <template #footer>
        <div class="flex gap-3 justify-end w-full border-t border-gray-100 dark:border-slate-800 p-4">
          <button type="button" @click="deleteDialog = false"
            class="px-4 py-2 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">Cancelar</button>
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

// Usamos el composable limpio que hereda useApi (CORS corregido)
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

const initialForm = { id: null, nombre: '', telefono: '', direccion: '', detalle: '' }
const form = ref({ ...initialForm })
const proveedorToDelete = ref(null)

const columns = [
  { key: 'nombre', label: 'Nombre' },
  { key: 'telefono', label: 'Teléfono' },
  { key: 'direccion', label: 'Dirección' },
  { key: 'detalle', label: 'Detalles' },
  { key: 'acciones', label: 'Acciones', sortable: false }
]

// Filtro reactivo en el frontend
const proveedoresFiltrados = computed(() => {
  const data = proveedores.value || []
  if (!search.value) return data
  const s = search.value.toLowerCase()
  return data.filter(p =>
    p.nombre?.toLowerCase().includes(s) ||
    p.telefono?.includes(s) ||
    p.direccion?.toLowerCase().includes(s)
  )
})

// --- ACCIONES ---

const saveProveedor = async () => {
  // El composable ya se encarga del try/catch y de refrescar la lista
  const result = await saveProveedorApi(isEditing.value, form.value)
  if (result) closeDialog()
}

const deleteProveedor = async () => {
  if (!proveedorToDelete.value) return
  const result = await deleteProveedorApi(proveedorToDelete.value.id)
  if (result) deleteDialog.value = false
}

// --- GESTIÓN DE MODALES ---

const openNewDialog = () => {
  isEditing.value = false
  form.value = { ...initialForm }
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
  // Limpiamos después de cerrar para evitar saltos visuales
  setTimeout(() => { form.value = { ...initialForm } }, 200)
}

onMounted(fetchProveedores)
</script>
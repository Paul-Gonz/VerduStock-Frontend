<template>
  <div class="categoria-page p-6">
    <!-- Error -->
    <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
      <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
      </svg>
      {{ error }}
      <button @click="fetchCategories" class="ml-auto underline hover:text-red-900">Reintentar</button>
    </div>

    <!-- Integrated Table Card -->
    <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 flex flex-col overflow-hidden">
      
      <!-- Unified Header Section -->
      <div class="p-4 sm:p-5 flex flex-col gap-4 border-b border-gray-100 dark:border-slate-800/60 bg-gray-50/30 dark:bg-transparent">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div class="w-full flex-1">
            <BaseSearch v-model="search" placeholder="Buscar categoría..." class="w-full" @search="setFilter" />
          </div>

          <div class="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button @click="onAdd"
              class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm">
              <span class="mdi mdi-plus-box"></span>
              Nueva Categoría
            </button>
          </div>
        </div>
      </div>

      <BaseTable class="border-0 shadow-none !bg-transparent pt-4" :columns="columns" :rows="categories" :loading="loading" :selectable="false" :searchable="false"
        empty-text="No hay categorías registradas aún.">
        <!-- ID -->
        <template #id="{ value }">
          <span class="font-semibold text-gray-600 dark:text-slate-400">#{{ value }}</span>
        </template>

        <!-- Nombre -->
        <template #nombre="{ value, row }">
          <span class="font-medium text-gray-900 dark:text-slate-200">{{ row.emoji }} {{ value }}</span>
        </template>

        <!-- Descripción -->
        <template #detalle="{ value }">
          <span class="text-gray-500 dark:text-slate-400 text-sm line-clamp-1">{{ value || '—' }}</span>
        </template>

        <template #acciones="{ row }">
          <div class="flex items-center gap-3">
            <button @click="onEdit(row)" class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 p-1 transition-colors" title="Editar">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button @click="onDelete(row)" :disabled="loading"
              class="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-1 transition-colors disabled:opacity-50" title="Eliminar">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </template>
      </BaseTable>
    </div>

    <!-- Modal Form (Create/Edit) -->
    <BaseModal :isOpen="isFormModalOpen" :title="isEditing ? 'Editar Categoría' : 'Nueva Categoría'"
      @close="closeFormModal">
      <div class="p-4">
        <form @submit.prevent="submitForm" class="flex flex-col gap-4">
          <div class="flex gap-3 items-end relative">
            <div class="relative">
              <button type="button" @click="showEmojiPicker = !showEmojiPicker"
                class="w-11 h-11 shrink-0 rounded-full border-2 border-dashed border-gray-300 dark:border-slate-600 flex items-center justify-center text-gray-400 dark:text-slate-500 hover:border-green-500 dark:hover:border-green-400 hover:text-green-500 dark:hover:text-green-400 transition-colors bg-gray-50 dark:bg-slate-800/50 text-2xl focus:outline-none focus:ring-2 focus:ring-green-500"
                title="Seleccionar Emoji">
                <div class="flex items-center justify-center w-full h-full leading-none rounded-full"
                  :class="!formData.emoji ? 'pb-1' : ''">
                  <span v-if="formData.emoji">{{ formData.emoji }}</span>
                  <span v-else>+</span>
                </div>
              </button>

              <div v-if="showEmojiPicker"
                class="absolute z-50 top-12 left-0 shadow-xl rounded-lg border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800">
                <ClientOnly>
                  <EmojiPicker :native="true"
                    :disabled-groups="['smileys_people', 'animals_nature', 'activities', 'travel_places', 'objects', 'symbols', 'flags']"
                    @select="onSelectEmoji" />
                </ClientOnly>
              </div>
            </div>

            <div class="flex flex-col gap-1 flex-1">
              <label class="text-sm font-medium text-gray-700 dark:text-slate-300">Nombre</label>
              <input v-model="formData.nombre" type="text" required placeholder="Ej. Frutas"
                class="w-full border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500" />
            </div>
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-gray-700 dark:text-slate-300">Descripción</label>
            <textarea v-model="formData.detalle" rows="3" placeholder="Breve detalle de la categoría..."
              class="border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"></textarea>
          </div>
        </form>
      </div>

      <template #footer>
        <div class="flex gap-3 justify-end w-full border-t border-gray-100 dark:border-slate-800 p-4">
          <button type="button" @click="closeFormModal"
            class="px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-gray-700 dark:text-slate-300 font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">Cancelar</button>
          <button @click="submitForm" :disabled="loading"
            class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2">
            <span v-if="loading"
              class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            {{ isEditing ? 'Actualizar' : 'Guardar' }}
          </button>
        </div>
      </template>
    </BaseModal>

    <!-- Modal Delete -->
    <BaseModal :isOpen="isDeleteModalOpen" title="Eliminar Categoría" @close="isDeleteModalOpen = false">
      <div class="p-4">
        <p class="text-sm text-gray-600 dark:text-slate-400">
          ¿Estás seguro de que deseas eliminar la categoría <strong class="text-gray-900 dark:text-slate-200">{{ itemToDelete?.nombre
          }}</strong>? Esta acción no se puede deshacer.
        </p>
      </div>

      <template #footer>
        <div class="flex gap-3 justify-end w-full border-t border-gray-100 dark:border-slate-800 p-4">
          <button type="button" @click="isDeleteModalOpen = false"
            class="px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-gray-700 dark:text-slate-300 font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">Cancelar</button>
          <button @click="submitDelete" :disabled="loading"
            class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2">
            <span v-if="loading"
              class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            Eliminar
          </button>
        </div>
      </template>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useCategories, type Category } from '~/composables/useCategories'
import EmojiPicker from 'vue3-emoji-picker'

// @ts-ignore - El componente BaseTable no tiene tipos definidos, pero sabemos que funciona bien
import 'vue3-emoji-picker/css'

// Extraemos todo del composable centralizado
const {
  categories,
  loading,
  error,
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  setFilter,
} = useCategories()

const search = ref('')

// Sincronizamos el input de búsqueda con la lógica del composable
watch(search, (val) => {
  setFilter(val)
})

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'nombre', label: 'Nombre' },
  { key: 'detalle', label: 'Descripción' },
  { key: 'acciones', label: 'Acciones', align: 'left' as const }
]

onMounted(() => fetchCategories())

// --- Modal and Form State ---
const isFormModalOpen = ref(false)
const showEmojiPicker = ref(false)
const isEditing = ref(false)
const initialFormState = { id: 0, nombre: '', detalle: '', emoji: '' }
const formData = ref({ ...initialFormState })
const editingId = ref<number | null>(null)

const onSelectEmoji = (emoji: any) => {
  formData.value.emoji = emoji.i
  showEmojiPicker.value = false
}

const onAdd = () => {
  formData.value = { ...initialFormState }
  isEditing.value = false
  editingId.value = null
  showEmojiPicker.value = false
  isFormModalOpen.value = true
}

const onEdit = (row: Category) => {
  editingId.value = row.id
  isEditing.value = true
  showEmojiPicker.value = false
  formData.value = {
    id: row.id,
    nombre: row.nombre,
    detalle: row.detalle || '',
    emoji: row.emoji || ''
  }
  isFormModalOpen.value = true
}

const closeFormModal = () => {
  isFormModalOpen.value = false
  // Reset después de que cierre la animación
  setTimeout(() => {
    formData.value = { ...initialFormState }
  }, 200)
}

const submitForm = async () => {
  try {
    if (isEditing.value && editingId.value !== null) {
      await updateCategory(editingId.value, formData.value)
    } else {
      await createCategory(formData.value)
    }
    closeFormModal()
  } catch (e) {
    // El error ya se gestiona en el composable (error.value)
    console.error('Error en formulario:', e)
  }
}

// --- Delete State ---
const isDeleteModalOpen = ref(false)
const itemToDelete = ref<Category | null>(null)

const onDelete = (row: Category) => {
  itemToDelete.value = row
  isDeleteModalOpen.value = true
}

const submitDelete = async () => {
  if (!itemToDelete.value) return
  try {
    await deleteCategory(itemToDelete.value.id)
    isDeleteModalOpen.value = false
  } catch (e) {
    console.error('Error al eliminar:', e)
  }
}
</script>

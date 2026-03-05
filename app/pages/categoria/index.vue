<template>
  <div class="categoria-page p-6">
    <div class="flex flex-col gap-4 mb-6">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold text-gray-800">Categorías</h1>
        <button 
          @click="onAdd" 
          class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Nueva Categoría
        </button>
      </div>

      <div class="flex gap-4 items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <BaseSearch 
          v-model="search" 
          placeholder="Buscar categoría..." 
          class="flex-1"
          @search="setFilter"
        />
      </div>
    </div>

    <!-- Error -->
    <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
      <svg class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z"/>
      </svg>
      {{ error }}
      <button @click="fetchCategories" class="ml-auto underline hover:text-red-900">Reintentar</button>
    </div>

    <!-- Main Table -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <BaseTable
        :columns="columns"
        :rows="categories"
        :loading="loading"
        :total="total"
        :selectable="false"
        :searchable="false"
        empty-text="No hay categorías registradas aún."
      >
        <!-- ID -->
        <template #id="{ value }">
          <span class="font-semibold text-gray-600">#{{ value }}</span>
        </template>

        <!-- Nombre -->
        <template #nombre="{ value, row }">
          <span class="font-medium text-gray-900">{{ row.emoji }} {{ value }}</span>
        </template>

        <!-- Descripción -->
        <template #detalle="{ value }">
          <span class="text-gray-500 text-sm line-clamp-1">{{ value || '—' }}</span>
        </template>

        <template #acciones="{ row }">
          <div class="flex items-center gap-3">
            <button 
              @click="onEdit(row)" 
              class="text-blue-600 hover:text-blue-800 p-1 transition-colors"
              title="Editar"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button 
              @click="onDelete(row)" 
              :disabled="loading"
              class="text-red-600 hover:text-red-800 p-1 transition-colors disabled:opacity-50"
              title="Eliminar"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </template>
      </BaseTable>
    </div>

    <!-- Modal Form (Create/Edit) -->
    <BaseModal
      :isOpen="isFormModalOpen"
      :title="isEditing ? 'Editar Categoría' : 'Nueva Categoría'"
      @close="closeFormModal"
    >
      <div class="p-4">
        <form @submit.prevent="submitForm" class="flex flex-col gap-4">
          <div class="flex gap-3 items-end relative">
            <div class="relative">
              <button
                type="button"
                @click="showEmojiPicker = !showEmojiPicker"
                class="w-11 h-11 shrink-0 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-green-500 hover:text-green-500 transition-colors bg-gray-50 text-2xl focus:outline-none focus:ring-2 focus:ring-green-500"
                title="Seleccionar Emoji"
              >
                <div class="flex items-center justify-center w-full h-full leading-none rounded-full" :class="!formData.emoji ? 'pb-1' : ''">
                  <span v-if="formData.emoji">{{ formData.emoji }}</span>
                  <span v-else>+</span>
                </div>
              </button>

              <div v-if="showEmojiPicker" class="absolute z-50 top-12 left-0 shadow-xl rounded-lg border border-gray-100 bg-white">
                <ClientOnly>
                  <EmojiPicker
                    :native="true"
                    :disabled-groups="['smileys_people', 'animals_nature', 'activities', 'travel_places', 'objects', 'symbols', 'flags']"
                    @select="onSelectEmoji"
                  />
                </ClientOnly>
              </div>
            </div>

            <div class="flex flex-col gap-1 flex-1">
              <label class="text-sm font-medium text-gray-700">Nombre</label>
              <input
                v-model="formData.nombre"
                type="text"
                required
                placeholder="Ej. Frutas"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-gray-700">Descripción</label>
            <textarea
              v-model="formData.detalle"
              rows="3"
              placeholder="Breve detalle de la categoría..."
              class="border border-gray-300 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            ></textarea>
          </div>
        </form>
      </div>
      
      <template #footer>
        <div class="flex gap-3 justify-end w-full border-t border-gray-100 p-4">
          <button type="button" @click="closeFormModal" class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors">Cancelar</button>
          <button @click="submitForm" :disabled="loading" class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2">
            <span v-if="loading" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            {{ isEditing ? 'Actualizar' : 'Guardar' }}
          </button>
        </div>
      </template>
    </BaseModal>

    <!-- Modal Delete -->
    <BaseModal
      :isOpen="isDeleteModalOpen"
      title="Eliminar Categoría"
      @close="isDeleteModalOpen = false"
    >
      <div class="p-4">
        <p class="text-sm text-gray-600">
          ¿Estás seguro de que deseas eliminar la categoría <strong class="text-gray-900">{{ itemToDelete?.nombre }}</strong>? Esta acción no se puede deshacer.
        </p>
      </div>
      
      <template #footer>
        <div class="flex gap-3 justify-end w-full border-t border-gray-100 p-4">
          <button type="button" @click="isDeleteModalOpen = false" class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors">Cancelar</button>
          <button @click="submitDelete" :disabled="loading" class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2">
            <span v-if="loading" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            Eliminar
          </button>
        </div>
      </template>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useCategories, type Category } from '~/composables/useCategories'
import EmojiPicker from 'vue3-emoji-picker'
import 'vue3-emoji-picker/css'

const {
  categories,
  loading,
  error,
  total,
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  setFilter,
} = useCategories()

const search = ref('')

const columns = [
  { key: 'id',         label: 'ID' },
  { key: 'nombre',     label: 'Nombre' },
  { key: 'detalle',    label: 'Descripción' },
    { key: 'acciones',   label: 'Acciones', align: 'left' as const }
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
    // Error is handled in useCategories composable
    console.error(e)
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
    console.error(e)
  }
}
</script>


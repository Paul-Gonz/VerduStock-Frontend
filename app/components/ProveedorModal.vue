<template>
  <BaseModal :isOpen="isOpen" @close="closeModal" title="Nuevo Proveedor">
    <div class="p-4">
      <form @submit.prevent="submitProveedor" class="flex flex-col gap-4">
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-gray-700 dark:text-slate-300">Nombre *</label>
          <input v-model="form.nombre" type="text" required
            class="border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg px-3 py-2 outline-none focus:border-green-500 dark:focus:border-green-400 focus:ring-1 focus:ring-green-500" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-gray-700 dark:text-slate-300">Teléfono</label>
          <input v-model="form.telefono" type="text" @input="form.telefono = form.telefono.replace(/\D/g, '')"
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
        <button type="button" @click="closeModal"
          class="px-4 py-2 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">Cancelar</button>
        <button @click="submitProveedor" :disabled="saving"
          class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2">
          <span v-if="saving"
            class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          Guardar
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref } from 'vue'
import { useProveedores } from '~/composables/useProveedores'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'saved'])

const { saving, saveProveedor } = useProveedores()

const initialForm = { id: null, nombre: '', telefono: '', direccion: '', detalle: '' }
const form = ref({ ...initialForm })

const closeModal = () => {
  emit('close')
  setTimeout(() => { form.value = { ...initialForm } }, 200)
}

const submitProveedor = async () => {
  const result = await saveProveedor(false, form.value)
  if (result) {
    emit('saved', form.value.nombre)
    closeModal()
  }
}
</script>

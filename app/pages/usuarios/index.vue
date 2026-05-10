<template>
  <div class="usuarios-page p-6">
    <!-- Integrated Table Card -->
    <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 flex flex-col overflow-hidden">
      
      <!-- Unified Header Section -->
      <div class="p-4 sm:p-5 flex flex-col gap-4 border-b border-gray-100 dark:border-slate-800/60 bg-gray-50/30 dark:bg-transparent">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div class="w-full flex-1">
            <BaseSearch v-model="search" placeholder="Buscar usuario..." class="w-full" />
          </div>

          <div class="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button @click="fetchUsers" :disabled="loading"
              class="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors border border-green-200 dark:border-green-800/50">
              <span v-if="loading"
                class="w-4 h-4 border-2 border-green-700 dark:border-green-400 border-t-transparent rounded-full animate-spin"></span>
              <span class="mdi mdi-refresh"></span>
              <span>Actualizar</span>
            </button>

            <button @click="openNewUserDialog"
              class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm">
              <span class="mdi mdi-plus-box"></span>
              Nuevo Usuario
            </button>
          </div>
        </div>
      </div>

      <BaseTable class="border-0 shadow-none !bg-transparent pt-4" :columns="headers" :rows="filteredUsuarios" :searchable="false" :loading="loading"
        emptyText="No se encontraron usuarios">
        <template #nombre="{ row }">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold">
              {{ row.nombre.charAt(0).toUpperCase() }}
            </div>
            <div>
              <div class="font-medium text-gray-900">{{ row.nombre }}</div>
              <div class="text-xs text-gray-500">ID: {{ row.id }}</div>
            </div>
          </div>
        </template>
        <template #status="{ row }">
          <span
            :class="['px-3 py-1 rounded-full text-xs font-medium', (row.status === 'activo' || !row.status) ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700']">
            {{ row.status || 'activo' }}
          </span>
        </template>
        <template #created_at="{ row }">
          {{ formatDate(row.created_at) }}
        </template>
        <template #acciones="{ row }">
          <div class="flex items-center justify-center gap-3">
            <button @click.stop="viewDialog = true; selectedUser = row" class="text-gray-500 hover:text-gray-700 p-1"
              title="Ver detalles">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
            <button @click.stop="editUser(row)" class="text-blue-600 hover:text-blue-800 p-1" title="Editar">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button @click.stop="confirmDelete(row)" class="text-red-600 hover:text-red-800 p-1" title="Eliminar">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </template>
      </BaseTable>
    </div>

    <!-- Modal User Form -->
    <BaseModal :isOpen="userDialog" @close="closeDialog" :title="isEditing ? 'Editar Usuario' : 'Nuevo Usuario'">
      <div class="p-4">
        <form @submit.prevent="handleSave" id="userForm" class="flex flex-col gap-4">
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-gray-700">Nombre *</label>
            <input v-model="form.nombre" type="text" required
              class="border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-green-500" />
          </div>

          <div v-if="isEditing" class="flex flex-col gap-1 p-3 bg-yellow-50 rounded-lg mb-2">
            <p class="text-xs text-yellow-800">Para poder actualizar o guardar los cambios del usuario, debes confirmar
              ingresando su contraseña actual.</p>
            <label class="text-sm font-medium text-gray-700 mt-2">Contraseña actual *</label>
            <input v-model="form.current_password" type="password" required
              class="border border-yellow-300 rounded-lg px-3 py-2 outline-none focus:border-yellow-500" />
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-gray-700">
              {{ isEditing ? 'Nueva contraseña (Opcional)' : 'Contraseña * ' }}
            </label>
            <input v-model="form.password" type="password" :required="!isEditing"
              class="border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-green-500" />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-gray-700">
              {{ isEditing ? 'Confirmar nueva contraseña' : 'Confirmar Contraseña * ' }}
            </label>
            <input v-model="form.password_confirmation" type="password" :required="!isEditing && form.password"
              class="border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-green-500" />
          </div>

          <div v-if="errorMessage" class="text-red-500 text-sm py-2">{{ errorMessage }}</div>
        </form>
      </div>
      <template #footer>
        <div class="flex gap-3 justify-end w-full border-t border-gray-100 p-4">
          <button type="button" @click="closeDialog"
            class="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">Cancelar</button>
          <button type="submit" form="userForm" :disabled="saving"
            class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2">
            <span v-if="saving"
              class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            {{ saving ? 'Guardando...' : 'Guardar' }}
          </button>
        </div>
      </template>
    </BaseModal>

    <!-- Modal Eliminar -->
    <BaseModal :isOpen="deleteDialog" @close="deleteDialog = false" title="Confirmar Eliminación">
      <div class="p-4">
        <p class="text-gray-700 mb-4">Para eliminar a <strong>{{ userToDelete?.nombre }}</strong>, debes ingresar tu
          contraseña actual de administrador por seguridad.</p>
        <form @submit.prevent="handleDelete" id="deleteForm" class="flex flex-col gap-4">
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-gray-700">Contraseña *</label>
            <input v-model="deletePassword" type="password" required
              class="border border-red-300 rounded-lg px-3 py-2 outline-none focus:border-red-500" />
          </div>
          <div v-if="deleteError" class="text-red-500 text-sm py-2">{{ deleteError }}</div>
        </form>
      </div>
      <template #footer>
        <div class="flex gap-3 justify-end w-full border-t border-gray-100 p-4">
          <button type="button" @click="deleteDialog = false"
            class="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">Cancelar</button>
          <button type="submit" form="deleteForm" :disabled="deleting"
            class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2">
            <span v-if="deleting"
              class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            Eliminar Usuario
          </button>
        </div>
      </template>
    </BaseModal>

    <!-- View Modal -->
    <BaseModal :isOpen="viewDialog" @close="viewDialog = false" title="Detalle de Usuario">
      <div class="p-4 flex flex-col gap-3" v-if="selectedUser">
        <div class="flex items-center gap-4 border-b border-gray-100 pb-4">
          <div
            class="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-2xl">
            {{ selectedUser.nombre.charAt(0).toUpperCase() }}
          </div>
          <div>
            <h3 class="text-lg font-bold">{{ selectedUser.nombre }}</h3>
            <p class="text-gray-500 text-sm">ID: {{ selectedUser.id }}</p>
          </div>
        </div>
        <div class="flex flex-col gap-1 py-2">
          <span class="text-xs text-gray-500 uppercase font-medium">Registro</span>
          <span>{{ formatDate(selectedUser.created_at) }}</span>
        </div>
      </div>
      <template #footer>
        <div class="flex gap-3 justify-end w-full border-t border-gray-100 p-4">
          <button @click="viewDialog = false"
            class="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">Cerrar</button>
        </div>
      </template>
    </BaseModal>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useUsuarios } from '~/composables/useUsuarios'

const {
  usuarios,
  loading,
  saving,
  deleting,
  errorMessage,
  deleteError,
  fetchUsers,
  saveUser,
  deleteUser
} = useUsuarios()

const search = ref('')
const userDialog = ref(false)
const deleteDialog = ref(false)
const viewDialog = ref(false)

const initialForm = {
  nombre: '',
  password: '',
  password_confirmation: '',
  current_password: ''
}
const form = ref({ ...initialForm })
const showPassword = ref(false)
const userToDelete = ref(null)
const deletePassword = ref('')
const selectedUser = ref(null)
const isEditing = ref(false)

const snackbar = ref({
  show: false,
  title: '',
  message: '',
  color: 'success',
  icon: 'mdi-check-circle',
  timeout: 4000
})

// Headers para tu BaseTable
const headers = [
  { label: 'Usuario', key: 'nombre', width: '250px' },
  { label: 'Fecha de registro', key: 'created_at', width: '150px' },
  { label: 'Estado', key: 'status', width: '120px' },
  { label: 'Acciones', key: 'acciones', width: '140px', align: 'center', sortable: false }
]

// --- FILTRADO ---
const filteredUsuarios = computed(() => {
  const list = usuarios.value || []
  if (!search.value) return list
  const term = search.value.toLowerCase()
  return list.filter(u =>
    u.nombre?.toLowerCase().includes(term) ||
    String(u.id).includes(term)
  )
})

// --- UTILIDADES ---
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return dateString
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit'
  })
}

const showNotification = (title, message, type = 'success') => {
  snackbar.value = {
    show: true,
    title,
    message,
    color: type === 'error' ? 'error' : 'success',
    icon: type === 'error' ? 'mdi-alert-circle' : 'mdi-check-circle',
    timeout: 4000
  }
}

// --- ACCIONES ---
onMounted(fetchUsers)

const openNewUserDialog = () => {
  isEditing.value = false
  form.value = { ...initialForm }
  errorMessage.value = ''
  userDialog.value = true
}

const editUser = (user) => {
  isEditing.value = true
  selectedUser.value = user
  // Al editar no cargamos los passwords por seguridad
  form.value = { nombre: user.nombre, password: '', password_confirmation: '', current_password: '' }
  errorMessage.value = ''
  userDialog.value = true
}

const handleSave = async () => {
  const id = isEditing.value && selectedUser.value ? selectedUser.value.id : null
  const result = await saveUser(id, form.value)

  if (result.success) {
    userDialog.value = false
    showNotification(
      isEditing.value ? 'Usuario actualizado' : 'Usuario creado',
      result.message
    )
    // El composable ya debería llamar a fetchUsers(), pero si no, puedes hacerlo aquí
  }
}

const confirmDelete = (user) => {
  userToDelete.value = user
  deletePassword.value = ''
  deleteError.value = ''
  deleteDialog.value = true
}

const handleDelete = async () => {
  if (!userToDelete.value || !deletePassword.value) return

  const result = await deleteUser(userToDelete.value.id, deletePassword.value)
  if (result.success) {
    deleteDialog.value = false
    showNotification('Usuario eliminado', result.message, 'success')
  }
}

const closeDialog = () => {
  userDialog.value = false
  setTimeout(() => { form.value = { ...initialForm } }, 300)
}
</script>
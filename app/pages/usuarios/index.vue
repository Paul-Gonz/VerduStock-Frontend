<template>
  <div class="usuarios-page p-6">
    <div class="flex flex-col gap-4 mb-6">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold text-gray-800">Gestión de Usuarios</h1>
        <button 
          @click="openNewUserDialog" 
          class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Nuevo Usuario
        </button>
      </div>

      <div class="flex gap-4 items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <BaseSearch 
          v-model="search" 
          placeholder="Buscar usuario..." 
          class="flex-1"
        />
        <button
          @click="fetchUsers"
          :disabled="loading"
          class="bg-green-50 text-green-700 hover:bg-green-100 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors border border-green-200"
        >
          <span v-if="loading" class="w-4 h-4 border-2 border-green-700 border-t-transparent rounded-full animate-spin"></span>
          <span>Actualizar</span>
        </button>
      </div>
    </div>

    <!-- Main Table -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <BaseTable
        :columns="headers"
        :rows="filteredUsuarios"
        :searchable="false"
        :loading="loading"
        emptyText="No se encontraron usuarios"
      >
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
          <span :class="['px-3 py-1 rounded-full text-xs font-medium', (row.status === 'activo' || !row.status) ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700']">
            {{ row.status || 'activo' }}
          </span>
        </template>
        <template #created_at="{ row }">
          {{ formatDate(row.created_at) }}
        </template>
        <template #acciones="{ row }">
          <div class="flex items-center justify-center gap-3">
            <button @click.stop="viewDialog = true; selectedUser = row" class="text-gray-500 hover:text-gray-700 p-1" title="Ver detalles">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
            <button @click.stop="editUser(row)" class="text-blue-600 hover:text-blue-800 p-1" title="Editar">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button @click.stop="confirmDelete(row)" class="text-red-600 hover:text-red-800 p-1" title="Eliminar">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
            <input v-model="form.nombre" type="text" required class="border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-green-500" />
          </div>
          
          <div v-if="isEditing" class="flex flex-col gap-1 p-3 bg-yellow-50 rounded-lg mb-2">
            <p class="text-xs text-yellow-800">Para poder actualizar o guardar los cambios del usuario, debes confirmar ingresando su contraseña actual.</p>
            <label class="text-sm font-medium text-gray-700 mt-2">Contraseña actual *</label>
            <input v-model="form.current_password" type="password" required class="border border-yellow-300 rounded-lg px-3 py-2 outline-none focus:border-yellow-500" />
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-gray-700">{{ isEditing ? 'Nueva contraseña (Opcional)' : 'Contraseña *' }}</label>
            <input v-model="form.password" type="password" :required="!isEditing" class="border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-green-500" />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-gray-700">{{ isEditing ? 'Confirmar nueva contraseña' : 'Confirmar Contraseña *' }}</label>
            <input v-model="form.password_confirmation" type="password" :required="!isEditing && form.password" class="border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-green-500" />
          </div>
          
          <div v-if="errorMessage" class="text-red-500 text-sm py-2">{{ errorMessage }}</div>
        </form>
      </div>
      <template #footer>
        <div class="flex gap-3 justify-end w-full border-t border-gray-100 p-4">
          <button type="button" @click="closeDialog" class="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">Cancelar</button>
          <button type="submit" form="userForm" :disabled="saving" class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2">
            <span v-if="saving" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            {{ saving ? 'Guardando...' : 'Guardar' }}
          </button>
        </div>
      </template>
    </BaseModal>

    <!-- Modal Eliminar -->
    <BaseModal :isOpen="deleteDialog" @close="deleteDialog = false" title="Confirmar Eliminación">
      <div class="p-4">
        <p class="text-gray-700 mb-4">Para eliminar a <strong>{{ userToDelete?.nombre }}</strong>, debes ingresar tu contraseña actual de administrador por seguridad.</p>
        <form @submit.prevent="handleDelete" id="deleteForm" class="flex flex-col gap-4">
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-gray-700">Contraseña *</label>
            <input v-model="deletePassword" type="password" required class="border border-red-300 rounded-lg px-3 py-2 outline-none focus:border-red-500" />
          </div>
          <div v-if="deleteError" class="text-red-500 text-sm py-2">{{ deleteError }}</div>
        </form>
      </div>
      <template #footer>
        <div class="flex gap-3 justify-end w-full border-t border-gray-100 p-4">
          <button type="button" @click="deleteDialog = false" class="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">Cancelar</button>
          <button type="submit" form="deleteForm" :disabled="deleting" class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2">
            <span v-if="deleting" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            Eliminar Usuario
          </button>
        </div>
      </template>
    </BaseModal>

    <!-- View Modal -->
    <BaseModal :isOpen="viewDialog" @close="viewDialog = false" title="Detalle de Usuario">
      <div class="p-4 flex flex-col gap-3" v-if="selectedUser">
        <div class="flex items-center gap-4 border-b border-gray-100 pb-4">
           <div class="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-2xl">
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
          <button @click="viewDialog = false" class="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">Cerrar</button>
        </div>
      </template>
    </BaseModal>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
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
const page = ref(1)
const totalPages = ref(1)

const userDialog = ref(false)
const deleteDialog = ref(false)
const viewDialog = ref(false)

const form = ref({
    nombre: '',
    password: '',
    password_confirmation: '',
    current_password: ''
})
const showPassword = ref(false)
const userToDelete = ref(null)
const deletePassword = ref('')
const selectedUser = ref(null)
const isEditing = ref(false)

const userStats = ref([
    {
        id: 1, title: 'Usuarios Totales', value: '0', icon: 'mdi-account-group', color: 'success-lighten-4', iconColor: 'success', tag: 'Activos', tagColor: 'success', change: '+2%', changeIcon: 'mdi-arrow-up', changeClass: 'text-success'
    }
])

const headers = [
    { label: 'Usuario', key: 'nombre', width: '250px' },
    { label: 'Fecha de registro', key: 'created_at', width: '150px' },
    { label: 'Estado', key: 'status', width: '120px' },
    { label: 'Acciones', key: 'acciones', width: '140px', align: 'center', sortable: false }
]

const filteredUsuarios = computed(() => {
    if (!search.value) return usuarios.value;
    const term = search.value.toLowerCase();
    return usuarios.value.filter(u => 
        u.nombre.toLowerCase().includes(term) || 
        String(u.id).toLowerCase().includes(term)
    );
});

const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    try {
        const date = new Date(dateString)
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = String(date.getFullYear()).slice(-2);
        return `${day}/${month}/${year}`;
    } catch(e) {
        return dateString;
    }
}

const snackbar = ref({ show: false, title: '', message: '', color: 'success', icon: 'mdi-check-circle', timeout: 4000 })

const showNotification = (title, message, type = 'success') => {
    snackbar.value = { show: true, title, message, color: type === 'error' ? 'error' : 'success', icon: 'mdi-information', timeout: 4000 }
}

onMounted(() => {
    fetchUsers()
})

const openNewUserDialog = () => {
    isEditing.value = false
    form.value = { nombre: '', password: '', password_confirmation: '', current_password: '' }
    errorMessage.value = ''
    userDialog.value = true
}

const viewUser = (user) => {
    selectedUser.value = user
    viewDialog.value = true
}

const editUser = (user) => {
    isEditing.value = true
    selectedUser.value = user
    form.value = { nombre: user.nombre, password: '', password_confirmation: '', current_password: '' }
    errorMessage.value = ''
    userDialog.value = true
}

const confirmDelete = (user) => {
    userToDelete.value = user
    deletePassword.value = ''
    deleteError.value = ''
    deleteDialog.value = true
}

const handleSave = async () => {
    const id = isEditing.value && selectedUser.value ? selectedUser.value.id : null;
    const result = await saveUser(id, form.value);
    
    if (result.success) {
      userDialog.value = false;
      showNotification(isEditing.value ? 'Usuario actualizado' : 'Usuario creado', result.message, 'success');
    }
}

const handleDelete = async () => {
    if (!userToDelete.value || !deletePassword.value) return;
    
    const result = await deleteUser(userToDelete.value.id, deletePassword.value);
    if (result.success) {
      deleteDialog.value = false;
      showNotification('Usuario eliminado', result.message, 'success');
    }
}

const closeDialog = () => { userDialog.value = false }

const resetForm = () => {
    form.value = { nombre: '', password: '', password_confirmation: '', current_password: '' };
};

</script>

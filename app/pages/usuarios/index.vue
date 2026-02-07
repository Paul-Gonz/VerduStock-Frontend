<template>
    <section class="usuarios-page">
        <!-- Tarjeta de estadísticas -->
        <v-card class="mb-8 section-card" rounded="lg" border>
            <v-card-title class="d-flex align-center justify-space-between">
               <span class="text-subtitle-1 font-weight-bold">Módulo de Usuarios</span>
                <v-btn 
                    class="new-user-btn" 
                    color="success" 
                    variant="flat" 
                    prepend-icon="mdi-account-plus"
                    @click="openNewUserDialog"
                >
                    Nuevo usuario
                </v-btn>
            </v-card-title>
           <!--<v-card-text>
                <v-row>
                    <v-col v-for="stat in userStats" :key="stat.id" cols="12" md="4">
                        <v-card class="stat-card" rounded="lg" border>
                            <v-card-text>
                                <div class="d-flex align-center justify-space-between">
                                    <div class="d-flex align-center ga-3">
                                        <v-avatar :color="stat.color" size="44">
                                            <v-icon :color="stat.iconColor" :icon="stat.icon"></v-icon>
                                        </v-avatar>
                                        <div>
                                            <div class="text-subtitle-1 font-weight-bold">{{ stat.value }}</div>
                                            <div class="text-caption text-medium-emphasis">{{ stat.title }}</div>
                                        </div>
                                    </div>
                                    <v-chip :color="stat.tagColor" variant="tonal" size="small">{{ stat.tag }}</v-chip>
                                </div>

                                <v-divider class="my-3"></v-divider>

                                <div class="d-flex align-center justify-space-between text-body-2">
                                    <span class="text-medium-emphasis">Cambio mensual</span>
                                    <span class="font-weight-semibold" :class="stat.changeClass">
                                        <v-icon size="16" :icon="stat.changeIcon"></v-icon>
                                        {{ stat.change }}
                                    </span>
                                </div>
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>
            </v-card-text>-->
        </v-card>

        <!-- Tabla de usuarios -->
        <v-card class="section-card" rounded="lg" border>
            <v-card-title class="d-flex align-center justify-space-between">
                <span class="text-subtitle-1 font-weight-bold">Lista de Usuarios</span>
                <div class="d-flex align-center ga-2">
                    <v-text-field
                        v-model="search"
                        placeholder="Buscar usuario..."
                        prepend-inner-icon="mdi-magnify"
                        variant="outlined"
                        density="compact"
                        hide-details
                        style="width: 250px;"
                        rounded="lg"
                    ></v-text-field>
                    <v-btn
                        icon
                        variant="tonal"
                        color="success"
                        size="small"
                        @click="fetchUsers"
                        :loading="loading"
                    >
                        <v-icon>mdi-refresh</v-icon>
                    </v-btn>
                </div>
            </v-card-title>
            <v-card-text>
                <v-data-table
                    :headers="headers"
                    :items="usuarios"
                    :search="search"
                    :loading="loading"
                    :items-per-page="10"
                    class="elevation-0"
                    hide-default-footer
                >
                    <!-- Columna: Nombre -->
                    <template #[`item.nombre`]="{ item }">
                        <div class="d-flex align-center ga-3">
                            <v-avatar color="success-lighten-4" size="36">
                                <v-icon color="success" icon="mdi-account"></v-icon>
                            </v-avatar>
                            <div>
                                <div class="text-subtitle-2 font-weight-bold">{{ item.nombre }}</div>
                                <div class="text-caption text-medium-emphasis">ID: {{ item.id }}</div>
                            </div>
                        </div>
                    </template>

                    <!-- Columna: Fecha de registro -->
                    <template #[`item.created_at`]="{ item }">
                        <div class="text-body-2">
                            {{ formatDate(item.created_at) }}
                        </div>
                    </template>

                    <!-- Columna: Estado -->
                    <template #[`item.status`]="{ item }">
                        <v-chip
                            color="success"
                            variant="tonal"
                            size="small"
                            class="active-chip"
                        >
                            <v-icon start size="16">mdi-check-circle</v-icon>
                            Activo
                        </v-chip>
                    </template>

                    <!-- Columna: Acciones -->
                    <template #[`item.actions`]="{ item }">
                        <div class="d-flex ga-1">
                            <v-btn
                                icon
                                size="small"
                                variant="tonal"
                                color="info"
                                @click="viewUser(item)"
                            >
                                <v-icon>mdi-eye</v-icon>
                            </v-btn>
                            <v-btn
                                icon
                                size="small"
                                variant="tonal"
                                color="warning"
                                @click="editUser(item)"
                            >
                                <v-icon>mdi-pencil</v-icon>
                            </v-btn>
                            <v-btn
                                icon
                                size="small"
                                variant="tonal"
                                color="error"
                                @click="confirmDelete(item)"
                            >
                                <v-icon>mdi-delete</v-icon>
                            </v-btn>
                        </div>
                    </template>

                    <!-- Cuando no hay datos -->
                    <template #no-data>
                        <div class="text-center py-8">
                            <v-icon size="64" color="grey-lighten-1" icon="mdi-account-group-outline"></v-icon>
                            <div class="text-h6 mt-2 text-grey">No hay usuarios registrados</div>
                            <div class="text-body-2 text-grey mt-2">Haz clic en "Nuevo usuario" para crear uno</div>
                        </div>
                    </template>

                    <!-- Cuando está cargando -->
                    <template #loading>
                        <div class="text-center py-8">
                            <v-progress-circular indeterminate color="success"></v-progress-circular>
                            <div class="text-body-1 mt-2">Cargando usuarios...</div>
                        </div>
                    </template>
                </v-data-table>

                <!-- Paginación -->
                <div class="d-flex justify-center mt-6" v-if="usuarios.length > 0">
                    <v-pagination
                        v-model="page"
                        :length="totalPages"
                        :total-visible="5"
                        color="success"
                        rounded="circle"
                    ></v-pagination>
                </div>
            </v-card-text>
        </v-card>

        <!-- Diálogo para nuevo usuario -->
        <v-dialog v-model="userDialog" max-width="500" persistent>
            <v-card rounded="lg">
                <v-card-title class="d-flex align-center justify-space-between">
                    <span class="text-h6 font-weight-bold">
                        {{ isEditing ? 'Editar Usuario' : 'Nuevo Usuario' }}
                    </span>
                    <v-btn icon @click="closeDialog">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </v-card-title>
                <v-card-text>
                    <v-form @submit.prevent="saveUser" ref="userForm">
                        <v-text-field
                            v-model="form.nombre"
                            label="Nombre de usuario"
                            placeholder="Ingresa el nombre de usuario"
                            variant="outlined"
                            :rules="[v => !!v || 'El nombre es requerido', v => v.length >= 3 || 'Mínimo 3 caracteres']"
                            required
                            class="mb-4"
                            rounded="lg"
                        ></v-text-field>

                        <v-text-field
                            v-model="form.password"
                            :label="isEditing ? 'Nueva contraseña (opcional)' : 'Contraseña'"
                            :placeholder="isEditing ? 'Dejar en blanco para no cambiar' : 'Ingresa la contraseña'"
                            :type="showPassword ? 'text' : 'password'"
                            variant="outlined"
                            :rules="isEditing ? [] : [v => !!v || 'La contraseña es requerida', v => v.length >= 6 || 'Mínimo 6 caracteres']"
                            :required="!isEditing"
                            class="mb-4"
                            rounded="lg"
                            :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                            @click:append-inner="showPassword = !showPassword"
                        ></v-text-field>

                        <v-text-field
                            v-model="form.password_confirmation"
                            label="Confirmar contraseña"
                            placeholder="Confirma la contraseña"
                            :type="showPassword ? 'text' : 'password'"
                            variant="outlined"
                            :rules="[v => !form.password || v === form.password || 'Las contraseñas no coinciden']"
                            class="mb-4"
                            rounded="lg"
                        ></v-text-field>

                        <div v-if="isEditing" class="mb-4">
    <v-text-field
        v-model="form.current_password"
        :label="`Contraseña de ${selectedUser?.nombre} (requerida para editar)`"
        placeholder="Ingresa la contraseña del usuario a editar"
        type="password"
        variant="outlined"
        :rules="[v => !!v || 'La contraseña del usuario es requerida']"
        required
        rounded="lg"
    ></v-text-field>
</div>

                        <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-4">
                            {{ errorMessage }}
                        </v-alert>
                    </v-form>
                </v-card-text>
                <v-card-actions class="px-6 pb-6">
                    <v-spacer></v-spacer>
                    <v-btn variant="tonal" @click="closeDialog">Cancelar</v-btn>
                    <v-btn 
                        color="success" 
                        @click="saveUser"
                        :loading="saving"
                        variant="flat"
                    >
                        {{ isEditing ? 'Actualizar' : 'Crear' }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Diálogo de confirmación para eliminar -->
        <v-dialog v-model="deleteDialog" max-width="400">
            <v-card rounded="lg">
                <v-card-title class="text-h6 font-weight-bold">¿Eliminar usuario?</v-card-title>
                <v-card-text>
                    <div class="text-body-1">
                        ¿Estás seguro de eliminar al usuario <strong>{{ userToDelete?.nombre }}</strong>?
                    </div>
                   <v-text-field
    v-model="deletePassword"
    :label="`Contraseña de ${userToDelete?.nombre}`"
    placeholder="Ingresa la contraseña del usuario a eliminar"
    type="password"
    variant="outlined"
    class="mt-4"
    rounded="lg"
    :rules="[v => !!v || 'La contraseña del usuario es requerida']"
></v-text-field>
                    <v-alert v-if="deleteError" type="error" variant="tonal" class="mt-2">
                        {{ deleteError }}
                    </v-alert>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn variant="tonal" @click="deleteDialog = false">Cancelar</v-btn>
                    <v-btn 
                        color="error" 
                        @click="deleteUser"
                        :loading="deleting"
                        :disabled="!deletePassword"
                        variant="flat"
                    >
                        Eliminar
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Diálogo para ver detalles -->
        <v-dialog v-model="viewDialog" max-width="500">
            <v-card rounded="lg" v-if="selectedUser">
                <v-card-title class="d-flex align-center justify-space-between">
                    <span class="text-h6 font-weight-bold">Detalles del Usuario</span>
                    <v-btn icon @click="viewDialog = false">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </v-card-title>
                <v-card-text>
                    <div class="text-center mb-6">
                        <v-avatar color="success" size="80">
                            <v-icon size="40" color="white">mdi-account</v-icon>
                        </v-avatar>
                        <div class="text-h5 font-weight-bold mt-4">{{ selectedUser.nombre }}</div>
                        <div class="text-body-2 text-medium-emphasis">ID: {{ selectedUser.id }}</div>
                    </div>

                    <v-divider class="my-4"></v-divider>

                    <v-row>
                        <v-col cols="6">
                            <div class="text-caption text-medium-emphasis">Fecha de registro</div>
                            <div class="text-body-1 font-weight-bold">{{ formatDate(selectedUser.created_at) }}</div>
                        </v-col>
                        <v-col cols="6">
                            <div class="text-caption text-medium-emphasis">Última actualización</div>
                            <div class="text-body-1 font-weight-bold">{{ formatDate(selectedUser.updated_at) }}</div>
                        </v-col>
                    </v-row>

                    <div class="mt-6">
                        <div class="text-caption text-medium-emphasis mb-2">Estado</div>
                        <v-chip
                            color="success"
                            variant="tonal"
                            size="large"
                            class="px-4 active-chip"
                        >
                            <v-icon start>mdi-check-circle</v-icon>
                            Activo
                        </v-chip>
                    </div>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="success" variant="tonal" @click="editUser(selectedUser)">
                        <v-icon start>mdi-pencil</v-icon>
                        Editar
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-snackbar
    v-model="snackbar.show"
    :color="snackbar.color"
    :timeout="snackbar.timeout"
    location="top right"
    rounded="lg"
    elevation="10"
>
    <div class="d-flex align-center ga-3">
        <v-icon :icon="snackbar.icon" size="24"></v-icon>
        <div>
            <div class="text-subtitle-2 font-weight-bold">{{ snackbar.title }}</div>
            <div class="text-body-2">{{ snackbar.message }}</div>
        </div>
    </div>
    
    <template v-slot:actions>
        <v-btn
            icon
            variant="text"
            :color="snackbar.color"
            @click="snackbar.show = false"
        >
            <v-icon>mdi-close</v-icon>
        </v-btn>
    </template>
</v-snackbar>
    </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// Estados
const usuarios = ref([])
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const search = ref('')
const page = ref(1)
const totalPages = ref(1)
const errorMessage = ref('')
const deleteError = ref('')

// Diálogos
const userDialog = ref(false)
const deleteDialog = ref(false)
const viewDialog = ref(false)

// Formularios
const form = ref({
    nombre: '',
    password: '',
    password_confirmation: '',
    current_password: ''
})
const showPassword = ref(false)
const userForm = ref(null)
const userToDelete = ref(null)
const deletePassword = ref('')
const selectedUser = ref(null)
const isEditing = ref(false)

// Estadísticas
const userStats = ref([
    {
        id: 1,
        title: 'Usuarios Totales',
        value: '0',
        icon: 'mdi-account-group',
        color: 'success-lighten-4',
        iconColor: 'success',
        tag: 'Activos',
        tagColor: 'success',
        change: '+2%',
        changeIcon: 'mdi-arrow-up',
        changeClass: 'text-success'
    },
    {
        id: 2,
        title: 'Nuevos este mes',
        value: '0',
        icon: 'mdi-account-plus',
        color: 'info-lighten-4',
        iconColor: 'info',
        tag: 'Reciente',
        tagColor: 'info',
        change: '+5%',
        changeIcon: 'mdi-arrow-up',
        changeClass: 'text-info'
    },
    {
        id: 3,
        title: 'Administradores',
        value: '0',
        icon: 'mdi-shield-account',
        color: 'warning-lighten-4',
        iconColor: 'warning',
        tag: 'Privilegiados',
        tagColor: 'warning',
        change: '0%',
        changeIcon: 'mdi-minus',
        changeClass: 'text-grey'
    }
])

// Headers de la tabla
const headers = [
    { title: 'Usuario', key: 'nombre', width: '250px' },
    { title: 'Fecha de registro', key: 'created_at', width: '150px' },
    { title: 'Estado', key: 'status', width: '120px' },
    { title: 'Acciones', key: 'actions', width: '140px', align: 'center', sortable: false }
]

// Funciones helper
const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    try {
        const date = new Date(dateString)
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    } catch (e) {
        return dateString
    }
}

const snackbar = ref({
    show: false,
    title: '',
    message: '',
    color: 'success',
    icon: 'mdi-check-circle',
    timeout: 4000
})

// Función para mostrar notificaciones
const showNotification = (title, message, type = 'success') => {
    const types = {
        success: {
            color: 'success',
            icon: 'mdi-check-circle',
            timeout: 4000
        },
        error: {
            color: 'error',
            icon: 'mdi-alert-circle',
            timeout: 5000
        },
        warning: {
            color: 'warning',
            icon: 'mdi-alert',
            timeout: 4500
        },
        info: {
            color: 'info',
            icon: 'mdi-information',
            timeout: 4000
        }
    }
    
    const config = types[type] || types.success
    
    snackbar.value = {
        show: true,
        title,
        message,
        color: config.color,
        icon: config.icon,
        timeout: config.timeout
    }
}

// Verificar estado de autenticación
const checkAuthStatus = async () => {
    try {
        const response = await $fetch('http://localhost:8000/check-auth', {
            credentials: 'include'
        })
        return response.authenticated
    } catch (error) {
        console.error('Error verificando autenticación:', error)
        return false
    }
}

onMounted(async () => {
    const isAuthenticated = await checkAuthStatus()
    
    if (isAuthenticated) {
        await fetchUsers()
    } else {
        errorMessage.value = 'Debes iniciar sesión para ver los usuarios'
        // Redirigir al login si no está autenticado
        // router.push('/login')
    }
})

// Cargar usuarios
const fetchUsers = async () => {
    loading.value = true
    errorMessage.value = ''
    try {
        const response = await $fetch('http://localhost:8000/usuarios/', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
        
        // Diferentes formatos de respuesta posibles
        if (Array.isArray(response)) {
            usuarios.value = response
        } else if (response.data && Array.isArray(response.data)) {
            usuarios.value = response.data
        } else if (response.success && response.data) {
            usuarios.value = response.data
        } else {
            usuarios.value = []
        }
        
        // Actualizar estadísticas
        updateStats(usuarios.value.length)
        
    } catch (error) {
        console.error('Error al cargar usuarios:', error)
        errorMessage.value = `Error al cargar usuarios: ${error.message || 'Error desconocido'}`
        usuarios.value = []
        updateStats(0)
    } finally {
        loading.value = false
    }
}

const updateStats = (totalUsers) => {
    userStats.value[0].value = totalUsers.toString()
    userStats.value[1].value = Math.floor(totalUsers * 0.1).toString()
    userStats.value[2].value = Math.floor(totalUsers * 0.2).toString()
}

// Diálogos
const openNewUserDialog = () => {
    isEditing.value = false
    resetForm()
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
    form.value = {
        nombre: user.nombre,
        password: '',
        password_confirmation: '',
        current_password: ''
    }
    errorMessage.value = ''
    userDialog.value = true
}

const confirmDelete = (user) => {
    userToDelete.value = user
    deletePassword.value = ''
    deleteError.value = ''
    deleteDialog.value = true
}

const resetForm = () => {
    form.value = {
        nombre: '',
        password: '',
        password_confirmation: '',
        current_password: ''
    }
    if (userForm.value) {
        userForm.value.reset()
    }
}

const closeDialog = () => {
    userDialog.value = false
    resetForm()
}

// Guardar usuario
const saveUser = async () => {
    if (!userForm.value) return
    
    const { valid } = await userForm.value.validate()
    if (!valid) {
        console.log('Validación del formulario fallida')
        return
    }
    
    saving.value = true
    errorMessage.value = ''
    
    try {
        let url, method, payload
        
        if (isEditing.value) {
    // Editar usuario existente
    url = `http://localhost:8000/usuarios/${selectedUser.value.id}`
    method = 'PUT'
    payload = {
        nombre: form.value.nombre,
        current_password: form.value.current_password // Esta es la contraseña DEL USUARIO que se edita
    }
    
    // Solo agregar nueva contraseña si se proporcionó
    if (form.value.password) {
        payload.new_password = form.value.password
        payload.new_password_confirmation = form.value.password_confirmation
    }
} else {
            // Crear nuevo usuario
            url = 'http://localhost:8000/usuarios/'
            method = 'POST'
            payload = {
                nombre: form.value.nombre,
                password: form.value.password,
                password_confirmation: form.value.password_confirmation
            }
        }
        
        const response = await $fetch(url, {
            method,
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify(payload)
        })
        
        if (response.success) {
            await fetchUsers()
            closeDialog()
            showNotification(
    isEditing.value ? 'Usuario actualizado' : 'Usuario creado',
    response.message || (isEditing.value ? 'Usuario actualizado exitosamente' : 'Usuario creado exitosamente'),
    'success'
)
        } else {
            errorMessage.value = response.message || 'Error en la operación'
        }
        
    } catch (error) {
        console.error('Error al guardar usuario:', error)
        
        if (error.status === 401) {
            errorMessage.value = 'No estás autenticado. Por favor inicia sesión.'
            await navigateTo('/login')
        } else if (error.status === 403) {
            errorMessage.value = 'No tienes permiso para realizar esta acción.'
        } else if (error.data) {
            if (error.data.message) {
                errorMessage.value = error.data.message
            } else if (error.data.errors) {
                const errors = Object.values(error.data.errors).flat()
                errorMessage.value = errors.join(', ')
            }
        } else {
            showNotification(
    'Error',
    errorMessage.value || 'Ocurrió un error al guardar el usuario',
    'error'
)
        }
    } finally {
        saving.value = false
    }
}

// Eliminar usuario
const deleteUser = async () => {
    if (!userToDelete.value) return
    
    deleting.value = true
    deleteError.value = ''
    
    try {
        const response = await $fetch(`http://localhost:8000/usuarios/${userToDelete.value.id}`, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                password: deletePassword.value
            })
        })
        
        if (response && response.success) {
            await fetchUsers()
            deleteDialog.value = false
            showNotification(
    'Usuario eliminado',
    'Usuario eliminado exitosamente',
    'success'
)
        } else {
            throw new Error(response?.message || 'Error al eliminar usuario')
        }
        
    } catch (error) {
        console.error('Error al eliminar usuario:', error)
        
        if (error.data) {
            deleteError.value = error.data.message || 'Error al eliminar usuario'
        } else {
           showNotification(
    'Error',
    deleteError.value || 'Ocurrió un error al eliminar el usuario',
    'error'
)
        }
    } finally {
        deleting.value = false
    }
}

// Lifecycle
onMounted(() => {
    fetchUsers()
})
</script>

<style scoped>
.usuarios-page {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.section-card {
    border-color: rgba(34, 197, 94, 0.22);
    background: #ffffff;
    box-shadow: 0 6px 18px rgba(34, 197, 94, 0.08);
}

.section-card :deep(.v-card-title) {
    padding: 18px 22px 20px;
}

.section-card :deep(.v-card-text) {
    padding: 10px 22px 22px;
}

.stat-card {
    background: #f2fff6;
    border-color: rgba(34, 197, 94, 0.28);
    box-shadow: 0 4px 10px rgba(34, 197, 94, 0.08);
}

.new-user-btn {
    min-height: 34px;
    width: 170px;
    min-width: 180px;
    border-radius: 14px;
    text-transform: none;
    font-weight: 600;
    font-family: inherit;
    font-size: 15px;
}

.active-chip {
    background: #EEFCF5 !important;
    color: #05a552 !important;
    border: 1.5px solid #7AF0A8;
}

:deep(.v-data-table) {
    background: transparent !important;
}

:deep(.v-data-table-header) {
    background: #f8fff9;
}

:deep(.v-data-table-row:hover) {
    background: #f2fff6 !important;
}

:deep(.v-pagination__item--is-active) {
    background: linear-gradient(135deg, #0bc965 0%, #05a552 100%) !important;
    color: white !important;
}
</style>
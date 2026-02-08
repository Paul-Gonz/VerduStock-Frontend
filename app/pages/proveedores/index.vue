<template>
    <section class="d-flex flex-column ga-6">
        <v-card class="app-card pt-5" rounded="lg">
            <span class="text-subtitle-1 font-weight-bold pa-5 text-success providers-title">Directorio de Proveedores</span>

            <v-card-title class="d-flex align-center justify-space-between pa-5">
                <div class="d-flex align-center flex-grow-1 mr-5">
                    <v-text-field v-model="search" prepend-inner-icon="mdi-magnify"
                        label="Buscar por nombre, tlf o dirección..." variant="outlined" hide-details
                        density="comfortable" color="success" base-color="success" bg-color="surface"
                        class="search-input flex-grow-1" rounded="lg" clearable></v-text-field>
                </div>

                <v-btn color="success" variant="flat" prepend-icon="mdi-plus" @click="openNewDialog">
                    Nuevo proveedor
                </v-btn>
            </v-card-title>

            <v-card-text class="px-6 pb-6">
                <v-row v-if="loading">
                    <v-col v-for="n in 9" :key="n" cols="12" md="4">
                        <v-skeleton-loader type="card"></v-skeleton-loader>
                    </v-col>
                </v-row>

                <div v-else>
                    <v-row v-if="proveedoresPaginados.length > 0" class="ga-2">
                        <v-col v-for="prov in proveedoresPaginados" :key="prov.id || prov.nombre" cols="12" md="4" lg="4" class="pa-2">
                            <v-card class="app-card" rounded="lg" elevation="4">
                                <v-card-text class="py-2 px-3">
                                    <div class="d-flex align-center justify-space-between mb-2">
                                        <div class="text-subtitle-2 font-weight-bold text-success">
                                            {{ prov.nombre }}
                                        </div>
                                        <v-icon color="success" size="small">mdi-check-decagram</v-icon>
                                    </div>

                                    <div class="d-flex flex-column ga-1 mt-2">
                                        <div class="text-body-2 text-medium-emphasis d-flex align-center ga-2">
                                            <v-icon size="16" color="success">mdi-phone</v-icon>
                                            <span>{{ prov.telefono || 'Sin teléfono' }}</span>
                                        </div>
                                        <div class="text-body-2 text-medium-emphasis d-flex align-center ga-2">
                                            <v-icon size="16" color="success">mdi-map-marker</v-icon>
                                            <span class="text-truncate" :title="prov.direccion || ''">
                                                {{ prov.direccion || 'Sin dirección' }}
                                            </span>
                                        </div>
                                        <div v-if="prov.detalle"
                                            class="text-caption text-medium-emphasis font-italic mt-1 pa-2 rounded-lg border"
                                            :style="{ background: 'var(--app-surface-muted)', borderColor: 'var(--app-border)' }">
                                            "{{ prov.detalle }}"
                                        </div>
                                    </div>

                                    <v-divider class="my-3"></v-divider>
                                    <div class="d-flex justify-end ga-1">
                                        <v-btn icon="mdi-pencil" variant="text" size="small" color="success"
                                            @click="editProveedor(prov)"></v-btn>
                                        <v-btn icon="mdi-trash-can-outline" variant="text" size="small" color="error"
                                            @click="confirmDelete(prov)"></v-btn>
                                    </div>
                                </v-card-text>
                            </v-card>
                        </v-col>
                    </v-row>

                    <div v-else class="text-center py-12">
                        <v-icon size="64" color="grey-lighten-2">mdi-account-off-outline</v-icon>
                        <p class="text-grey-darken-1 mt-4">No se encontraron proveedores.</p>
                    </div>

                    <div class="d-flex justify-center mt-8">
                        <v-pagination v-model="page" :length="totalPaginas" :total-visible="5" active-color="success"
                            variant="flat" rounded="lg" density="comfortable" class="app-pagination"
                            prev-icon="mdi-chevron-left" next-icon="mdi-chevron-right"
                            show-first-last></v-pagination>
                    </div>
                </div>
            </v-card-text>
        </v-card>

        <!-- Diálogo para nuevo/editar proveedor -->
        <v-dialog v-model="dialog" max-width="500" persistent>
            <v-card rounded="lg">
                <v-card-title class="d-flex align-center justify-space-between">
                    <span class="text-h6 font-weight-bold">
                        {{ isEditing ? 'Editar Proveedor' : 'Nuevo Proveedor' }}
                    </span>
                    <v-btn icon @click="closeDialog">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </v-card-title>
                <v-card-text>
                    <v-form @submit.prevent="saveProveedor" ref="proveedorForm">
                        <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-4">
                            {{ errorMessage }}
                        </v-alert>

                        <v-text-field v-model="form.nombre" label="Nombre del proveedor*"
                            placeholder="Ingresa el nombre del proveedor" variant="outlined"
                            :rules="[v => !!v || 'El nombre es requerido', v => v.length >= 3 || 'Mínimo 3 caracteres']"
                            required class="mb-4" rounded="lg"></v-text-field>

                        <v-text-field v-model="form.telefono" label="Teléfono" placeholder="Ingresa el teléfono"
                            variant="outlined"
                            :rules="[v => !v || /^[0-9]+$/.test(v) || 'El teléfono solo debe contener números']"
                            class="mb-4" rounded="lg" prepend-inner-icon="mdi-phone"></v-text-field>

                        <v-text-field v-model="form.direccion" label="Dirección" placeholder="Ingresa la dirección"
                            variant="outlined" class="mb-4" rounded="lg"
                            prepend-inner-icon="mdi-map-marker"></v-text-field>

                        <v-textarea v-model="form.detalle" label="Detalles o notas"
                            placeholder="Ingresa detalles adicionales" variant="outlined" rows="3" rounded="lg"
                            class="mb-4"></v-textarea>
                    </v-form>
                </v-card-text>
                <v-card-actions class="px-6 pb-6">
                    <v-spacer></v-spacer>
                    <v-btn variant="tonal" @click="closeDialog">Cancelar</v-btn>
                    <v-btn color="success" @click="saveProveedor" :loading="saving" variant="flat">
                        {{ isEditing ? 'Actualizar' : 'Crear' }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Diálogo de confirmación para eliminar -->
        <v-dialog v-model="deleteDialog" max-width="400">
            <v-card rounded="lg">
                <v-card-title class="text-h6 font-weight-bold">¿Eliminar proveedor?</v-card-title>
                <v-card-text>
                    <div class="text-body-1">
                        ¿Estás seguro de eliminar al proveedor <strong>{{ proveedorToDelete?.nombre }}</strong>?
                    </div>
                    <div class="text-caption text-medium-emphasis mt-2">
                        Esta acción no se puede deshacer.
                    </div>
                    <v-alert v-if="deleteError" type="error" variant="tonal" class="mt-2">
                        {{ deleteError }}
                    </v-alert>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn variant="tonal" @click="deleteDialog = false">Cancelar</v-btn>
                    <v-btn color="error" @click="deleteProveedor" :loading="deleting" variant="flat">
                        Eliminar
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Snackbar para notificaciones -->
        <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="snackbar.timeout" location="top right"
            rounded="lg" elevation="10">
            <div class="d-flex align-center ga-3">
                <v-icon :icon="snackbar.icon" size="24"></v-icon>
                <div>
                    <div class="text-subtitle-2 font-weight-bold">{{ snackbar.title }}</div>
                    <div class="text-body-2">{{ snackbar.message }}</div>
                </div>
            </div>

            <template v-slot:actions>
                <v-btn icon variant="text" :color="snackbar.color" @click="snackbar.show = false">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </template>
        </v-snackbar>
    </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { navigateTo } from '#app'

// Estados
const proveedores = ref([])
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const search = ref('')
const page = ref(1)
const itemsPerPage = 9
const errorMessage = ref('')
const deleteError = ref('')

// Diálogos
const dialog = ref(false)
const deleteDialog = ref(false)

// Formularios
const form = ref({
    id: null,
    nombre: '',
    telefono: '',
    direccion: '',
    detalle: ''
})
const proveedorForm = ref(null)
const proveedorToDelete = ref(null)
const selectedProveedor = ref(null)
const isEditing = ref(false)

// Snackbar
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

// Cargar proveedores
const fetchProveedores = async () => {
    loading.value = true
    errorMessage.value = ''
    try {
        const response = await $fetch('http://localhost:8000/proveedores', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })

        // Diferentes formatos de respuesta posibles
        if (Array.isArray(response)) {
            proveedores.value = response
        } else if (response.data && Array.isArray(response.data)) {
            proveedores.value = response.data
        } else if (response.success && response.data) {
            proveedores.value = response.data
        } else {
            proveedores.value = []
        }

    } catch (error) {
        console.error('Error al cargar proveedores:', error)

        if (error.status === 401) {
            errorMessage.value = 'No estás autenticado. Por favor inicia sesión.'
            await navigateTo('/login')
        } else {
            errorMessage.value = `Error al cargar proveedores: ${error.message || 'Error desconocido'}`
            showNotification('Error', errorMessage.value, 'error')
        }

        proveedores.value = []
    } finally {
        loading.value = false
    }
}

// Computed para filtrado y paginación
const todosLosProveedores = computed(() => {
    return proveedores.value
})

const proveedoresFiltrados = computed(() => {
    const lista = todosLosProveedores.value
    if (!search.value) return lista
    const term = search.value.toLowerCase()
    return lista.filter(p =>
        p.nombre?.toLowerCase().includes(term) ||
        p.telefono?.toLowerCase().includes(term) ||
        p.direccion?.toLowerCase().includes(term)
    )
})

const totalPaginas = computed(() => {
    return Math.max(1, Math.ceil(proveedoresFiltrados.value.length / itemsPerPage))
})

const proveedoresPaginados = computed(() => {
    const inicio = (page.value - 1) * itemsPerPage
    return proveedoresFiltrados.value.slice(inicio, inicio + itemsPerPage)
})

// Diálogos
const openNewDialog = () => {
    isEditing.value = false
    resetForm()
    errorMessage.value = ''
    dialog.value = true
}

const editProveedor = (proveedor) => {
    isEditing.value = true
    selectedProveedor.value = proveedor
    form.value = {
        id: proveedor.id,
        nombre: proveedor.nombre,
        telefono: proveedor.telefono || '',
        direccion: proveedor.direccion || '',
        detalle: proveedor.detalle || ''
    }
    errorMessage.value = ''
    dialog.value = true
}

const confirmDelete = (proveedor) => {
    proveedorToDelete.value = proveedor
    deleteError.value = ''
    deleteDialog.value = true
}

const resetForm = () => {
    form.value = {
        id: null,
        nombre: '',
        telefono: '',
        direccion: '',
        detalle: ''
    }
    if (proveedorForm.value) {
        proveedorForm.value.reset()
    }
}

const closeDialog = () => {
    dialog.value = false
    resetForm()
}

// Guardar proveedor
const saveProveedor = async () => {
    if (!proveedorForm.value) return

    const { valid } = await proveedorForm.value.validate()
    if (!valid) {
        console.log('Validación del formulario fallida')
        return
    }

    saving.value = true
    errorMessage.value = ''

    try {
        let url, method

        if (isEditing.value) {
            // Editar proveedor existente
            url = `http://localhost:8000/proveedores/${form.value.id}`
            method = 'PUT'
        } else {
            // Crear nuevo proveedor
            url = 'http://localhost:8000/proveedores'
            method = 'POST'
        }

        const response = await $fetch(url, {
            method,
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify(form.value)
        })

        if (response) {
            await fetchProveedores()
            closeDialog()
            showNotification(
                isEditing.value ? 'Proveedor actualizado' : 'Proveedor creado',
                isEditing.value ? 'Proveedor actualizado exitosamente' : 'Proveedor creado exitosamente',
                'success'
            )
        } else {
            errorMessage.value = 'Error en la operación'
        }

    } catch (error) {
        console.error('Error al guardar proveedor:', error)

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
            errorMessage.value = 'Ocurrió un error al guardar el proveedor'
        }

        showNotification('Error', errorMessage.value, 'error')
    } finally {
        saving.value = false
    }
}

// Eliminar proveedor
const deleteProveedor = async () => {
    if (!proveedorToDelete.value) return

    deleting.value = true
    deleteError.value = ''

    try {
        // Nota: Según tu API, es posible que necesites cambiar esto a DELETE
        // Verifica si tu backend usa DELETE o POST para eliminar
        const response = await $fetch(`http://localhost:8000/proveedores/${proveedorToDelete.value.id}`, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })

        if (response && (response.success || response.status === 'success')) {
            await fetchProveedores()
            deleteDialog.value = false
            showNotification(
                'Proveedor eliminado',
                'Proveedor eliminado exitosamente',
                'success'
            )
        } else {
            throw new Error(response?.message || 'Error al eliminar proveedor')
        }

    } catch (error) {
        console.error('Error al eliminar proveedor:', error)

        if (error.status === 401) {
            deleteError.value = 'No estás autenticado. Por favor inicia sesión.'
            await navigateTo('/login')
        } else if (error.data) {
            deleteError.value = error.data.message || 'Error al eliminar proveedor'
        } else {
            deleteError.value = 'Ocurrió un error al eliminar el proveedor'
        }

        showNotification('Error', deleteError.value, 'error')
    } finally {
        deleting.value = false
    }
}

// Lifecycle
onMounted(async () => {
    const isAuthenticated = await checkAuthStatus()

    if (isAuthenticated) {
        await fetchProveedores()
    } else {
        errorMessage.value = 'Debes iniciar sesión para ver los proveedores'
        await navigateTo('/login')
    }
})

// Watchers para paginación
watch(search, () => { page.value = 1 })
watch(page, () => {
    if (import.meta.client) window.scrollTo({ top: 0, behavior: 'smooth' })
})
</script>

<style scoped>
.categoria-page {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.section-card {
    border-color: rgba(34, 197, 94, 0.22);
    background: #ffffff;
    box-shadow: 0 6px 18px rgba(34, 197, 94, 0.08);
}

.product-card {
    background: #f2fff6;
    border-color: rgba(34, 197, 94, 0.28);
    min-height: 180px;
    transition: transform 0.2s ease;
}

.product-card:hover {
    transform: translateY(-2px);
}

.new-category-btn {
    min-height: 34px;
    width: 185px;
    min-width: 185px;
    border-radius: 14px;
    text-transform: none;
    font-weight: 600;
    font-family: inherit;
    font-size: 14px;
}

.search-input :deep(.v-field__outline) {
    display: none;
}

.search-input :deep(.v-field) {
    border: 1px solid rgba(34, 197, 94, 0.2) !important;
    font-size: 0.9rem;
}

.search-input :deep(.v-field--focused) {
    border: 1px solid #05a552 !important;
}

:global(.v-theme--dark .categoria-page .search-input .v-field) {
    background: #1b1e1d !important;
    border-color: rgba(255, 255, 255, 0.12) !important;
    color: var(--app-text) !important;
}

:global(.v-theme--dark .categoria-page .search-input .v-field__input) {
    color: var(--app-text) !important;
}

:global(.v-theme--dark .categoria-page .search-input .v-field--focused) {
    border-color: rgba(75, 228, 143, 0.6) !important;
}

:global(.v-theme--dark .categoria-page .product-card) {
    background: #1b1e1d !important;
    border-color: rgba(255, 255, 255, 0.08) !important;
    box-shadow: 0 12px 26px rgba(0, 0, 0, 0.32);
}

:global(.v-theme--dark .categoria-page .product-card:hover) {
    transform: translateY(-3px);
    box-shadow: 0 16px 30px rgba(0, 0, 0, 0.4);
}


:global(.v-theme--dark .categoria-page .product-card .bg-white) {
    background: #1a1f1d !important;
}

:global(.v-theme--dark .categoria-page .product-card .border-green-100) {
    border-color: rgba(255, 255, 255, 0.08) !important;
}

:global(.v-theme--dark .categoria-page .product-card .text-slate-700) {
    color: var(--app-text) !important;
    background: transparent !important;
}

</style>
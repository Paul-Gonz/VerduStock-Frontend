<template>
    <section class="pa-0">
        <v-card class="app-card border-0" variant="flat" bg-color="transparent">
            <div class="d-flex flex-column flex-sm-row align-sm-center justify-space-between mb-6 ga-4">
                <h1 class="text-h5 font-weight-bold text-success px-1">
                    Directorio de Proveedores
                </h1>
                <v-btn color="success" size="large" prepend-icon="mdi-plus" @click="openNewDialog" elevation="2"
                    rounded="lg">
                    Nuevo proveedor
                </v-btn>
            </div>

            <v-card class="mb-6" rounded="lg" elevation="0" border>
                <v-card-text class="pa-3">
                    <v-text-field v-model="search" prepend-inner-icon="mdi-magnify"
                        label="Buscar por nombre, teléfono o dirección..." variant="solo-filled" hide-details flat
                        density="comfortable" color="success" rounded="lg" clearable></v-text-field>
                </v-card-text>
            </v-card>

            <v-row v-if="loading">
                <v-col v-for="n in 6" :key="n" cols="12" sm="6" md="4">
                    <v-skeleton-loader type="card" class="rounded-lg"></v-skeleton-loader>
                </v-col>
            </v-row>

            <div v-else>
                <v-row v-if="proveedoresFiltrados.length > 0">
                    <v-col v-for="prov in proveedoresPaginados" :key="prov.id || prov.nombre" cols="12" sm="6" lg="4">
                        <v-card class="app-card h-100 d-flex flex-column" rounded="lg" elevation="2" border>
                            <v-card-text class="pa-5 flex-grow-1">
                                <div class="d-flex align-center justify-space-between mb-4">
                                    <span class="text-h6 font-weight-bold text-success text-truncate">
                                        {{ prov.nombre }}
                                    </span>
                                    <v-icon color="success">mdi-check-decagram</v-icon>
                                </div>

                                <div class="d-flex flex-column ga-3">
                                    <div class="d-flex align-center ga-3 text-body-1 text-medium-emphasis">
                                        <v-icon color="success" size="20">mdi-phone</v-icon>
                                        {{ prov.telefono || 'Sin teléfono' }}
                                    </div>
                                    <div class="d-flex align-center ga-3 text-body-1 text-medium-emphasis">
                                        <v-icon color="success" size="20">mdi-map-marker</v-icon>
                                        <span class="text-truncate" :title="prov.direccion">
                                            {{ prov.direccion || 'Sin dirección' }}
                                        </span>
                                    </div>

                                    <div v-if="prov.detalle"
                                        class="mt-2 pa-3 rounded-lg border-s-lg bg-grey-lighten-4 text-body-2 font-italic border-success"
                                        style="border-left-width: 4px !important;">
                                        "{{ prov.detalle }}"
                                    </div>
                                </div>
                            </v-card-text>

                            <v-divider></v-divider>

                            <v-card-actions class="pa-3 bg-grey-lighten-5">
                                <v-spacer></v-spacer>
                                <v-btn icon="mdi-pencil" variant="text" color="success"
                                    @click="editProveedor(prov)"></v-btn>
                                <v-btn icon="mdi-trash-can-outline" variant="text" color="error"
                                    @click="confirmDelete(prov)"></v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-col>
                </v-row>

                <div v-else class="text-center py-16">
                    <v-icon size="80" color="grey-lighten-1" class="mb-4">mdi-account-search-outline</v-icon>
                    <h3 class="text-h6 text-grey-darken-1">No se encontraron proveedores</h3>
                    <p class="text-body-2 text-grey">Intenta con otros términos de búsqueda.</p>
                </div>

                <div class="d-flex justify-center mt-10">
                    <v-pagination v-model="page" :length="totalPaginas" :total-visible="5" active-color="success"
                        variant="flat" rounded="lg"></v-pagination>
                </div>
            </div>
        </v-card>

        <v-dialog v-model="dialog" max-width="500px" persistent>
            <v-card rounded="xl">
                <v-card-title class="pa-6 pb-0 d-flex justify-space-between align-center">
                    <span class="text-h5 font-weight-bold">{{ isEditing ? 'Editar Proveedor' : 'Nuevo Proveedor'
                        }}</span>
                    <v-btn icon="mdi-close" variant="text" @click="closeDialog"></v-btn>
                </v-card-title>
                <v-card-text class="pa-6">
                    <v-form ref="proveedorForm" @submit.prevent="saveProveedor">
                        <v-text-field v-model="form.nombre" label="Nombre *" variant="outlined" rounded="lg"
                            class="mb-2" :rules="[v => !!v || 'Campo requerido']"></v-text-field>
                        <v-text-field v-model="form.telefono" label="Teléfono" variant="outlined" rounded="lg"
                            class="mb-2" prepend-inner-icon="mdi-phone"></v-text-field>
                        <v-text-field v-model="form.direccion" label="Dirección" variant="outlined" rounded="lg"
                            class="mb-2" prepend-inner-icon="mdi-map-marker"></v-text-field>
                        <v-textarea v-model="form.detalle" label="Notas adicionales" variant="outlined" rounded="lg"
                            rows="3"></v-textarea>
                    </v-form>
                </v-card-text>
                <v-card-actions class="pa-6 pt-0">
                    <v-spacer></v-spacer>
                    <v-btn variant="text" @click="closeDialog" class="px-6">Cancelar</v-btn>
                    <v-btn color="success" variant="flat" @click="saveProveedor" :loading="saving" class="px-8"
                        rounded="lg">
                        {{ isEditing ? 'Actualizar' : 'Guardar' }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="deleteDialog" max-width="450px">
            <v-card rounded="lg" class="pa-4">
                <v-card-title class="text-h6 font-weight-bold">¿Eliminar este proveedor?</v-card-title>
                <v-card-text>Esta acción eliminará a <b>{{ proveedorToDelete?.nombre }}</b>. Los datos no podrán
                    recuperarse.</v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn variant="text" @click="deleteDialog = false">Cancelar</v-btn>
                    <v-btn color="error" variant="flat" @click="deleteProveedor" :loading="deleting"
                        rounded="lg">Eliminar</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-snackbar v-model="snackbar.show" :color="snackbar.color" location="top right" rounded="lg">
            <div class="d-flex align-center ga-2">
                <v-icon>{{ snackbar.icon }}</v-icon>
                {{ snackbar.message }}
            </div>
        </v-snackbar>
    </section>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { navigateTo } from '#app'

// --- ESTADO ---
const proveedores = ref([])
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const search = ref('')
const page = ref(1)
const itemsPerPage = 6

const dialog = ref(false)
const deleteDialog = ref(false)
const isEditing = ref(false)
const proveedorForm = ref(null)

const form = ref({ id: null, nombre: '', telefono: '', direccion: '', detalle: '' })
const proveedorToDelete = ref(null)
const snackbar = ref({ show: false, message: '', color: 'success', icon: 'mdi-check' })

// --- COMPUTED ---
const proveedoresFiltrados = computed(() => {
    if (!search.value) return proveedores.value
    const s = search.value.toLowerCase()
    return proveedores.value.filter(p =>
        p.nombre?.toLowerCase().includes(s) ||
        p.telefono?.includes(s) ||
        p.direccion?.toLowerCase().includes(s)
    )
})

const totalPaginas = computed(() => Math.ceil(proveedoresFiltrados.value.length / itemsPerPage))

const proveedoresPaginados = computed(() => {
    const start = (page.value - 1) * itemsPerPage
    return proveedoresFiltrados.value.slice(start, start + itemsPerPage)
})

// --- MÉTODOS ---
const showNotification = (msg, color = 'success') => {
    snackbar.value = { show: true, message: msg, color, icon: color === 'success' ? 'mdi-check-circle' : 'mdi-alert' }
}

const fetchProveedores = async () => {
    loading.value = true
    try {
        const data = await $fetch('http://localhost:8000/proveedores', { credentials: 'include' })
        proveedores.value = Array.isArray(data) ? data : (data.data || [])
    } catch (e) {
        showNotification('Error al cargar datos', 'error')
    } finally { loading.value = false }
}

const saveProveedor = async () => {
    const { valid } = await proveedorForm.value.validate()
    if (!valid) return

    saving.value = true
    try {
        const url = isEditing.value ? `http://localhost:8000/proveedores/${form.value.id}` : 'http://localhost:8000/proveedores'
        await $fetch(url, {
            method: isEditing.value ? 'PUT' : 'POST',
            body: form.value,
            credentials: 'include'
        })
        await fetchProveedores()
        closeDialog()
        showNotification(isEditing.value ? 'Actualizado correctamente' : 'Creado correctamente')
    } catch (e) {
        showNotification('Error al procesar la solicitud', 'error')
    } finally { saving.value = false }
}

const deleteProveedor = async () => {
    deleting.value = true
    try {
        await $fetch(`http://localhost:8000/proveedores/${proveedorToDelete.value.id}`, {
            method: 'DELETE',
            credentials: 'include'
        })
        await fetchProveedores()
        deleteDialog.value = false
        showNotification('Eliminado correctamente')
    } catch (e) {
        showNotification('Error al eliminar', 'error')
    } finally { deleting.value = false }
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
    proveedorForm.value?.reset()
}

// --- CICLO DE VIDA ---
onMounted(fetchProveedores)
watch(search, () => { page.value = 1 })
</script>

<style scoped>
.app-card {
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.app-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1) !important;
}

/* Estilos para modo oscuro si los usas */
:deep(.v-theme--dark) .bg-grey-lighten-4 {
    background-color: #2a2a2a !important;
}

:deep(.v-theme--dark) .bg-grey-lighten-5 {
    background-color: #1e1e1e !important;
}
</style>
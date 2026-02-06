<template>
    <section class="categoria-page">
        <v-card class="section-card pt-5" rounded="lg" border>
            <span class="text-subtitle-1 font-weight-bold pa-5 text-green-800">Directorio de Proveedores</span>

            <v-card-title class="d-flex align-center justify-space-between pa-5">
                <div class="d-flex align-center flex-grow-1 mr-5">
                    <v-text-field v-model="search" prepend-inner-icon="mdi-magnify"
                        label="Buscar por nombre, tlf o dirección..." variant="solo" flat hide-details density="compact"
                        bg-color="#f2fff6" class="search-input max-w-sm" rounded="lg" clearable></v-text-field>
                </div>

                <v-btn class="new-category-btn" color="success" variant="flat" prepend-icon="mdi-plus"
                    @click="abrirCrear">
                    Nuevo proveedor
                </v-btn>
            </v-card-title>

            <v-card-text class="px-6 pb-6">
                <v-row v-if="pending">
                    <v-col v-for="n in 9" :key="n" cols="12" md="4">
                        <v-skeleton-loader type="card" class="bg-[#f2fff6] border-[#22c55e28]"></v-skeleton-loader>
                    </v-col>
                </v-row>

                <div v-else>
                    <v-row v-if="proveedoresPaginados.length > 0">
                        <v-col v-for="prov in proveedoresPaginados" :key="prov.id || prov.nombre" cols="12" md="4">
                            <v-card class="product-card" rounded="lg" border>
                                <v-card-text>
                                    <div class="d-flex align-center justify-space-between mb-3">
                                        <div class="text-subtitle-2 font-weight-bold text-green-700">
                                            {{ prov.nombre }}
                                        </div>
                                        <v-icon color="success" size="small">mdi-check-decagram</v-icon>
                                    </div>

                                    <div class="flex flex-col gap-2 mt-2">
                                        <div class="text-body-2 text-medium-emphasis flex items-center gap-2">
                                            <v-icon size="16" color="success">mdi-phone</v-icon>
                                            <span class="text-slate-700 font-medium">{{ prov.telefono || 'Sin teléfono'
                                            }}</span>
                                        </div>
                                        <div class="text-body-2 text-medium-emphasis flex items-center gap-2">
                                            <v-icon size="16" color="success">mdi-map-marker</v-icon>
                                            <span class="text-truncate" :title="prov.direccion || ''">
                                                {{ prov.direccion || 'Sin dirección' }}
                                            </span>
                                        </div>
                                        <div v-if="prov.detalle"
                                            class="text-[11px] bg-white p-2 rounded-md border border-green-100 text-slate-500 italic mt-1">
                                            "{{ prov.detalle }}"
                                        </div>
                                    </div>

                                    <v-divider class="my-4"></v-divider>
                                    <div class="flex justify-end gap-1">
                                        <v-btn icon="mdi-pencil" variant="text" size="small" color="success"
                                            @click="abrirEditar(prov)"></v-btn>
                                        <v-btn icon="mdi-trash-can-outline" variant="text" size="small"
                                            color="error"></v-btn>
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
                            variant="flat" rounded="lg" density="comfortable"></v-pagination>
                    </div>
                </div>
            </v-card-text>
        </v-card>

        <v-dialog v-model="isDialogOpen" max-width="500px" persistent>
            <v-card rounded="lg">
                <v-card-title class="pa-5 d-flex align-center">
                    <v-icon color="success" class="mr-2">
                        {{ editMode ? 'mdi-pencil' : 'mdi-account-plus' }}
                    </v-icon>
                    <span class="text-h6 font-weight-bold text-green-800">
                        {{ editMode ? 'Editar Proveedor' : 'Registrar Proveedor' }}
                    </span>
                </v-card-title>

                <v-card-text class="pa-5 pt-0">
                    <v-expand-transition>
                        <v-alert v-if="showError" type="error" variant="tonal" density="compact"
                            class="mb-4 text-caption" closable @click:close="showError = false">
                            {{ errorMessage }}
                        </v-alert>
                    </v-expand-transition>

                    <v-row dense>
                        <v-col cols="12">
                            <v-text-field v-model="form.nombre" label="Nombre del proveedor*" variant="outlined"
                                color="success" hide-details="auto"></v-text-field>
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-text-field v-model="form.telefono" label="Teléfono" variant="outlined" color="success"
                                prepend-inner-icon="mdi-phone" hide-details="auto" type="tel"
                                :rules="phoneRules"></v-text-field>
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-text-field v-model="form.direccion" label="Dirección" variant="outlined" color="success"
                                prepend-inner-icon="mdi-map-marker" hide-details="auto"></v-text-field>
                        </v-col>
                        <v-col cols="12">
                            <v-textarea v-model="form.detalle" label="Detalles o Notas" variant="outlined"
                                color="success" rows="2" hide-details="auto"></v-textarea>
                        </v-col>
                    </v-row>
                </v-card-text>

                <v-divider></v-divider>
                <v-card-actions class="pa-5">
                    <v-spacer></v-spacer>
                    <v-btn color="grey-darken-1" variant="text" @click="cerrarDialogo"
                        :disabled="isSaving">Cancelar</v-btn>
                    <v-btn color="success" variant="flat" rounded="lg" class="px-6" :loading="isSaving"
                        @click="guardarProveedor">
                        {{ editMode ? 'Actualizar' : 'Guardar' }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </section>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

// 1. Interfaz flexible: El ID es opcional y permitimos null del backend
interface Proveedor {
    id?: number | null;
    nombre: string;
    telefono: string | null;
    direccion: string | null;
    detalle: string | null;
}

const { api } = useApi()
const search = ref('')
const page = ref(1)
const itemsPerPage = 9

// --- ESTADO DEL MODAL Y FORMULARIO ---
const isDialogOpen = ref(false)
const isSaving = ref(false)
const editMode = ref(false)
const showError = ref(false)
const errorMessage = ref('')

// 2. Definimos el form con tipos que acepten nulos pero inicializados como string
const form = ref<Proveedor>({
    id: null,
    nombre: '',
    telefono: '',
    direccion: '',
    detalle: ''
})

// --- CARGA DE DATOS ---
const { data: response, pending, refresh } = await useAsyncData(
    'proveedores',
    () => api('/proveedores'),
    { default: () => ({ data: [] }) }
)

const todosLosProveedores = computed(() => {
    const res = response.value as any
    return (res?.data || (Array.isArray(res) ? res : [])) as Proveedor[]
})

// --- FILTRADO Y PAGINACIÓN ---
const proveedoresFiltrados = computed(() => {
    const lista = todosLosProveedores.value
    if (!search.value) return lista
    const term = search.value.toLowerCase()
    return lista.filter(p =>
        p.nombre?.toLowerCase().includes(term) ||
        p.direccion?.toLowerCase().includes(term)
    )
})

const totalPaginas = computed(() => Math.max(1, Math.ceil(proveedoresFiltrados.value.length / itemsPerPage)))

const proveedoresPaginados = computed(() => {
    const inicio = (page.value - 1) * itemsPerPage
    return proveedoresFiltrados.value.slice(inicio, inicio + itemsPerPage)
})

// 3. Regla de validación de números (Acepta nulo o string vacío)
const phoneRules = [
    (v: any) => !v || /^[0-9]+$/.test(v) || 'El teléfono solo debe contener números'
]

const abrirCrear = () => {
    editMode.value = false
    form.value = { id: null, nombre: '', telefono: '', direccion: '', detalle: '' }
    isDialogOpen.value = true
}

// 4. LIMPIEZA DE DATOS: Convertimos nulls en strings vacíos para evitar errores
const abrirEditar = (prov: Proveedor) => {
    editMode.value = true
    form.value = {
        id: prov.id,
        nombre: prov.nombre,
        telefono: prov.telefono ?? '', // Si es null de la DB, ponemos ''
        direccion: prov.direccion ?? '',
        detalle: prov.detalle ?? ''
    }
    isDialogOpen.value = true
}

const cerrarDialogo = () => {
    isDialogOpen.value = false
    showError.value = false
    form.value = { id: null, nombre: '', telefono: '', direccion: '', detalle: '' }
}

const guardarProveedor = async () => {
    if (!form.value.nombre) {
        errorMessage.value = "El nombre es obligatorio."
        showError.value = true
        return
    }

    isSaving.value = true
    showError.value = false

    try {
        const url = editMode.value ? `/proveedores/${form.value.id}` : '/proveedores'
        const method = editMode.value ? 'PUT' : 'POST'

        await api(url, { method, body: form.value })

        await refresh()
        cerrarDialogo()
    } catch (err: any) {
        errorMessage.value = err.data?.message || "Error al procesar la solicitud."
        showError.value = true
    } finally {
        isSaving.value = false
    }
}

// --- UX WATCHERS ---
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
</style>
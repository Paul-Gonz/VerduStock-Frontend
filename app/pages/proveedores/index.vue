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

                <v-btn class="new-category-btn" color="success" variant="flat" prepend-icon="mdi-plus">
                    Nuevo proveedor
                </v-btn>
            </v-card-title>

            <v-card-text class="px-6 pb-6">
                <v-row v-if="pending">
                    <v-col v-for="n in 9" :key="n" cols="12" md="4">
                        <v-skeleton-loader type="card" class="bg-[#f2fff6] border-[#22c55e28]"></v-skeleton-loader>
                    </v-col>
                </v-row>

                <v-alert v-else-if="error" type="error" variant="tonal" class="mb-4">
                    Error al conectar con el backend de VerduStock.
                </v-alert>

                <div v-else>
                    <v-row v-if="proveedoresPaginados.length > 0">
                        <v-col v-for="prov in proveedoresPaginados" :key="prov.id" cols="12" md="4">
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
                                            <span class="font-medium text-slate-700">{{ prov.telefono || 'Sin teléfono'
                                                }}</span>
                                        </div>

                                        <div class="text-body-2 text-medium-emphasis flex items-center gap-2">
                                            <v-icon size="16" color="success">mdi-map-marker</v-icon>
                                            <span class="text-truncate">
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
                                        <v-btn icon="mdi-pencil" variant="text" size="small" color="success"></v-btn>
                                        <v-btn icon="mdi-trash-can-outline" variant="text" size="small"
                                            color="error"></v-btn>
                                    </div>
                                </v-card-text>
                            </v-card>
                        </v-col>
                    </v-row>

                    <div v-else class="text-center py-12">
                        <v-avatar color="grey-lighten-4" size="70" class="mb-4">
                            <v-icon size="36" color="grey-lighten-1">mdi-magnify-remove</v-icon>
                        </v-avatar>
                        <p class="text-grey-darken-1 font-weight-medium">No se encontraron proveedores</p>
                    </div>

                    <div class="d-flex justify-center mt-8">
                        <v-pagination v-model="page" :length="totalPaginas" :total-visible="5" active-color="success"
                            variant="flat" rounded="lg" density="comfortable"></v-pagination>
                    </div>
                </div>
            </v-card-text>
        </v-card>
    </section>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface Proveedor {
    id: number;
    nombre: string;
    telefono: string | null;
    direccion: string | null;
    detalle: string | null;
}

const { api } = useApi()
const search = ref('')
const page = ref(1)
const itemsPerPage = 9

const { data: response, pending, error } = await useAsyncData(
    'proveedores',
    () => api('/proveedores'),
    {
        lazy: true,
        default: () => ({ data: [] })
    }
)

const todosLosProveedores = computed(() => {
    const res = response.value as any
    const lista = res?.data || (Array.isArray(res) ? res : [])
    return lista as Proveedor[]
})

const proveedoresFiltrados = computed(() => {
    const lista = todosLosProveedores.value
    if (!search.value) return lista

    const term = search.value.toLowerCase()
    return lista.filter((prov: Proveedor) =>
        prov.nombre?.toLowerCase().includes(term) ||
        prov.direccion?.toLowerCase().includes(term) ||
        prov.telefono?.toLowerCase().includes(term)
    )
})

const totalPaginas = computed(() => {
    const totalItems = proveedoresFiltrados.value.length
    return Math.max(1, Math.ceil(totalItems / itemsPerPage))
})

const proveedoresPaginados = computed(() => {
    const inicio = (page.value - 1) * itemsPerPage
    const fin = inicio + itemsPerPage
    return proveedoresFiltrados.value.slice(inicio, fin)
})

watch(search, () => {
    page.value = 1
})

watch(page, () => {
    if (import.meta.client) {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        })
    }
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
    box-shadow: 0 4px 10px rgba(34, 197, 94, 0.08);
    min-height: 180px;
    transition: transform 0.2s ease;
}

.product-card:hover {
    transform: translateY(-2px);
}

.new-category-btn {
    text-transform: none;
    font-weight: 600;
    border-radius: 12px;
    background: linear-gradient(135deg, #0bc965 0%, #05a552 100%) !important;
    color: #ffffff !important;
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
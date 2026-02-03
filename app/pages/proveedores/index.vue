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
                <div v-if="pending && !proveedores">
                    <v-row>
                        <v-col v-for="n in 3" :key="n" cols="12" md="4">
                            <v-skeleton-loader type="card" class="bg-[#f2fff6]"></v-skeleton-loader>
                        </v-col>
                    </v-row>
                </div>

                <div v-else-if="error">
                    <v-alert type="error" variant="tonal" icon="mdi-alert">
                        Error al cargar: {{ error.message }}
                        <v-btn size="small" variant="text" @click="refresh">Reintentar</v-btn>
                    </v-alert>
                </div>

                <div v-else>
                    <v-row v-if="proveedoresFiltrados.length > 0">
                        <v-col v-for="prov in proveedoresFiltrados" :key="prov.id" cols="12" md="4">
                            <v-card class="product-card" rounded="lg" border>
                                <v-card-text>
                                    <div class="d-flex align-center justify-space-between mb-3">
                                        <div class="text-subtitle-2 font-weight-bold text-green-700">{{ prov.nombre }}
                                        </div>
                                        <v-icon color="success" size="small">mdi-check-decagram</v-icon>
                                    </div>

                                    <div class="flex flex-col gap-2 mt-2">
                                        <div v-if="prov.telefono"
                                            class="text-body-2 text-medium-emphasis flex items-center gap-2">
                                            <v-icon size="16" color="success">mdi-phone</v-icon>
                                            <span>{{ prov.telefono }}</span>
                                        </div>
                                        <div v-if="prov.direccion"
                                            class="text-body-2 text-medium-emphasis flex items-center gap-2">
                                            <v-icon size="16" color="success">mdi-map-marker</v-icon>
                                            <span class="text-truncate">{{ prov.direccion }}</span>
                                        </div>
                                        <div v-if="prov.detalle"
                                            class="text-[11px] bg-slate-50 p-2 rounded-md italic text-slate-500">
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
                        <v-icon size="64" color="grey-lighten-2">mdi-account-off-outline</v-icon>
                        <p class="text-grey-darken-1 mt-4">No se encontraron proveedores.</p>
                    </div>
                </div>
            </v-card-text>
        </v-card>
    </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const { api } = useApi()
const search = ref('')

const { data: proveedores, pending, error, refresh } = await useAsyncData(
    'proveedores',
    () => api('/proveedores'),
    {
        lazy: true,
        default: () => []
    }
)

const proveedoresFiltrados = computed(() => {
    const rawData = Array.isArray(proveedores.value) ? proveedores.value : (proveedores.value as any)?.data || []

    if (!search.value) return rawData

    const term = search.value.toLowerCase()
    return rawData.filter((prov: any) => {
        return (
            prov.nombre?.toLowerCase().includes(term) ||
            prov.telefono?.includes(term) ||
            prov.direccion?.toLowerCase().includes(term) ||
            prov.detalle?.toLowerCase().includes(term)
        )
    })
})
</script>

<style scoped>
/* Estructura general de la página */
.categoria-page {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

/* Tarjeta principal que contiene el directorio */
.section-card {
    border-color: rgba(34, 197, 94, 0.22);
    /* Verde suave para bordes */
    background: #ffffff;
    box-shadow: 0 6px 18px rgba(34, 197, 94, 0.08);
    /* Sombra sutil característica de VerduStock */
}

/* Tarjetas individuales de proveedores (Product Cards) */
.product-card {
    background: #f2fff6;
    /* Fondo verde muy claro para resaltar del contenedor blanco */
    border-color: rgba(34, 197, 94, 0.28);
    box-shadow: 0 4px 10px rgba(34, 197, 94, 0.08);
    min-height: 180px;
    transition: transform 0.2s ease;
}

.product-card:hover {
    transform: translateY(-2px);
    /* Efecto de elevación al pasar el mouse */
}

/* Botón de "Nuevo proveedor" con tu degradado corporativo */
.new-category-btn {
    text-transform: none;
    font-weight: 600;
    border-radius: 12px;
    background: linear-gradient(135deg, #0bc965 0%, #05a552 100%) !important;
    color: #ffffff !important;
    box-shadow: none !important;
}

/* Quita el overlay gris por defecto de Vuetify al hacer click */
.new-category-btn :deep(.v-btn__overlay) {
    opacity: 0;
}

/* Estilización personalizada del Buscador (V-Text-Field) */
.search-input :deep(.v-field__outline) {
    display: none;
    /* Elimina el borde por defecto de Vuetify */
}

.search-input :deep(.v-field) {
    border: 1px solid rgba(34, 197, 94, 0.2) !important;
    font-size: 0.9rem;
    transition: border-color 0.3s ease;
}

.search-input :deep(.v-field--focused) {
    border: 1px solid #05a552 !important;
    /* Resalta el borde al escribir */
}

/* Estilo para los detalles (cursiva y fondo gris claro) */
.italic {
    font-style: italic;
}
</style>
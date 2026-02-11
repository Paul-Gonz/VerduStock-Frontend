<template>
    <section class="categoria-page">
        <v-card class="mb-8 section-card" rounded="lg" border>
            <v-card-title class="d-flex align-center justify-space-between ga-3">
                <span class="text-subtitle-1 font-weight-bold">Estadísticas por Categoría</span>
                <div class="d-flex align-center ga-2">
                    <v-tooltip location="bottom">
                        <template #activator="{ props }">
                            <v-btn v-bind="props" class="action-btn list-categories-btn" color="success" variant="tonal"
                                icon="mdi-format-list-bulleted" @click="openListDialog"></v-btn>
                        </template>
                        <span>Ver categorías registradas</span>
                    </v-tooltip>
                    <v-btn class="action-btn new-category-btn" color="success" variant="flat" prepend-icon="mdi-plus"
                        @click="openCreateDialog">
                        Nueva categoría
                    </v-btn>
                </div>
            </v-card-title>
            <v-card-text>
                <v-progress-linear v-if="categoriasLoading" indeterminate color="success" height="6" rounded
                    class="mb-4"></v-progress-linear>

                <!-- Contenedor de paginación por categoría -->
                <div v-if="paginatedCategories.length > 0">
                    <!-- Navegación simplificada -->
                    <div class="category-navigation mb-6">
                        <div class="d-flex align-center justify-space-between mb-4">
                            <div class="d-flex align-center ga-2">
                                <v-btn icon="mdi-chevron-left" variant="tonal" color="success"
                                    :disabled="currentCategoryPage === 0" @click="prevCategoryPage" size="small">
                                </v-btn>

                                <div class="category-current-info text-center px-4">
                                    <div
                                        class="text-subtitle-2 font-weight-bold d-flex align-center ga-2 justify-center">
                                        <v-avatar color="success-lighten-4" size="32" class="emoji-avatar">
                                            <span class="emoji-avatar__emoji">{{ currentCategory?.emoji }}</span>
                                        </v-avatar>
                                        <span>{{ currentCategory?.name }}</span>
                                    </div>
                                    <div class="text-caption text-medium-emphasis">
                                        Página {{ currentCategoryPage + 1 }} de {{ paginatedCategories.length }}
                                    </div>
                                </div>

                                <v-btn icon="mdi-chevron-right" variant="tonal" color="success"
                                    :disabled="currentCategoryPage === paginatedCategories.length - 1"
                                    @click="nextCategoryPage" size="small">
                                </v-btn>
                            </div>

                            <!-- Selector rápido de categorías -->
                            <v-select v-model="currentCategoryPage" :items="paginatedCategories" item-title="name"
                                item-value="pageIndex" density="compact" variant="outlined" color="success"
                                label="Cambiar categoría" style="max-width: 220px;" class="category-quick-select"
                                hide-details prepend-inner-icon="mdi-filter" @update:model-value="onCategoryChange">
                                <template #item="{ props, item }">
                                    <v-list-item v-bind="props">
                                        <template #prepend>
                                            <span class="me-2">{{ item.raw.emoji }}</span>
                                        </template>
                                        <template #append>
                                            <v-chip size="x-small" color="success" variant="tonal">
                                                {{ item.raw.products }}
                                            </v-chip>
                                        </template>
                                    </v-list-item>
                                </template>
                                <template #selection="{ item }">
                                    <div class="d-flex align-center">
                                        <span class="me-2">{{ item.raw.emoji }}</span>
                                        <span>{{ item.title }}</span>
                                    </div>
                                </template>
                            </v-select>
                        </div>

                        <!-- Barra de progreso minimalista -->
                        <v-progress-linear :model-value="((currentCategoryPage + 1) / paginatedCategories.length) * 100"
                            color="success" height="4" rounded class="mb-2"></v-progress-linear>
                    </div>

                    <!-- Estadísticas de la categoría actual -->
                    <v-row v-if="currentCategory">
                        <v-col cols="12">
                            <v-card class="stat-card current-category-card" rounded="lg" border>
                                <v-card-text>
                                    <v-row class="text-body-1">
                                        <v-col cols="6" md="3">
                                            <div class="stat-item">
                                                <div class="text-medium-emphasis mb-1">Productos registrados</div>
                                                <div class="text-h5 font-weight-bold">
                                                    {{ currentCategory.products !== undefined ? currentCategory.products : 0 }}
                                                </div>
                                            </div>
                                        </v-col>
                                        <v-col cols="6" md="3">
                                            <div class="stat-item">
                                                <div class="text-medium-emphasis mb-1">Cantidad neta</div>
                                                <div class="text-h5 font-weight-bold">
                                                    {{ currentCategory.totalQty || '0 kg' }}
                                                </div>
                                                <div class="text-caption text-error" 
                                                     v-if="currentCategory.totalDesperdicio && 
                                                            currentCategory.totalDesperdicio !== '0.00 kg' && 
                                                            currentCategory.totalDesperdicio !== '0 kg'">
                                                    {{ currentCategory.totalDesperdicio }} desperdicio
                                                </div>
                                            </div>
                                        </v-col>
                                        <v-col cols="6" md="3">
                                            <div class="stat-item">
                                                <div class="text-medium-emphasis mb-1">Valor en venta</div>
                                                <div class="text-h5 font-weight-bold">
                                                    {{ formatCurrency(currentCategory.totalValue || 0) }}
                                                </div>
                                            </div>
                                        </v-col>
                                        <v-col cols="6" md="3">
                                            <div class="stat-item">
                                                <div class="text-medium-emphasis mb-1">Ganancia estimada</div>
                                                <div class="text-h5 font-weight-bold text-success">
                                                    {{ formatCurrency(currentCategory.profit || 0) }}
                                                </div>
                                            </div>
                                        </v-col>
                                    </v-row>
                                    <!-- Indicador de progreso de la paginación -->
                                    <div class="mt-6">
                                        <div class="d-flex justify-space-between mb-2">
                                            <div class="text-caption text-medium-emphasis">
                                                Progreso: {{ currentCategoryPage + 1 }} / {{ paginatedCategories.length }}
                                            </div>
                                            <div class="text-caption text-medium-emphasis">
                                                {{ Math.round(((currentCategoryPage + 1) / paginatedCategories.length) * 100) }}%
                                            </div>
                                        </div>
                                        <v-progress-linear
                                            :model-value="((currentCategoryPage + 1) / paginatedCategories.length) * 100"
                                            color="success" height="8" rounded></v-progress-linear>
                                    </div>
                                </v-card-text>
                            </v-card>
                        </v-col>
                    </v-row>
                </div>

                <div v-else-if="!categoriasLoading" class="text-body-2 text-medium-emphasis py-8 text-center">
                    <v-icon size="48" color="grey-lighten-1" class="mb-3">mdi-folder-outline</v-icon>
                    <div>Aún no registras categorías.</div>
                    <v-btn color="success" variant="tonal" class="mt-4" @click="openCreateDialog">
                        <v-icon icon="mdi-plus" class="me-2"></v-icon>
                        Crear primera categoría
                    </v-btn>
                </div>
            </v-card-text>
        </v-card>

        <!-- SECCIÓN DE PRODUCTOS (solo muestra productos de la categoría actual) -->
        <v-card class="section-card" rounded="lg" border>
            <v-card-title class="d-flex align-center justify-space-between">
                <div class="d-flex align-center ga-3">
                    <v-avatar color="success-lighten-4" size="36" class="emoji-avatar">
                        <span class="emoji-avatar__emoji">{{ currentCategory?.emoji }}</span>
                    </v-avatar>
                    <div>
                        <span class="text-subtitle-1 font-weight-bold">Productos en </span>
                        <span class="text-subtitle-1 font-weight-bold text-success">
                            {{ currentCategory?.name || 'Categoría actual' }}
                        </span>
                    </div>
                </div>
                <div class="d-flex align-center ga-2">
                    <v-chip color="success" variant="tonal" size="small">
                        {{ productsForCurrentCategory.length }} productos
                    </v-chip>
                    <v-chip color="success" variant="flat" size="small">
                        {{ formatCurrency(currentCategory?.profit || 0) }} ganancia
                    </v-chip>
                </div>
            </v-card-title>
            <v-card-text>
                <div class="filters-bar mb-4">
                    <div class="filters-bar__search">
                        <v-text-field v-model="productSearchQuery"
                            :label="`Buscar en ${currentCategory?.name || 'categoría'}`"
                            placeholder="Escribe el nombre o proveedor" variant="outlined" density="comfortable"
                            prepend-inner-icon="mdi-magnify" clearable color="success" base-color="success"
                            bg-color="surface" class="search-input"></v-text-field>
                    </div>
                </div>

                <v-alert v-if="!currentCategory && !categoriasLoading" type="info" density="comfortable" variant="tonal"
                    class="mb-4">
                    Selecciona una categoría para ver sus productos.
                </v-alert>

                <v-progress-linear v-if="productosLoading" indeterminate color="success" height="6" rounded
                    class="mb-4"></v-progress-linear>
                <v-alert v-if="productosError" type="error" density="comfortable" variant="tonal" class="mb-4">
                    {{ productosError }}
                </v-alert>

                <template v-if="filteredProducts.length > 0">
                    <v-row>
                        <v-col v-for="product in paginatedProducts" :key="product.id" cols="12" sm="6" md="4" lg="3">
                            <v-card class="product-card" rounded="lg" border>
                                <v-card-text>
                                    <div class="d-flex align-center justify-space-between">
                                        <div class="text-subtitle-2 font-weight-bold">{{ product.name }}</div>
                                        <v-chip :color="product.stockColor" size="small" variant="tonal"
                                            :class="{ 'stock-chip--success': product.stockColor === 'success' }">
                                            {{ product.stock }}
                                        </v-chip>
                                    </div>

                                    <div class="mt-2 text-body-2 text-medium-emphasis d-flex align-center ga-2">
                                        <span> Compra: {{ product.purchaseLabel }}</span>
                                    </div>
                                    <div class="mt-1 text-body-2 text-medium-emphasis d-flex align-center ga-2">
                                        <span> Venta: {{ product.saleLabel }}</span>
                                    </div>
                                    <div class="mt-1 text-body-2 text-medium-emphasis d-flex align-center ga-2">
                                        <span> Kilos brutos: {{ product.kilosBrutos }}</span>
                                        <v-tooltip v-if="product.desperdicio > 0" location="bottom">
                                            <template #activator="{ props }">
                                                <v-icon v-bind="props" size="small"
                                                    color="error">mdi-alert-circle-outline</v-icon>
                                            </template>
                                            <span>Desperdicio: {{ product.desperdicio }}kg</span>
                                        </v-tooltip>
                                    </div>
                                    <div class="mt-1 text-body-2 text-medium-emphasis d-flex align-center ga-2">
                                        <span> Ganancia por kg: {{ product.profitPerKgLabel }}</span>
                                    </div>
                                    <div class="mt-1 text-body-2 text-medium-emphasis d-flex align-center ga-2">
                                        <span> Ganancia total: {{ product.profitTotalLabel }}</span>
                                    </div>
                                    <div class="mt-1 text-body-2 text-medium-emphasis d-flex align-center ga-2">
                                        <span> {{ product.source }}</span>
                                    </div>

                                    <v-divider class="my-3"></v-divider>

                                    <div class="d-flex align-center justify-space-between text-body-2">
                                        <span class="text-medium-emphasis">Disponibilidad</span>
                                        <span class="font-weight-semibold"
                                            :class="{ 'availability--low': product.progressColor === 'error' }">
                                            {{ product.availability }}
                                        </span>
                                    </div>
                                    <v-progress-linear class="mt-2" :model-value="product.progress"
                                        :color="product.progressColor" height="6" rounded
                                        :class="{ 'progress--low': product.progressColor === 'error' }"></v-progress-linear>
                                </v-card-text>
                            </v-card>
                        </v-col>
                    </v-row>

                    <!-- Paginación de productos dentro de la categoría -->
                    <div v-if="filteredProducts.length > itemsPerPage" class="mt-6">
                        <v-pagination v-model="currentProductPage" :length="totalProductPages" :total-visible="7"
                            color="success" variant="tonal" rounded="circle"></v-pagination>
                    </div>
                </template>

                <div v-else-if="productsForCurrentCategory.length === 0 && currentCategory && !productosLoading"
                    class="text-body-2 text-medium-emphasis py-6 text-center">
                    <v-icon size="48" color="grey-lighten-1" class="mb-3">mdi-package-variant</v-icon>
                    <div>Esta categoría no tiene productos registrados.</div>
                    <v-btn color="success" variant="tonal" class="mt-4" :to="{ name: 'productos' }">
                        <v-icon icon="mdi-plus" class="me-2"></v-icon>
                        Agregar productos
                    </v-btn>
                </div>

                <div v-else-if="filteredProducts.length === 0 && productSearchQuery && !productosLoading"
                    class="text-body-2 text-medium-emphasis py-6 text-center">
                    No se encontraron productos que coincidan con "{{ productSearchQuery }}"
                </div>
            </v-card-text>
        </v-card>

        <v-dialog v-model="showCreateDialog" max-width="520" persistent transition="dialog-bottom-transition">
            <v-card rounded="xl" border class="modal-shell">
                <div class="modal-shell__header">
                    <div>
                        <p class="modal-shell__eyebrow">{{ categoriaEditando ? 'Modo edición' : 'Nueva categoría' }}</p>
                        <h3 class="modal-shell__title">{{ formTitle }}</h3>
                        <p class="modal-shell__subtitle">
                            {{
                                categoriaEditando
                                    ? 'Actualiza el nombre, emoji y descripción antes de guardar los cambios.'
                                    : 'Ingresa los datos básicos para clasificar tus productos de forma clara.'
                            }}
                        </p>
                    </div>
                    <v-btn icon="mdi-close" variant="text" color="grey-darken-1" class="modal-shell__dismiss"
                        @click="cancelCreateDialog"></v-btn>
                </div>
                <div class="modal-shell__divider"></div>
                <div class="modal-shell__body">
                    <v-form ref="categoryForm" class="modal-shell__form" @submit.prevent="submitCategory">
                        <div class="modal-shell__content">
                            <v-alert v-if="formError" type="warning" density="comfortable" variant="tonal"
                                color="warning" class="modal-shell__alert">
                                {{ formError }}
                            </v-alert>
                            <div class="name-input-block">
                                <v-menu v-model="showEmojiPicker" :close-on-content-click="false" location="bottom"
                                    offset="8">
                                    <template #activator="{ props }">
                                        <v-btn v-bind="props" class="emoji-selector emoji-selector--floating"
                                            variant="flat" color="grey-lighten-4" elevation="0" size="large"
                                            rounded="circle" height="55px" location="top">
                                            <span v-if="formulario.emoji" class="emoji-selector__value">
                                                {{ formulario.emoji }}
                                            </span>
                                            <v-icon v-else icon="mdi-plus" class="emoji-selector__icon"></v-icon>
                                        </v-btn>
                                    </template>
                                    <ClientOnly>
                                        <div class="emoji-picker-surface">
                                            <EmojiPicker :native="true" :hide-search="false" theme="light"
                                                :disabled-groups="emojiDisabledGroups" :disable-skin-tones="true"
                                                @select="handleEmojiSelect" />
                                        </div>
                                    </ClientOnly>
                                </v-menu>
                                <div class="name-input-block__inputs">
                                    <v-text-field v-model="formulario.nombre" label="Nombre"
                                        placeholder="Ej. Vegetales hoja verde" variant="outlined" density="comfortable"
                                        class="name-field" :rules="[requiredRule]" color="success"
                                        base-color="success"></v-text-field>
                                    <v-textarea v-model="formulario.detalle" label="Descripción"
                                        placeholder="Describe cómo usarás esta categoría" variant="outlined"
                                        density="comfortable" rows="3" class="description-field" :counter="160"
                                        :maxlength="160"></v-textarea>
                                </div>
                            </div>
                        </div>
                        <div class="modal-shell__actions">
                            <v-btn variant="text" color="grey-darken-1" class="modal-shell__ghost"
                                @click="cancelCreateDialog">
                                Cancelar
                            </v-btn>
                            <v-btn type="submit" color="success" class="action-btn new-category-btn modal-shell__cta"
                                :prepend-icon="submitIcon" :loading="cargando" :disabled="cargando">
                                {{ submitLabel }}
                            </v-btn>
                        </div>
                    </v-form>
                </div>
            </v-card>
        </v-dialog>

        <v-dialog v-model="showListDialog" max-width="720" location="center" class="categoria-dialog"
            content-class="categoria-dialog-content">
            <v-card class="modal-card list-modal" rounded="xl" border>
                <v-card-title class="d-flex align-center justify-space-between">
                    <span class="text-subtitle-1 font-weight-bold">Categorías registradas</span>
                    <v-btn icon="mdi-close" variant="text" color="grey" @click="closeListDialog"></v-btn>
                </v-card-title>
                <v-card-text>
                    <v-alert v-if="categoriasError" type="error" density="comfortable" variant="tonal" class="mb-4">
                        {{ categoriasError }}
                    </v-alert>

                    <v-progress-linear v-if="categoriasLoading" indeterminate color="success" height="6" rounded
                        class="mb-4"></v-progress-linear>

                    <v-table v-else-if="categoriasRegistradas.length" class="categoria-table" density="comfortable">
                        <thead>
                            <tr>
                                <th>Emoji</th>
                                <th>Nombre</th>
                                <th>Descripción</th>
                                <th class="text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(categoria, index) in categoriasRegistradas" :key="categoria.id"
                                class="categoria-table-row">
                                <td class="emoji-cell">
                                    <span class="emoji-avatar__emoji">{{ getCategoriaEmoji(categoria, index) }}</span>
                                </td>
                                <td>{{ categoria.nombre }}</td>
                                <td>{{ categoria.detalle || 'Sin detalle' }}</td>
                                <td class="text-right">
                                    <div class="d-flex justify-end ga-1">
                                        <v-btn size="x-small" color="success" variant="tonal" icon="mdi-pencil"
                                            class="action-icon-btn" @click="startUpdate(categoria)"></v-btn>
                                        <v-btn size="x-small" color="error" variant="tonal" icon="mdi-delete"
                                            :loading="categoriaEliminando === categoria.id"
                                            :disabled="categoriaEliminando === categoria.id" class="action-icon-btn"
                                            @click="deleteCategoria(categoria)"></v-btn>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </v-table>

                    <div v-else class="text-body-2 text-medium-emphasis py-6 text-center">
                        Aún no registras categorías.
                    </div>
                </v-card-text>
            </v-card>
        </v-dialog>
        <v-dialog v-model="confirmDeleteDialog" max-width="400">
            <v-card rounded="xl" border class="pa-4 text-center">
                <v-card-text>
                    <v-avatar color="error-lighten-5" size="70" class="mb-4">
                        <v-icon color="error" size="40">mdi-delete-alert-outline</v-icon>
                    </v-avatar>

                    <h3 class="text-h6 font-weight-bold mb-2">¿Confirmar eliminación?</h3>
                    <p class="text-body-2 text-medium-emphasis">
                        Estás a punto de eliminar la categoría <strong>"{{ categoryToDelete?.nombre }}"</strong>.
                        Esta acción no se puede deshacer.
                    </p>
                </v-card-text>

                <v-card-actions class="justify-center ga-2 pb-4">
                    <v-btn variant="text" color="grey-darken-1" rounded="lg" @click="confirmDeleteDialog = false">
                        Cancelar
                    </v-btn>
                    <v-btn color="error" variant="flat" rounded="lg" class="px-6"
                        :loading="categoriaEliminando === categoryToDelete?.id" @click="executeDelete">
                        Sí, eliminar
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </section>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import EmojiPicker from 'vue3-emoji-picker'
import 'vue3-emoji-picker/css'
import { navigateTo } from '#app'

// --- CONFIGURACIÓN DE API ---
const API_URL = 'http://localhost:8000'
const fetchConfig = {
    credentials: 'include',
    headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json'
    }
}

// --- FORMATEADORES ---
const currencyFormatter = new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
})

const weightFormatter = new Intl.NumberFormat('es-EC', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
})

const formatCurrency = (value = 0) => currencyFormatter.format(Number(value) || 0)
const formatWeight = (value = 0) => {
    const numValue = Number(value) || 0
    return `${weightFormatter.format(numValue)} kg`
}

// --- CONSTANTES Y ESTADOS ---
const MAX_PRODUCTOS_PER_PAGE = 500
const HIGH_STOCK_THRESHOLD = 30
const MEDIUM_STOCK_THRESHOLD = 10
const ITEMS_PER_PAGE = 12

const emojiFallbacks = ['🥬', '🍎', '🥕', '🌾', '🧺']
const emojiDisabledGroups = ['smileys_people', 'animals_nature', 'activities', 'travel_places', 'objects', 'symbols', 'flags']

const categoriasRegistradas = ref([])
const productosRegistrados = ref([])
const proveedoresLookup = ref(new Map())
const categoriasLoading = ref(false)
const productosLoading = ref(false)
const categoriasError = ref('')
const productosError = ref('')
const categoriaEliminando = ref(null)
const formError = ref('')
const productSearchQuery = ref('')

const showCreateDialog = ref(false)
const showListDialog = ref(false)
const categoryForm = ref(null)
const formulario = ref({ nombre: '', detalle: '', emoji: '' })
const cargando = ref(false)
const categoriaEditando = ref(null)
const showEmojiPicker = ref(false)

// Nuevas variables para paginación por categoría
const currentCategoryPage = ref(0)
const currentProductPage = ref(1)
const itemsPerPage = ref(ITEMS_PER_PAGE)

// Variable para forzar actualización
const forceRefreshKey = ref(0)

// --- COMPUTED PROPERTIES ---
const formTitle = computed(() => (categoriaEditando.value ? 'Actualizar categoría' : 'Registrar nueva categoría'))
const submitLabel = computed(() => (categoriaEditando.value ? 'Actualizar' : 'Guardar'))
const submitIcon = computed(() => (categoriaEditando.value ? 'mdi-content-save-edit' : 'mdi-content-save'))
const requiredRule = (value) => !!value?.trim() || 'Este campo es obligatorio'

// --- MANEJO DE EMOJIS ---
const handleEmojiSelect = (emoji) => {
    const symbol = emoji.i || emoji.native;
    if (symbol) {
        formulario.value.emoji = symbol;
        showEmojiPicker.value = false;
    }
}

const isProductoEnBs = (p) => {
    if (p?.moneda === 'Bs' || p?.currency === 'Bs' || p?.moneda === 'VEF' || p?.currency === 'VEF' || p?.moneda === 'VES' || p?.currency === 'VES') return true;
    if (p?.detalle && typeof p.detalle === 'string' && (p.detalle.includes('VEF') || p.detalle.includes('Bs') || p.detalle.includes('VES'))) return true;
    // Heurística: si el precio de compra o venta es mayor a $500 y menor a $1000000, probablemente está en Bs
    if ((Number(p?.precio_compra) > 500 && Number(p?.precio_compra) < 1000000) || (Number(p?.precio_venta_kg) > 500 && Number(p?.precio_venta_kg) < 1000000)) {
        return true;
    }
    return false;
}

const convertirBsAUsd = (montoBs) => {
    const tasa = typeof getTasa === 'function' ? getTasa() : 1;
    if (!tasa || tasa <= 0) return 0;
    return Number((Number(montoBs) / tasa).toFixed(2));
}

// --- FUNCIONES DE EXTRACCIÓN DE DATOS CON DESPERDICIO ---
const toNumber = (v) => { const n = Number(v); return Number.isFinite(n) ? n : 0 }
const clamp = (v, min, max) => Math.min(Math.max(v, min), max)

const extractKilosBrutos = (p) => {
    return toNumber(p?.kilogramos ?? p?.kilogramos_netos ?? p?.kilo ?? p?.stock ?? 0)
}

const extractDesperdicio = (p) => {
    return toNumber(p?.desperdicio ?? p?.waste ?? p?.perdida ?? 0)
}

const extractKilos = (p) => {
    const kilosBrutos = extractKilosBrutos(p)
    const desperdicio = extractDesperdicio(p)
    return Math.max(0, kilosBrutos - desperdicio)
}

const extractPrecioVenta = (p) => {
    let val = toNumber(p?.precio_venta_kg ?? p?.precio_ventakg ?? p?.precio_venta ?? p?.precio ?? 0)
    if (isProductoEnBs(p)) val = convertirBsAUsd(val)
    return val
}

const extractPrecioCompra = (p) => {
    let val = toNumber(p?.precio_compra ?? p?.costo ?? 0)
    if (isProductoEnBs(p)) val = convertirBsAUsd(val)
    return val
}

const computeProductoProfit = (p) => {
    const kilosNetos = extractKilos(p)
    const venta = extractPrecioVenta(p)
    const compra = extractPrecioCompra(p)
    return kilosNetos * (venta - compra)
}

// --- FUNCIONES DE LLAMADA A RUTA ---

const fetchCategorias = async () => {
    categoriasLoading.value = true
    categoriasError.value = ''
    try {
        const response = await $fetch(`${API_URL}/categorias`, {
            method: 'GET',
            ...fetchConfig
        })
        categoriasRegistradas.value = response?.data || response || []
    } catch (error) {
        if (error.status === 401) await navigateTo('/login')
        categoriasError.value = 'No se pudieron cargar las categorías.'
    } finally {
        categoriasLoading.value = false
    }
}

const fetchProductos = async () => {
    productosLoading.value = true
    productosError.value = ''
    try {
        const response = await $fetch(`${API_URL}/productos`, {
            method: 'GET',
            params: { per_page: MAX_PRODUCTOS_PER_PAGE },
            ...fetchConfig
        })
        productosRegistrados.value = response?.data || response || []
    } catch (error) {
        console.error('Error al cargar productos:', error)
    } finally {
        productosLoading.value = false
    }
}

const fetchProveedores = async () => {
    try {
        const response = await $fetch(`${API_URL}/proveedores`, {
            method: 'GET',
            ...fetchConfig
        })
        const lista = response?.data || response || []
        const map = new Map()
        lista.forEach((p) => { if (p.id) map.set(p.id, p) })
        proveedoresLookup.value = map
    } catch (error) {
        console.warn('No se pudieron cargar los proveedores.', error)
    }
}

const submitCategory = async () => {
    formError.value = ''
    const nombreActual = formulario.value.nombre?.trim()
    if (!nombreActual) return

    const payload = {
        nombre: nombreActual,
        detalle: formulario.value.detalle?.trim() || null,
        emoji: formulario.value.emoji || null,
    }

    cargando.value = true
    try {
        const url = categoriaEditando.value
            ? `${API_URL}/categorias/${categoriaEditando.value.id}`
            : `${API_URL}/categorias`

        const method = categoriaEditando.value ? 'PUT' : 'POST'

        await $fetch(url, {
            method,
            body: payload,
            ...fetchConfig
        })

        await reloadAllData()
        cancelCreateDialog()
    } catch (error) {
        formError.value = error.data?.message || 'No se pudo guardar la categoría.'
    } finally {
        cargando.value = false
    }
}

// --- FUNCIÓN PARA RECARGAR TODOS LOS DATOS ---
const reloadAllData = async () => {
    // Incrementar la clave para forzar la actualización de computed properties
    forceRefreshKey.value++
    
    // Recargar todos los datos
    await Promise.all([
        fetchCategorias(),
        fetchProductos(),
        fetchProveedores()
    ])
}

// --- LÓGICA DE TRANSFORMACIÓN DE DATOS ---

const getCategoriaEmoji = (cat, idx) => cat?.emoji ?? cat?.icono ?? emojiFallbacks[idx % emojiFallbacks.length]

const computeStockMeta = (kilo) => {
    const val = Math.max(0, toNumber(kilo))
    if (val === 0) return { stockColor: 'error', availability: 'Sin stock', progress: 10 }
    if (val >= HIGH_STOCK_THRESHOLD) return { stockColor: 'success', availability: 'Alta', progress: clamp(Math.round((val / 50) * 100), 45, 100) }
    if (val >= MEDIUM_STOCK_THRESHOLD) return { stockColor: 'warning', availability: 'Media', progress: clamp(Math.round((val / 40) * 100), 25, 75) }
    return { stockColor: 'error', availability: 'Baja', progress: clamp(Math.round((val / 25) * 100), 10, 45) }
}

const buildProductCard = (p, key) => {
    const kilosBrutos = extractKilosBrutos(p)
    const desperdicio = extractDesperdicio(p)
    const kilosNetos = extractKilos(p)
    const compra = extractPrecioCompra(p)
    const ventaKg = extractPrecioVenta(p)
    const ventaTotal = kilosNetos * ventaKg
    const gananciaPorKg = ventaKg - compra
    const gananciaTotal = gananciaPorKg * kilosNetos
    const meta = computeStockMeta(kilosNetos) // Usar kilos netos para el cálculo de stock

    return {
        id: p?.id ?? key,
        name: p?.nombre ?? 'Sin nombre',
        price: ventaKg,
        purchaseLabel: formatCurrency(compra),
        saleLabel: formatCurrency(ventaKg),
        profitPerKgLabel: formatCurrency(gananciaPorKg),
        profitTotalLabel: formatCurrency(gananciaTotal),
        source: p?.proveedor_nombre || p?.proveedor?.nombre || proveedoresLookup.value.get(p?.proveedor_id)?.nombre || 'S/P',
        // Mostrar información del desperdicio
        stock: kilosNetos > 0 ? `${weightFormatter.format(kilosNetos)} kg` : '0 kg',
        kilosBrutos: weightFormatter.format(kilosBrutos),
        desperdicio: desperdicio,
        desperdicioLabel: desperdicio > 0 ? `(${weightFormatter.format(desperdicio)} desperdicio)` : '',
        ...meta,
        progressColor: meta.stockColor,
    }
}

// --- COMPUTED PARA PAGINACIÓN POR CATEGORÍA ---

const productosPorCategoriaMap = computed(() => {
    // Incluir forceRefreshKey en la dependencia para forzar recálculo
    forceRefreshKey.value
    
    const map = new Map()
    productosRegistrados.value.forEach((p) => {
        const key = p?.categoria_id || p?.categoriaId || 'sin-categoria'
        if (!map.has(key)) map.set(key, [])
        map.get(key).push(p)
    })
    return map
})

const confirmDeleteDialog = ref(false)
const categoryToDelete = ref(null)

// 1. Abre el diálogo y guarda la categoría a eliminar
const deleteCategoria = (categoria) => {
    categoryToDelete.value = categoria
    confirmDeleteDialog.value = true
}

// 2. Ejecuta la llamada a la API
const executeDelete = async () => {
    if (!categoryToDelete.value) return

    categoriaEliminando.value = categoryToDelete.value.id
    try {
        await $fetch(`${API_URL}/categorias/${categoryToDelete.value.id}`, {
            method: 'DELETE',
            ...fetchConfig
        })

        await reloadAllData()

        // Si eliminamos la categoría actual, retroceder una página
        if (currentCategoryPage.value >= categoriasRegistradas.value.length) {
            currentCategoryPage.value = Math.max(0, categoriasRegistradas.value.length - 1)
        }

        // Cerrar el diálogo al finalizar con éxito
        confirmDeleteDialog.value = false
        categoryToDelete.value = null
    } catch (error) {
        alert('Error al eliminar: ' + (error.data?.message || 'Error desconocido'))
    } finally {
        categoriaEliminando.value = null
    }
}

const mappedCategories = computed(() => {
    // Incluir forceRefreshKey en la dependencia para forzar recálculo
    forceRefreshKey.value
    
    return categoriasRegistradas.value.map((cat, idx) => {
        const prods = productosPorCategoriaMap.value.get(cat.id) ?? []

        // Inicializar todas las variables a cero
        let totalKilosNetos = 0
        let totalDesperdicio = 0
        let totalValue = 0
        let profit = 0

        // Solo calcular si hay productos
        if (prods.length > 0) {
            // Calcular kilos netos totales
            totalKilosNetos = prods.reduce((s, p) => {
                return s + extractKilos(p)
            }, 0)

            // Calcular desperdicio total
            totalDesperdicio = prods.reduce((s, p) => {
                return s + extractDesperdicio(p)
            }, 0)

            // Calcular valor total usando kilos netos
            totalValue = prods.reduce((s, p) => {
                const venta = extractPrecioVenta(p)
                const kilosNetos = extractKilos(p)
                return s + (kilosNetos * venta)
            }, 0)

            // Calcular ganancia total usando kilos netos
            profit = prods.reduce((s, p) => s + computeProductoProfit(p), 0)
        }

        return {
            id: cat.id,
            name: cat.nombre,
            products: prods.length,
            totalQty: formatWeight(totalKilosNetos),
            totalDesperdicio: formatWeight(totalDesperdicio),
            totalValue: totalValue,
            profit: profit,
            emoji: getCategoriaEmoji(cat, idx),
            tag: cat.estado ?? 'Activa',
        }
    })
})

const paginatedCategories = computed(() => {
    // Incluir forceRefreshKey en la dependencia
    forceRefreshKey.value
    
    return mappedCategories.value.map((cat, index) => ({
        ...cat,
        pageIndex: index
    }))
})

const currentCategory = computed(() => {
    // Incluir forceRefreshKey en la dependencia
    forceRefreshKey.value
    
    if (paginatedCategories.value.length === 0) return null
    
    // Asegurarnos de que el índice sea válido
    const safeIndex = Math.max(0, Math.min(currentCategoryPage.value, paginatedCategories.value.length - 1))
    const category = paginatedCategories.value[safeIndex]
    
    // Si la categoría no tiene datos válidos, devolver valores por defecto
    if (!category) {
        const cat = categoriasRegistradas.value[safeIndex]
        return {
            id: cat?.id || null,
            name: cat?.nombre || 'Sin nombre',
            products: 0,
            totalQty: '0 kg',
            totalDesperdicio: '0 kg',
            totalValue: 0,
            profit: 0,
            emoji: getCategoriaEmoji(cat, safeIndex),
            tag: 'Activa',
            pageIndex: safeIndex
        }
    }
    
    return category
})

const productsForCurrentCategory = computed(() => {
    // Incluir forceRefreshKey en la dependencia
    forceRefreshKey.value
    
    if (!currentCategory.value) return []
    const catId = currentCategory.value.id
    const prods = productosPorCategoriaMap.value.get(catId) ?? []
    return prods.map((p, idx) => buildProductCard(p, `p-${catId}-${idx}`))
})

const filteredProducts = computed(() => {
    // Incluir forceRefreshKey en la dependencia
    forceRefreshKey.value
    
    const term = productSearchQuery.value?.toLowerCase().trim()
    if (!term) return productsForCurrentCategory.value

    return productsForCurrentCategory.value.filter(product =>
        product.name.toLowerCase().includes(term) ||
        product.source.toLowerCase().includes(term)
    )
})

const paginatedProducts = computed(() => {
    const startIndex = (currentProductPage.value - 1) * itemsPerPage.value
    const endIndex = startIndex + itemsPerPage.value
    return filteredProducts.value.slice(startIndex, endIndex)
})

const totalProductPages = computed(() => {
    return Math.ceil(filteredProducts.value.length / itemsPerPage.value)
})

// --- MANEJO DE CAMBIO DE CATEGORÍA ---
const onCategoryChange = () => {
    // Forzar recarga de datos cuando cambia la categoría
    reloadAllData()
    currentProductPage.value = 1
    productSearchQuery.value = ''
}

// --- FUNCIONES DE NAVEGACIÓN ---
const prevCategoryPage = () => {
    if (currentCategoryPage.value > 0) {
        currentCategoryPage.value--
        onCategoryChange()
    }
}

const nextCategoryPage = () => {
    if (currentCategoryPage.value < paginatedCategories.value.length - 1) {
        currentCategoryPage.value++
        onCategoryChange()
    }
}

// Watch para resetear paginación de productos cuando se filtra
watch(productSearchQuery, () => {
    currentProductPage.value = 1
})

// --- DIÁLOGOS ---
const resetForm = () => { formulario.value = { nombre: '', detalle: '', emoji: '' }; categoriaEditando.value = null; formError.value = '' }
const openCreateDialog = () => { resetForm(); showCreateDialog.value = true }
const cancelCreateDialog = () => { resetForm(); showCreateDialog.value = false }
const openListDialog = () => { showListDialog.value = true; fetchCategorias() }
const closeListDialog = () => { showListDialog.value = false }

const startUpdate = (cat) => {
    formulario.value = {
        nombre: cat.nombre,
        detalle: cat.detalle || '',
        emoji: cat.emoji || ''
    }
    categoriaEditando.value = cat
    showCreateDialog.value = true
}

// --- LIFECYCLE ---
onMounted(() => {
    fetchProveedores()
    fetchCategorias()
    fetchProductos()
})
</script>

<style scoped>
/* Los estilos permanecen iguales */
.categoria-page {
    display: flex;
    flex-direction: column;
}

.section-card {
    border-color: var(--app-border);
    background: var(--app-surface);
    box-shadow: 0 6px 18px color-mix(in srgb, var(--app-text) 8%, transparent);
}

.section-card :deep(.v-card-title) {
    padding: 18px 25px 6px;
}

.section-card :deep(.v-card-text) {
    padding: 18px 25px 22px;
}

.category-navigation {
    padding: 16px;
    background: color-mix(in srgb, var(--app-surface) 95%, var(--app-accent) 5%);
    border-radius: 16px;
    border: 1px solid var(--app-border);
}

.category-current-info {
    min-width: 180px;
}

.current-category-card {
    background: linear-gradient(145deg, color-mix(in srgb, var(--app-surface) 85%, var(--app-accent) 15%) 0%, var(--app-surface) 100%);
    border: 2px solid color-mix(in srgb, var(--app-accent) 25%, transparent);
}

.product-card {
    min-height: 240px;
    transition: all 0.3s ease;
    background: var(--app-surface);
    border-color: var(--app-border);
    box-shadow: 0 4px 10px color-mix(in srgb, var(--app-text) 8%, transparent);
}

.product-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px color-mix(in srgb, var(--app-text) 12%, transparent);
}

:global(.v-theme--light .categoria-page .product-card) {
    background: color-mix(in srgb, var(--app-surface) 88%, var(--app-accent) 12%);
    border-color: color-mix(in srgb, var(--app-accent) 28%, var(--app-border));
}

:global(.v-theme--dark .categoria-page .stat-card) {
    background: color-mix(in srgb, var(--app-surface) 75%, var(--app-bg) 25%);
    border-color: color-mix(in srgb, var(--app-text) 14%, transparent);
}

.stat-card :deep(.v-card-text),
.product-card :deep(.v-card-text) {
    padding: 18px 18px 16px;
}

.stat-item {
    padding: 12px;
    background: color-mix(in srgb, var(--app-surface) 95%, transparent);
    border-radius: 12px;
    border: 1px solid var(--app-border);
}

.modal-shell {
    padding: 26px 30px;
    background: var(--app-surface);
    border-color: var(--app-border);
    box-shadow: 0 26px 55px color-mix(in srgb, var(--app-text) 18%, transparent);
    display: flex;
    flex-direction: column;
    max-height: 85vh;
    overflow: hidden;
}

.modal-shell__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
}

.modal-shell__eyebrow {
    margin: 0 0 4px;
    font-size: 0.74rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--app-text-muted);
}

.modal-shell__title {
    margin: 0;
    font-size: 1.35rem;
    color: var(--app-text);
}

.modal-shell__subtitle {
    margin: 6px 0 0;
    color: var(--app-text-muted);
    font-size: 0.92rem;
}

.modal-shell__dismiss {
    margin-top: -6px;
}

.modal-shell__divider {
    height: 1px;
    background: color-mix(in srgb, var(--app-text) 12%, transparent);
    margin: 18px 0 24px;
}

.modal-shell__body {
    display: flex;
    flex-direction: column;
    gap: 0;
    flex: 1;
    min-height: 0;
}

.modal-shell__alert {
    margin: 0;
}

.modal-shell__form {
    display: flex;
    flex-direction: column;
    gap: 18px;
    flex: 1;
    min-height: 0;
}

.modal-shell__content {
    display: flex;
    flex-direction: column;
    gap: 18px;
    flex: 1;
    min-height: 0;
    max-height: 100%;
    overflow-y: auto;
    scrollbar-gutter: stable both-edges;
    padding-right: 6px;
    padding-bottom: 6px;
}

.modal-shell__content::-webkit-scrollbar {
    width: 6px;
}

.modal-shell__content::-webkit-scrollbar-track {
    background: rgba(11, 155, 74, 0.08);
    border-radius: 999px;
}

.modal-shell__content::-webkit-scrollbar-thumb {
    background: rgba(11, 155, 74, 0.45);
    border-radius: 999px;
}

.modal-shell__content::-webkit-scrollbar-thumb:hover {
    background: rgba(11, 155, 74, 0.6);
}

.modal-shell__actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
}

.modal-shell__ghost {
    font-weight: 600;
    letter-spacing: 0.08em;
}

.modal-shell__cta {
    text-transform: none;
    font-weight: 600;
}

.action-btn {
    min-height: 34px;
    width: 170px;
    min-width: 170px;
    border-radius: 14px;
    text-transform: none;
    font-weight: 600;
    font-family: inherit;
    font-size: 15px;
}

.new-category-btn {
    padding: 0 1.4rem;
    min-width: 100px;
    background: linear-gradient(135deg, #0cc665 0%, #06a453 100%) !important;
    color: #ffffff !important;
    box-shadow: 0 4px 12px rgba(6, 164, 83, 0.14) !important;
}

.list-categories-btn {
    width: 20px;
    min-width: 44px;
    height: 40px;
    min-height: 40px;
    border-radius: 16px;
    border: 1.5px dashed rgba(11, 155, 74, 0.45);
    background: linear-gradient(145deg, #f5fff7 0%, #e0f9e7 100%) !important;
    color: #05934a !important;
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.6), 0 3px 8px rgba(5, 147, 74, 0.12) !important;
}

.action-btn :deep(.v-btn__overlay) {
    opacity: 0;
}

.new-category-btn :deep(.v-btn__content) {
    letter-spacing: 0.2px;
}

.stock-chip--success {
    background: color-mix(in srgb, var(--app-surface) 85%, var(--app-accent) 15%) !important;
    color: var(--app-accent) !important;
    border: 1.5px solid color-mix(in srgb, var(--app-accent) 45%, var(--app-border));
}

.availability--low {
    color: rgb(var(--v-theme-error));
}

.progress--low :deep(.v-progress-linear__determinate) {
    background-color: rgb(var(--v-theme-error)) !important;
}

.modal-card {
    background: var(--app-surface);
    border-color: var(--app-border);
    box-shadow: 0 18px 40px color-mix(in srgb, var(--app-text) 18%, transparent);
}

.submit-btn {
    text-transform: none;
    font-weight: 600;
}

.categoria-table thead th {
    font-size: 0.78rem;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    color: var(--app-accent);
}

.categoria-table tbody td {
    font-size: 0.92rem;
    vertical-align: middle;
}

:deep(.categoria-table table) {
    border-collapse: separate;
    border-spacing: 0 12px;
}

:deep(.categoria-table-row td) {
    padding: 16px 18px;
    background: var(--app-surface);
}

:deep(.categoria-table-row td:first-child) {
    border-top-left-radius: 14px;
    border-bottom-left-radius: 14px;
}

:deep(.categoria-table-row td:last-child) {
    border-top-right-radius: 14px;
    border-bottom-right-radius: 14px;
}

.action-icon-btn {
    width: 30px;
    height: 30px;
    min-width: 30px;
    border-radius: 10px;
}

.list-modal {
    padding: 20px 28px 26px;
}

:deep(.categoria-dialog .categoria-dialog-content) {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
}

:deep(.categoria-dialog .categoria-dialog-content > .v-overlay__scrim) {
    backdrop-filter: blur(2px);
}

.emoji-avatar {
    background: color-mix(in srgb, var(--app-surface) 85%, var(--app-accent) 15%) !important;
    color: var(--app-accent) !important;
}

.emoji-avatar__emoji {
    font-size: 1.6rem;
    line-height: 1;
}

.name-input-block {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 16px;
    align-items: flex-start;
    margin-bottom: 1.2rem;
}

.emoji-selector {
    width: 58px;
    height: 58px;
    min-width: 58px;
    border-radius: 50% !important;
    border: 1px solid var(--app-border);
    background: var(--app-surface) !important;
    color: var(--app-text);
    font-size: 1.5rem;
    padding: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.emoji-selector--floating {
    margin-top: 4px;
}

.emoji-selector__icon {
    color: var(--app-text-muted);
}

.emoji-selector__value {
    line-height: 1;
}

.name-input-block__inputs {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.name-field,
.description-field {
    border-radius: 18px;
}

.name-field :deep(.v-field__input),
.description-field :deep(.v-field__input) {
    min-height: 56px;
}

.name-field :deep(.v-field__outline),
.description-field :deep(.v-field__outline) {
    border-width: 1.5px;
    border-color: var(--app-border);
}

.emoji-picker-surface {
    border-radius: 20px;
    background: transparent;
    box-shadow: none;
    padding: 0;
    width: min(360px, 80vw);
}

.emoji-cell {
    width: 72px;
    text-align: center;
}

.filters-bar {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

@media (min-width: 960px) {
    .filters-bar {
        flex-direction: row;
        align-items: center;
        gap: 50px;
    }

    .filters-bar__search {
        flex: 1 1 100%;
        display: flex;
        align-items: center;
    }
}

.category-quick-select :deep(.v-field) {
    border-radius: 12px;
}

:global(.v-theme--dark .categoria-page .list-categories-btn) {
    background: color-mix(in srgb, var(--app-accent) 28%, transparent) !important;
    border-color: #000000 !important;
}

:global(.v-theme--dark .categoria-page .list-categories-btn .v-icon) {
    color: var(--app-accent) !important;
}

:global(.v-theme--dark .categoria-dialog .list-modal) {
    background: var(--app-surface) !important;
    border-color: var(--app-border) !important;
}

:global(.v-theme--dark .list-modal .categoria-table) {
    color: var(--app-text) !important;
    background: transparent !important;
}

:global(.v-theme--dark .list-modal .categoria-table thead th) {
    color: #94b8a2 !important;
    font-weight: 600;
    text-transform: uppercase;
    background: transparent !important;
    border-bottom: 1px solid #335539 !important;
    letter-spacing: 0.05em;
}

:global(.v-theme--dark .list-modal .categoria-table-row td) {
    background: #1e3b28cc !important;
    color: #e2e8f0 !important;
    border-top: 1px solid #335539 !important;
    border-bottom: 1px solid #335539 !important;
}

:global(.v-theme--dark .list-modal .categoria-table-row td:first-child) {
    border-left: 1px solid #335539 !important;
}

:global(.v-theme--dark .list-modal .categoria-table-row td:last-child) {
    border-right: 1px solid #335539 !important;
}

:global(.v-theme--dark .list-modal .categoria-table-row:hover td) {
    background: #234d32 !important;
    border-color: #4ade80 !important;
    color: #ffffff !important;
}

:global(.v-theme--dark .list-modal .emoji-avatar__emoji) {
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

/* Responsive adjustments */
@media (max-width: 960px) {
    .category-navigation {
        flex-direction: column;
        gap: 16px;
    }

    .category-quick-select {
        max-width: 100% !important;
        margin-top: 12px;
    }
}

@media (max-width: 600px) {
    .modal-shell {
        padding: 22px 20px;
    }

    .modal-shell__header {
        flex-direction: column;
    }

    .modal-shell__actions {
        flex-direction: column;
    }

    .name-input-block {
        grid-template-columns: 1fr;
    }

    .emoji-selector--floating {
        margin: 0 auto 16px;
    }

    .category-current-info {
        min-width: 140px;
    }

    .current-category-card :deep(.v-card-text) {
        padding: 16px 12px;
    }

    .stat-item {
        padding: 8px;
    }
}

:global(.v-theme--light .bg-error-lighten-5) {
    background-color: #ffebee !important;
}

:global(.v-theme--dark .bg-error-lighten-5) {
    background-color: rgba(255, 82, 82, 0.15) !important;
}

.categoria-table tbody td {
    font-size: 0.92rem;
    vertical-align: middle;
    white-space: normal;
    word-break: break-all;
    max-width: 300px;
}
</style>
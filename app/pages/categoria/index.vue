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
                <v-row v-if="visibleCategories.length" align="center" class="ga-2">
                    <v-col cols="auto" class="d-flex justify-center">
                        <v-btn icon="mdi-chevron-left" variant="text" color="success" :disabled="!canGoPrev"
                            @click="prevCategory"></v-btn>
                    </v-col>
                    <v-col>
                        <v-row>
                            <v-col v-for="item in visibleCategories" :key="item.id" cols="12" md="6">
                                <v-card class="stat-card" rounded="lg" border>
                                    <v-card-text>
                                        <div class="d-flex align-center justify-space-between">
                                            <div class="d-flex align-center ga-3">
                                                <v-avatar color="success-lighten-4" size="44" class="emoji-avatar">
                                                    <span class="emoji-avatar__emoji">{{ item.emoji }}</span>
                                                </v-avatar>
                                                <div>
                                                    <div class="text-subtitle-1 font-weight-bold">{{ item.name }}</div>
                                                    <div class="text-caption text-medium-emphasis">
                                                        {{ item.products }} producto(s)
                                                    </div>
                                                </div>
                                            </div>
                                            <v-chip color="success" variant="tonal" size="small">{{ item.tag }}</v-chip>
                                        </div>

                                        <v-divider class="my-3"></v-divider>

                                        <v-row class="text-body-2">
                                            <v-col cols="6">
                                                <div class="text-medium-emphasis">Cantidad total</div>
                                                <div class="font-weight-semibold">{{ item.totalQty }}</div>
                                            </v-col>
                                            <v-col cols="6">
                                                <div class="text-medium-emphasis">Valor en venta</div>
                                                <div class="font-weight-semibold">{{ formatCurrency(item.totalValue) }}
                                                </div>
                                            </v-col>
                                        </v-row>

                                        <v-divider class="my-2"></v-divider>

                                        <div class="gain-chip d-flex align-center justify-space-between">
                                            <div class="d-flex align-center ga-2">
                                                <v-icon size="18" icon="mdi-cash-multiple"></v-icon>
                                                <span class="text-body-2 font-weight-semibold">Ganancia</span>
                                            </div>
                                            <div class="font-weight-bold">{{ formatCurrency(item.profit) }}</div>
                                        </div>
                                    </v-card-text>
                                </v-card>
                            </v-col>
                        </v-row>
                    </v-col>
                    <v-col cols="auto" class="d-flex justify-center">
                        <v-btn icon="mdi-chevron-right" variant="text" color="success" :disabled="!canGoNext"
                            @click="nextCategory"></v-btn>
                    </v-col>
                </v-row>
                <div v-else class="text-body-2 text-medium-emphasis py-8 text-center">
                    Aún no registras categorías.
                </div>
            </v-card-text>
        </v-card>

        <v-card class="section-card" rounded="lg" border>
            <v-card-title class="text-subtitle-1 font-weight-bold">Productos por Categoría</v-card-title>
            <v-card-text>
                <div class="filters-bar mb-4">
                    <div class="filters-bar__search">
                        <v-text-field v-model="productSearchQuery" label="Buscar producto"
                            placeholder="Escribe el nombre o proveedor" variant="outlined" density="comfortable"
                            prepend-inner-icon="mdi-magnify" clearable color="success" base-color="success"
                            bg-color="surface" class="search-input"></v-text-field>
                    </div>
                    <div class="filters-bar__categories">

                        <v-chip-group v-model="categoriaFiltroSeleccionada"
                            class="category-chip-group filters-bar__chips" column>
                            <v-chip v-for="item in categoriaFilterItems" :key="item.value" :value="item.value"
                                variant="outlined" size="small" class="category-chip"
                                :class="{ 'category-chip--active': categoriaFiltroSeleccionada === item.value }">
                                <span v-if="item.emoji" class="category-chip__emoji">{{ item.emoji }}</span>
                                <span class="category-chip__label">{{ item.title }}</span>
                            </v-chip>
                        </v-chip-group>
                    </div>
                </div>
                <v-progress-linear v-if="productosLoading" indeterminate color="success" height="6" rounded
                    class="mb-4"></v-progress-linear>
                <v-alert v-if="productosError" type="error" density="comfortable" variant="tonal" class="mb-4">
                    {{ productosError }}
                </v-alert>
                <template v-if="filteredProductGroups.length">
                    <div v-for="group in filteredProductGroups" :key="group.id" class="category-group">
                        <div class="category-group__header d-flex align-center ga-2 mb-4">
                            <v-avatar color="success-lighten-4" size="36" class="emoji-avatar">
                                <span class="emoji-avatar__emoji">{{ group.emoji }}</span>
                            </v-avatar>
                            <div class="text-subtitle-2 font-weight-bold">
                                {{ group.name }} ({{ group.items.length }})
                            </div>
                        </div>

                        <div class="category-group__content" v-if="group.items.length">
                            <v-row>
                                <v-col v-for="product in group.items" :key="product.id" cols="12" md="4">
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
                        </div>
                        <div v-else class="text-body-2 text-medium-emphasis py-4 px-3 bg-grey-lighten-5 rounded-lg">
                            Esta categoría aún no tiene productos registrados.
                        </div>
                    </div>
                </template>
                <div v-else-if="productGroups.length && !productosLoading"
                    class="text-body-2 text-medium-emphasis py-6 text-center">
                    No hay productos que coincidan con los filtros aplicados.
                </div>
                <div v-else-if="!productosLoading" class="text-body-2 text-medium-emphasis py-6 text-center">
                    No hay categorías o productos para mostrar todavía.
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
    </section>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, watch } from 'vue'
import EmojiPicker from 'vue3-emoji-picker'
import 'vue3-emoji-picker/css'
import { navigateTo } from '#app'

// --- CONFIGURACIÓN DE API (IDÉNTICA A PROVEEDORES) ---
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
const formatWeight = (value = 0) => `${weightFormatter.format(Number(value) || 0)} kg`

// --- CONSTANTES Y ESTADOS ---
const MAX_PRODUCTOS_PER_PAGE = 500
const visibleSlots = 2
const HIGH_STOCK_THRESHOLD = 30
const MEDIUM_STOCK_THRESHOLD = 10
const ALL_CATEGORIES_VALUE = '__all__'

const emojiFallbacks = ['🥬', '🍎', '🥕', '🌾', '🧺']
const emojiAllowedGroup = 'food_drink'
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
const categoriaFiltroSeleccionada = ref(ALL_CATEGORIES_VALUE)

const showCreateDialog = ref(false)
const showListDialog = ref(false)
const categoryForm = ref(null)
const formulario = ref({ nombre: '', detalle: '', emoji: '' })
const cargando = ref(false)
const categoriaEditando = ref(null)
const showEmojiPicker = ref(false)
const categoryCursor = ref(0)

// --- COMPUTED PROPERTIES ---
const formTitle = computed(() => (categoriaEditando.value ? 'Actualizar categoría' : 'Registrar nueva categoría'))
const submitLabel = computed(() => (categoriaEditando.value ? 'Actualizar' : 'Guardar'))
const submitIcon = computed(() => (categoriaEditando.value ? 'mdi-content-save-edit' : 'mdi-content-save'))
const requiredRule = (value) => !!value?.trim() || 'Este campo es obligatorio'

// --- MANEJO DE EMOJIS (CORREGIDO) ---
const handleEmojiSelect = (emoji) => {
    // vue3-emoji-picker devuelve el caracter en la propiedad .i o .native
    const symbol = emoji.i || emoji.native;
    if (symbol) {
        formulario.value.emoji = symbol;
        showEmojiPicker.value = false;
    }
}

// --- FUNCIONES DE LLAMADA A RUTA (AJUSTADAS) ---

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
            body: payload, // $fetch serializa automáticamente a JSON
            ...fetchConfig
        })

        await fetchCategorias()
        cancelCreateDialog()
    } catch (error) {
        formError.value = error.data?.message || 'No se pudo guardar la categoría.'
    } finally {
        cargando.value = false
    }
}

const deleteCategoria = async (categoria) => {
    if (!window.confirm(`¿Eliminar la categoría "${categoria.nombre}"?`)) return

    categoriaEliminando.value = categoria.id
    try {
        await $fetch(`${API_URL}/categorias/${categoria.id}`, {
            method: 'DELETE',
            ...fetchConfig
        })
        await fetchCategorias()
    } catch (error) {
        alert('Error al eliminar: ' + (error.data?.message || 'Error desconocido'))
    } finally {
        categoriaEliminando.value = null
    }
}

// --- LÓGICA DE TRANSFORMACIÓN DE DATOS ---

const toNumber = (v) => { const n = Number(v); return Number.isFinite(n) ? n : 0 }
const clamp = (v, min, max) => Math.min(Math.max(v, min), max)

const extractKilos = (p) => toNumber(p?.kilogramos ?? p?.kilogramos_netos ?? p?.kilo ?? p?.stock ?? 0)
const extractPrecioVenta = (p) => toNumber(p?.precio_venta_kg ?? p?.precio_ventakg ?? p?.precio_venta ?? p?.precio ?? 0)
const extractPrecioCompra = (p) => toNumber(p?.precio_compra ?? p?.costo ?? 0)

const computeProductoProfit = (p) => {
    const kilos = extractKilos(p)
    return kilos * (extractPrecioVenta(p) - extractPrecioCompra(p))
}

const getCategoriaEmoji = (cat, idx) => cat?.emoji ?? cat?.icono ?? emojiFallbacks[idx % emojiFallbacks.length]

const computeStockMeta = (kilo) => {
    const val = Math.max(0, toNumber(kilo))
    if (val === 0) return { stockColor: 'error', availability: 'Sin stock', progress: 10 }
    if (val >= HIGH_STOCK_THRESHOLD) return { stockColor: 'success', availability: 'Alta', progress: clamp(Math.round((val / 50) * 100), 45, 100) }
    if (val >= MEDIUM_STOCK_THRESHOLD) return { stockColor: 'warning', availability: 'Media', progress: clamp(Math.round((val / 40) * 100), 25, 75) }
    return { stockColor: 'error', availability: 'Baja', progress: clamp(Math.round((val / 25) * 100), 10, 45) }
}

const buildProductCard = (p, key) => {
    const kilo = extractKilos(p)
    const compra = extractPrecioCompra(p)
    const ventaKg = extractPrecioVenta(p)
    const ventaTotal = toNumber(p?.precio_venta_total ?? (kilo * ventaKg))
    const gananciaPorKg = ventaKg - compra
    const gananciaTotal = gananciaPorKg * kilo
    const meta = computeStockMeta(kilo)
    return {
        id: p?.id ?? key,
        name: p?.nombre ?? 'Sin nombre',
        price: ventaKg,
        purchaseLabel: formatCurrency(compra),
        saleLabel: formatCurrency(ventaKg),
        profitPerKgLabel: formatCurrency(gananciaPorKg),
        profitTotalLabel: formatCurrency(gananciaTotal),
        source: p?.proveedor_nombre || p?.proveedor?.nombre || proveedoresLookup.value.get(p?.proveedor_id)?.nombre || 'S/P',
        stock: kilo ? `${weightFormatter.format(kilo)} kg` : '0 kg',
        ...meta,
        progressColor: meta.stockColor,
    }
}

// --- COMPUTED MAPS ---

const productosPorCategoriaMap = computed(() => {
    const map = new Map()
    productosRegistrados.value.forEach((p) => {
        const key = p?.categoria_id || p?.categoriaId || 'sin-categoria'
        if (!map.has(key)) map.set(key, [])
        map.get(key).push(p)
    })
    return map
})

const mappedCategories = computed(() => {
    return categoriasRegistradas.value.map((cat, idx) => {
        const prods = productosPorCategoriaMap.value.get(cat.id) ?? []
        const totalValue = prods.reduce((s, p) => s + (extractKilos(p) * extractPrecioVenta(p)), 0)
        return {
            id: cat.id,
            name: cat.nombre,
            products: prods.length,
            totalQty: formatWeight(prods.reduce((s, p) => s + extractKilos(p), 0)),
            totalValue,
            profit: prods.reduce((s, p) => s + computeProductoProfit(p), 0),
            emoji: getCategoriaEmoji(cat, idx),
            tag: cat.estado ?? 'Activa',
        }
    })
})

const visibleCategories = computed(() => mappedCategories.value.slice(categoryCursor.value, categoryCursor.value + visibleSlots))
const canGoPrev = computed(() => categoryCursor.value > 0)
const canGoNext = computed(() => categoryCursor.value + visibleSlots < mappedCategories.value.length)

const prevCategory = () => { if (canGoPrev.value) categoryCursor.value-- }
const nextCategory = () => { if (canGoNext.value) categoryCursor.value++ }

const productGroups = computed(() => {
    const groups = categoriasRegistradas.value.map((cat, idx) => ({
        id: cat.id,
        name: cat.nombre,
        emoji: getCategoriaEmoji(cat, idx),
        items: (productosPorCategoriaMap.value.get(cat.id) ?? []).map((p, pIdx) => buildProductCard(p, `p-${cat.id}-${pIdx}`))
    }))
    return groups
})

const categoriaFilterItems = computed(() => [
    { title: 'Todas', value: ALL_CATEGORIES_VALUE, emoji: '⭐' },
    ...productGroups.value.map(g => ({ title: g.name, value: String(g.id), emoji: g.emoji }))
])

const filteredProductGroups = computed(() => {
    const term = productSearchQuery.value?.toLowerCase().trim()
    const selected = categoriaFiltroSeleccionada.value !== ALL_CATEGORIES_VALUE ? String(categoriaFiltroSeleccionada.value) : null

    return productGroups.value.map(g => {
        if (selected && String(g.id) !== selected) return null
        const items = term ? g.items.filter(i => i.name.toLowerCase().includes(term) || i.source.toLowerCase().includes(term)) : g.items
        return items.length ? { ...g, items } : null
    }).filter(Boolean)
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

.stat-card,
.product-card {
    background: var(--app-surface);
    border-color: var(--app-border);
    box-shadow: 0 4px 10px color-mix(in srgb, var(--app-text) 8%, transparent);
}

.product-card {
    min-height: 210px;
}

:global(.v-theme--light .categoria-page .product-card) {
    background: color-mix(in srgb, var(--app-surface) 88%, var(--app-accent) 12%);
    border-color: color-mix(in srgb, var(--app-accent) 28%, var(--app-border));
    box-shadow: 0 10px 22px color-mix(in srgb, var(--app-text) 10%, transparent);
}

:global(.v-theme--dark .categoria-page .stat-card) {
    background: color-mix(in srgb, var(--app-surface) 75%, var(--app-bg) 25%);
    border-color: color-mix(in srgb, var(--app-text) 14%, transparent);
    box-shadow: 0 12px 26px color-mix(in srgb, #000000 40%, transparent);
}

.stat-card :deep(.v-card-text),
.product-card :deep(.v-card-text) {
    padding: 18px 18px 16px;
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

.modal-shell :deep(.v-field__outline) {
    border-radius: 18px;
    border-width: 1.5px;
    border-color: color-mix(in srgb, var(--app-text) 18%, transparent);
}

.modal-shell :deep(.v-field__input) {
    padding-top: 18px;
    padding-bottom: 14px;
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

.gain-chip {
    border: 2px solid color-mix(in srgb, var(--app-accent) 45%, var(--app-border));
    color: var(--app-accent);
    background: color-mix(in srgb, var(--app-surface) 85%, var(--app-accent) 15%);
    padding: 6px 10px;
    border-radius: 10px;
    font-weight: 700;
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

.name-field :deep(.v-field__outline--notch),
.description-field :deep(.v-field__outline--notch) {
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

.category-group {
    margin-bottom: 2.5rem;
    padding: 14px 16px;
    border: 1px solid var(--app-border);
    border-radius: 20px;
    background: var(--app-surface);
}

.category-group__content {
    max-height: 420px;
    overflow-y: auto;
    overflow-x: hidden;
    padding-right: 6px;
}

.category-group__header {
    position: sticky;
    top: 0;
    background: var(--app-surface);
    padding-bottom: 10px;
    z-index: 1;
}

.category-group__content::-webkit-scrollbar {
    width: 6px;
}

.category-group__content::-webkit-scrollbar-thumb {
    background: color-mix(in srgb, var(--app-accent) 45%, transparent);
    border-radius: 4px;
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
        flex: 1 1 50%;
        display: flex;
        align-items: center;
        margin-top: 20px;
        margin-left: 10px;
    }

    .filters-bar__categories {
        flex: 1 1 50%;
        flex-direction: row;
        align-items: center;
        gap: 16px;
    }
}

.category-chip {
    border-radius: 14px;
    border-color: color-mix(in srgb, var(--app-accent) 35%, var(--app-border)) !important;
    color: var(--app-accent) !important;
    background: var(--app-surface);
}

.category-chip--active {
    background: color-mix(in srgb, var(--app-surface) 80%, var(--app-accent) 20%) !important;
    border-color: var(--app-accent) !important;
    color: var(--app-accent) !important;
}

.category-chip__emoji {
    margin-right: 6px;
    font-size: 1rem;
}

:global(.v-theme--dark .categoria-page .list-categories-btn) {
    background: color-mix(in srgb, var(--app-accent) 28%, transparent) !important;
    border: 1px solid color-mix(in srgb, var(--app-accent) 55%, transparent) !important;
}

:global(.v-theme--dark .categoria-page .list-categories-btn .v-icon) {
    color: var(--app-accent) !important;
}

:global(.v-theme--dark .categoria-dialog .list-modal) {
    background: var(--app-surface) !important;
    border-color: var(--app-border) !important;
}

:global(.v-theme--dark .categoria-dialog .categoria-table) {
    color: var(--app-text) !important;
}

:global(.v-theme--dark .categoria-dialog .categoria-table thead th) {
    color: #c7d2cc !important;
    font-weight: 600;
    background: #0e9b55 !important;
    border-bottom: 1px solid rgba(47, 214, 119, 0.18) !important;
}

:global(.v-theme--dark .categoria-dialog .categoria-table-row td) {
    background: #35a26c !important;
    color: #e7efea !important;
    border: 1px solid rgba(255, 255, 255, 0.04) !important;
}

:global(.v-theme--dark .categoria-dialog .categoria-table-row td:first-child) {
    border-left: 1px solid rgba(255, 255, 255, 0.04) !important;
}

:global(.v-theme--dark .categoria-dialog .categoria-table-row td:last-child) {
    border-right: 1px solid rgba(255, 255, 255, 0.04) !important;
}

:global(.v-theme--dark .categoria-dialog .categoria-table-row:hover td) {
    background: #232826 !important;
    border-color: rgba(47, 214, 119, 0.18) !important;
}

</style>
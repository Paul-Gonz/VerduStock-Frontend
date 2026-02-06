<template>
    <section class="categoria-page">
        <v-card class="mb-8 section-card" rounded="lg" border>
            <v-card-title class="d-flex align-center justify-space-between ga-3">
                <span class="text-subtitle-1 font-weight-bold">Estadísticas por Categoría</span>
                <div class="d-flex align-center ga-2">
                    <v-tooltip location="bottom">
                        <template #activator="{ props }">
                            <v-btn
                                v-bind="props"
                                class="action-btn list-categories-btn"
                                color="success"
                                variant="tonal"
                                icon="mdi-format-list-bulleted"
                                @click="openListDialog"
                            ></v-btn>
                        </template>
                        <span>Ver categorías registradas</span>
                    </v-tooltip>
                    <v-btn
                        class="action-btn new-category-btn"
                        color="success"
                        variant="flat"
                        prepend-icon="mdi-plus"
                        @click="openCreateDialog"
                    >
                        Nueva categoría
                    </v-btn>
                </div>
            </v-card-title>
            <v-card-text>
                <v-progress-linear
                    v-if="categoriasLoading"
                    indeterminate
                    color="success"
                    height="6"
                    rounded
                    class="mb-4"
                ></v-progress-linear>
                <v-row v-if="visibleCategories.length" align="center" class="ga-2">
                    <v-col cols="auto" class="d-flex justify-center">
                        <v-btn
                            icon="mdi-chevron-left"
                            variant="text"
                            color="success"
                            :disabled="!canGoPrev"
                            @click="prevCategory"
                        ></v-btn>
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
                                                <div class="font-weight-semibold">{{ formatCurrency(item.totalValue) }}</div>
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
                        <v-btn
                            icon="mdi-chevron-right"
                            variant="text"
                            color="success"
                            :disabled="!canGoNext"
                            @click="nextCategory"
                        ></v-btn>
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
                        <v-text-field
                            v-model="productSearchQuery"
                            label="Buscar producto"
                            placeholder="Escribe el nombre o proveedor"
                            variant="outlined"
                            density="comfortable"
                            prepend-inner-icon="mdi-magnify"
                            clearable
                            color="success"
                            base-color="success"
                        ></v-text-field>
                    </div>
                    <div class="filters-bar__categories">
                      
                        <v-chip-group
                            v-model="categoriaFiltroSeleccionada"
                            class="category-chip-group filters-bar__chips"
                            column
                        >
                            <v-chip
                                v-for="item in categoriaFilterItems"
                                :key="item.value"
                                :value="item.value"
                                variant="outlined"
                                size="small"
                                class="category-chip"
                                :class="{ 'category-chip--active': categoriaFiltroSeleccionada === item.value }"
                            >
                                <span v-if="item.emoji" class="category-chip__emoji">{{ item.emoji }}</span>
                                <span class="category-chip__label">{{ item.title }}</span>
                            </v-chip>
                        </v-chip-group>
                    </div>
                </div>
                <v-progress-linear
                    v-if="productosLoading"
                    indeterminate
                    color="success"
                    height="6"
                    rounded
                    class="mb-4"
                ></v-progress-linear>
                <v-alert
                    v-if="productosError"
                    type="error"
                    density="comfortable"
                    variant="tonal"
                    class="mb-4"
                >
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
                                            <v-chip
                                                :color="product.stockColor"
                                                size="small"
                                                variant="tonal"
                                                :class="{ 'stock-chip--success': product.stockColor === 'success' }"
                                            >
                                                {{ product.stock }}
                                            </v-chip>
                                        </div>

                                        <div class="mt-2 text-body-2 text-medium-emphasis d-flex align-center ga-2">
                                            <span> Venta: {{ formatCurrency(product.price) }}</span>
                                        </div>
                                        <div class="mt-1 text-body-2 text-medium-emphasis d-flex align-center ga-2">
                                            <span> {{ product.source }}</span>
                                        </div>

                                        <v-divider class="my-3"></v-divider>

                                        <div class="d-flex align-center justify-space-between text-body-2">
                                            <span class="text-medium-emphasis">Disponibilidad</span>
                                            <span
                                                class="font-weight-semibold"
                                                :class="{ 'availability--low': product.progressColor === 'error' }"
                                            >
                                                {{ product.availability }}
                                            </span>
                                        </div>
                                        <v-progress-linear
                                            class="mt-2"
                                            :model-value="product.progress"
                                            :color="product.progressColor"
                                            height="6"
                                            rounded
                                            :class="{ 'progress--low': product.progressColor === 'error' }"
                                        ></v-progress-linear>
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
                <div
                    v-else-if="productGroups.length && !productosLoading"
                    class="text-body-2 text-medium-emphasis py-6 text-center"
                >
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
                    <v-btn
                        icon="mdi-close"
                        variant="text"
                        color="grey-darken-1"
                        class="modal-shell__dismiss"
                        @click="cancelCreateDialog"
                    ></v-btn>
                </div>
                <div class="modal-shell__divider"></div>
                <div class="modal-shell__body">
                    <v-form ref="categoryForm" class="modal-shell__form" @submit.prevent="submitCategory">
                        <div class="modal-shell__content">
                            <v-alert
                                v-if="formError"
                                type="warning"
                                density="comfortable"
                                variant="tonal"
                                color="warning"
                                class="modal-shell__alert"
                            >
                                {{ formError }}
                            </v-alert>
                            <div class="name-input-block">
                            <v-menu
                                v-model="showEmojiPicker"
                                :close-on-content-click="false"
                                location="bottom"
                                offset="8"
                            >
                                <template #activator="{ props }">
                                    <v-btn
                                        v-bind="props"
                                        class="emoji-selector emoji-selector--floating"
                                        variant="flat"
                                        color="grey-lighten-4"
                                        elevation="0"
                                        size="large"
                                        rounded="circle"
                                        height="55px"
                                        location="top"
                                    >
                                        <span v-if="formulario.emoji" class="emoji-selector__value">
                                            {{ formulario.emoji }}
                                        </span>
                                        <v-icon v-else icon="mdi-plus" class="emoji-selector__icon"></v-icon>
                                    </v-btn>
                                </template>
                                <ClientOnly>
                                    <div class="emoji-picker-surface">
                                        <EmojiPicker
                                            :native="true"
                                            :hide-search="false"
                                            theme="light"
                                            :disabled-groups="emojiDisabledGroups"
                                            :disable-skin-tones="true"
                                            @select="handleEmojiSelect"
                                        />
                                    </div>
                                </ClientOnly>
                            </v-menu>
                            <div class="name-input-block__inputs">
                                <v-text-field
                                    v-model="formulario.nombre"
                                    label="Nombre"
                                    placeholder="Ej. Vegetales hoja verde"
                                    variant="outlined"
                                    density="comfortable"
                                    class="name-field"
                                    :rules="[requiredRule]"
                                    color="success"
                                    base-color="success"
                                ></v-text-field>
                                <v-textarea
                                    v-model="formulario.detalle"
                                    label="Descripción"
                                    placeholder="Describe cómo usarás esta categoría"
                                    variant="outlined"
                                    density="comfortable"
                                    rows="3"
                                    class="description-field"
                                    :counter="160"
                                    :maxlength="160"
                                ></v-textarea>
                            </div>
                        </div>
                    </div>
                    <div class="modal-shell__actions">
                            <v-btn variant="text" color="grey-darken-1" class="modal-shell__ghost" @click="cancelCreateDialog">
                                Cancelar
                            </v-btn>
                            <v-btn
                                type="submit"
                                color="success"
                                class="action-btn new-category-btn modal-shell__cta"
                                :prepend-icon="submitIcon"
                                :loading="cargando"
                                :disabled="cargando"
                            >
                                {{ submitLabel }}
                            </v-btn>
                        </div>
                    </v-form>
                </div>
            </v-card>
        </v-dialog>

        <v-dialog
            v-model="showListDialog"
            max-width="720"
            location="center"
            class="categoria-dialog"
            content-class="categoria-dialog-content"
        >
            <v-card class="modal-card list-modal" rounded="xl" border>
                <v-card-title class="d-flex align-center justify-space-between">
                    <span class="text-subtitle-1 font-weight-bold">Categorías registradas</span>
                    <v-btn icon="mdi-close" variant="text" color="grey" @click="closeListDialog"></v-btn>
                </v-card-title>
                <v-card-text>
                    <v-alert
                        v-if="categoriasError"
                        type="error"
                        density="comfortable"
                        variant="tonal"
                        class="mb-4"
                    >
                        {{ categoriasError }}
                    </v-alert>

                    <v-progress-linear
                        v-if="categoriasLoading"
                        indeterminate
                        color="success"
                        height="6"
                        rounded
                        class="mb-4"
                    ></v-progress-linear>

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
                            <tr
                                v-for="(categoria, index) in categoriasRegistradas"
                                :key="categoria.id"
                                class="categoria-table-row"
                            >
                                <td class="emoji-cell">
                                    <span class="emoji-avatar__emoji">{{ getCategoriaEmoji(categoria, index) }}</span>
                                </td>
                                <td>{{ categoria.nombre }}</td>
                                <td>{{ categoria.detalle || 'Sin detalle' }}</td>
                                <td class="text-right">
                                    <div class="d-flex justify-end ga-1">
                                        <v-btn
                                            size="x-small"
                                            color="success"
                                            variant="tonal"
                                            icon="mdi-pencil"
                                            class="action-icon-btn"
                                            @click="startUpdate(categoria)"
                                        ></v-btn>
                                        <v-btn
                                            size="x-small"
                                            color="error"
                                            variant="tonal"
                                            icon="mdi-delete"
                                            :loading="categoriaEliminando === categoria.id"
                                            :disabled="categoriaEliminando === categoria.id"
                                            class="action-icon-btn"
                                            @click="deleteCategoria(categoria)"
                                        ></v-btn>
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

const { secureRequest } = useApi()

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

const MAX_CATEGORIAS_PER_PAGE = 100
const MAX_PRODUCTOS_PER_PAGE = 200
const visibleSlots = 2
const HIGH_STOCK_THRESHOLD = 30
const MEDIUM_STOCK_THRESHOLD = 10
const ALL_CATEGORIES_VALUE = '__all__'

const emojiFallbacks = ['🥬', '🍎', '🥕', '🌾', '🧺']
const emojiAllowedGroup = 'food_drink'
const emojiDisabledGroups = [
    'smileys_people',
    'animals_nature',
    'activities',
    'travel_places',
    'objects',
    'symbols',
    'flags',
].filter((group) => group !== emojiAllowedGroup)

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
const formulario = ref({
    nombre: '',
    detalle: '',
    emoji: '',
})
const cargando = ref(false)
const categoriaEditando = ref(null)
const showEmojiPicker = ref(false)
const categoryCursor = ref(0)

const formTitle = computed(() => (categoriaEditando.value ? 'Actualizar categoría' : 'Registrar nueva categoría'))
const submitLabel = computed(() => (categoriaEditando.value ? 'Actualizar' : 'Guardar'))
const submitIcon = computed(() => (categoriaEditando.value ? 'mdi-content-save-edit' : 'mdi-content-save'))

const requiredRule = (value) => !!value?.trim() || 'Este campo es obligatorio'

const toNumber = (value) => {
    const num = Number(value)
    return Number.isFinite(num) ? num : 0
}

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

const extractKilos = (producto) =>
    toNumber(
        producto?.kilogramos ??
            producto?.kilogramos_netos ??
            producto?.kilo ??
            producto?.kilo ??
            producto?.cantidad ??
            producto?.stock ??
            0,
    )

const extractPrecioVenta = (producto) =>
    toNumber(
        producto?.precio_ventakg ??
            producto?.precio_venta_kg ??
            producto?.precio_venta ??
            producto?.precio ??
            0,
    )

const extractPrecioCompra = (producto) =>
    toNumber(producto?.precio_compra ?? producto?.costo ?? producto?.precio ?? 0)

const computeProductoProfit = (producto) => {
    const kilos = extractKilos(producto)
    const ventaKg = extractPrecioVenta(producto)
    const compraKg = extractPrecioCompra(producto)
    return kilos * (ventaKg - compraKg)
}

const extractCollection = (payload) => {
    if (!payload) return []
    if (Array.isArray(payload)) return payload
    if (Array.isArray(payload?.data)) return payload.data
    if (Array.isArray(payload?.data?.data)) return payload.data.data
    return []
}

const resolvePaginationMeta = (payload) => {
    if (!payload || typeof payload !== 'object') return null
    if (payload?.data?.meta && typeof payload.data.meta === 'object') {
        return payload.data.meta
    }
    if (payload?.meta && typeof payload.meta === 'object') {
        return payload.meta
    }
    return null
}

const getCategoriaEmoji = (categoria, index) => {
    return (
        categoria?.emoji ??
        categoria?.icono ??
        emojiFallbacks[index % emojiFallbacks.length]
    )
}

const proveedorNameFor = (producto) => {
    const proveedorId =
        producto?.proveedor_id ??
        producto?.proveedorId ??
        producto?.proveedor?.id

    if (proveedorId && proveedoresLookup.value.has(proveedorId)) {
        return proveedoresLookup.value.get(proveedorId)?.nombre ?? `Proveedor #${proveedorId}`
    }

    if (producto?.proveedor?.nombre) {
        return producto.proveedor.nombre
    }

    return proveedorId ? `Proveedor #${proveedorId}` : 'Proveedor no asignado'
}

const computeStockMeta = (kilo) => {
    const value = Math.max(0, toNumber(kilo))
    if (value === 0) {
        return {
            stockColor: 'error',
            availability: 'Sin stock',
            progress: 10,
        }
    }

    if (value >= HIGH_STOCK_THRESHOLD) {
        return {
            stockColor: 'success',
            availability: 'Alta',
            progress: clamp(Math.round((value / 50) * 100), 45, 100),
        }
    }

    if (value >= MEDIUM_STOCK_THRESHOLD) {
        return {
            stockColor: 'warning',
            availability: 'Media',
            progress: clamp(Math.round((value / 40) * 100), 25, 75),
        }
    }

    return {
        stockColor: 'error',
        availability: 'Baja',
        progress: clamp(Math.round((value / 25) * 100), 10, 45),
    }
}

const buildProductCard = (producto, fallbackKey = 'producto') => {
    const kilo = extractKilos(producto)
    const meta = computeStockMeta(kilo)
    const price = extractPrecioVenta(producto)

    const productId = producto?.id ?? producto?.uuid ?? `producto-${fallbackKey}`

    return {
        id: productId,
        name: producto?.nombre ?? producto?.name ?? 'Producto sin nombre',
        price,
        source: proveedorNameFor(producto),
        stock: kilo ? `${weightFormatter.format(kilo)} kg` : 'Sin unidades registradas',
        ...meta,
        progressColor: meta.stockColor,
    }
}

const productosPorCategoriaMap = computed(() => {
    const map = new Map()
    productosRegistrados.value.forEach((producto) => {
        const categoriaId =
            producto?.categoria_id ??
            producto?.categoriaId ??
            producto?.categoria?.id ??
            null
        const key = categoriaId ?? 'sin-categoria'
        if (!map.has(key)) {
            map.set(key, [])
        }
        map.get(key).push(producto)
    })
    return map
})

const mappedCategories = computed(() => {
    if (!categoriasRegistradas.value.length) return []
    return categoriasRegistradas.value.map((categoria, index) => {
        const productos = productosPorCategoriaMap.value.get(categoria.id) ?? []
        const totalQtyNumber = productos.reduce((sum, producto) => sum + extractKilos(producto), 0)
        const totalValue = productos.reduce((sum, producto) => {
            const kilos = extractKilos(producto)
            return sum + kilos * extractPrecioVenta(producto)
        }, 0)
        const profit = productos.reduce((sum, producto) => sum + computeProductoProfit(producto), 0)

        return {
            id: categoria?.id ?? index,
            name: categoria?.nombre ?? `Categoría ${index + 1}`,
            products: productos.length,
            totalQty: formatWeight(totalQtyNumber),
            totalValue,
            profit,
            emoji: getCategoriaEmoji(categoria, index),
            tag: categoria?.estado ?? 'Activa',
        }
    })
})

const visibleCategories = computed(() => {
    const all = mappedCategories.value
    if (!all.length) return []
    if (all.length <= visibleSlots) return all
    return all.slice(categoryCursor.value, categoryCursor.value + visibleSlots)
})

const canGoPrev = computed(() => categoryCursor.value > 0)
const canGoNext = computed(() => categoryCursor.value + visibleSlots < mappedCategories.value.length)

const prevCategory = () => {
    if (!canGoPrev.value) return
    categoryCursor.value -= 1
}

const nextCategory = () => {
    if (!canGoNext.value) return
    categoryCursor.value += 1
}

const productGroups = computed(() => {
    if (!categoriasRegistradas.value.length && !productosRegistrados.value.length) {
        return []
    }

    const groups = categoriasRegistradas.value.map((categoria, index) => {
        const productos = productosPorCategoriaMap.value.get(categoria.id) ?? []
        return {
            id: categoria?.id ?? `categoria-${index}`,
            name: categoria?.nombre ?? `Categoría ${index + 1}`,
            emoji: getCategoriaEmoji(categoria, index),
            items: productos.map((producto, productoIndex) =>
                buildProductCard(producto, `${categoria?.id ?? 'categoria'}-${productoIndex}`),
            ),
        }
    })

    const knownCategoryIds = new Set(categoriasRegistradas.value.map((categoria) => categoria?.id))
    productosPorCategoriaMap.value.forEach((productos, categoriaId) => {
        if (categoriaId === 'sin-categoria') return
        if (!categoriaId || knownCategoryIds.has(categoriaId)) return
        groups.push({
            id: categoriaId,
            name: `Categoría ${categoriaId}`,
            emoji: '📦',
            items: productos.map((producto, productoIndex) =>
                buildProductCard(producto, `${categoriaId}-${productoIndex}`),
            ),
        })
    })

    const uncategorized = productosPorCategoriaMap.value.get('sin-categoria')
    if (uncategorized?.length) {
        groups.push({
            id: 'sin-categoria',
            name: 'Sin categoría',
            emoji: '❔',
            items: uncategorized.map((producto, productoIndex) =>
                buildProductCard(producto, `sin-${productoIndex}`),
            ),
        })
    }

    return groups
})

const categoriaFilterItems = computed(() => {
    if (!productGroups.value.length) {
        return [{ title: 'Todas las categorías', value: ALL_CATEGORIES_VALUE, emoji: '⭐' }]
    }

    const map = new Map()
    productGroups.value.forEach((group) => {
        const id = group?.id ?? 'sin-categoria'
        const value = id != null ? String(id) : 'sin-categoria'
        map.set(value, {
            title: group?.name ?? `Categoría ${value}`,
            emoji: group?.emoji ?? null,
        })
    })

    return [
        { title: 'Todas las categorías', value: ALL_CATEGORIES_VALUE, emoji: '⭐' },
        ...Array.from(map.entries()).map(([value, meta]) => ({ value, ...meta })),
    ]
})

const filteredProductGroups = computed(() => {
    if (!productGroups.value.length) {
        return []
    }

    const term = normalizeText(productSearchQuery.value)
    const selectedValue = categoriaFiltroSeleccionada.value
    const selected = selectedValue && selectedValue !== ALL_CATEGORIES_VALUE ? String(selectedValue) : null

    return productGroups.value
        .map((group) => {
            const groupId = group?.id != null ? String(group.id) : 'sin-categoria'
            if (selected && groupId !== selected) {
                return null
            }

            const items = term
                ? group.items.filter((item) => {
                      const name = normalizeText(item?.name)
                      const source = normalizeText(item?.source)
                      return name.includes(term) || source.includes(term)
                  })
                : group.items

            if (!items.length) {
                return null
            }

            return { ...group, items }
        })
        .filter(Boolean)
})

const normalizeText = (value = '') => value?.toString?.().trim().toLowerCase() ?? ''

const hasDuplicateName = (name, ignoreId = null) => {
    if (!name) return false
    const normalized = normalizeText(name)
    return categoriasRegistradas.value.some((categoria) => {
        if (ignoreId && categoria.id === ignoreId) return false
        return normalizeText(categoria?.nombre) === normalized
    })
}

const resetForm = () => {
    formulario.value = {
        nombre: '',
        detalle: '',
        emoji: '',
    }
    categoryForm.value?.resetValidation?.()
    categoriaEditando.value = null
    formError.value = ''
    showEmojiPicker.value = false
}

const openCreateDialog = () => {
    resetForm()
    showCreateDialog.value = true
}

const closeCreateDialog = () => {
    showCreateDialog.value = false
}

const cancelCreateDialog = () => {
    resetForm()
    closeCreateDialog()
}

const handleEmojiSelect = (emoji) => {
    const symbol = emoji?.i ?? emoji?.native ?? emoji?.u ?? ''
    if (!symbol) return
    formulario.value.emoji = symbol
    showEmojiPicker.value = false
    if (formError.value) {
        formError.value = ''
    }
}

const submitCategory = async () => {
    formError.value = ''
    const nombreActual = formulario.value.nombre?.trim()

    if (!nombreActual) {
        formError.value = 'El nombre es obligatorio.'
        return
    }

    const duplicate = hasDuplicateName(nombreActual, categoriaEditando.value?.id)
    if (duplicate) {
        formError.value = 'Ya existe una categoría con ese nombre. Usa uno diferente.'
        return
    }

    const detalleActual = formulario.value.detalle?.trim?.() || ''

    const payload = {
        nombre: nombreActual,
        detalle: detalleActual || null,
        emoji: formulario.value.emoji || null,
    }

    cargando.value = true
    try {
        if (categoriaEditando.value) {
            await secureRequest(`/categorias/${categoriaEditando.value.id}`, {
                method: 'PUT',
                body: payload,
            })
        } else {
            await secureRequest('/categorias', {
                method: 'POST',
                body: payload,
            })
        }

        await fetchCategorias()
        resetForm()
        closeCreateDialog()
    } catch (error) {
        formError.value = error?.data?.message || 'No se pudo guardar la categoría.'
        console.error(error?.data || error)
    } finally {
        cargando.value = false
    }
}

const openListDialog = () => {
    showListDialog.value = true
    categoriasError.value = ''
    fetchCategorias()
}

const closeListDialog = () => {
    showListDialog.value = false
}

const fetchCategorias = async () => {
    categoriasLoading.value = true
    categoriasError.value = ''
    try {
        const todas = []
        let currentPage = 1
        let lastPage = 1

        do {
            const params = new URLSearchParams({
                page: String(currentPage),
                per_page: String(MAX_CATEGORIAS_PER_PAGE),
            })
            const response = await secureRequest(`/categorias?${params.toString()}`)
            let lista = extractCollection(response?.data)
            if (!lista.length) {
                lista = extractCollection(response)
            }
            todas.push(...lista)

            const meta =
                resolvePaginationMeta(response) || resolvePaginationMeta(response?.data) || {}
            lastPage = meta?.last_page ?? meta?.lastPage ?? currentPage
            if (!lastPage || lastPage < currentPage) {
                lastPage = currentPage
            }
            currentPage += 1
        } while (currentPage <= lastPage)

        categoriasRegistradas.value = todas
    } catch (error) {
        categoriasError.value = error?.data?.message || 'No se pudieron cargar las categorías.'
    } finally {
        categoriasLoading.value = false
    }
}

const fetchProductos = async () => {
    productosLoading.value = true
    productosError.value = ''
    try {
        const todos = []
        let currentPage = 1
        let lastPage = 1

        do {
            const params = new URLSearchParams({
                page: String(currentPage),
                per_page: String(MAX_PRODUCTOS_PER_PAGE),
            })
            const response = await secureRequest(`/productos?${params.toString()}`)
            let lista = extractCollection(response?.data)
            if (!lista.length) {
                lista = extractCollection(response)
            }
            todos.push(...lista)

            const meta =
                resolvePaginationMeta(response) || resolvePaginationMeta(response?.data) || {}
            lastPage = meta?.last_page ?? meta?.lastPage ?? currentPage
            if (!lastPage || lastPage < currentPage) {
                lastPage = currentPage
            }
            currentPage += 1
        } while (currentPage <= lastPage)

        productosRegistrados.value = todos
    } catch (error) {
        productosError.value = error?.data?.message || 'No se pudieron cargar los productos.'
    } finally {
        productosLoading.value = false
    }
}

const fetchProveedores = async () => {
    try {
        const response = await secureRequest('/proveedores')
        let lista = extractCollection(response?.data)
        if (!lista.length) {
            lista = extractCollection(response)
        }
        const map = new Map()
        lista.forEach((proveedor) => {
            if (!proveedor?.id) return
            map.set(proveedor.id, proveedor)
        })
        proveedoresLookup.value = map
    } catch (error) {
        console.warn('No se pudieron cargar los proveedores.', error)
    }
}

const startUpdate = async (categoria) => {
    formulario.value = {
        nombre: categoria?.nombre ?? '',
        detalle: categoria?.detalle ?? '',
        emoji: categoria?.emoji ?? categoria?.icono ?? '',
    }
    categoriaEditando.value = categoria
    showCreateDialog.value = true
    await nextTick()
    categoryForm.value?.resetValidation?.()
}

const deleteCategoria = async (categoria) => {
    const confirmado = window.confirm(`¿Eliminar la categoría "${categoria.nombre}"? Esta acción no se puede deshacer.`)
    if (!confirmado) return

    categoriaEliminando.value = categoria.id
    try {
        await secureRequest(`/categorias/${categoria.id}`, {
            method: 'DELETE',
        })
        await fetchCategorias()

        if (categoriaEditando.value?.id === categoria.id) {
            resetForm()
            closeCreateDialog()
        }
    } catch (error) {
        categoriasError.value = error?.data?.message || 'No se pudo eliminar la categoría.'
        console.error(error?.data || error)
    } finally {
        categoriaEliminando.value = null
    }
}

const initializeCategoriaModulo = async () => {
    await Promise.allSettled([fetchCategorias(), fetchProductos(), fetchProveedores()])
}

onMounted(() => {
    initializeCategoriaModulo()
})

watch(
    () => formulario.value.nombre,
    () => {
        if (formError.value) {
            formError.value = ''
        }
    },
)

watch(
    () => mappedCategories.value.length,
    (length) => {
        if (length <= visibleSlots) {
            categoryCursor.value = 0
            return
        }
        const maxStart = length - visibleSlots
        if (categoryCursor.value > maxStart) {
            categoryCursor.value = maxStart
        }
    },
)

watch(
    () => formulario.value.emoji,
    () => {
        if (formError.value) {
            formError.value = ''
        }
    },
)
</script>

<style scoped>
.categoria-page {
    display: flex;
    flex-direction: column;
}

.section-card {
    border-color: rgba(34, 197, 94, 0.22);
    background: #ffffff;
    box-shadow: 0 6px 18px rgba(34, 197, 94, 0.08);
}

.section-card :deep(.v-card-title) {
    padding: 18px 25px 6px;
}

.section-card :deep(.v-card-text) {
    padding: 18px 25px 22px;
}

.stat-card,
.product-card {
    background: #f2fff6;
    border-color: rgba(34, 197, 94, 0.28);
    box-shadow: 0 4px 10px rgba(34, 197, 94, 0.08);
}

.product-card {
    min-height: 210px;
}

.stat-card :deep(.v-card-text),
.product-card :deep(.v-card-text) {
    padding: 18px 18px 16px;
}

.modal-shell {
    padding: 26px 30px;
    background: linear-gradient(135deg, #ffffff 0%, #f5fff9 70%);
    border-color: rgba(11, 155, 74, 0.2);
    box-shadow: 0 26px 55px rgba(5, 84, 40, 0.18);
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
    color: #0b8a4a;
}

.modal-shell__title {
    margin: 0;
    font-size: 1.35rem;
    color: #062f1b;
}

.modal-shell__subtitle {
    margin: 6px 0 0;
    color: #5a6a61;
    font-size: 0.92rem;
}

.modal-shell__dismiss {
    margin-top: -6px;
}

.modal-shell__divider {
    height: 1px;
    background: rgba(11, 155, 74, 0.14);
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
    border-color: rgba(15, 138, 78, 0.18);
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
    border: 2px solid #7AF0A8;
    color: #05a552;
    background: #EEFCF5;
    padding: 6px 10px;
    border-radius: 10px;
    font-weight: 700;
}

.stock-chip--success {
    background: #EEFCF5 !important;
    color: #05a552 !important;
    border: 1.5px solid #7AF0A8;
}

.availability--low {
    color: #df2f26;
}

.progress--low :deep(.v-progress-linear__determinate) {
    background-color: #df2f26 !important;
}

.modal-card {
    background: #ffffff;
    border-color: rgba(34, 197, 94, 0.18);
    box-shadow: 0 18px 40px rgba(5, 165, 82, 0.22);
}

.submit-btn {
    text-transform: none;
    font-weight: 600;
}

.categoria-table thead th {
    font-size: 0.78rem;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    color: #05a552;
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
    background: #f7fff9;
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
    background: #e7f9ee !important;
    color: #05934a !important;
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
    border: 1px solid rgba(15, 23, 42, 0.1);
    background: #f8fafc !important;
    color: #111827;
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
    color: #6b7280;
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
    border-color: rgba(15, 103, 60, 0.18);
}

.name-field :deep(.v-field__outline--notch),
.description-field :deep(.v-field__outline--notch) {
    border-color: rgba(15, 103, 60, 0.18);
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
    border: 1px solid rgba(5, 165, 82, 0.12);
    border-radius: 20px;
    background: #f7fff9;
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
    background: #f7fff9;
    padding-bottom: 10px;
    z-index: 1;
}

.category-group__content::-webkit-scrollbar {
    width: 6px;
}

.category-group__content::-webkit-scrollbar-thumb {
    background: rgba(5, 165, 82, 0.35);
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
        align-items: top;
        gap: 50px;
    }

    .filters-bar__search {
        flex: 1 1 50%;
    }

    .filters-bar__categories {
        flex: 1 1 50%;
        flex-direction: row;
        align-items: top;
        gap: 16px;
    }
}

.category-chip {
    border-radius: 14px;
    border-color: rgba(5, 165, 82, 0.24) !important;
    color: #05934a !important;
    background: #ffffff;
}

.category-chip--active {
    background: #e8fdf0 !important;
    border-color: #06a453 !important;
    color: #06a453 !important;
}

.category-chip__emoji {
    margin-right: 6px;
    font-size: 1rem;
}
</style>
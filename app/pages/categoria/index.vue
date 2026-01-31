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
                <v-row align="center" class="ga-2">
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
                                                <v-avatar color="success-lighten-4" size="44">
                                                    <v-icon color="success" :icon="item.icon"></v-icon>
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
            </v-card-text>
        </v-card>

        <v-card class="section-card" rounded="lg" border>
            <v-card-title class="text-subtitle-1 font-weight-bold">Productos por Categoría</v-card-title>
            <v-card-text>
                <div v-for="group in productGroups" :key="group.id" class="mb-8">
                    <div class="d-flex align-center ga-2 mb-4">
                        <v-avatar color="success-lighten-4" size="36">
                            <v-icon color="success" :icon="group.icon"></v-icon>
                        </v-avatar>
                        <div class="text-subtitle-2 font-weight-bold">{{ group.name }} ({{ group.items.length }})</div>
                    </div>

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
                                        <span>💰 Venta: {{ formatCurrency(product.price) }}</span>
                                    </div>
                                    <div class="mt-1 text-body-2 text-medium-emphasis d-flex align-center ga-2">
                                        <span>🚛 {{ product.source }}</span>
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
            </v-card-text>
        </v-card>

        <v-dialog v-model="showCreateDialog" max-width="520" persistent transition="dialog-bottom-transition">
            <v-card class="modal-card form-modal" rounded="xl" border>
                <v-card-title class="text-subtitle-1 font-weight-bold pb-0 px-6 pt-6">
                    {{ formTitle }}
                </v-card-title>
                <v-card-text class="px-6 pb-6">
                    <p class="text-body-2 text-medium-emphasis mb-4">
                        Ingresa los datos básicos para crear una categoría que podrás usar al asignar productos.
                    </p>
                    <v-alert
                        v-if="formError"
                        type="warning"
                        density="comfortable"
                        variant="tonal"
                        color="warning"
                        class="mb-2"
                    >
                        {{ formError }}
                    </v-alert>
                    <v-form ref="categoryForm" @submit.prevent="submitCategory" class="flex flex-col gap-5">
                        <v-text-field
                            v-model="formulario.nombre"
                            label="Nombre"
                            placeholder="Ej. Vegetales hoja verde"
                            variant="solo-filled"
                            density="comfortable"
                            color="success"
                            base-color="success"
                            bg-color="success-lighten-4"
                            :rules="[requiredRule]"
                            class="rounded-2xl shadow-lg ring-1 ring-emerald-100 focus-within:ring-2 focus-within:ring-emerald-400 transition-all"
                            clearable
                            :counter="60"
                            :maxlength="60"
                            hint="Nombre visible en listados y tarjetas."
                            persistent-hint
                            autofocus
                        ></v-text-field>
                        <v-textarea
                            v-model="formulario.detalle"
                            label="Descripción"
                            placeholder="Describe cómo usarás esta categoría"
                            variant="solo-filled"
                            density="comfortable"
                            rows="3"
                            auto-grow
                            color="success"
                            base-color="success"
                            bg-color="success-lighten-4"
                            class="rounded-2xl shadow-lg ring-1 ring-emerald-100 focus-within:ring-2 focus-within:ring-emerald-400 transition-all"
                            :counter="160"
                            :maxlength="160"
                            hint="Descripción opcional para identificarla mejor."
                            persistent-hint
                        ></v-textarea>
                        <div class="modal-actions d-flex justify-end ga-3 mt-2">
                            <v-btn variant="text" color="grey-darken-1" class="cancel-btn" @click="cancelCreateDialog">
                                Cancelar
                            </v-btn>
                            <v-btn
                                type="submit"
                                color="success"
                                class="action-btn new-category-btn submit-btn"
                                :prepend-icon="submitIcon"
                                :loading="cargando"
                                :disabled="cargando"
                            >
                                {{ submitLabel }}
                            </v-btn>
                        </div>
                    </v-form>
                </v-card-text>
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
                                <th>Nombre</th>
                                <th>Descripción</th>
                                <th class="text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="categoria in categoriasRegistradas" :key="categoria.id" class="categoria-table-row">
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

const { secureRequest } = useApi()

const formatter = new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
})

const formatCurrency = (value) => formatter.format(value)

const createStat = (id, name, products, totalQty, totalValue, profit, icon, tag = 'Activo') => ({
    id,
    name,
    products,
    totalQty,
    totalValue,
    profit,
    icon,
    tag,
})

const createProduct = (
    id,
    name,
    price,
    source,
    stock,
    stockColor,
    availability,
    progress,
    progressColor = stockColor,
) => ({
    id,
    name,
    price,
    source,
    stock,
    stockColor,
    availability,
    progress,
    progressColor,
})

const createGroup = (id, name, icon, items) => ({ id, name, icon, items })

const categoryStats = [
    createStat(1, 'Verduras', 4, '78.00', 149.2, 70.6, 'mdi-leaf'),
    createStat(2, 'Frutas', 3, '70.00', 171, 78.4, 'mdi-food-apple'),
]

const categoriasRegistradas = ref([])
const categoriasLoading = ref(false)
const categoriasError = ref('')
const categoriaEliminando = ref(null)
const formError = ref('')

const iconPool = ['mdi-leaf', 'mdi-food-apple', 'mdi-food-carrot', 'mdi-sprout', 'mdi-basket']
const visibleSlots = 2
const categoryCursor = ref(0)

const mappedCategories = computed(() => {
    if (!categoriasRegistradas.value.length) return categoryStats
    return categoriasRegistradas.value.map((categoria, index) => ({
        id: categoria.id ?? index,
        name: categoria.nombre ?? `Categoría ${index + 1}`,
        products: categoria.total_productos ?? categoria.productos?.length ?? '--',
        totalQty: categoria.cantidad_total ?? categoria.totalQty ?? '--',
        totalValue: categoria.valor_total ?? categoria.totalValue ?? 0,
        profit: categoria.ganancia ?? categoria.profit ?? 0,
        icon: categoria.icono ?? iconPool[index % iconPool.length],
        tag: categoria.estado ?? 'Activa',
    }))
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

const productGroups = [
    createGroup(1, 'Verduras', 'mdi-leaf', [
        createProduct(1, 'Tomate', 2.8, 'Mercado Central', '25 kg', 'success', 'Alta', 85),
        createProduct(2, 'Lechuga', 1.5, 'Huerta Local', '30 unidad', 'success', 'Alta', 80),
        createProduct(3, 'Cebolla', 1.8, 'Mercado Central', '5 kg', 'error', 'Baja', 25, 'error'),
        createProduct(4, 'Zanahoria', 1.4, 'Huerta Local', '18 kg', 'success', 'Media', 60, 'warning'),
    ]),
    createGroup(2, 'Frutas', 'mdi-food-apple', [
        createProduct(5, 'Manzana', 2.2, 'Productor Local', '8 kg', 'warning', 'Media', 55, 'warning'),
        createProduct(6, 'Banana', 1.9, 'Importadora', '40 kg', 'success', 'Alta', 90),
        createProduct(7, 'Naranja', 2.1, 'Mercado Central', '12 kg', 'warning', 'Media', 50, 'warning'),
    ]),
]

const showCreateDialog = ref(false)
const showListDialog = ref(false)
const categoryForm = ref(null)
const formulario = ref({
    nombre: '',
    detalle: '',
})
const cargando = ref(false)
const categoriaEditando = ref(null)

const formTitle = computed(() => (categoriaEditando.value ? 'Actualizar categoría' : 'Registrar nueva categoría'))
const submitLabel = computed(() => (categoriaEditando.value ? 'Actualizar' : 'Guardar'))
const submitIcon = computed(() => (categoriaEditando.value ? 'mdi-content-save-edit' : 'mdi-content-save'))

const requiredRule = (value) => !!value?.trim() || 'Este campo es obligatorio'

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
    }
    categoryForm.value?.resetValidation?.()
    categoriaEditando.value = null
    formError.value = ''
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

    cargando.value = true
    try {
        if (categoriaEditando.value) {
            await secureRequest(`/categorias/${categoriaEditando.value.id}`, {
                method: 'PUT',
                body: formulario.value,
            })
        } else {
            await secureRequest('/categorias', {
                method: 'POST',
                body: formulario.value,
            })
        }

        resetForm()
        closeCreateDialog()
        if (showListDialog.value) {
            await fetchCategorias()
        }
    } catch (error) {
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

const parseCategoriaData = (payload) => {
    if (!payload) return []
    if (Array.isArray(payload)) return payload
    if (Array.isArray(payload?.data)) return payload.data
    if (Array.isArray(payload?.data?.data)) return payload.data.data
    return []
}

const fetchCategorias = async () => {
    categoriasLoading.value = true
    categoriasError.value = ''
    try {
        const response = await secureRequest('/categorias')
        let lista = parseCategoriaData(response?.data)
        if (!lista.length) {
            lista = parseCategoriaData(response)
        }
        categoriasRegistradas.value = lista
    } catch (error) {
        categoriasError.value = error?.data?.message || 'No se pudieron cargar las categorías.'
    } finally {
        categoriasLoading.value = false
    }
}

const startUpdate = async (categoria) => {
    formulario.value = {
        nombre: categoria?.nombre ?? '',
        detalle: categoria?.detalle ?? '',
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
        console.error(error?.data || error)
    } finally {
        categoriaEliminando.value = null
    }
}

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

onMounted(() => {
    fetchCategorias()
})

watch(
    () => formulario.value.nombre,
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
    gap: 1.5rem;
}

.section-card {
    border-color: rgba(34, 197, 94, 0.22);
    background: #ffffff;
    box-shadow: 0 6px 18px rgba(34, 197, 94, 0.08);
}

.section-card :deep(.v-card-title) {
    padding: 18px 22px 6px;
}

.section-card :deep(.v-card-text) {
    padding: 10px 22px 22px;
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

.form-modal {
    padding: 6px 6px 18px;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, #ffffff 65%);
    box-shadow: 0 18px 40px rgba(25, 132, 86, 0.25);
}

.form-modal :deep(.v-card-title) {
    padding: 18px 26px 6px;
}

.form-modal :deep(.v-card-text) {
    padding: 8px 26px 26px;
}

.modal-actions {
    margin-top: 8px;
}

.cancel-btn {
    font-weight: 600;
    letter-spacing: 0.12rem;
}

.action-btn {
    height: 44px;
    min-height: 44px;
    border-radius: 14px;
    text-transform: none;
    font-weight: 600;
    font-family: inherit;
}

.new-category-btn {
    padding: 0 1.4rem;
    min-width: 180px;
    background: linear-gradient(135deg, #0cc665 0%, #06a453 100%) !important;
    color: #ffffff !important;
    box-shadow: 0 4px 12px rgba(6, 164, 83, 0.14) !important;
}

.list-categories-btn {
    width: 44px;
    min-width: 44px;
    padding: 0;
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
</style>
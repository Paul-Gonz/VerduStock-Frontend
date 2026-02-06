<template>
	<section class="inventario-page">
		<v-container class="inventory-shell" fluid>
			<v-card class="inventory-board app-card" rounded="lg" border>
				<header class="board-header">
					<div class="board-heading">
						<v-icon icon="mdi-format-list-checks" size="30" color="success"></v-icon>
						<div>
							<p class="board-label">Lista de Productos</p>
						</div>
					</div>
					<div class="board-actions">
						<v-btn
							class="action-btn"
							prepend-icon="mdi-plus"
							@click="openCreateDialog"
						>
							Nuevo Producto
						</v-btn>
						<v-btn
							class="action-btn"
							prepend-icon="mdi-file-pdf-box"
							:loading="exportLoading"
							@click="exportInventario"
						>
							Exportar PDF
						</v-btn>
					</div>
				</header>

				<div class="filters-bar">
					<div class="filters-bar__search">
						<v-text-field
							v-model="searchQuery"
							density="comfortable"
							variant="outlined"
							color="success"
							base-color="success"
							prepend-inner-icon="mdi-magnify"
							placeholder="Buscar por nombre o proveedor..."
							hide-details
							clearable
						></v-text-field>
					</div>
					<div class="filters-bar__control">
						<v-select
							v-model="categoriaFiltro"
							:items="categoriaOptions"
							item-title="title"
							item-value="value"
							density="comfortable"
							variant="outlined"
							color="success"
							placeholder="Todas las categorías"
							hide-details
						></v-select>
					</div>
					<div class="filters-bar__control">
						<v-select
							v-model="estadoFiltro"
							:items="estadoOptions"
							item-title="title"
							item-value="value"
							density="comfortable"
							variant="outlined"
							color="success"
							placeholder="Todos los estados"
							hide-details
						></v-select>
					</div>
					<v-btn icon class="filters-refresh" color="success" variant="tonal" @click="refreshInventario">
						<v-icon icon="mdi-refresh"></v-icon>
					</v-btn>
				</div>

				<div class="alert-stack" v-if="!productosLoading && (hasLowStockAlerts || hasExpiringAlerts)">
					<div class="alert-card alert-card--danger" v-if="hasLowStockAlerts">
						<div class="alert-card__icon">
							<v-icon icon="mdi-alert" color="error"></v-icon>
						</div>
						<div>
							<p class="alert-card__title">Alerta de Stock Bajo</p>
							<p class="alert-card__body">
								{{ lowStockProducts.length }} producto(s) necesitan ser reabastecidos urgentemente.
							</p>
						</div>
					</div>
					<div class="alert-card alert-card--warning" v-if="hasExpiringAlerts">
						<div class="alert-card__icon">
							<v-icon icon="mdi-alarm" color="warning"></v-icon>
						</div>
						<div>
							<p class="alert-card__title">Productos Próximos a Vencer</p>
							<p class="alert-card__body">
								{{ expiringProducts.length }} producto(s) vencen en los próximos {{ EXPIRY_WARNING_DAYS }} día(s).
							</p>
						</div>
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
					variant="tonal"
					density="comfortable"
					border="start"
					border-color="error"
					class="mb-4"
				>
					{{ productosError }}
				</v-alert>

							<section class="cards-wrapper">
								<template v-if="filteredCards.length">
									<v-row>
										<v-col v-for="card in filteredCards" :key="card.id" cols="12" sm="6" md="4" lg="4" xl="4">
											<v-card :class="['product-card', card.status.styleKey]" rounded="lg" border elevation="0">
												<div class="status-banner" :class="card.status.styleKey">
													<v-icon :icon="card.status.icon" size="18"></v-icon>
													<span>{{ card.status.label }}</span>
												</div>
												<div class="product-card__header">
													<div class="product-card__title">
														<v-avatar class="category-avatar" size="42">
															<span>{{ card.badge }}</span>
														</v-avatar>
														<div>
															<p class="product-name">{{ card.name }}</p>
															<p class="product-category">{{ card.category }}</p>
														</div>
													</div>
													<div class="product-card__actions">
														<v-btn
															icon
															variant="text"
															color="grey-darken-1"
															@click="openEditDialog(card.raw)"
														>
															<v-icon icon="mdi-pencil"></v-icon>
														</v-btn>
														<v-btn
															icon
															variant="text"
															color="grey-darken-1"
															@click="openDeleteDialog(card.raw)"
														>
															<v-icon icon="mdi-delete-outline"></v-icon>
														</v-btn>
													</div>
												</div>

												<div class="stock-block">
													<div class="stock-metric">
														<p class="metric-label">Cantidad disponible</p>
														<p class="metric-value">{{ card.kilosLabel }}</p>
													</div>
													<div class="stock-metric text-right">
														<p class="metric-label">Stock mínimo</p>
														<p class="metric-value">{{ card.stockMinimumLabel }}</p>
													</div>
												</div>
												<v-progress-linear
													class="stock-progress"
													:model-value="card.progress"
													:color="card.status.progressColor"
													height="8"
													rounded
												></v-progress-linear>

												<div class="price-inline">
													<div class="detail-pair">
														<span class="detail-label">Compra</span>
														<span class="detail-value">{{ card.purchaseLabel }}</span>
													</div>
													<div class="detail-pair">
														<span class="detail-label">Venta</span>
														<span class="detail-value">{{ card.saleLabel }}</span>
													</div>
													<div class="detail-pair">
														<span class="detail-label">Ganancia</span>
														<span class="detail-value highlight">{{ card.profitLabel }}</span>
													</div>
												</div>

												<div class="details-list">
													<div class="detail-row">
														<v-icon icon="mdi-store-outline" size="18" color="success"></v-icon>
														<div>
															<p class="detail-value muted">{{ card.provider }}</p>
														</div>
													</div>
													<div class="detail-row">
														<v-icon icon="mdi-calendar-plus" size="18" color="success"></v-icon>
														<div>
															<p class="detail-value muted">{{"Ingreso: " + card.ingresoLabel }}</p>
														</div>
													</div>
													<div class="detail-row">
														<v-icon icon="mdi-calendar-alert" size="18" color="warning"></v-icon>
														<div>
															<p class="detail-value muted">{{"Vence: " + card.venceLabel }}</p>
														</div>
													</div>
												</div>
											</v-card>
										</v-col>
									</v-row>

									<div class="pagination-block" v-if="pagination.lastPage > 1">
										<v-pagination
											v-model="pagination.page"
											:length="pagination.lastPage"
											:total-visible="5"
											color="success"
										></v-pagination>
									</div>
								</template>

								<div v-else class="empty-state">
									<v-icon icon="mdi-package-variant" color="success" size="48"></v-icon>
									<p v-if="hasInventory || isFilteringActive">
										No hay productos que coincidan con los filtros seleccionados.
									</p>
									<p v-else>Registra tu primer producto para visualizarlo aquí.</p>
								</div>
							</section>
						</v-card>
					</v-container>

				<v-dialog v-model="formDialog" max-width="720" persistent>
					<v-card rounded="xl" border class="modal-shell">
						<div class="modal-shell__header">
							<div>
								<p class="modal-shell__eyebrow">{{ editingProducto ? 'Modo edición' : 'Nuevo registro' }}</p>
								<h3 class="modal-shell__title">
									{{ editingProducto ? 'Actualizar producto' : 'Registrar producto' }}
								</h3>
								<p class="modal-shell__subtitle">
									{{
										editingProducto
											? 'Ajusta la información del inventario antes de guardar los cambios.'
											: 'Completa el formulario para añadir un producto al inventario general.'
									}}
								</p>
							</div>
							<v-btn
								icon="mdi-close"
								variant="text"
								color="grey-darken-1"
								class="modal-shell__dismiss"
								@click="closeFormDialog"
							></v-btn>
						</div>
						<div class="modal-shell__divider"></div>
						<div class="modal-shell__body">
							<v-form ref="productFormRef" class="modal-shell__form" @submit.prevent="submitProducto">
								<v-alert
									v-if="formError"
									type="error"
									variant="tonal"
									border="start"
									border-color="error"
									class="modal-shell__alert"
								>
									{{ formError }}
								</v-alert>
								<div class="modal-shell__content">
									<div class="modal-form-grid">
										<v-text-field
										v-model="productForm.nombre"
										label="Nombre del producto"
										variant="outlined"
										density="comfortable"
										color="success"
										:rules="[requiredRule]"
										class="modal-form-grid__item modal-form-grid__item--full modal-form-grid__item--top-gap"
									></v-text-field>
										<v-select
										v-model="productForm.categoria_id"
										:items="categorySelectItems"
										item-title="title"
										item-value="value"
										label="Categoría"
										variant="outlined"
										density="comfortable"
										color="success"
										:rules="[requiredRule]"
										class="modal-form-grid__item"
									></v-select>
										<v-select
										v-model="productForm.proveedor_id"
										:items="providerSelectItems"
										item-title="title"
										item-value="value"
										label="Proveedor"
										variant="outlined"
										density="comfortable"
										color="success"
										:rules="[requiredRule]"
										class="modal-form-grid__item"
									></v-select>
										<v-text-field
										v-model="productForm.kilogramos"
										type="number"
										label="Cantidad (kg)"
										variant="outlined"
										density="comfortable"
										color="success"
										min="0"
										step="0.001"
										:rules="[requiredRule]"
										class="modal-form-grid__item"
									></v-text-field>
										<v-text-field
										v-model="productForm.desperdicio"
										type="number"
										label="Desperdicio (kg)"
										variant="outlined"
										density="comfortable"
										color="success"
										min="0"
										step="0.001"
										class="modal-form-grid__item"
									></v-text-field>
										<v-text-field
										v-model="productForm.precio_compra"
										type="number"
										label="Precio de compra ($)"
										variant="outlined"
										density="comfortable"
										color="success"
										min="0"
										step="0.01"
										:rules="[requiredRule]"
										class="modal-form-grid__item"
									></v-text-field>
										<v-text-field
										v-model="productForm.precio_venta_kg"
										type="number"
										label="Precio de venta por kg ($)"
										variant="outlined"
										density="comfortable"
										color="success"
										min="0"
										step="0.01"
										:rules="[requiredRule]"
										class="modal-form-grid__item"
									></v-text-field>
										<div class="modal-form-grid__item modal-form-grid__item--full modal-form-grid__pair">
											<v-text-field
												v-model="productForm.usuario_id"
												type="number"
												label="ID responsable"
												variant="outlined"
												density="comfortable"
												color="success"
												min="1"
												hint="Temporalmente se asigna el usuario {{ DEFAULT_USER_ID }} si no especificas otro."
												persistent-hint
												class="modal-form-grid__pair-field"
											></v-text-field>
											<div class="stock-slider-field">
												<div class="stock-slider-field__header">
													<span>Stock mínimo</span>
													<strong>{{ formatKilograms(productForm.stock_minimo ?? STOCK_MIN_KG) }}</strong>
												</div>
												<v-slider
													v-model.number="productForm.stock_minimo"
													class="stock-slider-field__slider"
													color="success"
													:step="0.5"
													:min="0"
													:max="200"
													hide-details
												></v-slider>
												<p class="stock-slider-field__hint">
													Define el umbral que detonará las alertas de bajo stock para este producto.
												</p>
											</div>
										</div>
										<v-textarea
											v-model="productForm.detalle"
											label="Detalle o notas"
											variant="outlined"
											density="comfortable"
											rows="3"
											class="modal-form-grid__item modal-form-grid__item--full"
										></v-textarea>
										</div>
									</div>
									<div class="modal-shell__actions">
									<v-btn variant="text" color="grey-darken-1" class="modal-shell__ghost" @click="closeFormDialog">
										Cancelar
									</v-btn>
									<v-btn
										type="submit"
										class="modal-shell__cta primary-gradient-btn"
										:loading="formLoading"
										:prepend-icon="editingProducto ? 'mdi-content-save-edit' : 'mdi-content-save'"
									>
										{{ editingProducto ? 'Actualizar' : 'Guardar' }}
									</v-btn>
								</div>
							</v-form>
						</div>
					</v-card>
				</v-dialog>

		<v-dialog v-model="deleteDialog" max-width="420">
			<v-card rounded="xl" border>
				<v-card-title class="text-subtitle-1 font-weight-bold">Eliminar producto</v-card-title>
				<v-card-text>
					¿Seguro que deseas eliminar
					<strong>{{ productoSeleccionado?.nombre }}</strong>? Esta acción no se puede deshacer.
				</v-card-text>
				<v-card-actions class="justify-end">
					<v-btn variant="text" color="grey" @click="closeDeleteDialog">Cancelar</v-btn>
					<v-btn color="error" :loading="deleteLoading" @click="confirmDelete">Eliminar</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>

		<v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="4000">
			{{ snackbar.message }}
		</v-snackbar>
	</section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'

const { secureRequest } = useApi()

const INVENTORY_PAGE_SIZE = 12
const STOCK_MIN_KG = 10
const EXPIRY_WARNING_DAYS = 3
const DEFAULT_SHELF_LIFE_DAYS = 7
const ONE_DAY_MS = 1000 * 60 * 60 * 24
const DEFAULT_USER_ID = 1
const FALLBACK_FETCH_SIZE = 100
const MAX_FALLBACK_PAGES = 10
const STOCK_THRESHOLD_STORAGE_KEY = 'inventory.stockThresholds'

const productosRaw = ref([])
const productosLoading = ref(false)
const productosError = ref('')
const categorias = ref([])
const proveedores = ref([])
const searchQuery = ref('')
const categoriaFiltro = ref('all')
const estadoFiltro = ref('all')
const exportLoading = ref(false)
const pagination = reactive({ page: 1, perPage: INVENTORY_PAGE_SIZE, lastPage: 1, total: 0 })
const formDialog = ref(false)
const deleteDialog = ref(false)
const editingProducto = ref(null)
const productoSeleccionado = ref(null)
const formError = ref('')
const formLoading = ref(false)
const deleteLoading = ref(false)
const productFormRef = ref(null)
const snackbar = reactive({ show: false, message: '', color: 'success' })
const localStockThresholds = ref({})
let searchDebounce = null
let skipRemoteSearch = false

const getDefaultForm = () => ({
	nombre: '',
	categoria_id: null,
	proveedor_id: null,
	kilogramos: '',
	desperdicio: 0,
	precio_compra: '',
	precio_venta_kg: '',
	usuario_id: DEFAULT_USER_ID,
	detalle: '',
	stock_minimo: STOCK_MIN_KG,
})

const productForm = ref(getDefaultForm())

const currencyFormatter = new Intl.NumberFormat('es-EC', {
	style: 'currency',
	currency: 'USD',
	minimumFractionDigits: 2,
})

const kilosFormatter = new Intl.NumberFormat('es-EC', {
	minimumFractionDigits: 2,
	maximumFractionDigits: 2,
})

const dateFormatter = new Intl.DateTimeFormat('es-EC', {
	day: '2-digit',
	month: 'short',
	year: 'numeric',
})

const estadoOptions = [
	{ title: 'Todos los estados', value: 'all' },
	{ title: 'Stock bajo', value: 'low' },
	{ title: 'Próximos a vencer', value: 'expiring' },
	{ title: 'Saludable', value: 'healthy' },
]

const categoriaOptions = computed(() => [
	{ title: 'Todas las categorías', value: 'all' },
	...categorias.value.map((categoria) => ({ title: categoria?.nombre ?? 'Sin nombre', value: categoria?.id })),
])

const categorySelectItems = computed(() =>
	categorias.value.map((categoria) => ({ title: categoria?.nombre ?? 'Sin nombre', value: categoria?.id }))
)

const providerSelectItems = computed(() =>
	proveedores.value.map((proveedor) => ({ title: proveedor?.nombre ?? 'Proveedor sin nombre', value: proveedor?.id }))
)

const requiredRule = (value) => !!String(value ?? '').trim() || 'Este campo es obligatorio'

const hasInventory = computed(() => productosRaw.value.length > 0)
const isFilteringActive = computed(() => {
	return (
		Boolean(searchQuery.value.trim()) ||
		categoriaFiltro.value !== 'all' ||
		estadoFiltro.value !== 'all'
	)
})

const normalizeCollection = (payload) => {
	if (!payload) return []
	if (Array.isArray(payload)) return payload
	if (Array.isArray(payload?.data)) return payload.data
	if (Array.isArray(payload?.data?.data)) return payload.data.data
	return []
}

const resolvePaginationMeta = (payload) => {
	if (!payload) return null
	if (payload?.meta) return payload.meta
	if (payload?.data?.meta) return payload.data.meta
	return null
}

const toNumber = (value, fallback = 0) => {
	const parsed = Number(value)
	return Number.isFinite(parsed) ? parsed : fallback
}

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

const persistLocalStockThresholds = () => {
	if (typeof window === 'undefined') return
	try {
		const payload = JSON.stringify({
			thresholds: localStockThresholds.value,
		})
		localStorage.setItem(STOCK_THRESHOLD_STORAGE_KEY, payload)
	} catch (error) {
		console.warn('No se pudieron guardar los límites locales de stock.', error)
	}
}

const loadLocalStockThresholds = () => {
	if (typeof window === 'undefined') return
	try {
		const raw = localStorage.getItem(STOCK_THRESHOLD_STORAGE_KEY)
		if (!raw) return
		const parsed = JSON.parse(raw)
		if (parsed?.thresholds) {
			localStockThresholds.value = parsed.thresholds
		} else if (typeof parsed === 'object' && parsed !== null) {
			localStockThresholds.value = parsed
		}
	} catch (error) {
		console.warn('No se pudieron cargar los límites locales de stock.', error)
	}
}

const setStockThresholdForProduct = (productId, value) => {
	if (!productId) return
	const sanitized = toNumber(value, STOCK_MIN_KG)
	localStockThresholds.value = {
		...localStockThresholds.value,
		[productId]: sanitized,
	}
	persistLocalStockThresholds()
}

const removeStockThresholdForProduct = (productId) => {
	if (!productId || localStockThresholds.value[productId] == null) return
	const clone = { ...localStockThresholds.value }
	delete clone[productId]
	localStockThresholds.value = clone
	persistLocalStockThresholds()
}

const resolveStockThreshold = (producto) => {
	const productId = producto?.id
	if (productId && localStockThresholds.value[productId] != null) {
		return localStockThresholds.value[productId]
	}
	if (producto?.stock_minimo != null) {
		return producto.stock_minimo
	}
	return STOCK_MIN_KG
}

const extractProductoId = (response, fallbackId = null) => {
	return response?.data?.id ?? response?.id ?? fallbackId ?? null
}

const persistThresholdFromPayload = (response, payload, fallbackId = null) => {
	const productId = extractProductoId(response, fallbackId)
	if (productId) {
		setStockThresholdForProduct(productId, payload.stock_minimo)
	}
}

const formatCurrency = (value) => currencyFormatter.format(toNumber(value))
const formatKilograms = (value) => `${kilosFormatter.format(Math.max(0, toNumber(value)))} kg`

const formatDate = (value) => {
	if (!value) return 'Sin fecha'
	const date = new Date(value)
	return Number.isNaN(date.getTime()) ? 'Sin fecha' : dateFormatter.format(date)
}

const normalizeText = (value = '') => {
	if (value == null) return ''
	return String(value).trim().toLowerCase()
}

const categoryEmojiMap = computed(() => {
	return categorias.value.reduce((acc, categoria) => {
		const emoji = categoria?.emoji ?? categoria?.icono ?? categoria?.icon ?? null
		if (!emoji) return acc
		if (categoria?.id != null) {
			acc[String(categoria.id)] = emoji
		}
		const normalizedName = normalizeText(categoria?.nombre)
		if (normalizedName) {
			acc[`name:${normalizedName}`] = emoji
		}
		return acc
	}, {})
})

const getCategoryName = (producto) =>
	producto?.categoria_nombre ?? producto?.categoria?.nombre ?? 'Sin categoría'

const getProviderName = (producto) =>
	producto?.proveedor_nombre ?? producto?.proveedor?.nombre ?? 'Proveedor sin asignar'

const matchesProductSearch = (producto, normalizedTerm) => {
	if (!normalizedTerm) return true
	const fields = [
		producto?.nombre,
		getCategoryName(producto),
		getProviderName(producto),
		producto?.detalle,
	]
	return fields.some((field) => normalizeText(field).includes(normalizedTerm))
}

const isDetalleColumnError = (error) => {
	const message = error?.data?.message ?? error?.message ?? ''
	return typeof message === 'string' && message.toLowerCase().includes('detalle')
}

const resolveCategoryEmojiFromMap = (producto) => {
	const categoryId = producto?.categoria_id ?? producto?.categoria?.id
	if (categoryId != null) {
		const emoji = categoryEmojiMap.value[String(categoryId)]
		if (emoji) return emoji
	}
	const normalizedName = normalizeText(getCategoryName(producto))
	if (normalizedName) {
		const emoji = categoryEmojiMap.value[`name:${normalizedName}`]
		if (emoji) return emoji
	}
	return null
}

const getCategoryBadge = (producto) => {
	const emoji =
		producto?.categoria?.emoji ??
		producto?.categoria_emoji ??
		producto?.emoji ??
		resolveCategoryEmojiFromMap(producto)
	if (emoji) return emoji
	const categoryName = getCategoryName(producto)
	return categoryName ? categoryName.trim().charAt(0).toUpperCase() : '❖'
}

const getKilos = (producto) =>
	toNumber(
		producto?.kilogramos ??
			producto?.kilogramos_netos ??
			producto?.kilo ??
			producto?.cantidad ??
			0,
	)

const getNetKilos = (producto) => {
	const bruto = getKilos(producto)
	const desperdicio = toNumber(producto?.desperdicio)
	return Math.max(bruto - desperdicio, 0)
}

const deriveExpiryDate = (producto) => {
	if (!producto?.created_at) return null
	const date = new Date(producto.created_at)
	if (Number.isNaN(date.getTime())) return null
	date.setDate(date.getDate() + DEFAULT_SHELF_LIFE_DAYS)
	return date
}

const buildStatus = (flags) => {
	if (flags.isLowStock) {
		return {
			label: 'Stock bajo - Reabastecer urgente',
			tone: 'error',
			icon: 'mdi-alert',
			weight: 0,
			progressColor: 'error',
			styleKey: 'is-low',
		}
	}
	if (flags.isExpiring) {
		return {
			label: `Vence en ${flags.daysToExpire} día(s)`,
			tone: 'warning',
			icon: 'mdi-timer-sand',
			weight: 1,
			progressColor: 'warning',
			styleKey: 'is-expiring',
		}
	}
	return {
		label: 'Stock saludable',
		tone: 'success',
		icon: 'mdi-leaf',
		weight: 2,
		progressColor: 'success',
		styleKey: 'is-healthy',
	}
}

const productCards = computed(() =>
	productosRaw.value
		.map((producto, index) => {
			const kilos = getNetKilos(producto)
			const stockMinimumRaw = toNumber(resolveStockThreshold(producto), STOCK_MIN_KG)
			const stockMinimum = stockMinimumRaw > 0 ? stockMinimumRaw : STOCK_MIN_KG
			const expiryDate = deriveExpiryDate(producto)
			const daysToExpire = expiryDate
				? Math.ceil((expiryDate.getTime() - Date.now()) / ONE_DAY_MS)
				: null
			const isLowStock = kilos <= stockMinimum
			const isExpiring = typeof daysToExpire === 'number' && daysToExpire <= EXPIRY_WARNING_DAYS && daysToExpire >= 0
			const status = buildStatus({ isLowStock, isExpiring, daysToExpire })
			const saleTotal = kilos * toNumber(producto?.precio_venta_kg)
			const profit = saleTotal - toNumber(producto?.precio_compra)

			return {
				id: producto?.id ?? `producto-${index}`,
				raw: producto,
				name: producto?.nombre ?? 'Producto sin nombre',
				category: getCategoryName(producto),
				provider: getProviderName(producto),
				badge: getCategoryBadge(producto),
				kilosLabel: formatKilograms(kilos),
				stockMinimumLabel: formatKilograms(stockMinimum),
				purchaseLabel: formatCurrency(producto?.precio_compra),
				saleLabel: formatCurrency(producto?.precio_venta_kg),
				profitLabel: formatCurrency(profit),
				ingresoLabel: formatDate(producto?.created_at),
				venceLabel: expiryDate ? formatDate(expiryDate) : 'Pendiente',
				status,
				progress: clamp(
					Math.round((kilos / (Math.max(stockMinimum, 1) * 3)) * 100),
					6,
					100,
				),
			}
		})
		.sort((a, b) => a.status.weight - b.status.weight || a.name.localeCompare(b.name))
)

const filteredCards = computed(() => {
	const stateFilter = estadoFiltro.value
	const categoryFilter = categoriaFiltro.value
	const searchTerm = normalizeText(searchQuery.value)

	return productCards.value.filter((card) => {
		if (stateFilter === 'low' && card.status.weight !== 0) return false
		if (stateFilter === 'expiring' && card.status.weight !== 1) return false
		if (stateFilter === 'healthy' && card.status.weight !== 2) return false
		if (categoryFilter !== 'all' && String(card.raw?.categoria_id ?? '') !== String(categoryFilter)) {
			return false
		}
		if (searchTerm && !matchesProductSearch(card.raw, searchTerm)) {
			return false
		}
		return true
	})
})

const lowStockProducts = computed(() => productCards.value.filter((card) => card.status.weight === 0))
const expiringProducts = computed(() => productCards.value.filter((card) => card.status.weight === 1))
const hasLowStockAlerts = computed(() => lowStockProducts.value.length > 0)
const hasExpiringAlerts = computed(() => expiringProducts.value.length > 0)

const showSnackbar = (message, color = 'success') => {
	snackbar.message = message
	snackbar.color = color
	snackbar.show = true
}

const fetchCategorias = async () => {
	try {
		const params = new URLSearchParams({ per_page: '100' })
		const response = await secureRequest(`/categorias?${params.toString()}`)
		categorias.value = normalizeCollection(response?.data ?? response)
	} catch (error) {
		console.warn('No se pudieron cargar las categorías.', error)
	}
}

const fetchProveedores = async () => {
	try {
		const response = await secureRequest('/proveedores')
		proveedores.value = normalizeCollection(response?.data ?? response)
	} catch (error) {
		console.warn('No se pudieron cargar los proveedores.', error)
	}
}

const handleSearchFallback = async (searchValue) => {
	const normalizedTerm = normalizeText(searchValue)
	if (!normalizedTerm) return

	const aggregated = []
	let currentPage = 1
	let lastPage = 1
	let totalItems = null

	try {
		do {
			const params = new URLSearchParams({
				page: String(currentPage),
				por_pagina: String(FALLBACK_FETCH_SIZE),
			})
			if (categoriaFiltro.value !== 'all') {
				params.set('categoria_id', String(categoriaFiltro.value))
			}

			const response = await secureRequest(`/productos?${params.toString()}`)
			aggregated.push(...normalizeCollection(response?.data ?? response))

			const meta = resolvePaginationMeta(response) || resolvePaginationMeta(response?.data) || {}
			totalItems = meta?.total ?? totalItems
			lastPage = meta?.last_page ?? meta?.lastPage ?? lastPage ?? currentPage
			if (!lastPage || lastPage < currentPage) {
				lastPage = currentPage
			}
			currentPage += 1
		} while (
			currentPage <= lastPage &&
			currentPage <= MAX_FALLBACK_PAGES &&
			(totalItems == null || aggregated.length < totalItems)
		)

		const filtered = aggregated.filter((producto) => matchesProductSearch(producto, normalizedTerm))
		productosRaw.value = filtered
		pagination.page = 1
		pagination.lastPage = 1
		pagination.total = filtered.length
		productosError.value = ''
	} catch (error) {
		productosRaw.value = []
		productosError.value =
			error?.data?.message ?? error?.message ?? 'No se pudo completar la búsqueda local.'
	}
}

const fetchProductos = async (page = pagination.page) => {
	productosLoading.value = true
	productosError.value = ''
	try {
		pagination.page = page
		const params = new URLSearchParams({
			page: String(page),
			por_pagina: String(pagination.perPage),
		})

		const searchValue = searchQuery.value.trim()
		if (searchValue && skipRemoteSearch) {
			await handleSearchFallback(searchValue)
			return
		}
		if (searchValue) params.set('busqueda', searchValue)
		if (categoriaFiltro.value !== 'all') params.set('categoria_id', String(categoriaFiltro.value))

		const response = await secureRequest(`/productos?${params.toString()}`)
		productosRaw.value = normalizeCollection(response?.data ?? response)

		const meta = resolvePaginationMeta(response) || resolvePaginationMeta(response?.data)
		if (meta) {
			pagination.lastPage = meta.last_page ?? meta.lastPage ?? 1
			pagination.total = meta.total ?? productosRaw.value.length
			if (pagination.page > pagination.lastPage) {
				pagination.page = pagination.lastPage
			}
		} else {
			pagination.lastPage = 1
			pagination.total = productosRaw.value.length
		}
	} catch (error) {
		const searchValue = searchQuery.value.trim()
		if (searchValue && isDetalleColumnError(error)) {
			skipRemoteSearch = true
			await handleSearchFallback(searchValue)
			return
		}
		productosRaw.value = []
		productosError.value = error?.data?.message ?? error?.message ?? 'No se pudo cargar el inventario.'
	} finally {
		productosLoading.value = false
	}
}

const refreshInventario = () => {
	fetchProductos(1)
}

const openCreateDialog = () => {
	editingProducto.value = null
	productForm.value = getDefaultForm()
	formError.value = ''
	formDialog.value = true
}

const closeFormDialog = () => {
	formDialog.value = false
}

const openEditDialog = (producto) => {
	editingProducto.value = producto
	productForm.value = {
		nombre: producto?.nombre ?? '',
		categoria_id: producto?.categoria_id ?? null,
		proveedor_id: producto?.proveedor_id ?? null,
		kilogramos: getKilos(producto).toString(),
		desperdicio: toNumber(producto?.desperdicio).toString(),
		precio_compra: toNumber(producto?.precio_compra).toString(),
		precio_venta_kg: toNumber(producto?.precio_venta_kg).toString(),
		usuario_id: producto?.usuario_id ?? DEFAULT_USER_ID,
		detalle: producto?.detalle ?? '',
		stock_minimo: toNumber(resolveStockThreshold(producto), STOCK_MIN_KG),
	}
	formDialog.value = true
}

const closeDeleteDialog = () => {
	deleteDialog.value = false
	productoSeleccionado.value = null
}

const openDeleteDialog = (producto) => {
	productoSeleccionado.value = producto
	deleteDialog.value = true
}

const validateForm = () => {
	const requiredFields = ['nombre', 'categoria_id', 'proveedor_id', 'kilogramos', 'precio_compra', 'precio_venta_kg']
	for (const field of requiredFields) {
		if (!String(productForm.value[field] ?? '').trim()) {
			formError.value = 'Por favor completa todos los campos obligatorios.'
			return false
		}
	}

	const kilos = toNumber(productForm.value.kilogramos)
	const desperdicio = toNumber(productForm.value.desperdicio)
	if (desperdicio >= kilos) {
		formError.value = 'El desperdicio debe ser menor que los kilogramos disponibles.'
		return false
	}

	formError.value = ''
	return true
}

const submitProducto = async () => {
	if (!validateForm()) return

	formLoading.value = true

	const kilosValue = toNumber(productForm.value.kilogramos)
	const stockMinValue = toNumber(productForm.value.stock_minimo, STOCK_MIN_KG)

	const payload = {
		nombre: productForm.value.nombre.trim(),
		categoria_id: Number(productForm.value.categoria_id),
		proveedor_id: Number(productForm.value.proveedor_id),
		kilogramos: kilosValue,
		kilo: kilosValue,
		desperdicio: productForm.value.desperdicio ? toNumber(productForm.value.desperdicio) : 0,
		precio_compra: toNumber(productForm.value.precio_compra),
		precio_venta_kg: toNumber(productForm.value.precio_venta_kg),
		usuario_id: Number(productForm.value.usuario_id) || DEFAULT_USER_ID,
		stock_minimo: stockMinValue > 0 ? stockMinValue : STOCK_MIN_KG,
	}

	try {
		if (editingProducto.value?.id) {
			const response = await secureRequest(`/productos/${editingProducto.value.id}`, {
				method: 'PUT',
				body: payload,
			})
			persistThresholdFromPayload(response, payload, editingProducto.value.id)
			showSnackbar('Producto actualizado correctamente.')
		} else {
			const response = await secureRequest('/productos', {
				method: 'POST',
				body: payload,
			})
			persistThresholdFromPayload(response, payload)
			showSnackbar('Producto registrado correctamente.')
		}

		formDialog.value = false
		editingProducto.value = null
		await fetchProductos(pagination.page)
	} catch (error) {
		formError.value = error?.data?.message ?? 'No se pudo guardar el producto.'
		console.error(error?.data || error)
	} finally {
		formLoading.value = false
	}
}

const confirmDelete = async () => {
	if (!productoSeleccionado.value?.id) {
		closeDeleteDialog()
		return
	}

	deleteLoading.value = true
	try {
		await secureRequest(`/productos/${productoSeleccionado.value.id}`, {
			method: 'DELETE',
		})
		showSnackbar('Producto eliminado correctamente.')
		removeStockThresholdForProduct(productoSeleccionado.value.id)
		closeDeleteDialog()
		await fetchProductos(pagination.page)
	} catch (error) {
		showSnackbar(error?.data?.message ?? 'No se pudo eliminar el producto.', 'error')
		console.error(error?.data || error)
	} finally {
		deleteLoading.value = false
	}
}

const exportInventario = async () => {
	exportLoading.value = true
	try {
		const params = new URLSearchParams({ page: '1', por_pagina: '200' })
		const response = await secureRequest(`/productos?${params.toString()}`)
		const rows = normalizeCollection(response?.data ?? response)
		if (!rows.length) {
			throw new Error('No hay datos para exportar.')
		}

		const headers = ['Nombre', 'Categoría', 'Proveedor', 'Kg disponibles', 'Precio compra', 'Precio venta/kg']
		const csv = [
			headers.join(';'),
			...rows.map((producto) =>
				[
					producto?.nombre ?? '',
					getCategoryName(producto),
					getProviderName(producto),
					getNetKilos(producto),
					toNumber(producto?.precio_compra),
					toNumber(producto?.precio_venta_kg),
				].join(';'),
			),
		].join('\n')

		const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
		const url = URL.createObjectURL(blob)
		const link = document.createElement('a')
		link.href = url
		link.download = `inventario-${new Date().toISOString().slice(0, 10)}.csv`
		link.click()
		URL.revokeObjectURL(url)
		showSnackbar('Exportación generada en CSV. Puedes abrirla en Excel o Google Sheets.')
	} catch (error) {
		showSnackbar(error?.message ?? 'No se pudo exportar el inventario.', 'error')
	} finally {
		exportLoading.value = false
	}
}

watch(
	() => categoriaFiltro.value,
	() => {
		pagination.page = 1
		fetchProductos(1)
	},
)

watch(
	() => pagination.page,
	(page, previous) => {
		if (page !== previous) {
			fetchProductos(page)
		}
	},
)

watch(
	() => searchQuery.value,
	() => {
		if (searchDebounce) clearTimeout(searchDebounce)
		searchDebounce = setTimeout(() => {
			pagination.page = 1
			fetchProductos(1)
		}, 450)
	},
)

onMounted(async () => {
	loadLocalStockThresholds()
	await Promise.all([fetchCategorias(), fetchProveedores()])
	fetchProductos()
})

onBeforeUnmount(() => {
	if (searchDebounce) clearTimeout(searchDebounce)
})

defineExpose({ refreshInventario })

</script>

<style scoped>
.inventario-page {
	padding: 5px 16px 48px;
	background: #f2f2f2;
	min-height: 100%;
}

.inventory-shell {
	width: 100%;
	padding-inline: 0;
}

.inventory-board {
	background: #ffffff;
	border: 1px solid rgba(34, 197, 94, 0.22);
	box-shadow: 0 6px 18px rgba(34, 197, 94, 0.08);
	padding: 18px 22px 22px;
}

.board-header {
	display: flex;
	justify-content: space-between;
	gap: 16px;
	flex-wrap: wrap;
	align-items: center;
}

.board-heading {
	display: flex;
	align-items: center;
	gap: 12px;
}

.board-label {
	margin: 0;
	font-size: 1.rem;
	font-weight: 700;
	color: #0d3b25;
}

.board-subtitle {
	margin: 0;
	color: #5a7064;
	font-size: 0.88rem;
}

.board-actions {
	display: flex;
	gap: 10px;
	flex-wrap: wrap;
}

.action-btn {
	min-height: 34px;
	border-radius: 14px;
	text-transform: none;
	font-weight: 600;
	font-family: inherit;
	font-size: 14px;
}

.filters-bar {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 12px;
	margin: 20px 0 28px;
	padding: 14px 18px;
	background: #ffffff;
	border-radius: 18px;
	border: 1px solid #e5e9f0;
	box-shadow: 0 4px 16px rgba(15, 23, 42, 0.06);
}

.filters-bar__search {
	flex: 1 1 320px;
}

.filters-bar__control {
	flex: 0 1 200px;
	min-width: 180px;
}

.filters-refresh {
	min-width: 48px;
	border-radius: 16px;
	box-shadow: 0 2px 8px rgba(34, 197, 94, 0.25);
}

.alert-stack {
	display: flex;
	flex-direction: column;
	gap: 12px;
	margin-bottom: 24px;
}

.alert-card {
	display: flex;
	align-items: center;
	gap: 12px;
	padding: 14px 18px;
	border-radius: 14px;
	border: 1.5px solid #f0b4b4;
	background: #fff8f8;
	box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.35);
}

.alert-card--warning {
	border-color: #f6c48b;
	background: #fff9f1;
}

.alert-card__icon {
	width: 34px;
	height: 34px;
	border-radius: 12px;
	background: rgba(244, 63, 94, 0.12);
	display: flex;
	align-items: center;
	justify-content: center;
	color: #c53030;
}

.alert-card--warning .alert-card__icon {
	background: rgba(251, 191, 36, 0.16);
	color: #c05621;
}

.alert-card__title {
	margin: 0;
	font-weight: 700;
	color: #b42828;
}

.alert-card--warning .alert-card__title {
	color: #c05621;
}

.alert-card__body {
	margin: 0;
	color: #5f4b4b;
	font-size: 0.92rem;
}

.alert-card--warning .alert-card__body {
	color: #785327;
}

.cards-wrapper {
	margin-top: 8px;
}

.product-card {
	padding: 20px 22px;
	display: flex;
	flex-direction: column;
	gap: 18px;
	background: linear-gradient(180deg, #ffffff 0%, #f8fffb 100%);
	border: 2px solid rgba(4, 158, 75, 0.18);
	border-radius: 22px;
	box-shadow: 0 14px 30px rgba(9, 94, 57, 0.08);
	min-height: 100%;
	transition: border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
}

.product-card:hover {
	border-color: rgba(4, 158, 75, 0.4);
	transform: translateY(-4px);
	box-shadow: 0 18px 36px rgba(9, 94, 57, 0.12);
}

.product-card.is-healthy {
	border-color: rgba(15, 182, 122, 0.7);
	box-shadow: 0 16px 34px rgba(15, 182, 122, 0.18);
}

.product-card.is-low {
	border-color: rgba(234, 67, 53, 0.55);
	background: linear-gradient(180deg, #fffefe 0%, #fff5f5 100%);
	box-shadow: 0 16px 34px rgba(234, 67, 53, 0.16);
}

.product-card.is-expiring {
	border-color: rgba(245, 158, 11, 0.6);
	background: linear-gradient(180deg, #fffdf7 0%, #fff5e7 100%);
	box-shadow: 0 16px 34px rgba(245, 158, 11, 0.16);
}

.status-banner {
	display: inline-flex;
	align-items: center;
	gap: 8px;
	font-size: 0.85rem;
	font-weight: 600;
	padding: 8px 14px;
	border-radius: 14px;
	background: #edf8f0;
	color: #0f5132;
}

.status-banner.is-low {
	background: #fdecec;
	color: #b42318;
}

.status-banner.is-expiring {
	background: #fff1dc;
	color: #c05621;
}

.status-banner.is-healthy {
	background: #e7f8ed;
	color: #0f5132;
}

.status-banner + .product-card__header {
	margin-top: 4px;
}

.product-card__header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 10px;
}

.product-card__title {
	display: flex;
	gap: 10px;
	align-items: center;
}

.category-avatar {
	background: #f1fbf4;
	color: #0d3b25;
	font-size: 1.2rem;
	border: 1px solid rgba(4, 158, 75, 0.2);
}

.product-name {
	font-size: 1rem;
	font-weight: 700;
	margin: 0;
	color: #0b2f1f;
	line-height: 1.2;
}

.product-category {
	margin: 0;
	color: #66786f;
	font-size: 0.82rem;
}

.product-card__actions {
	display: flex;
	gap: 4px;
}

.stock-block {
	display: flex;
	justify-content: space-between;
	gap: 16px;
	flex-wrap: wrap;
	border-bottom: 1px dashed rgba(13, 59, 37, 0.16);
	padding-bottom: 6px;
}

.stock-metric {
	flex: 1;
	min-width: 140px;
}

.metric-label {
	margin: 0;
	font-size: 0.78rem;
	text-transform: uppercase;
	letter-spacing: 0.05em;
	color: #6b7a71;
}

.metric-value {
	margin: 2px 0 0;
	font-size: 0.96rem;
	font-weight: 700;
	color: #0b2f1f;
}

.metric-value.emphasis {
	color: #0f5132;
	font-size: 1.2rem;
}

.text-right {
	text-align: right;
}

.stock-progress {
	margin-top: 4px;
	border-radius: 999px;
}

.price-inline {
	display: flex;
	flex-wrap: wrap;
	gap: 16px;
	margin-top: 8px;
}

.detail-pair {
	display: flex;
	flex-direction: column;
	gap: 2px;
	min-width: 120px;
}

.detail-label {
	margin: 0;
	font-size: 0.72rem;
	letter-spacing: 0.08em;
	text-transform: uppercase;
	color: #7b8b82;
}

.detail-label.subtle {
	font-size: 0.7rem;
}

.detail-value {
	margin: 0;
	font-size: 0.9rem;
	font-weight: 600;
	color: #1b2f23;
}

.detail-value.highlight {
	color: #0f8a4e;
	font-weight: 700;
}

.detail-value.muted {
	font-size: 0.82rem;
	color: #506058;
}

.details-list {
	display: grid;
	gap: 6px;
	margin-top: 0px;
}

.detail-row {
	display: flex;
	gap: 5px;
	align-items: flex-start;
}

.pagination-block {
	display: flex;
	justify-content: center;
	margin-top: 24px;
}

.empty-state {
	margin-top: 32px;
	padding: 48px;
	background: #ffffff;
	border-radius: 24px;
	border: 1px dashed rgba(4, 158, 75, 0.2);
	text-align: center;
	color: #4d5b52;
	display: flex;
	flex-direction: column;
	gap: 12px;
	align-items: center;
}

.modal-shell {
	padding: 28px 32px;
	background: linear-gradient(145deg, #ffffff 0%, #f6fff9 70%);
	border-color: rgba(11, 155, 74, 0.2);
	box-shadow: 0 28px 60px rgba(5, 68, 36, 0.18);
	display: flex;
	flex-direction: column;
	max-height: 85vh;
	overflow: hidden;
}

.modal-shell__header {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	gap: 16px;
}

.modal-shell__eyebrow {
	margin-bottom: 4px;
	font-size: 0.75rem;
	letter-spacing: 0.22em;
	text-transform: uppercase;
	color: #0f8a4e;
}

.modal-shell__title {
	margin: 0;
	font-size: 1.45rem;
	color: #0b3421;
}

.modal-shell__subtitle {
	margin: 6px 0 0;
	color: #5c6d63;
	font-size: 0.95rem;
}

.modal-shell__dismiss {
	margin-top: -6px;
}

.modal-shell__divider {
	margin: 20px 0 28px;
	height: 1px;
	background: rgba(11, 155, 74, 0.15);
}

.modal-shell__body {
	display: flex;
	flex-direction: column;
	gap: 0;
	flex: 1;
	min-height: 0;
}

.modal-shell__alert {
	margin: 0 0 20px;
}

.modal-shell__form {
	display: flex;
	flex-direction: column;
	gap: 20px;
	flex: 1;
	min-height: 0;
}

.modal-shell__content {
	display: flex;
	flex-direction: column;
	gap: 20px;
	flex: 1;
	min-height: 0;
	max-height: 100%;
	overflow-y: auto;
	scrollbar-gutter: stable both-edges;
	padding: 0 6px 6px;
}

.modal-shell__content::-webkit-scrollbar {
	width: 6px;
}

.modal-shell__content::-webkit-scrollbar-track {
	background: rgba(15, 138, 78, 0.08);
	border-radius: 999px;
}

.modal-shell__content::-webkit-scrollbar-thumb {
	background: rgba(15, 138, 78, 0.4);
	border-radius: 999px;
}

.modal-shell__content::-webkit-scrollbar-thumb:hover {
	background: rgba(15, 138, 78, 0.55);
}

.modal-form-grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
	gap: 16px;
}

.modal-form-grid__item--full {
	grid-column: 1 / -1;
}

.modal-form-grid__item--top-gap {
	margin-top: 10px;
}

.modal-form-grid__pair {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
	gap: 16px;
	align-items: stretch;
}

.stock-slider-field {
	display: flex;
	flex-direction: column;
	gap: 10px;
	border: 1.5px solid rgba(15, 138, 78, 0.18);
	border-radius: 16px;
	background: linear-gradient(180deg, #f9fefb 0%, #f3fbf6 100%);
	padding: 16px 18px 12px;
}

.stock-slider-field__header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	font-size: 0.78rem;
	letter-spacing: 0.12em;
	text-transform: uppercase;
	color: #55685f;
}

.stock-slider-field__header strong {
	font-size: 1rem;
	letter-spacing: normal;
	text-transform: none;
	color: #0b4c2a;
}

.stock-slider-field__hint {
	margin: 0;
	font-size: 0.75rem;
	color: #6b7a71;
}

.stock-slider-field__slider :deep(.v-slider-track__background) {
	background: rgba(11, 155, 74, 0.2);
}

.stock-slider-field__slider :deep(.v-slider-track__fill) {
	background: #05a552;
}

.stock-slider-field__slider :deep(.v-slider-thumb) {
	border: 3px solid #ffffff;
	box-shadow: 0 4px 10px rgba(5, 84, 40, 0.25);
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
	min-width: 160px;
	text-transform: none;
	font-weight: 600;
}

.primary-gradient-btn {
	padding: 0 1.4rem;
	min-width: 180px;
	border-radius: 14px;
	background: linear-gradient(135deg, #0cc665 0%, #06a453 100%) !important;
	color: #ffffff !important;
	box-shadow: 0 4px 12px rgba(6, 164, 83, 0.14) !important;
	font-weight: 600;
}

.primary-gradient-btn :deep(.v-btn__content) {
	letter-spacing: 0.2px;
}

.primary-gradient-btn :deep(.v-btn__overlay) {
	opacity: 0;
}

.modal-shell :deep(.v-field__outline) {
	border-radius: 16px;
	border-width: 1.5px;
	border-color: rgba(15, 138, 78, 0.18);
}

.modal-shell :deep(.v-field__input) {
	padding-top: 18px;
	padding-bottom: 14px;
}

.modal-shell :deep(.v-select__selection-text) {
	font-weight: 500;
}

@media (max-width: 720px) {
	.modal-shell {
		padding: 22px;
	}

	.modal-shell__header {
		flex-direction: column;
	}
}

@media (max-width: 600px) {
	.modal-shell__actions {
		flex-direction: column;
	}
}

@media (max-width: 960px) {
	.board-header {
		flex-direction: column;
		align-items: flex-start;
	}

	.inventory-board {
		padding: 24px;
	}
}

@media (max-width: 600px) {
	.inventario-page {
		padding: 16px 8px 32px;
	}

	.filters-bar {
		flex-direction: column;
		align-items: stretch;
	}

	.filters-bar__search,
	.filters-bar__control,
	.filters-refresh {
		flex: 1 1 auto;
		width: 100%;
	}

	.filters-refresh {
		justify-content: center;
	}
}
</style>

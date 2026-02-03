<template>
	<section class="inventario-page">
		<v-container class="inventory-shell">
			<v-card class="inventory-board" rounded="xl" border>
				<header class="board-header">
					<div class="board-heading">
						<span class="board-icon">📋</span>
						<div>
							<p class="board-label">Lista de Productos</p>
							<p class="board-subtitle">Gestión de frutas y verduras frescas</p>
						</div>
					</div>
					<div class="board-actions">
						<v-btn
							class="action-btn"
							color="success"
							variant="tonal"
							prepend-icon="mdi-plus"
							@click="openCreateDialog"
						>
							Nuevo Producto
						</v-btn>
						<v-btn
							class="action-btn"
							color="success"
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
					<v-card rounded="xl" border class="form-card">
						<v-card-title class="text-subtitle-1 font-weight-bold">
							{{ editingProducto ? 'Editar producto' : 'Registrar producto' }}
						</v-card-title>
						<v-card-text>
							<v-alert
								v-if="formError"
								type="error"
								variant="tonal"
								border="start"
								border-color="error"
								class="mb-4"
							>
								{{ formError }}
							</v-alert>

							<v-form ref="productFormRef" @submit.prevent="submitProducto">
								<v-row dense class="form-grid">
									<v-col cols="12">
										<v-text-field
											v-model="productForm.nombre"
											label="Nombre del producto"
											variant="outlined"
											density="comfortable"
											color="success"
											:rules="[requiredRule]"
										></v-text-field>
									</v-col>
									<v-col cols="12" md="6">
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
										></v-select>
									</v-col>
									<v-col cols="12" md="6">
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
										></v-select>
									</v-col>
									<v-col cols="12" md="6">
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
										></v-text-field>
									</v-col>
									<v-col cols="12" md="6">
										<v-text-field
											v-model="productForm.desperdicio"
											type="number"
											label="Desperdicio (kg)"
											variant="outlined"
											density="comfortable"
											color="success"
											min="0"
											step="0.001"
										></v-text-field>
									</v-col>
									<v-col cols="12" md="6">
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
										></v-text-field>
									</v-col>
									<v-col cols="12" md="6">
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
										></v-text-field>
									</v-col>
									<v-col cols="12" md="6">
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
										></v-text-field>
									</v-col>
									<v-col cols="12">
										<v-textarea
											v-model="productForm.detalle"
											label="Detalle o notas"
											variant="outlined"
											density="comfortable"
											rows="3"
										></v-textarea>
									</v-col>
								</v-row>
								<div class="form-actions">
									<v-btn variant="text" color="grey" @click="closeFormDialog">Cancelar</v-btn>
									<v-btn
										type="submit"
										color="success"
										:loading="formLoading"
										:prepend-icon="editingProducto ? 'mdi-content-save-edit' : 'mdi-content-save'"
									>
										{{ editingProducto ? 'Actualizar' : 'Guardar' }}
									</v-btn>
								</div>
							</v-form>
						</v-card-text>
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

const getCategoryBadge = (producto, index) => {
	const fallback = ['🍅', '🥬', '🍋', '🥕', '🍇', '🍉']
	return (
		producto?.categoria?.emoji ??
		producto?.categoria_emoji ??
		producto?.emoji ??
		fallback[index % fallback.length]
	)
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
			const expiryDate = deriveExpiryDate(producto)
			const daysToExpire = expiryDate
				? Math.ceil((expiryDate.getTime() - Date.now()) / ONE_DAY_MS)
				: null
			const isLowStock = kilos <= STOCK_MIN_KG
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
				badge: getCategoryBadge(producto, index),
				kilosLabel: formatKilograms(kilos),
				stockMinimumLabel: formatKilograms(STOCK_MIN_KG),
				purchaseLabel: formatCurrency(producto?.precio_compra),
				saleLabel: formatCurrency(producto?.precio_venta_kg),
				profitLabel: formatCurrency(profit),
				ingresoLabel: formatDate(producto?.created_at),
				venceLabel: expiryDate ? formatDate(expiryDate) : 'Pendiente',
				status,
				progress: clamp(Math.round((kilos / (STOCK_MIN_KG * 3)) * 100), 6, 100),
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

	const payload = {
		nombre: productForm.value.nombre.trim(),
		categoria_id: Number(productForm.value.categoria_id),
		proveedor_id: Number(productForm.value.proveedor_id),
		kilogramos: toNumber(productForm.value.kilogramos),
		desperdicio: productForm.value.desperdicio ? toNumber(productForm.value.desperdicio) : 0,
		precio_compra: toNumber(productForm.value.precio_compra),
		precio_venta_kg: toNumber(productForm.value.precio_venta_kg),
		usuario_id: Number(productForm.value.usuario_id) || DEFAULT_USER_ID,
	}

	try {
		if (editingProducto.value?.id) {
			await secureRequest(`/productos/${editingProducto.value.id}`, {
				method: 'PUT',
				body: payload,
			})
			showSnackbar('Producto actualizado correctamente.')
		} else {
			await secureRequest('/productos', {
				method: 'POST',
				body: payload,
			})
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
	background: #f6fbf6;
	min-height: 100%;
}

.inventory-shell {
	max-width: 1300px;
	margin: 0 auto;
}

.inventory-board {
	background: #ffffff;
	border: 1.5px solid rgb(33, 229, 118);
	box-shadow: 0 18px 40px rgba(5, 93, 55, 0.08);
	padding: 28px 32px 32px;
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

.board-icon {
	font-size: 1.4rem;
	width: 48px;
	height: 48px;
	border-radius: 14px;
	background: #e9f8ef;
	display: flex;
	align-items: center;
	justify-content: center;
}

.board-label {
	margin: 0;
	font-size: 1.15rem;
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
	border-radius: 999px;
	text-transform: none;
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

.form-card {
	padding: 8px 8px 24px;
}

.form-grid {
	display: flex;
	flex-direction: column;
	gap: 16px;
}

.form-actions {
	display: flex;
	justify-content: flex-end;
	gap: 12px;
	margin-top: 8px;
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

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
						<v-btn class="action-btn" prepend-icon="mdi-plus" @click="openCreateDialog">
							Nuevo Producto
						</v-btn>
						<!-- Reemplaza el botón simple con este menú -->
						 <v-btn 
        class="action-btn" 
        prepend-icon="mdi-file-pdf-box"
        @click="$router.push('/reportes')"
    >
        Reportes
    </v-btn>
					</div>
				</header>

				<div class="filters-bar">
					<div class="filters-bar__search">
						<v-text-field v-model="searchQuery" density="comfortable" variant="outlined" color="success"
							base-color="success" prepend-inner-icon="mdi-magnify"
							placeholder="Buscar por nombre o proveedor..." hide-details clearable></v-text-field>
					</div>
					<div class="filters-bar__control">
						<v-select v-model="categoriaFiltro" :items="categoriaOptions" item-title="title"
							item-value="value" density="comfortable" variant="outlined" color="success"
							placeholder="Todas las categorías" hide-details></v-select>
					</div>
					<div class="filters-bar__control">
						<v-select v-model="estadoFiltro" :items="estadoOptions" item-title="title" item-value="value"
							density="comfortable" variant="outlined" color="success" placeholder="Todos los estados"
							hide-details></v-select>
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
								{{ expiringProducts.length }} producto(s) vencen en los próximos {{ EXPIRY_WARNING_DAYS
								}} día(s).
							</p>
						</div>
					</div>
				</div>

				<v-progress-linear v-if="productosLoading" indeterminate color="success" height="6" rounded
					class="mb-4"></v-progress-linear>

				<v-alert v-if="productosError" type="error" variant="tonal" density="comfortable" border="start"
					border-color="error" class="mb-4">
					{{ productosError }}
				</v-alert>

				<section class="cards-wrapper">
					<template v-if="filteredCards.length">
						<v-row>
							<v-col v-for="card in filteredCards" :key="card.id" cols="12" sm="6" md="4" lg="4" xl="4">
								<v-card :class="['product-card', card.status.styleKey]" rounded="lg" border
									elevation="0">
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
											<v-btn icon variant="text" color="grey-darken-1"
												@click="openEditDialog(card.raw)">
												<v-icon icon="mdi-pencil"></v-icon>
											</v-btn>
											<v-btn icon variant="text" color="grey-darken-1"
												@click="openDeleteDialog(card.raw)">
												<v-icon icon="mdi-delete-outline"></v-icon>
											</v-btn>
										</div>
									</div>

									<div class="stock-block">
										<div class="stock-metric">
											<p class="metric-label">Cantidad disponible</p>
											<div class="metric-inline">
												<p class="metric-value metric-value--wide">{{ card.kilosLabel }}</p>
												<div class="stock-adjust">
													<v-btn icon size="x-small" variant="tonal" color="success"
														:loading="inlineStockLoading[card.id]"
														@click="adjustStock(card.raw, -STOCK_STEP_KG)">
														<v-icon icon="mdi-minus"></v-icon>
													</v-btn>
													<v-btn icon size="x-small" variant="tonal" color="success"
														:loading="inlineStockLoading[card.id]"
														@click="adjustStock(card.raw, STOCK_STEP_KG)">
														<v-icon icon="mdi-plus"></v-icon>
													</v-btn>
												</div>
											</div>
										</div>
										<div class="stock-metric text-right">
											<p class="metric-label">Stock mínimo</p>
											<p class="metric-value">{{ card.stockMinimumLabel }}</p>
										</div>
									</div>
									<v-progress-linear class="stock-progress" :model-value="card.progress"
										:color="card.status.progressColor" height="8" rounded></v-progress-linear>

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
											<span class="detail-label">Ganancia por kg</span>
											<span class="detail-value highlight">{{ card.profitPerKgLabel }}</span>
										</div>
										<div class="detail-pair">
											<span class="detail-label">Ganancia total</span>
											<span class="detail-value highlight">{{ card.profitTotalLabel }}</span>
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
												<p class="detail-value muted">{{ "Ingreso: " + card.ingresoLabel }}</p>
											</div>
										</div>
										<div class="detail-row">
											<v-icon icon="mdi-calendar-alert" size="18" color="warning"></v-icon>
											<div>
												<p class="detail-value muted">{{ "Vence: " + card.venceLabel }}</p>
											</div>
										</div>
									</div>
								</v-card>
							</v-col>
						</v-row>

						<div class="pagination-block" v-if="pagination.lastPage > 1">
							<v-pagination v-model="pagination.page" :length="pagination.lastPage" :total-visible="5"
								color="success"></v-pagination>
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
					<v-btn icon="mdi-close" variant="text" color="grey-darken-1" class="modal-shell__dismiss"
						@click="closeFormDialog"></v-btn>
				</div>
				<div class="modal-shell__divider"></div>
				<div class="modal-shell__body">
					<v-form ref="productFormRef" class="modal-shell__form" @submit.prevent="submitProducto">
						<v-alert v-if="formError" type="error" variant="tonal" border="start" border-color="error"
							class="modal-shell__alert">
							{{ formError }}
						</v-alert>
						<div class="modal-shell__content">
							<div class="modal-form-grid">
								<v-text-field v-model="productForm.nombre" label="Nombre del producto"
									variant="outlined" density="comfortable" color="success" :rules="[requiredRule]"
									class="modal-form-grid__item modal-form-grid__item--full modal-form-grid__item--top-gap"></v-text-field>
								<v-select v-model="productForm.categoria_id" :items="categorySelectItems"
									item-title="title" item-value="value" label="Categoría" variant="outlined"
									density="comfortable" color="success" :rules="[requiredRule]"></v-select>
								<v-select v-model="productForm.proveedor_id" :items="providerSelectItems"
									item-title="title" item-value="value" label="Proveedor" variant="outlined"
									density="comfortable" color="success" :rules="[requiredRule]"></v-select>
								<v-text-field v-model="productForm.kilogramos" type="number" label="Cantidad (kg)"
									variant="outlined" density="comfortable" color="success" min="0" step="0.001"
									:rules="[requiredRule]" class="modal-form-grid__item"></v-text-field>
								<v-text-field v-model="productForm.desperdicio" type="number" label="Desperdicio (kg)"
									variant="outlined" density="comfortable" color="success" min="0" step="0.001"
									class="modal-form-grid__item"></v-text-field>
								<v-text-field v-model="productForm.precio_compra_total" type="number"
									label="Precio total de compra ($)" variant="outlined" density="comfortable"
									color="success" min="0" step="0.01" :rules="[requiredRule]"
									class="modal-form-grid__item"></v-text-field>
								<v-text-field :model-value="purchasePricePerKg" type="number"
									label="Precio de compra por kg ($)" variant="outlined" density="comfortable"
									color="success" min="0" step="0.0001" readonly
									class="modal-form-grid__item"></v-text-field>
								<v-text-field v-model="productForm.precio_venta_kg" type="number"
									label="Precio de venta por kg ($)" variant="outlined" density="comfortable"
									color="success" min="0" step="0.01" :rules="[requiredRule]"
									class="modal-form-grid__item"></v-text-field>
								<div class="modal-form-grid__item modal-form-grid__item--full modal-form-grid__pair">
									<div class="frescura-field">
										<p class="frescura-field__label">Vida útil</p>
										<v-radio-group v-model="productForm.frescura_modo" inline color="success"
											class="frescura-field__options">
											<v-radio label="Días" value="dias"></v-radio>
											<v-radio label="Fecha exacta" value="fecha"></v-radio>
										</v-radio-group>
										<v-text-field v-if="productForm.frescura_modo === 'dias'"
											v-model="productForm.frescura_dias" type="number" min="1" step="1"
											label="Días de frescura" variant="outlined" density="comfortable" color="success"
											class="frescura-field__input"></v-text-field>
										<v-text-field v-else v-model="productForm.frescura_fecha" type="date"
											label="Fecha  de vida útil" variant="outlined" density="comfortable" color="success"
											class="frescura-field__input"></v-text-field>
									</div>
									<div class="stock-slider-field">
										<div class="stock-slider-field__header">
											<span>Stock mínimo</span>
											<strong>{{ formatKilograms(productForm.stock_minimo ?? STOCK_MIN_KG)
											}}</strong>
										</div>
										<v-text-field v-model.number="productForm.stock_minimo" type="number"
											label="Stock mínimo (kg)" variant="outlined" density="comfortable" color="success"
											min="0" step="0.1" hide-details></v-text-field>
										<p class="stock-slider-field__hint">
											Define el umbral que detonará las alertas de bajo stock para este producto.
										</p>
									</div>
								</div>
								<v-textarea v-model="productForm.detalle" label="Detalle o notas" variant="outlined"
									density="comfortable" rows="3"
									class="modal-form-grid__item modal-form-grid__item--full"></v-textarea>
							</div>
						</div>
						<div class="modal-shell__actions">
							<v-btn variant="text" color="grey-darken-1" class="modal-shell__ghost"
								@click="closeFormDialog">
								Cancelar
							</v-btn>
							<v-btn type="submit" class="modal-shell__cta primary-gradient-btn" :loading="formLoading"
								:prepend-icon="editingProducto ? 'mdi-content-save-edit' : 'mdi-content-save'">
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

const requiredRule = (value) => !!String(value ?? '').trim() || 'Este campo es obligatorio'
const INVENTORY_PAGE_SIZE = 12
const STOCK_MIN_KG = 10
const STOCK_STEP_KG = 1
const EXPIRY_WARNING_DAYS = 3
const DEFAULT_SHELF_LIFE_DAYS = 7
const ONE_DAY_MS = 1000 * 60 * 60 * 24
const STOCK_THRESHOLD_STORAGE_KEY = 'inventory.stockThresholds'

// --- ESTADOS ---
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
const snackbar = reactive({ show: false, message: '', color: 'success' })
const localStockThresholds = ref({})
const inlineStockLoading = ref({})
const suppressPageWatch = ref(false)
let searchDebounce = null

const categoriaOptions = computed(() => [
	{ title: 'Todas las categorias', value: 'all' },
	...categorias.value.map((cat) => ({
		title: cat.nombre || 'Sin nombre',
		value: cat.id
	}))
])

const estadoOptions = [
	{ title: 'Todos los estados', value: 'all' },
	{ title: 'Stock bajo', value: 'low' },
	{ title: 'Por vencer', value: 'expiring' },
	{ title: 'Vencido', value: 'expired' },
	{ title: 'Saludable', value: 'healthy' },
]

const hasInventory = computed(() => productosRaw.value.length > 0)
const isFilteringActive = computed(() =>
	!!searchQuery.value.trim() || categoriaFiltro.value !== 'all' || estadoFiltro.value !== 'all'
)

const getDefaultForm = () => ({
	nombre: '',
	categoria_id: null,
	proveedor_id: null,
	kilogramos: '',
	desperdicio: 0,
	precio_compra_total: '',
	precio_venta_kg: '',
	frescura_modo: 'dias',
	frescura_dias: DEFAULT_SHELF_LIFE_DAYS,
	frescura_fecha: '',
	detalle: '',
	stock_minimo: STOCK_MIN_KG,
})

const productForm = ref(getDefaultForm())

// --- FORMATEADORES ---
const currencyFormatter = new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' })
const kilosFormatter = new Intl.NumberFormat('es-EC', { minimumFractionDigits: 2 })
const dateFormatter = new Intl.DateTimeFormat('es-EC', { day: '2-digit', month: 'short', year: 'numeric' })

const formatCurrency = (value) => currencyFormatter.format(Number(value) || 0)
const formatKilograms = (value) => `${kilosFormatter.format(Math.max(0, Number(value) || 0))} kg`
const formatDate = (value) => value ? dateFormatter.format(new Date(value)) : 'Sin fecha'

const purchasePricePerKg = computed(() => {
	const kilos = Number(productForm.value.kilogramos) || 0
	const total = Number(productForm.value.precio_compra_total) || 0
	if (kilos <= 0) return 0
	return Number((total / kilos).toFixed(2))
})

const parseDetalle = (detalle) => {
	if (!detalle || typeof detalle !== 'string') return { nota: '', frescura: null }
	const trimmed = detalle.trim()
	if (!trimmed) return { nota: '', frescura: null }
	if (trimmed.startsWith('{')) {
		try {
			const parsed = JSON.parse(trimmed)
			if (parsed && typeof parsed === 'object') {
				return {
					nota: typeof parsed.nota === 'string' ? parsed.nota : '',
					frescura: parsed.frescura || null
				}
			}
		} catch (error) {
			return { nota: trimmed, frescura: null }
		}
	}
	return { nota: trimmed, frescura: null }
}

const buildDetallePayload = (nota, frescura) => {
	const cleanNota = String(nota ?? '').trim()
	if (frescura) {
		return JSON.stringify({ nota: cleanNota || '', frescura })
	}
	return cleanNota || null
}

const buildFrescuraPayload = () => {
	if (productForm.value.frescura_modo === 'fecha') {
		const fecha = String(productForm.value.frescura_fecha || '').trim()
		return fecha ? { modo: 'fecha', fecha } : null
	}
	const dias = Number(productForm.value.frescura_dias)
	return dias > 0 ? { modo: 'dias', dias } : null
}

const computeExpiryDate = (producto) => {
	const { frescura } = parseDetalle(producto?.detalle)
	if (!frescura) return null
	if (frescura.modo === 'fecha' && frescura.fecha) {
		const fecha = new Date(frescura.fecha)
		return Number.isNaN(fecha.getTime()) ? null : fecha
	}
	if (frescura.modo === 'dias' && frescura.dias) {
		const base = producto?.created_at ? new Date(producto.created_at) : null
		if (!base || Number.isNaN(base.getTime())) return null
		return new Date(base.getTime() + Number(frescura.dias) * ONE_DAY_MS)
	}
	return null
}

const loadLocalStockThresholds = () => {
	try {
		const raw = localStorage.getItem(STOCK_THRESHOLD_STORAGE_KEY)
		const parsed = raw ? JSON.parse(raw) : {}
		localStockThresholds.value = parsed && typeof parsed === 'object' ? parsed : {}
	} catch (error) {
		localStockThresholds.value = {}
	}
}

const persistLocalStockThresholds = () => {
	localStorage.setItem(STOCK_THRESHOLD_STORAGE_KEY, JSON.stringify(localStockThresholds.value))
}

const setLocalStockThreshold = (productoId, value) => {
	if (!productoId) return
	localStockThresholds.value = {
		...localStockThresholds.value,
		[String(productoId)]: Number(value) || STOCK_MIN_KG
	}
	persistLocalStockThresholds()
}

const getLocalStockThreshold = (productoId) => {
	if (!productoId) return STOCK_MIN_KG
	const stored = localStockThresholds.value[String(productoId)]
	return Number.isFinite(Number(stored)) ? Number(stored) : STOCK_MIN_KG
}

// --- LLAMADAS A RUTAS (ESTILO PROVEEDORES) ---

const fetchProveedores = async () => {
	try {
		const response = await $fetch(`${API_URL}/proveedores`, { method: 'GET', ...fetchConfig })
		proveedores.value = response?.data || response || []
	} catch (error) {
		console.warn('Error proveedores:', error)
	}
}

const categorySelectItems = computed(() => {
	return categorias.value.map((cat) => ({
		title: cat.nombre || 'Sin nombre', // Lo que el usuario ve
		value: cat.id                      // Lo que se guarda en la base de datos
	}))
})

const fetchProductos = async (page = pagination.page) => {
	productosLoading.value = true
	productosError.value = ''
	try {
		suppressPageWatch.value = true
		pagination.page = page
		const queryParams = new URLSearchParams({
			page: String(page),
			por_pagina: String(pagination.perPage),
		})

		if (searchQuery.value.trim()) queryParams.set('busqueda', searchQuery.value.trim())
		if (categoriaFiltro.value !== 'all') queryParams.set('categoria_id', String(categoriaFiltro.value))

		const response = await $fetch(`${API_URL}/productos?${queryParams.toString()}`, {
			method: 'GET',
			...fetchConfig
		})

		productosRaw.value = response?.data || response || []

		const meta = response?.meta || response?.data?.meta
		if (meta) {
			pagination.lastPage = meta.last_page || 1
			pagination.total = meta.total || productosRaw.value.length
		}
	} catch (error) {
		if (error.status === 401) await navigateTo('/login')
		productosRaw.value = []
		productosError.value = 'No se pudo cargar el inventario.'
	} finally {
		suppressPageWatch.value = false
		productosLoading.value = false
	}
}

const fetchCategorias = async () => {
	try {
		const response = await $fetch(`${API_URL}/categorias`, {
			method: 'GET',
			params: { per_page: 100 }, // Traer suficientes categorías
			...fetchConfig
		})

		// Laravel suele enviar la lista en 'data' o directamente en el body
		const lista = response?.data || response || []
		categorias.value = Array.isArray(lista) ? lista : []

		console.log("Categorías cargadas para el select:", categorias.value)
	} catch (error) {
		console.warn('Error al cargar categorías en inventario:', error)
	}
}

const confirmDelete = async () => {
	if (!productoSeleccionado.value?.id) return
	deleteLoading.value = true
	try {
		await $fetch(`${API_URL}/productos/${productoSeleccionado.value.id}`, {
			method: 'DELETE',
			...fetchConfig
		})
		showSnackbar('Producto eliminado correctamente')
		deleteDialog.value = false
		await fetchProductos(pagination.page)
	} catch (error) {
		showSnackbar('No se pudo eliminar el producto', 'error')
	} finally {
		deleteLoading.value = false
	}
}

// --- FUNCIONES DE DIÁLOGO (AÑADIR O REEMPLAZAR) ---

// Esta es la función que llama tu botón "Nuevo Producto"
const openCreateDialog = () => {
	editingProducto.value = null
	productForm.value = getDefaultForm() // Reinicia el formulario
	formError.value = ''
	formDialog.value = true // Abre el v-dialog
}

// Función para cerrar el diálogo limpiando estados
const closeFormDialog = () => {
	formDialog.value = false
	editingProducto.value = null
	productForm.value = getDefaultForm()
}

// Función corregida para editar
const openEditDialog = (producto) => {
	editingProducto.value = producto
	const parsedDetalle = parseDetalle(producto?.detalle)
	const stockMinimo = getLocalStockThreshold(producto?.id)
	// Mapeamos los datos del producto al formulario
	productForm.value = {
		nombre: producto.nombre,
		categoria_id: producto.categoria_id,
		proveedor_id: producto.proveedor_id,
		kilogramos: producto.kilogramos,
		desperdicio: producto.desperdicio || 0,
		precio_compra_total: Number(producto.precio_compra || 0) * Number(producto.kilogramos || 0),
		precio_venta_kg: producto.precio_venta_kg,
		frescura_modo: parsedDetalle.frescura?.modo || 'dias',
		frescura_dias: parsedDetalle.frescura?.modo === 'dias'
			? Number(parsedDetalle.frescura?.dias || DEFAULT_SHELF_LIFE_DAYS)
			: DEFAULT_SHELF_LIFE_DAYS,
		frescura_fecha: parsedDetalle.frescura?.modo === 'fecha'
			? String(parsedDetalle.frescura?.fecha || '')
			: '',
		detalle: parsedDetalle.nota || '',
		stock_minimo: stockMinimo,
	}
	formError.value = ''
	formDialog.value = true
}


// --- LÓGICA DE INTERFAZ ---

const productCards = computed(() =>
	productosRaw.value.map((p, index) => {
		const kilosNetos = Number(p.kilogramos_netos ?? p.kilogramos ?? p.kilo ?? 0)
		const kilos = Math.max(kilosNetos, 0)
		const stockMin = getLocalStockThreshold(p.id)
		const expiryDate = computeExpiryDate(p)
		const now = Date.now()
		const daysToExpire = expiryDate ? Math.ceil((expiryDate.getTime() - now) / ONE_DAY_MS) : null
		const isExpired = daysToExpire !== null && daysToExpire < 0
		const isExpiringSoon = daysToExpire !== null && daysToExpire <= EXPIRY_WARNING_DAYS && daysToExpire >= 0
		const isLowStock = kilos <= stockMin
		const saleUnit = Number(p.precio_venta_kg || 0)
		const saleTotal = Number(p.precio_venta_total ?? (kilos * saleUnit))
		const basePrice = Number(p.precio_compra || 0)
		const profitPerKg = saleUnit - basePrice
		const profitTotal = profitPerKg * kilos
		let status = {
			label: 'Saludable',
			styleKey: 'is-healthy',
			icon: 'mdi-leaf',
			progressColor: 'success',
			weight: 2
		}
		if (isLowStock) {
			status = { label: 'Stock bajo', styleKey: 'is-low', icon: 'mdi-alert', progressColor: 'error', weight: 0 }
		} else if (isExpired) {
			status = { label: 'Vencido', styleKey: 'is-expiring', icon: 'mdi-alert-circle', progressColor: 'error', weight: 1 }
		} else if (isExpiringSoon) {
			status = { label: 'Por vencer', styleKey: 'is-expiring', icon: 'mdi-alarm', progressColor: 'warning', weight: 1 }
		}

		return {
			id: p.id || index,
			raw: p,
			name: p.nombre || 'Sin nombre',
			category: p.categoria_nombre || p.categoria?.nombre || 'General',
			provider: p.proveedor_nombre || p.proveedor?.nombre || 'S/P',
			badge: p.categoria?.emoji || p.categoria_emoji || (p.categoria_nombre || p.categoria?.nombre || '').charAt(0) || '📦',
			kilosLabel: formatKilograms(kilos),
			stockMinimumLabel: formatKilograms(stockMin),
			purchaseLabel: formatCurrency(basePrice),
			saleLabel: formatCurrency(saleUnit),
			profitPerKgLabel: formatCurrency(profitPerKg),
			profitTotalLabel: formatCurrency(profitTotal),
			ingresoLabel: formatDate(p.created_at),
			venceLabel: expiryDate ? formatDate(expiryDate) : 'Revisar stock',
			status,
			isExpiring: isExpiringSoon,
			isExpired,
			isLowStock,
			progress: Math.min((kilos / (stockMin * 2)) * 100, 100)
		}
	})
)

const filteredCards = computed(() => {
	let cards = productCards.value
	const query = searchQuery.value.trim().toLowerCase()
	if (query) {
		cards = cards.filter((c) => {
			const name = String(c.name || '').toLowerCase()
			const provider = String(c.provider || '').toLowerCase()
			return name.includes(query) || provider.includes(query)
		})
	}

	if (estadoFiltro.value === 'low') {
		cards = cards.filter(c => c.isLowStock)
	} else if (estadoFiltro.value === 'expiring') {
		cards = cards.filter(c => c.isExpiring && !c.isExpired)
	} else if (estadoFiltro.value === 'expired') {
		cards = cards.filter(c => c.isExpired)
	} else if (estadoFiltro.value === 'healthy') {
		cards = cards.filter(c => !c.isLowStock && !c.isExpiring && !c.isExpired)
	}

	if (categoriaFiltro.value !== 'all') cards = cards.filter(c => String(c.raw.categoria_id) === String(categoriaFiltro.value))
	return cards
})

const providerSelectItems = computed(() => {
	return proveedores.value.map((prov) => ({
		title: prov.nombre || 'Proveedor sin nombre', // Lo que el usuario lee
		value: prov.id                                // El ID que se envía al backend
	}))
})

const lowStockProducts = computed(() => productCards.value.filter(c => c.status.weight === 0))
const hasLowStockAlerts = computed(() => lowStockProducts.value.length > 0)
const expiringProducts = computed(() => productCards.value.filter(c => c.isExpiring))
const hasExpiringAlerts = computed(() => expiringProducts.value.length > 0)

const showSnackbar = (message, color = 'success') => {
	snackbar.message = message
	snackbar.color = color
	snackbar.show = true
}

const adjustStock = async (producto, delta) => {
	if (!producto?.id) return
	const current = Number(producto.kilogramos || 0)
	const next = Math.max(0, current + Number(delta || 0))
	if (next === current) return

	inlineStockLoading.value = { ...inlineStockLoading.value, [producto.id]: true }
	try {
		await $fetch(`${API_URL}/productos/${producto.id}`, {
			method: 'PUT',
			body: { kilogramos: next },
			...fetchConfig
		})
		producto.kilogramos = next
		const desperdicio = Number(producto.desperdicio || 0)
		producto.kilogramos_netos = Math.max(next - desperdicio, 0)
		showSnackbar('Cantidad actualizada')
	} catch (error) {
		showSnackbar('No se pudo actualizar la cantidad', 'error')
	} finally {
		inlineStockLoading.value = { ...inlineStockLoading.value, [producto.id]: false }
	}
}

const submitProducto = async () => {
	formError.value = ''
	formLoading.value = true

	const payload = {
		nombre: productForm.value.nombre.trim(),
		categoria_id: Number(productForm.value.categoria_id),
		proveedor_id: Number(productForm.value.proveedor_id),
		kilogramos: Number(productForm.value.kilogramos),
		precio_compra: Number(purchasePricePerKg.value.toFixed(2)),
		precio_venta_kg: Number(productForm.value.precio_venta_kg),
		desperdicio: Number(productForm.value.desperdicio) || 0,
		detalle: buildDetallePayload(productForm.value.detalle, buildFrescuraPayload())
	}

	try {
		const isEdit = !!editingProducto.value?.id
		const url = isEdit ? `${API_URL}/productos/${editingProducto.value.id}` : `${API_URL}/productos`

		const response = await $fetch(url, {
			method: isEdit ? 'PUT' : 'POST',
			body: payload,
			...fetchConfig
		})

		const persistedId = isEdit
			? editingProducto.value?.id
			: response?.data?.id
		if (persistedId) {
			setLocalStockThreshold(persistedId, productForm.value.stock_minimo)
		}

		showSnackbar(isEdit ? 'Producto actualizado' : 'Producto registrado')
		formDialog.value = false
		await fetchProductos(1)
	} catch (error) {
		// Esto te mostrará en pantalla exactamente qué campo falló
		if (error.status === 422) {
			const firstError = Object.values(error.data.errors)[0][0]
			formError.value = firstError
		} else {
			formError.value = 'Error al guardar el producto.'
		}
	} finally {
		formLoading.value = false
	}
}

const openDeleteDialog = (p) => { productoSeleccionado.value = p; deleteDialog.value = true }
const closeDeleteDialog = () => deleteDialog.value = false
const refreshInventario = () => fetchProductos(1)

// --- WATCHERS Y LIFECYCLE ---
watch(searchQuery, () => {
	if (searchDebounce) clearTimeout(searchDebounce)
	searchDebounce = setTimeout(() => fetchProductos(1), 500)
})

watch(categoriaFiltro, () => fetchProductos(1))

watch(estadoFiltro, () => fetchProductos(1))

watch(() => pagination.page, (page) => {
	if (suppressPageWatch.value) return
	fetchProductos(page)
})

onMounted(() => {
	loadLocalStockThresholds()
	fetchCategorias()
	fetchProveedores()
	fetchProductos()
})

onBeforeUnmount(() => {
	if (searchDebounce) clearTimeout(searchDebounce)
})

const generarReporteRapido = async (tipo) => {
  try {
    const params = new URLSearchParams()
    
    // Aplicar filtros actuales
    if (categoriaFiltro.value !== 'all') {
      params.append('categoria_id', categoriaFiltro.value)
    }
    
    // Usar ruta sin /api/
    const url = `${API_URL}/reportes/${tipo}?${params.toString()}`
    console.log('Generando reporte rápido:', url)
    
    window.open(url, '_blank')
    
  } catch (error) {
    console.error('Error generando reporte rápido:', error)
    showSnackbar('Error al generar reporte', 'error')
  }
}

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

:deep(.action-btn.v-btn) {
	min-height: 35px;
	height: 35px;
	width: 190px;
	min-width: 190px;
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

.status-banner+.product-card__header {
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

.metric-value--wide {
	min-width: 90px;
}

.metric-inline {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 8px;
}

.stock-adjust {
	display: inline-flex;
	gap: 6px;
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

.frescura-field {
	display: flex;
	flex-direction: column;
	gap: 10px;
	border: 1.5px solid rgba(15, 138, 78, 0.16);
	border-radius: 16px;
	background: linear-gradient(180deg, #f9fefb 0%, #f2fbf6 100%);
	padding: 14px 16px 10px;
}

.frescura-field__label {
	margin: 0;
	font-size: 0.78rem;
	letter-spacing: 0.12em;
	text-transform: uppercase;
	color: #55685f;
}

.frescura-field__options :deep(.v-selection-control) {
	margin-right: 16px;
}

.frescura-field__input {
	margin-top: -4px;
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

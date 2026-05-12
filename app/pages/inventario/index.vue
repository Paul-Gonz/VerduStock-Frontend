<template>
  <div class="inventario-page p-6 flex flex-col gap-6">
    <!-- Stats Panel -->
    <StatsPanel :stats="panelStats" />

    <!-- Integrated Table Card -->
    <div
      class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 flex flex-col">

      <!-- Unified Header Section -->
      <div
        class="p-4 sm:p-5 flex flex-col gap-5 border-b border-gray-100 dark:border-slate-800/60 bg-gray-50/30 dark:bg-transparent">

        <!-- Search and Main Actions -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div class="w-full flex-1">
            <BaseSearch v-model="searchQuery" placeholder="Buscar por nombre o proveedor..." class="w-full" />
          </div>

          <div class="flex items-center gap-3 w-full sm:w-auto justify-end">
            <NuxtLink to="/reportes"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm">
              <span class="mdi mdi-chart-box"></span>
              Reportes
            </NuxtLink>
            <button @click="openModal()"
              class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm">
              <span class="mdi mdi-plus-box"></span>
              Nuevo Producto
            </button>
          </div>
        </div>

        <!-- Filters and Bulk Actions -->
        <div class="flex flex-col sm:flex-row justify-between items-end gap-4 min-h-11">
          <div class="flex flex-wrap items-end gap-4 w-full sm:w-auto">
            <!-- Estado Filter -->
            <div class="flex flex-col gap-1.5 w-full sm:w-auto relative z-20">
              <span class="text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wide px-1">Estado
                del Producto</span>
              <BaseSelect v-model="filterCondition" :options="estadoOptions" class="w-full sm:w-50" />
            </div>

            <!-- Categoría Filter -->
            <div class="flex flex-col gap-1.5 w-full sm:w-auto relative z-19">
              <span
                class="text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wide px-1">Categoría</span>
              <BaseMultiSelect v-model="filterCategoria" :options="categorias" placeholder="Todas las categorías"
                class="w-full sm:w-50" />
            </div>

            <!-- Proveedor Filter -->
            <div class="flex flex-col gap-1.5 w-full sm:w-auto relative z-18">
              <span
                class="text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wide px-1">Proveedor</span>
              <BaseMultiSelect v-model="filterProveedor" :options="proveedores" placeholder="Todos los proveedores"
                class="w-full sm:w-50" />
            </div>

            <!-- Vencimiento Filter -->
            <div class="flex flex-col gap-1.5 w-full sm:w-auto relative z-17">
              <span
                class="text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wide px-1">Vencimiento</span>
              <BaseSelect v-model="filterVencimiento" :options="vencimientoOptions" class="w-full sm:w-50" />
            </div>

            <!-- Desperdicio Filter -->
            <div class="flex flex-col gap-1.5 w-full sm:w-auto relative z-16">
              <span
                class="text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wide px-1">Mermas</span>
              <BaseSelect v-model="filterDesperdicio" :options="desperdicioOptions" class="w-full sm:w-50" />
            </div>

            <!-- Rentabilidad Filter -->
            <div class="flex flex-col gap-1.5 w-full sm:w-auto relative z-15">
              <span
                class="text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wide px-1">Rentabilidad</span>
              <BaseSelect v-model="filterRentabilidad" :options="rentabilidadOptions" class="w-full sm:w-50" />
            </div>
          </div>

          <!-- Bulk Actions Toolbar -->
          <div v-if="selectedIds.size > 0"
            class="flex gap-2 items-center bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg border border-blue-100 dark:border-blue-900/50 w-full sm:w-auto justify-center shadow-sm">
            <span class="text-blue-800 dark:text-blue-400 font-medium text-sm px-1">{{ selectedIds.size }}
              seleccionado(s)</span>
            <div class="h-4 w-px bg-blue-200 dark:bg-blue-800 mx-1"></div>
            <button v-if="selectedIds.size === 1" @click="handleEditSelected"
              class="text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 text-sm font-medium transition-colors px-2">
              Editar
            </button>
            <button @click="handleBulkDelete"
              class="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm font-medium transition-colors px-2">
              Eliminar
            </button>
          </div>
        </div>
      </div>

      <!-- Main Table -->
      <BaseTable class="border-0 shadow-none bg-transparent! pt-4" :columns="columns" :rows="tableRows"
        :searchable="false" :loading="loading" :selectable="false" :showFooter="true"
        emptyText="No se encontraron productos">

        <template #stock_actual="{ row, value }">
          <div class="flex items-center gap-2 group min-h-7">
            <span class="font-medium text-gray-800 dark:text-slate-200">{{ Number(value).toFixed(2) }} kg</span>
            <div class="flex items-center ml-1" v-if="editingStockId !== row.id">
              <button @click.stop="openStockAdjust(row, 'subtract')"
                class="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                title="Restar stock">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                </svg>
              </button>
              <button @click.stop="openStockAdjust(row, 'add')"
                class="p-1.5 text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-md transition-colors"
                title="Sumar stock">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            <!-- Inline Stock Adjust Edit -->
            <div v-else
              class="flex items-center gap-1 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm px-1.5 py-1"
              @click.stop>
              <span class="text-[11px] font-bold"
                :class="stockAdjustmentType === 'add' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
                {{ stockAdjustmentType === 'add' ? '+' : '-' }}
              </span>
              <input v-model="stockAdjustmentValue" type="number" min="0.01" step="0.01"
                class="w-14 text-sm border-b border-gray-300 dark:border-slate-600 focus:border-green-500 dark:focus:border-green-500 bg-transparent dark:text-white focus:outline-none px-0.5 text-center"
                placeholder="Cant." @keyup.enter="submitStockAdjust(row)" @keyup.esc="cancelStockAdjust" autofocus />
              <button @click.stop="submitStockAdjust(row)"
                class="text-green-600 dark:text-green-400 p-0.5 hover:bg-green-50 dark:hover:bg-green-900/20 rounded">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </button>
              <button @click.stop="cancelStockAdjust"
                class="text-gray-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 p-0.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </template>

        <template #precio_compra="{ value }">
          <span class="text-red-600 dark:text-red-400 font-medium">${{ Number(value).toFixed(2) }}</span>
        </template>
        <template #precio_venta="{ value }">
          <span class="text-emerald-600 dark:text-emerald-400 font-medium">${{ Number(value).toFixed(2) }}</span>
        </template>

        <template #estado="{ value }">
          <span :class="estadoBadgeClass(value)"
            class="px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap">
            {{ estadoLabel(value) }}
          </span>
        </template>

        <template #acciones="{ row }">
          <div class="flex items-center gap-1">
            <button @click.stop="selectedProduct = row"
              class="text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 p-1 transition-colors"
              title="Ver detalle">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
            <button @click.stop="openModal(row)"
              class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 p-1 transition-colors"
              title="Editar">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button @click.stop="deleteSingle(row)"
              class="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-1 transition-colors"
              title="Eliminar">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </template>
      </BaseTable>
    </div>

    <BaseModal :isOpen="isModalOpen" @close="closeModal" :title="isEditing ? 'Editar Producto' : 'Nuevo Producto'"
      maxWidth="max-w-[700px]">
      <div class="p-4">
        <form @submit.prevent="handleSubmit" class="flex flex-col gap-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="flex flex-col gap-1 col-span-2">
              <label class="text-sm font-medium text-gray-700 dark:text-slate-300">Nombre del producto</label>
              <input v-model="formData.nombre" type="text" required
                class="border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 dark:text-white" />
            </div>

            <div class="flex flex-col gap-1">
              <label class="text-sm font-medium text-gray-700 dark:text-slate-300">Categoría</label>
              <select v-model="formData.categoria_id" required
                class="border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 dark:text-white">
                <option value="" disabled>Seleccione una categoría</option>
                <option v-for="cat in categorias" :key="cat.id" :value="cat.id">
                  {{ cat.nombre }}
                </option>
              </select>
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-sm font-medium text-gray-700 dark:text-slate-300">Proveedor</label>
              <select v-model="formData.proveedor_id" required
                class="border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 dark:text-white">
                <option value="" disabled>Seleccione un proveedor</option>
                <option v-for="prov in proveedores" :key="prov.id" :value="prov.id">
                  {{ prov.nombre }}
                </option>
              </select>
            </div>

            <div class="flex flex-col gap-1">
              <label class="text-sm font-medium text-gray-700 dark:text-slate-300">Stock Mínimo</label>
              <input v-model="formData.stock_minimo" type="number" step="0.01" required
                class="border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 dark:text-white" />
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-sm font-medium text-gray-700 dark:text-slate-300">Cantidad Comprada (Kg) <span
                  class="text-xs text-gray-400 dark:text-slate-500 font-normal">Bruto</span></label>
              <input v-model="cantidadBruta" type="number" step="0.01" required
                class="border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 dark:text-white" />
            </div>

            <div class="flex flex-col gap-1">
              <label class="text-sm font-medium text-gray-700 dark:text-slate-300">Desperdicio (Kg) <span
                  class="text-xs text-gray-400 dark:text-slate-500 font-normal cursor-pointer"
                  title="Auto-calculado al 5% pero puedes ajustarlo">(~5%)</span></label>
              <input v-model="desperdicioKg" type="number" step="0.01"
                class="border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 dark:text-white" />
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-sm font-medium text-gray-700 dark:text-slate-300">Stock Inicial (Kg) <span
                  class="text-xs text-gray-400 dark:text-slate-500 font-normal">Neto</span></label>
              <input v-model="formData.kilogramos" type="number" step="0.01" required readonly
                class="border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 bg-gray-50 dark:bg-slate-900 text-gray-600 dark:text-slate-400 outline-none cursor-not-allowed" />
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-sm font-medium text-gray-700 dark:text-slate-300">Stock Actual (Kg)</label>
              <input v-model="formData.stock_actual" type="number" step="0.01" required
                class="border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 dark:text-white" />
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-sm font-medium text-gray-700 dark:text-slate-300">Costo Total Compra ($)</label>
              <input v-model="costoTotalCompra" type="number" step="0.01" required
                class="border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 dark:text-white"
                placeholder="Pago total al proveedor" />
            </div>

            <div class="flex flex-col gap-1">
              <label class="text-sm font-medium text-gray-700 dark:text-slate-300">Precio de Compra por Kg ($)</label>
              <input v-model="formData.precio_compra" type="number" step="0.01" required readonly
                class="border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 bg-gray-50 dark:bg-slate-900 text-gray-600 dark:text-slate-400 outline-none cursor-not-allowed" />
            </div>

            <div class="flex flex-col gap-1">
              <label class="text-sm font-medium text-gray-700 dark:text-slate-300">Precio Venta por Kg ($)</label>
              <input v-model="formData.precio_venta_kg" type="number" step="0.01" required
                class="border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 dark:text-white" />
            </div>

            <div class="flex flex-col gap-2 col-span-2 mt-2">
              <label
                class="text-sm font-medium text-gray-700 dark:text-slate-300 border-b dark:border-slate-700 pb-1">Vencimiento</label>
              <div class="flex gap-4 items-center">
                <label class="flex items-center gap-1 text-sm cursor-pointer dark:text-slate-300">
                  <input type="radio" v-model="vencimientoMode" value="Días" class="accent-green-600" /> Días
                </label>
                <label class="flex items-center gap-1 text-sm cursor-pointer dark:text-slate-300">
                  <input type="radio" v-model="vencimientoMode" value="Calendario" class="accent-green-600" />
                  Calendario
                </label>
                <label class="flex items-center gap-1 text-sm cursor-pointer dark:text-slate-300">
                  <input type="radio" v-model="vencimientoMode" value="No aplica" class="accent-green-600" /> No aplica
                </label>
              </div>

              <div v-if="vencimientoMode === 'Días'" class="mt-1">
                <input v-model.number="vencimientoDias" type="number" min="1" placeholder="Cantidad de días"
                  class="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 dark:text-white" />
              </div>
              <div v-else-if="vencimientoMode === 'Calendario'" class="mt-1">
                <input v-model="vencimientoFecha" type="date"
                  class="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 dark:text-white dark:color-scheme:dark" />
              </div>
            </div>
          </div>
        </form>
      </div>

      <template #footer>
        <div class="flex gap-3 justify-end w-full border-t border-gray-100 dark:border-slate-800 p-4">
          <button type="button" @click="closeModal"
            class="px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">Cancelar</button>
          <button @click="handleSubmit" :disabled="formLoading"
            class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2">
            <span v-if="formLoading"
              class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            {{ isEditing ? 'Actualizar' : 'Guardar' }}
          </button>
        </div>
      </template>
    </BaseModal>

    <!-- Product Drawer -->
    <ProductDrawer :isOpen="!!selectedProduct" :product="selectedProduct" @close="selectedProduct = null"
      @edit="(row) => { selectedProduct = null; openModal(row) }" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useProducts } from '~/composables/useProducts'

const {
  tableRows,
  loading,
  searchQuery,
  filterCondition,
  filterCategoria,
  filterProveedor,
  filterVencimiento,
  filterDesperdicio,
  filterRentabilidad,
  fetchProductos,
  createProducto,
  updateProducto,
  deleteProducto,
  stats
} = useProducts()

// Select options para filtros
const estadoOptions = [
  { value: 'todos', label: 'Todos los estados' },
  { value: 'por_vencer', label: 'Por vencer (7 días)' },
  { value: 'vencidos', label: 'Vencidos' },
  { value: 'stock_bajo', label: 'Stock bajo' },
  { value: 'agotados', label: 'Agotados (0 Kg)' }
]

const vencimientoOptions = [
  { value: 'todas', label: 'Todas las fechas' },
  { value: 'este_mes', label: 'Vencen este mes' },
  { value: 'proximos_30_dias', label: 'Próximos 30 días' }
]

const desperdicioOptions = [
  { value: 'todos', label: 'Todos los niveles' },
  { value: 'alto', label: 'Alta (>10%)' },
  { value: 'normal', label: 'Normal (1-10%)' },
  { value: 'cero', label: 'Sin mermas' }
]

const rentabilidadOptions = [
  { value: 'todas', label: 'Todos los márgenes' },
  { value: 'alta', label: 'Alta (>40%)' },
  { value: 'media', label: 'Media (15-40%)' },
  { value: 'baja', label: 'Baja (<15%)' }
]

// Estado badge helpers
const estadoBadgeClass = (estado: string) => ({
  'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400': estado === 'ok',
  'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400': estado === 'bajo',
  'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400': estado === 'por_vencer',
  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400': estado === 'vencido',
})
const estadoLabel = (estado: string) => ({
  ok: 'OK',
  bajo: 'Stock Bajo',
  por_vencer: 'Por Vencer',
  vencido: 'Vencido',
}[estado] ?? estado)

// Formato de moneda: $1.234,56
const formatCurrency = (value: number) =>
  '$' + value.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

// Datos para StatsPanel
const panelStats = computed(() => [
  { label: 'Total Productos', value: stats.value.total, icon: 'box' as const, color: 'green' as const },
  { label: 'Valor Inventario', value: formatCurrency(stats.value.totalValor), icon: 'money' as const, color: 'blue' as const },
  { label: 'Stock Bajo', value: stats.value.bajosCount, icon: 'warning' as const, color: 'amber' as const },
  { label: 'Alerta de vencimiento', value: stats.value.alertaCount, icon: 'calendar' as const, color: 'red' as const },
])

const isModalOpen = ref(false)
const isEditing = ref(false)
const formLoading = ref(false)
const selectedProduct = ref<any>(null)

const categorias = ref<any[]>([])
const proveedores = ref<any[]>([])
const selectedIds = ref(new Set<number>())

const vencimientoMode = ref('No aplica')
const vencimientoDias = ref<number | null>(null)
const vencimientoFecha = ref('')

const initialFormState = { id: '', nombre: '', categoria_id: '', proveedor_id: '', stock_minimo: '', kilogramos: '', stock_actual: '', precio_compra: '', precio_venta_kg: '', fecha_vencimiento: '' }
const formData = ref({ ...initialFormState })
const costoTotalCompra = ref<number | ''>('')

const cantidadBruta = ref<number | ''>('')
const desperdicioKg = ref<number | ''>('')
const suspendWatchers = ref(false)

watch(() => cantidadBruta.value, (newVal) => {
  if (suspendWatchers.value) return
  if (newVal && Number(newVal) > 0) {
    if (!isEditing.value) {
      desperdicioKg.value = Number((Number(newVal) * 0.05).toFixed(2))
    }
  } else {
    desperdicioKg.value = ''
  }
})

watch([() => cantidadBruta.value, () => desperdicioKg.value], ([bruta, desp]) => {
  if (suspendWatchers.value) return
  const b = Number(bruta || 0)
  const d = Number(desp || 0)
  if (b >= d) {
    const net = (Number((b - d).toFixed(2))).toString()
    formData.value.kilogramos = net
    if (!isEditing.value) formData.value.stock_actual = net
  } else {
    formData.value.kilogramos = ''
    if (!isEditing.value) formData.value.stock_actual = ''
  }
})

// Calcular precio_compra cuando cambian costoTotalCompra o kilogramos
watch([() => costoTotalCompra.value, () => formData.value.kilogramos], ([total, kg]) => {
  if (suspendWatchers.value) return
  if (Number(total) > 0 && Number(kg) > 0) {
    formData.value.precio_compra = (Number(total) / Number(kg)).toFixed(2)
  } else {
    formData.value.precio_compra = ''
  }
})

const columns = [
  { key: 'nombre', label: 'Producto' },
  { key: 'categoria', label: 'Categoría' },
  { key: 'proveedor', label: 'Proveedor' },
  { key: 'stock_actual', label: 'Stock Actual' },
  { key: 'precio_compra', label: 'Precio Compra' },
  { key: 'precio_venta', label: 'Precio Venta' },
  { key: 'estado', label: 'Estado' },
  { key: 'acciones', label: 'Acciones', align: 'left' as const }
]

const statusOptions = [
  { value: 'todos', label: 'Todos los estados' },
  { value: 'por_vencer', label: 'Por vencer (7 días)' },
  { value: 'vencidos', label: 'Vencidos' },
  { value: 'stock_bajo', label: 'Stock bajo' },
]

const loadDependencies = async () => {
  try {
    const { api } = useApi()

    // Usamos el hook useApi para manejar cookies y headers correctamente
    const [cats, provs] = await Promise.all([
      api('/categorias').catch(() => []),
      api('/proveedores').catch(() => [])
    ])

    const extractData = (res: any) => {
      if (Array.isArray(res)) return res;
      if (res && Array.isArray(res.data)) return res.data;
      return [];
    };

    categorias.value = extractData(cats)
    proveedores.value = extractData(provs)
  } catch (error) {
    console.error('Error fetching categories or providers:', error)
  }
}

onMounted(() => {
  loadDependencies()
  fetchProductos()
})

const onSelectionChange = (selection: any[]) => {
  selectedIds.value = new Set(selection.map(item => item.id))
}

const handleEditSelected = () => {
  if (selectedIds.value.size !== 1) return
  const idToEdit = Array.from(selectedIds.value)[0]
  const rowToEdit = tableRows.value.find((r: any) => r.id === idToEdit)
  if (rowToEdit) {
    openModal(rowToEdit)
  }
}

const handleBulkDelete = async () => {
  if (selectedIds.value.size === 0) return
  if (confirm(`¿Estás seguro de que quieres eliminar ${selectedIds.value.size} producto(s)?`)) {
    try {
      loading.value = true
      for (const id of selectedIds.value) {
        await deleteProducto(id)
      }
      selectedIds.value.clear()
      await fetchProductos()
    } catch (e) {
      console.error('Error in bulk delete:', e)
    } finally {
      loading.value = false
    }
  }
}

const deleteSingle = async (row: any) => {
  if (confirm(`¿Estás seguro de que quieres eliminar el producto "${row.nombre}"?`)) {
    try {
      loading.value = true
      await deleteProducto(row.id)
      await fetchProductos()
    } catch (e) {
      console.error('Error in delete:', e)
    } finally {
      loading.value = false
    }
  }
}

const formatDate = (dateString: string) => {
  if (!dateString || dateString === 'N/A') return 'N/A'
  const d = new Date(dateString)
  return isNaN(d.getTime()) ? dateString : d.toLocaleDateString()
}

const isExpired = (dateString: string) => {
  if (!dateString || dateString === 'N/A') return false
  return new Date(dateString) < new Date()
}
const isExpiring = (dateString: string) => {
  if (!dateString || dateString === 'N/A') return false
  const now = new Date()
  const exp = new Date(dateString)
  const diff = exp.getTime() - now.getTime()
  return diff > 0 && diff <= (7 * 24 * 60 * 60 * 1000)
}

const openModal = (row: any = null) => {
  suspendWatchers.value = true
  if (row) {
    isEditing.value = true
    formData.value = {
      id: row.id,
      nombre: row.nombre,
      categoria_id: row.raw?.categoria_id || row.categoria_id || '',
      proveedor_id: row.raw?.proveedor_id || row.proveedor_id || '',
      stock_minimo: row.stock_minimo,
      kilogramos: row.cantidad_disponible, stock_actual: row.stock_actual !== undefined ? row.stock_actual : row.cantidad_disponible, precio_compra: row.precio_compra,
      precio_venta_kg: row.precio_venta,
      fecha_vencimiento: '' // Computed below
    }

    const rawDesperdicio = Number(row.raw?.desperdicio) || 0
    cantidadBruta.value = Number(row.cantidad_disponible) + rawDesperdicio
    desperdicioKg.value = rawDesperdicio

    // Calcular costo total inverso para el pre-llenado si es edición
    costoTotalCompra.value = row.cantidad_disponible && row.precio_compra
      ? Number((Number(row.cantidad_disponible) * Number(row.precio_compra)).toFixed(2))
      : ''

    const dbFecha = row.fecha_vencimiento && row.fecha_vencimiento !== 'N/A' ? row.fecha_vencimiento : null
    if (dbFecha) {
      vencimientoMode.value = 'Calendario'
      // Format as YYYY-MM-DD for input type="date"
      vencimientoFecha.value = new Date(dbFecha).toISOString().split('T')[0] || ''
      vencimientoDias.value = null
    } else {
      vencimientoMode.value = 'No aplica'
      vencimientoFecha.value = ''
      vencimientoDias.value = null
    }
  } else {
    isEditing.value = false
    formData.value = { ...initialFormState }
    costoTotalCompra.value = ''
    cantidadBruta.value = ''
    desperdicioKg.value = ''
    vencimientoMode.value = 'No aplica'
    vencimientoFecha.value = ''
    vencimientoDias.value = null
  }
  isModalOpen.value = true
  setTimeout(() => { suspendWatchers.value = false }, 100)
}

const closeModal = () => {
  isModalOpen.value = false
  setTimeout(() => {
    formData.value = { ...initialFormState }
    cantidadBruta.value = ''
    desperdicioKg.value = ''
    costoTotalCompra.value = ''
  }, 200)
}

const calculateFechaVencimiento = () => {
  if (vencimientoMode.value === 'No aplica') return null
  if (vencimientoMode.value === 'Calendario') return vencimientoFecha.value || null
  if (vencimientoMode.value === 'Días' && vencimientoDias.value) {
    const d = new Date()
    d.setDate(d.getDate() + vencimientoDias.value)
    return d.toISOString().split('T')[0]
  }
  return null
}

const handleSubmit = async () => {
  formLoading.value = true
  try {
    const fn_vencimiento = calculateFechaVencimiento()

    // Obtener detalles previos si es una edición
    let detalleOriginal = {}
    if (isEditing.value) {
      const row = tableRows.value.find((r: any) => r.id === formData.value.id)
      if (row && row.raw && row.raw.detalle) {
        try { detalleOriginal = typeof row.raw.detalle === 'string' ? JSON.parse(row.raw.detalle) : row.raw.detalle }
        catch (e) { }
      }
    }

    // Asignar nueva fecha de vencimiento a los detalles
    const detalleObj = {
      ...detalleOriginal,
      fecha_vencimiento: fn_vencimiento,
      stock_actual: formData.value.stock_actual
    }

    const payload: any = {
      ...formData.value,
      desperdicio: Number(desperdicioKg.value) || 0,
      detalle: JSON.stringify(detalleObj)
    }
    delete payload.stock_actual // Asegurarse de que no de error SQL de columna inexistente en backend

    if (isEditing.value) {
      await updateProducto(Number(payload.id), payload)
    } else {
      await createProducto(payload)
    }

    closeModal()
    await fetchProductos()
  } catch (error) {
    console.error('Error guardando producto:', error)
    alert('Ocurrió un error al guardar el producto')
  } finally {
    formLoading.value = false
  }
}

// Lógica para ajuste rápido de stock
const editingStockId = ref<number | null>(null)
const stockAdjustmentType = ref<'add' | 'subtract'>('add')
const stockAdjustmentValue = ref<number | ''>('')
const stockAdjustLoading = ref(false)

const openStockAdjust = (row: any, type: 'add' | 'subtract') => {
  editingStockId.value = row.id
  stockAdjustmentType.value = type
  stockAdjustmentValue.value = ''
}

const cancelStockAdjust = () => {
  editingStockId.value = null
  stockAdjustmentValue.value = ''
}

const submitStockAdjust = async (row: any) => {
  if (!stockAdjustmentValue.value || Number(stockAdjustmentValue.value) <= 0) return

  stockAdjustLoading.value = true
  try {
    const raw = row.raw
    let detalleOriginal = {}
    if (typeof raw.detalle === 'string') {
      try { detalleOriginal = JSON.parse(raw.detalle) } catch (e) { }
    } else if (raw.detalle) {
      detalleOriginal = { ...raw.detalle }
    }

    const val = Number(stockAdjustmentValue.value)
    const currentStock = Number(row.stock_actual) || Number(row.cantidad_disponible)
    const newStock = stockAdjustmentType.value === 'add' ? currentStock + val : currentStock - val

    const detalleObj = {
      ...detalleOriginal,
      stock_actual: newStock
    }

    // Construimos el payload de actualización excluyendo el read-only stock_actual de la forma original
    const payload: any = {
      nombre: raw.nombre,
      categoria_id: raw.categoria_id,
      proveedor_id: raw.proveedor_id,
      stock_minimo: raw.stock_minimo,
      kilogramos: raw.kilogramos,
      precio_compra: raw.precio_compra,
      precio_venta_kg: raw.precio_venta_kg,
      desperdicio: raw.desperdicio,
      detalle: JSON.stringify(detalleObj)
    }

    await updateProducto(row.id, payload)
    await fetchProductos()
    cancelStockAdjust()
  } catch (error) {
    console.error('Error al actualizar inventario', error)
  } finally {
    stockAdjustLoading.value = false
  }
}
</script>
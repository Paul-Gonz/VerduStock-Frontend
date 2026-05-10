<template>
  <!-- Backdrop -->
  <Transition
    enter-active-class="transition-opacity duration-300"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-200"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isOpen"
      class="fixed inset-0 z-40 bg-black/25 backdrop-blur-[2px]"
      @click="$emit('close')"
    />
  </Transition>

  <!-- Panel lateral -->
  <Transition
    enter-active-class="transition-transform duration-300 ease-out"
    enter-from-class="translate-x-full"
    enter-to-class="translate-x-0"
    leave-active-class="transition-transform duration-200 ease-in"
    leave-from-class="translate-x-0"
    leave-to-class="translate-x-full"
  >
    <div
      v-if="isOpen && product"
      class="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white dark:bg-slate-900 shadow-2xl"
    >
      <!-- Encabezado -->
      <div class="flex items-start justify-between gap-4 border-b border-gray-100 dark:border-slate-800 px-6 py-5">
        <div class="min-w-0">
          <p class="mb-1 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-slate-500">
            Detalle del producto
          </p>
          <h2 class="truncate text-xl font-bold text-gray-900 dark:text-white">{{ product.nombre }}</h2>
          <div class="mt-2 flex flex-wrap gap-2">
            <span class="rounded-full bg-gray-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:text-slate-300">
              {{ product.categoria }}
            </span>
            <span class="rounded-full px-2.5 py-0.5 text-xs font-semibold" :class="badgeClass">
              {{ badgeLabel }}
            </span>
          </div>
        </div>

        <button
          @click="$emit('close')"
          class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 dark:text-slate-500 transition-colors hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-600 dark:hover:text-slate-300"
        >
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Contenido con scroll -->
      <div class="flex flex-1 flex-col gap-6 overflow-y-auto p-6">

        <!-- Sección: Stock -->
        <section class="flex flex-col gap-3">
          <h3 class="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500">Stock</h3>
          <div class="grid grid-cols-2 gap-3">
            <div class="rounded-xl bg-gray-50 dark:bg-slate-800 p-4">
              <p class="mb-1 text-xs text-gray-400 dark:text-slate-500">Stock Actual</p>
              <p class="text-2xl font-bold text-gray-800 dark:text-white">
                {{ stockActual }} <span class="text-sm font-medium text-gray-400 dark:text-slate-500">kg</span>
              </p>
            </div>
            <div class="rounded-xl bg-gray-50 dark:bg-slate-800 p-4">
              <p class="mb-1 text-xs text-gray-400 dark:text-slate-500">Stock Inicial (neto)</p>
              <p class="text-2xl font-bold text-gray-800 dark:text-white">
                {{ stockInicial }} <span class="text-sm font-medium text-gray-400 dark:text-slate-500">kg</span>
              </p>
            </div>
            <div class="rounded-xl bg-gray-50 dark:bg-slate-800 p-4">
              <p class="mb-1 text-xs text-gray-400 dark:text-slate-500">Desperdicio</p>
              <p class="text-2xl font-bold text-gray-800 dark:text-white">
                {{ desperdicio }} <span class="text-sm font-medium text-gray-400 dark:text-slate-500">kg</span>
              </p>
            </div>
            <div class="rounded-xl bg-gray-50 dark:bg-slate-800 p-4">
              <p class="mb-1 text-xs text-gray-400 dark:text-slate-500">Vencimiento</p>
              <p class="text-sm font-semibold" :class="vencimientoClass">{{ vencimientoLabel }}</p>
            </div>
          </div>
        </section>

        <!-- Sección: Precios -->
        <section class="flex flex-col gap-3">
          <h3 class="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500">Precios</h3>
          <div class="grid grid-cols-2 gap-3">
            <div class="rounded-xl bg-gray-50 dark:bg-slate-800 p-4">
              <p class="mb-1 text-xs text-gray-400 dark:text-slate-500">Precio Compra / kg</p>
              <p class="text-xl font-bold text-gray-800 dark:text-white">{{ fmt(precioCompra) }}</p>
            </div>
            <div class="rounded-xl bg-green-50 dark:bg-green-900/20 p-4">
              <p class="mb-1 text-xs text-green-500 dark:text-green-400">Precio Venta / kg</p>
              <p class="text-xl font-bold text-green-700 dark:text-green-400">{{ fmt(precioVenta) }}</p>
            </div>
          </div>
          <div class="rounded-xl bg-gray-50 dark:bg-slate-800 p-4">
            <p class="mb-1 text-xs text-gray-400 dark:text-slate-500">Proveedor</p>
            <p class="text-sm font-semibold text-gray-700 dark:text-slate-300">{{ product.proveedor }}</p>
          </div>
        </section>

        <!-- Sección: Rentabilidad -->
        <section class="flex flex-col gap-4">
          <h3 class="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500">Rentabilidad</h3>

          <!-- Indicador circular de margen -->
          <div class="flex items-center justify-center py-2">
            <div class="relative h-36 w-36">
              <svg viewBox="0 0 100 100" class="h-full w-full -rotate-90">
                <circle cx="50" cy="50" r="42" fill="none" :stroke="isDark ? '#334155' : '#f3f4f6'" stroke-width="10" />
                <circle
                  cx="50" cy="50" r="42"
                  fill="none"
                  :stroke="margenColor"
                  stroke-width="10"
                  stroke-linecap="round"
                  :stroke-dasharray="circumference"
                  :stroke-dashoffset="dashOffset"
                  class="transition-all duration-700"
                />
              </svg>
              <div class="absolute inset-0 flex flex-col items-center justify-center">
                <span class="text-3xl font-black" :class="margenTextColor">{{ margenPct }}%</span>
                <span class="text-xs font-medium text-gray-400 dark:text-slate-500">margen</span>
              </div>
            </div>
          </div>

          <!-- Desglose financiero -->
          <div class="flex flex-col gap-3 rounded-xl bg-gray-50 dark:bg-slate-800 p-4">
            <div class="flex justify-between text-sm">
              <span class="text-gray-500 dark:text-slate-400">Costo total</span>
              <span class="font-semibold text-gray-700 dark:text-slate-300">{{ fmt(costoTotal) }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-500 dark:text-slate-400">Ganancia potencial</span>
              <span class="font-semibold text-green-600 dark:text-green-400">{{ fmt(gananciaTotal) }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-500 dark:text-slate-400">Valor total en venta</span>
              <span class="font-bold text-gray-800 dark:text-white">{{ fmt(valorVentaTotal) }}</span>
            </div>

            <!-- Barra apilada costo vs ganancia -->
            <div>
              <div class="h-3 overflow-hidden rounded-full bg-gray-200 dark:bg-slate-700 flex">
                <div
                  class="h-full bg-gray-400 dark:bg-slate-500 transition-all duration-700"
                  :style="{ width: costoPct + '%' }"
                />
                <div
                  class="h-full bg-green-500 transition-all duration-700"
                  :style="{ width: gananciaPct + '%' }"
                />
              </div>
              <div class="mt-1.5 flex justify-between text-xs text-gray-400 dark:text-slate-500">
                <span>Costo {{ costoPct.toFixed(0) }}%</span>
                <span>Ganancia {{ gananciaPct.toFixed(0) }}%</span>
              </div>
            </div>

            <div class="flex justify-between border-t border-gray-200 dark:border-slate-700 pt-3 text-sm">
              <span class="text-gray-500 dark:text-slate-400">Ganancia por kg</span>
              <span class="font-semibold" :class="gananciaPorKg >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'">
                {{ fmt(gananciaPorKg) }}
              </span>
            </div>
          </div>
        </section>

      </div>

      <!-- Pie del panel -->
      <div class="border-t border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/50 px-6 py-4">
        <button
          @click="$emit('edit', product)"
          class="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-700"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Editar producto
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useTheme } from '~/composables/useTheme'

const { isDark } = useTheme()

const props = defineProps<{
  isOpen: boolean
  product: any
}>()

const emit = defineEmits<{
  close: []
  edit: [any]
}>()

// Cerrar con tecla Escape
const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') emit('close') }
onMounted(() => document.addEventListener('keydown', onKeyDown))
onUnmounted(() => document.removeEventListener('keydown', onKeyDown))

// Parsear el campo detalle (puede llegar como string JSON o como objeto)
const parseDetalle = (d: any): Record<string, any> => {
  if (!d) return {}
  if (typeof d === 'string') { try { return JSON.parse(d) } catch { return {} } }
  return d
}

const raw     = computed(() => props.product?.raw ?? props.product ?? {})
const detalle = computed(() => parseDetalle(raw.value.detalle))

// Valores de stock
const stockActual  = computed(() => Number(detalle.value.stock_actual ?? raw.value.kilogramos ?? 0).toFixed(2))
const stockInicial = computed(() => Number(raw.value.kilogramos ?? 0).toFixed(2))
const desperdicio  = computed(() => Number(raw.value.desperdicio ?? 0).toFixed(2))
const stock        = computed(() => Number(detalle.value.stock_actual ?? raw.value.kilogramos ?? 0))

// Precios base
const precioCompra = computed(() => Number(raw.value.precio_compra ?? 0))
const precioVenta  = computed(() => Number(raw.value.precio_venta_kg ?? 0))

// Cálculos de rentabilidad
const gananciaPorKg  = computed(() => precioVenta.value - precioCompra.value)
const costoTotal     = computed(() => precioCompra.value * stock.value)
const gananciaTotal  = computed(() => gananciaPorKg.value * stock.value)
const valorVentaTotal = computed(() => precioVenta.value * stock.value)

// Margen = (ganancia / precio_compra) * 100
const margenPct = computed(() => {
  if (precioCompra.value <= 0) return 0
  return Math.round((gananciaPorKg.value / precioCompra.value) * 100)
})

// Porcentajes para la barra apilada (basados en valor de venta total)
const costoPct    = computed(() => valorVentaTotal.value > 0 ? (costoTotal.value / valorVentaTotal.value) * 100 : 100)
const gananciaPct = computed(() => Math.max(0, 100 - costoPct.value))

// Gauge SVG: radio = 42, circunferencia = 2π × 42
const circumference = 2 * Math.PI * 42
const dashOffset = computed(() => {
  const pct = Math.min(Math.max(margenPct.value, 0), 100)
  return circumference - (pct / 100) * circumference
})

const margenColor = computed(() => {
  if (margenPct.value >= 30) return '#22c55e'
  if (margenPct.value >= 10) return '#f59e0b'
  return '#ef4444'
})
const margenTextColor = computed(() => {
  if (margenPct.value >= 30) return 'text-green-600 dark:text-green-400'
  if (margenPct.value >= 10) return 'text-amber-500 dark:text-amber-400'
  return 'text-red-500 dark:text-red-400'
})

// Badge de estado (sin iconos, solo el nombre)
const estado = computed(() => props.product?.estado ?? 'ok')

const badgeClass = computed(() => ({
  'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400':   estado.value === 'ok',
  'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400':   estado.value === 'bajo',
  'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400': estado.value === 'por_vencer',
  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400':       estado.value === 'vencido',
}))

const badgeLabel = computed(() => {
  const labels: Record<string, string> = {
    ok:         'OK',
    bajo:       'Stock Bajo',
    por_vencer: 'Por Vencer',
    vencido:    'Vencido',
  }
  return labels[estado.value] ?? estado.value
})

// Vencimiento
const vencimientoLabel = computed(() => {
  const f = detalle.value.fecha_vencimiento
  if (!f) return 'No aplica'
  return new Date(f).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })
})

const vencimientoClass = computed(() => {
  const f = detalle.value.fecha_vencimiento
  if (!f) return 'text-gray-500 dark:text-slate-400'
  const now = new Date()
  const exp = new Date(f)
  if (exp < now) return 'text-red-600 dark:text-red-400'
  if (exp.getTime() - now.getTime() <= 7 * 86400000) return 'text-amber-600 dark:text-amber-400'
  return 'text-gray-700 dark:text-slate-300'
})

const fmt = (v: number) =>
  '$' + v.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
</script>

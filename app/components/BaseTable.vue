<template>
  <div class="flex flex-col bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">

    <!-- Barra superior opcional (search + acciones) -->
    <div v-if="$slots.toolbar || searchable" class="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-slate-800">
      <BaseSearch
        v-if="searchable"
        v-model="search"
        :placeholder="_searchPlaceholder"
        @search="$emit('search', $event)"
      />
      <slot name="toolbar" />
    </div>

    <!-- Tabla -->
    <div class="overflow-auto custom-scrollbar h-[340px]">
      <table class="min-w-full text-sm">
        <thead>
          <tr class="bg-gray-50/60 dark:bg-transparent border-b border-gray-100 dark:border-slate-800/60">
            <!-- Checkbox header -->
            <th v-if="selectable" class="w-10 pl-4 py-3">
              <div class="flex items-center">
                <input
                  type="checkbox"
                  class="w-4.5 h-4.5 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                  :checked="allSelected"
                  :indeterminate.prop="someSelected"
                  @change="toggleAll"
                />
              </div>
            </th>
            <th
              v-for="(col, idx) in columns"
              :key="col.key"
              class="py-3 text-left text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap"
              :class="[
                col.align === 'right' ? 'text-right' : '',
                idx === 0 && !selectable ? 'pl-6 sm:pl-8 pr-2 sm:pr-3' : 'px-2 sm:px-3'
              ]"
            >
              {{ col.label }}
            </th>
          </tr>
        </thead>

        <tbody class="divide-y divide-gray-50 dark:divide-slate-800/50">
          <!-- Loading skeleton -->
          <template v-if="loading">
            <tr v-for="n in _skeletonRows" :key="n">
              <td v-if="selectable" class="pl-4 py-3">
                <div class="w-4 h-4 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
              </td>
              <td v-for="col in columns" :key="col.key" class="px-2 sm:px-3 py-3">
                <div class="h-4 bg-gray-100 dark:bg-slate-800 rounded animate-pulse" :class="col.key === 'actions' ? 'w-16' : 'w-full max-w-[160px]'" />
              </td>
            </tr>
          </template>

          <!-- Rows -->
          <template v-else-if="paginatedRows.length > 0">
            <tr
              v-for="(row, idx) in paginatedRows"
              :key="row.id ?? idx"
              class="hover:bg-green-50/50 dark:hover:bg-slate-800 transition-colors duration-200 group relative"
              :class="{ 'bg-green-50/50 dark:bg-slate-800/80': selectedIds.has(row.id) }"
            >
              <!-- Checkbox -->
              <td v-if="selectable" class="pl-4 py-3">
                <div class="flex items-center">
                  <input
                    type="checkbox"
                    class="w-4.5 h-4.5 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                    :checked="selectedIds.has(row.id)"
                    @change="toggleRow(row.id)"
                  />
                </div>
              </td>

              <!-- Celdas -->
              <td
                v-for="(col, idx) in columns"
                :key="col.key"
                class="py-3 text-[13px] text-gray-600 dark:text-slate-300 font-medium"
                :class="[
                  col.align === 'right' ? 'text-right' : '',
                  col.nowrap ? 'whitespace-nowrap' : '',
                  idx === 0 && !selectable ? 'pl-6 sm:pl-8 pr-2 sm:pr-3' : 'px-2 sm:px-3'
                ]"
              >
                <div v-if="selectedIds.has(row.id) && col === columns[0]" class="absolute left-0 top-0 bottom-0 w-1 bg-green-600 rounded-r-full"></div>
                <slot :name="col.key" :row="row" :value="row[col.key]">
                  <!-- Renderizado por defecto -->
                  <span v-if="row[col.key] !== null && row[col.key] !== undefined">
                    {{ row[col.key] }}
                  </span>
                  <span v-else class="text-gray-300 dark:text-slate-600 text-xs">—</span>
                </slot>
              </td>
            </tr>
          </template>

          <!-- Estado vacío -->
          <tr v-else>
            <td :colspan="selectable ? columns.length + 1 : columns.length" class="text-center py-16">
              <div class="flex flex-col items-center text-gray-400 dark:text-slate-500">
                <svg class="w-10 h-10 mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7m16 0v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-5m16 0H4" />
                </svg>
                <p class="text-sm font-medium">{{ _emptyText }}</p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Footer: info de filas + paginación -->
    <div class="flex flex-col sm:flex-row items-center justify-between px-5 py-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50/30 dark:bg-slate-900">
      
      <!-- Left side -->
      <div class="flex items-center gap-3">
        <span class="text-sm font-medium text-gray-600 dark:text-slate-300">Mostrar resultados:</span>
        <div class="relative">
          <select v-model="itemsPerPage" class="appearance-none bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 text-sm rounded-lg px-3 py-1.5 pr-8 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 cursor-pointer transition-colors shadow-sm font-medium">
            <option :value="5">5</option>
            <option :value="10">10</option>
            <option :value="15">15</option>
          </select>
          <svg class="w-4 h-4 text-gray-400 dark:text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
        </div>
      </div>
      
      <!-- Right side -->
      <div class="flex items-center gap-1.5 mt-4 sm:mt-0" v-if="totalPages > 1">
        <button @click="currentPage--" :disabled="currentPage === 1" class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
        </button>
        
        <template v-for="(p, i) in visiblePages" :key="i">
          <span v-if="p === '...'" class="w-8 h-8 flex items-center justify-center text-gray-400 dark:text-slate-500">...</span>
          <button v-else @click="currentPage = Number(p)" class="w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors"
            :class="currentPage === p ? 'bg-green-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900 dark:text-slate-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800'">
            {{ p }}
          </button>
        </template>
        
        <button @click="currentPage++" :disabled="currentPage === totalPages" class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

export interface TableColumn {
  key: string
  label: string
  align?: 'left' | 'right'
  nowrap?: boolean
}

const props = defineProps<{
  columns: TableColumn[]
  rows: any[]
  loading?: boolean
  selectable?: boolean
  searchable?: boolean
  searchPlaceholder?: string
  emptyText?: string
  total?: number
  skeletonRows?: number
  showFooter?: boolean
}>()

const emit = defineEmits<{
  (e: 'search', val: string): void
  (e: 'selection-change', ids: Set<any>): void
}>()

// Defaults (renombrados para evitar colisión con los nombres de props)
const _emptyText = computed(() => props.emptyText ?? 'Sin registros')
const _skeletonRows = computed(() => props.skeletonRows ?? 5)
const _showFooter = computed(() => props.showFooter ?? true)
const _searchPlaceholder = computed(() => props.searchPlaceholder ?? 'Buscar...')

// Search
const search = ref('')

// Selection
const selectedIds = ref<Set<any>>(new Set())
const allSelected = computed(() => paginatedRows.value.length > 0 && paginatedRows.value.every(r => selectedIds.value.has(r.id)))
const someSelected = computed(() => paginatedRows.value.some(r => selectedIds.value.has(r.id)) && !allSelected.value)

// Paginación interna
const itemsPerPage = ref(10)
const currentPage = ref(1)

const totalPages = computed(() => Math.ceil(props.rows.length / itemsPerPage.value) || 1)

const paginatedRows = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return props.rows.slice(start, end)
})

const visiblePages = computed(() => {
  const pages = []
  const total = totalPages.value
  const current = currentPage.value
  
  if (total <= 5) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    if (current <= 3) {
      pages.push(1, 2, 3, 4, '...', total)
    } else if (current >= total - 2) {
      pages.push(1, '...', total - 3, total - 2, total - 1, total)
    } else {
      pages.push(1, '...', current - 1, current, current + 1, '...', total)
    }
  }
  return pages
})

watch(() => props.rows.length, () => {
  if (currentPage.value > totalPages.value) {
    currentPage.value = totalPages.value || 1
  }
})

watch(itemsPerPage, () => {
  currentPage.value = 1
})

const toggleRow = (id: any) => {
  const s = new Set(selectedIds.value)
  s.has(id) ? s.delete(id) : s.add(id)
  selectedIds.value = s
  emit('selection-change', s)
}

const toggleAll = () => {
  if (allSelected.value) {
    // Si están todos los de esta página, deseleccionamos SOLO los de esta página
    paginatedRows.value.forEach(r => selectedIds.value.delete(r.id))
  } else {
    // Seleccionamos todos los de esta página
    paginatedRows.value.forEach(r => selectedIds.value.add(r.id))
  }
  // trigger reactivity
  selectedIds.value = new Set(selectedIds.value)
  emit('selection-change', selectedIds.value)
}
</script>
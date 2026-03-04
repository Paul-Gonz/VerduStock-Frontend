<template>
  <div class="flex flex-col bg-white rounded-1xl border border-gray-100 shadow-sm overflow-hidden">

    <!-- Barra superior opcional (search + acciones) -->
    <div v-if="$slots.toolbar || searchable" class="flex items-center justify-between px-6 py-5 border-b border-gray-100">
      <BaseSearch
        v-if="searchable"
        v-model="search"
        :placeholder="_searchPlaceholder"
        @search="$emit('search', search)"
      />
      <slot name="toolbar" />
    </div>

    <!-- Tabla -->
    <div class="overflow-x-auto">
      <table class="min-w-full text-sm">
        <thead>
          <tr class="bg-gray-50/60 border-b border-gray-100">
            <!-- Checkbox header -->
            <th v-if="selectable" class="w-12 pl-6 py-4">
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
              v-for="col in columns"
              :key="col.key"
              class="px-6 py-4 text-left text-[11px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap"
              :class="col.align === 'right' ? 'text-right' : ''"
            >
              {{ col.label }}
            </th>
          </tr>
        </thead>

        <tbody class="divide-y divide-gray-50">
          <!-- Loading skeleton -->
          <template v-if="loading">
            <tr v-for="n in _skeletonRows" :key="n">
              <td v-if="selectable" class="pl-5 py-3.5">
                <div class="w-4 h-4 bg-gray-200 rounded animate-pulse" />
              </td>
              <td v-for="col in columns" :key="col.key" class="px-5 py-3.5">
                <div class="h-4 bg-gray-100 rounded animate-pulse" :class="col.key === 'actions' ? 'w-16' : 'w-full max-w-[160px]'" />
              </td>
            </tr>
          </template>

          <!-- Rows -->
          <template v-else-if="rows.length > 0">
            <tr
              v-for="(row, idx) in rows"
              :key="row.id ?? idx"
              class="hover:bg-green-50/50 transition-colors duration-200 group relative"
              :class="{ 'bg-green-600/5': selectedIds.has(row.id) }"
            >
              <!-- Checkbox -->
              <td v-if="selectable" class="pl-6 py-4">
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
                v-for="col in columns"
                :key="col.key"
                class="px-6 py-4 text-sm text-gray-600 font-medium"
                :class="[col.align === 'right' ? 'text-right' : '', col.nowrap ? 'whitespace-nowrap' : '']"
              >
                <div v-if="selectedIds.has(row.id) && col === columns[0]" class="absolute left-0 top-0 bottom-0 w-1 bg-green-600 rounded-r-full"></div>
                <slot :name="col.key" :row="row" :value="row[col.key]">
                  <!-- Renderizado por defecto -->
                  <span v-if="row[col.key] !== null && row[col.key] !== undefined">
                    {{ row[col.key] }}
                  </span>
                  <span v-else class="text-gray-300 text-xs">—</span>
                </slot>
              </td>
            </tr>
          </template>

          <!-- Estado vacío -->
          <tr v-else>
            <td :colspan="selectable ? columns.length + 1 : columns.length" class="text-center py-16">
              <div class="flex flex-col items-center text-gray-400">
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
    <div v-if="$slots.pagination || _showFooter" class="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50/50">
      <p class="text-xs text-gray-500">
        <slot name="footer-info">
          <span v-if="total !== undefined && total >= rows.length">Mostrando {{ rows.length }} de {{ total }} registros</span>
          <span v-else>Mostrando {{ rows.length }} registros</span>
        </slot>
      </p>
      <slot name="pagination" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

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
const allSelected = computed(() => props.rows.length > 0 && props.rows.every(r => selectedIds.value.has(r.id)))
const someSelected = computed(() => props.rows.some(r => selectedIds.value.has(r.id)) && !allSelected.value)

const toggleRow = (id: any) => {
  const s = new Set(selectedIds.value)
  s.has(id) ? s.delete(id) : s.add(id)
  selectedIds.value = s
  emit('selection-change', s)
}

const toggleAll = () => {
  if (allSelected.value) {
    selectedIds.value = new Set()
  } else {
    selectedIds.value = new Set(props.rows.map(r => r.id))
  }
  emit('selection-change', selectedIds.value)
}
</script>
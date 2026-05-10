<template>
  <div class="relative" ref="containerRef">
    <!-- Trigger -->
    <button
      type="button"
      @click="open = !open"
      class="flex items-center gap-2 h-10 px-4 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 hover:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-200 transition-all min-w-[180px] justify-between"
    >
      <span v-if="modelValue.length === 0" class="text-gray-400">{{ placeholder }}</span>
      <span v-else class="font-medium text-green-700">
        {{ modelValue.length === options.length ? 'Todas las categorías' : `${modelValue.length} seleccionada(s)` }}
      </span>
      <svg
        class="w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0"
        :class="{ 'rotate-180': open }"
        fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- Dropdown -->
    <Transition
      enter-active-class="transition ease-out duration-150"
      enter-from-class="opacity-0 translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-100"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-1"
    >
      <div
        v-if="open"
        class="absolute z-50 mt-1.5 w-full min-w-[220px] bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden"
      >
        <!-- Select all -->
        <div class="px-3 py-2.5 border-b border-gray-100">
          <label class="flex items-center gap-2.5 cursor-pointer group">
            <input
              type="checkbox"
              :checked="modelValue.length === options.length"
              :indeterminate="modelValue.length > 0 && modelValue.length < options.length"
              @change="toggleAll"
              class="w-4 h-4 rounded accent-green-600"
            />
            <span class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Todas</span>
          </label>
        </div>

        <!-- Options -->
        <div class="max-h-52 overflow-y-auto py-1">
          <label
            v-for="opt in options"
            :key="opt.id"
            class="flex items-center gap-2.5 px-3 py-2 cursor-pointer hover:bg-green-50 transition-colors group"
          >
            <input
              type="checkbox"
              :value="opt.id"
              :checked="modelValue.includes(opt.id)"
              @change="toggle(opt.id)"
              class="w-4 h-4 rounded accent-green-600 shrink-0"
            />
            <span class="text-sm text-gray-700 group-hover:text-green-800 select-none">
              {{ opt.emoji ? `${opt.emoji} ` : '' }}{{ opt.nombre }}
            </span>
          </label>
        </div>

        <!-- Footer -->
        <div v-if="modelValue.length > 0" class="px-3 py-2 border-t border-gray-100 bg-gray-50">
          <button
            type="button"
            @click="clear"
            class="text-xs text-gray-400 hover:text-red-500 transition-colors"
          >
            Limpiar selección
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

export interface SelectOption {
  id: number | string
  nombre: string
  emoji?: string
}

const props = defineProps<{
  modelValue: (number | string)[]
  options: SelectOption[]
  placeholder?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [(number | string)[]]
}>()

const open = ref(false)
const containerRef = ref<HTMLElement | null>(null)

const toggle = (id: number | string) => {
  const current = [...props.modelValue]
  const idx = current.indexOf(id)
  if (idx === -1) current.push(id)
  else current.splice(idx, 1)
  emit('update:modelValue', current)
}

const toggleAll = () => {
  if (props.modelValue.length === props.options.length) {
    emit('update:modelValue', [])
  } else {
    emit('update:modelValue', props.options.map(o => o.id))
  }
}

const clear = () => emit('update:modelValue', [])

const handleClickOutside = (e: MouseEvent) => {
  if (containerRef.value && !containerRef.value.contains(e.target as Node)) {
    open.value = false
  }
}

onMounted(() => document.addEventListener('mousedown', handleClickOutside))
onUnmounted(() => document.removeEventListener('mousedown', handleClickOutside))
</script>

<template>
  <div class="relative" ref="containerRef">
    <!-- Trigger -->
    <button
      type="button"
      @click="open = !open"
      class="flex items-center gap-2 h-10 px-4 rounded-lg border border-gray-300 dark:border-slate-700/80 bg-white dark:bg-slate-800 text-sm text-gray-700 dark:text-white hover:border-green-400 dark:hover:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200 dark:focus:ring-green-500/50 transition-all min-w-[180px] justify-between"
    >
      <span v-if="modelValue.length === 0" class="text-gray-400 dark:text-slate-500">{{ placeholder }}</span>
      <span v-else class="font-medium text-green-700 dark:text-green-400">
        {{ modelValue.length === options.length ? 'Todas las categorías' : `${modelValue.length} seleccionada(s)` }}
      </span>
      <svg
        class="w-4 h-4 text-gray-400 dark:text-slate-500 transition-transform duration-200 shrink-0"
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
        class="absolute z-50 mt-1.5 w-full min-w-[220px] bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-lg overflow-hidden"
      >
        <!-- Select all -->
        <div class="px-3 py-2.5 border-b border-gray-100 dark:border-slate-700/80">
          <div @click.stop="toggleAll" class="flex items-center gap-2.5 cursor-pointer group">
            <div class="flex items-center justify-center w-[18px] h-[18px] rounded-[5px] border transition-all duration-200"
                 :class="modelValue.length === options.length ? 'bg-green-500 border-green-500 shadow-sm shadow-green-500/20' : 'bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600'">
              <svg v-if="modelValue.length === options.length" class="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <svg v-else-if="modelValue.length > 0 && modelValue.length < options.length" class="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                <path stroke-linecap="round" stroke-linejoin="round" d="M20 12H4" />
              </svg>
            </div>
            <span class="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Todas</span>
          </div>
        </div>

        <!-- Options -->
        <div class="max-h-52 overflow-y-auto p-1.5 flex flex-col gap-0.5">
          <div
            v-for="opt in options"
            :key="opt.id"
            @click.stop="toggle(opt.id)"
            class="flex items-center gap-2.5 px-3 py-2 cursor-pointer transition-colors rounded-md group"
            :class="modelValue.includes(opt.id) ? 'bg-green-50/50 dark:bg-green-900/10' : 'hover:bg-gray-50 dark:hover:bg-slate-700/50'"
          >
            <div class="flex items-center justify-center w-[18px] h-[18px] rounded-[5px] border transition-all duration-200 shrink-0"
                 :class="modelValue.includes(opt.id) ? 'bg-green-500 border-green-500 shadow-sm shadow-green-500/20' : 'bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600'">
              <svg v-if="modelValue.includes(opt.id)" class="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span class="text-sm text-gray-700 dark:text-slate-300 group-hover:text-green-800 dark:group-hover:text-green-400 select-none">
              {{ opt.emoji ? `${opt.emoji} ` : '' }}{{ opt.nombre }}
            </span>
          </div>
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

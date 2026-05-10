<template>
  <div class="relative" ref="containerRef">
    <!-- Trigger -->
    <button
      type="button"
      @click="open = !open"
      class="flex items-center gap-2 h-10 px-4 rounded-lg border border-gray-300 dark:border-slate-700/80 bg-white dark:bg-slate-800 text-sm text-gray-700 dark:text-white hover:border-green-400 dark:hover:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200 dark:focus:ring-green-500/50 transition-all min-w-[180px] justify-between"
    >
      <span :class="selectedLabel === placeholder ? 'text-gray-400 dark:text-slate-500' : 'text-gray-700 dark:text-white'">
        {{ selectedLabel }}
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
        class="absolute z-50 mt-1.5 w-full min-w-[200px] bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-lg overflow-hidden"
      >
        <div class="p-1.5 max-h-[300px] overflow-y-auto flex flex-col gap-0.5">
          <button
            v-for="opt in options"
            :key="opt.value"
            type="button"
            @click="select(opt.value)"
            class="w-full flex items-center justify-between px-3 py-2 text-sm transition-colors rounded-md"
            :class="modelValue === opt.value
              ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-medium'
              : 'text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/50'"
          >
            <span>{{ opt.label }}</span>
            <svg
              v-if="modelValue === opt.value"
              class="w-4 h-4 text-green-600 shrink-0"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

export interface SelectOption {
  value: string
  label: string
}

const props = defineProps<{
  modelValue: string
  options: SelectOption[]
  placeholder?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [string]
}>()

const open = ref(false)
const containerRef = ref<HTMLElement | null>(null)

const selectedLabel = computed(
  () => props.options.find(o => o.value === props.modelValue)?.label ?? props.placeholder ?? 'Seleccionar'
)

const select = (value: string) => {
  emit('update:modelValue', value)
  open.value = false
}

const handleClickOutside = (e: MouseEvent) => {
  if (containerRef.value && !containerRef.value.contains(e.target as Node)) {
    open.value = false
  }
}

onMounted(() => document.addEventListener('mousedown', handleClickOutside))
onUnmounted(() => document.removeEventListener('mousedown', handleClickOutside))
</script>

<template>
  <div class="relative group w-full">
    <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
      <svg 
        class="h-[1.125rem] w-[1.125rem] text-gray-400 group-focus-within:text-green-500 transition-colors" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor" 
        stroke-width="2.5" 
        stroke-linecap="round" 
        stroke-linejoin="round"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
    </div>
    <input
      :value="modelValue"
      @input="handleInput"
      type="text"
      :placeholder="placeholder"
      class="block w-full pl-11 pr-4 py-2.5 text-sm text-gray-900 dark:text-white bg-gray-50/80 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 dark:focus:border-green-500 focus:bg-white dark:focus:bg-slate-800 transition-all shadow-sm placeholder-gray-400 dark:placeholder-slate-400"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Buscar...'
  }
})

const emit = defineEmits(['update:modelValue', 'search'])

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.value
  emit('update:modelValue', value)
  emit('search', value)
}
</script>

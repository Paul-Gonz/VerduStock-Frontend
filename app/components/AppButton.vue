<template>
  <button 
    :class="[
      buttonClasses, 
      'inline-flex items-center justify-center font-medium py-2 px-4 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ease-in-out border text-center disabled:opacity-50 disabled:cursor-not-allowed w-fit'
    ]" 
    @click="$emit('click')"
    :disabled="disabled || loading"
  >
    <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  primary?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | string;
  disabled?: boolean;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  primary: false,
  variant: 'secondary',
  disabled: false,
  loading: false,
});

defineEmits(["click"]);

const buttonClasses = computed(() => {
  const isPrimary = props.primary || props.variant === 'primary';
  
  if (props.variant === 'danger') {
    return 'bg-red-600 hover:bg-red-700 text-white shadow-sm border-transparent focus:ring-red-500';
  }
  if (isPrimary) {
    return 'bg-green-600 hover:bg-green-700 text-white shadow-sm border-transparent focus:ring-green-500';
  }
  // Secondary (Default fallback)
  return 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300 focus:ring-gray-200';
});
</script>

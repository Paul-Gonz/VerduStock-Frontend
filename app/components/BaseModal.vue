<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-sm overflow-y-auto h-full w-full flex items-center justify-center transition-all duration-300" @click.self="$emit('close')">
    <div :class="['relative mx-auto border border-gray-100 w-full shadow-2xl rounded-2xl bg-white transform transition-all overflow-hidden flex flex-col', maxWidth]">
      
      <!-- Header -->
      <div class="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
        <h3 class="text-lg font-bold text-gray-900 tracking-tight">
          {{ title }}
          <slot name="header" />
        </h3>
        <button @click="$emit('close')" class="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Body & Footer Workflow -->
      <div class="px-6 py-6 text-left text-gray-600 overflow-y-auto max-h-[70vh] flex flex-col gap-6">
        <!-- Body Content -->
        <slot />

        <!-- Acciones alineadas al flujo -->
        <div class="flex items-center gap-3">
          <slot name="footer">
            <AppButton 
              @click="$emit('confirm')" 
              :loading="loading"
              :variant="variant"
            >
              {{ confirmText }}
            </AppButton>
            <AppButton 
              @click="$emit('close')" 
              variant="secondary"
            >
              Cancelar
            </AppButton>
          </slot>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Modal'
  },
  loading: {
    type: Boolean,
    default: false
  },
  confirmText: {
    type: String,
    default: 'Confirmar'
  },
  variant: {
    type: String, // 'primary' o 'danger'
    default: 'primary'
  },
  maxWidth: {
    type: String,
    default: 'max-w-[440px]'
  }
});

defineEmits(['close', 'confirm']);
</script>

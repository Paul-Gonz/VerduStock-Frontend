<template>
  <div class="flex flex-wrap gap-3 items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
    <BaseSearch
      :modelValue="search"
      @update:modelValue="$emit('update:search', $event)"
      :placeholder="searchPlaceholder"
      class="flex-1 min-w-[200px]"
    />
    <!-- Additional filters go in the slot -->
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  search: string
  searchPlaceholder?: string
}>()

defineEmits<{
  'update:search': [string]
}>()
</script>

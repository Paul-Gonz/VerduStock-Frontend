<template>
  <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
    <div
      v-for="stat in stats"
      :key="stat.label"
      class="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm p-4 flex items-center gap-3 transition-shadow hover:shadow-md"
    >
      <div
        :class="iconBg[stat.color]"
        class="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
      >
        <!-- box -->
        <svg v-if="stat.icon === 'box'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        <!-- money -->
        <svg v-else-if="stat.icon === 'money'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <!-- warning -->
        <svg v-else-if="stat.icon === 'warning'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <!-- calendar -->
        <svg v-else-if="stat.icon === 'calendar'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>

      <div class="min-w-0">
        <p class="text-xs text-gray-400 dark:text-slate-500 font-medium truncate">{{ stat.label }}</p>
        <p :class="valueColor[stat.color]" class="text-2xl font-bold leading-tight">{{ stat.value }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
export type StatColor = 'green' | 'blue' | 'amber' | 'red'
export type StatIcon = 'box' | 'money' | 'warning' | 'calendar'

export interface StatCard {
  label: string
  value: string | number
  icon: StatIcon
  color: StatColor
}

defineProps<{ stats: StatCard[] }>()

const iconBg: Record<StatColor, string> = {
  green: 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  blue:  'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  amber: 'bg-amber-50 text-amber-500 dark:bg-amber-900/30 dark:text-amber-400',
  red:   'bg-red-50 text-red-500 dark:bg-red-900/30 dark:text-red-400',
}

const valueColor: Record<StatColor, string> = {
  green: 'text-gray-800 dark:text-white',
  blue:  'text-gray-800 dark:text-white',
  amber: 'text-gray-800 dark:text-white',
  red:   'text-gray-800 dark:text-white',
}
</script>

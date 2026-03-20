<script setup>
import { computed } from 'vue'

const props = defineProps({
  found: { type: Number, required: true },
  total: { type: Number, required: true },
})

const pct = computed(() =>
  props.total > 0 ? Math.round((props.found / props.total) * 100) : 0
)
</script>

<template>
  <div>
    <div class="h-3 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
      <div
        class="h-full rounded-full bg-lp-green transition-all duration-500 ease-out"
        :style="{ width: `${pct}%` }"
      />
    </div>
    <p class="text-sm text-gray-500 dark:text-gray-400 mt-1 text-right">
      <span class="font-semibold text-lp-dark dark:text-gray-100">{{ found }}</span> / {{ total }} found
    </p>
  </div>
</template>

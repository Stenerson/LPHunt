<script setup>
import { computed } from 'vue'

const props = defineProps({
  found: { type: Number, required: true },
  total: { type: Number, required: true },
  additional: { type: Number, default: 0 },
})

const pct = computed(() =>
  props.total > 0 ? Math.round((props.found / props.total) * 100) : 0
)

const additionalPct = computed(() =>
  props.total > 0 ? Math.round((props.additional / props.total) * 100) : 0
)
</script>

<template>
  <div>
    <div class="h-3 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex">
      <div
        class="h-full bg-lp-green transition-all duration-500 ease-out"
        :style="{ width: `${pct}%` }"
      />
      <div
        v-if="additional > 0"
        class="h-full bg-blue-500 transition-all duration-500 ease-out"
        :style="{ width: `${additionalPct}%` }"
      />
    </div>
    <p class="text-sm text-gray-500 dark:text-gray-400 mt-1 text-right">
      <span class="font-semibold text-lp-dark dark:text-gray-100">{{ found }}</span> / {{ total }} found
      <template v-if="additional > 0">
        · <span class="font-semibold text-blue-500">+{{ additional }}</span> new
      </template>
    </p>
  </div>
</template>

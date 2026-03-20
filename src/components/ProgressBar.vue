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
    <div class="h-3 rounded-full overflow-hidden bg-gray-200">
      <div
        class="h-full rounded-full transition-all duration-500 ease-out"
        :style="{
          width: `${pct}%`,
          background: 'linear-gradient(90deg, #E63946 0%, #F4A261 50%, #2D6A4F 100%)',
        }"
      />
    </div>
    <p class="text-sm text-gray-500 mt-1 text-right">
      <span class="font-semibold text-lp-dark">{{ found }}</span> / {{ total }} found
    </p>
  </div>
</template>

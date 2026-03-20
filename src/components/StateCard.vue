<script setup>
defineProps({
  abbr: { type: String, required: true },
  name: { type: String, required: true },
  found: { type: Boolean, required: true },
})
defineEmits(['toggle'])
</script>

<template>
  <button
    @click="$emit('toggle', abbr)"
    class="relative flex flex-col items-center justify-center rounded-xl min-h-[96px] p-2 w-full transition-all duration-150 active:scale-95 select-none overflow-hidden"
    style="touch-action: manipulation"
    :class="found
      ? 'bg-lp-green text-white shadow-md'
      : 'bg-white dark:bg-gray-800 text-lp-dark dark:text-gray-100 shadow-sm border border-gray-200 dark:border-gray-700'"
  >
    <span class="font-bold text-base leading-none">{{ abbr }}</span>
    <span class="text-[9px] uppercase tracking-normal mt-1 leading-tight text-center opacity-75 w-full px-0.5">{{ name }}</span>
    <span v-if="found" class="absolute top-1 right-1.5 text-[10px] opacity-60">&#10003;</span>
  </button>
</template>

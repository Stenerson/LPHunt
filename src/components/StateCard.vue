<script setup>
import { ref } from 'vue'

const props = defineProps({
  abbr: { type: String, required: true },
  name: { type: String, required: true },
  found: { type: Boolean, required: true },
})
const emit = defineEmits(['toggle', 'hint'])

const HOLD_MS = 600
let pressTimer = null
let didHold = false
const holding = ref(false)

function onPointerDown() {
  if (!props.found) return
  didHold = false
  holding.value = true
  pressTimer = setTimeout(() => {
    holding.value = false
    didHold = true
    navigator.vibrate?.(30)
    emit('toggle', props.abbr)
  }, HOLD_MS)
}

function onPointerUp() {
  clearTimeout(pressTimer)
  holding.value = false
}

function onClick() {
  // Swallow the click that fires right after a successful hold
  if (didHold) {
    didHold = false
    return
  }
  if (!props.found) {
    emit('toggle', props.abbr)
  } else {
    emit('hint') // tell parent to show "hold to unselect" toast
  }
}
</script>

<template>
  <button
    @click="onClick"
    @pointerdown="onPointerDown"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp"
    @pointerleave="onPointerUp"
    class="relative flex flex-col rounded-xl overflow-hidden w-full aspect-[2/1] select-none border-2 transition-all duration-150"
    :class="[
      found
        ? 'bg-white border-lp-green shadow-md'
        : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 shadow-sm active:scale-95',
      found && holding ? 'scale-95 opacity-60' : '',
    ]"
    style="touch-action: manipulation"
  >
    <!-- Top accent strip -->
    <div
      class="h-4 w-full flex-shrink-0"
      :class="found ? 'bg-lp-green' : 'bg-gray-300 dark:bg-gray-600'"
    />

    <!-- Bolt holes with Phillips screw heads -->
    <svg class="absolute top-1.5 left-2 w-2.5 h-2.5" viewBox="0 0 10 10">
      <circle cx="5" cy="5" r="4.5"
        :fill="found ? '#D1D5DB' : '#9CA3AF'"
        :stroke="found ? '#9CA3AF' : '#6B7280'"
        stroke-width="0.8"
      />
      <line x1="5" y1="2" x2="5" y2="8" :stroke="found ? '#9CA3AF' : '#6B7280'" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="2" y1="5" x2="8" y2="5" :stroke="found ? '#9CA3AF' : '#6B7280'" stroke-width="1.5" stroke-linecap="round"/>
    </svg>
    <svg class="absolute top-1.5 right-2 w-2.5 h-2.5" viewBox="0 0 10 10">
      <circle cx="5" cy="5" r="4.5"
        :fill="found ? '#D1D5DB' : '#9CA3AF'"
        :stroke="found ? '#9CA3AF' : '#6B7280'"
        stroke-width="0.8"
      />
      <line x1="5" y1="2" x2="5" y2="8" :stroke="found ? '#9CA3AF' : '#6B7280'" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="2" y1="5" x2="8" y2="5" :stroke="found ? '#9CA3AF' : '#6B7280'" stroke-width="1.5" stroke-linecap="round"/>
    </svg>

    <!-- Main content -->
    <div class="flex-1 flex flex-col items-center justify-center px-2">
      <span
        class="font-black text-xl leading-none tracking-normal"
        :class="found ? 'text-lp-dark' : 'text-gray-500 dark:text-gray-400'"
      >{{ abbr }}</span>
      <span
        class="text-[9px] uppercase tracking-normal mt-0.5 leading-tight text-center w-full overflow-hidden"
        :class="found ? 'text-lp-dark opacity-60' : 'text-gray-500 dark:text-gray-400 opacity-75'"
      >{{ name }}</span>
    </div>

    <!-- Bottom strip -->
    <div
      class="h-2 w-full flex-shrink-0"
      :class="found ? 'bg-lp-green' : 'bg-gray-300 dark:bg-gray-600'"
    />
  </button>
</template>

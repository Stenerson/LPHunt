<script setup>
import { useGame } from '../composables/useGame.js'

defineEmits(['navigate'])
const { games } = useGame()
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-[100dvh] px-6 py-12 text-center bg-lp-bg dark:bg-gray-900">
    <div class="mb-10">
      <div class="flex items-center justify-center mb-4">
        <svg class="w-16 h-16 text-lp-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
      </div>
      <h1 class="font-fredoka text-5xl text-lp-dark dark:text-gray-100 mb-3 leading-tight">
        License Plate Hunt
      </h1>
      <p class="text-gray-500 dark:text-gray-400 text-lg">How many states can you spot?</p>
    </div>

    <div class="flex flex-col gap-4 w-full max-w-xs">
      <button
        @click="$emit('navigate', 'new-game')"
        class="bg-lp-green text-white font-semibold text-lg py-4 px-6 rounded-2xl shadow-lg active:scale-95 transition-all"
      >
        Start New Game
      </button>

      <button
        v-if="games.length > 0"
        @click="$emit('navigate', 'past-games')"
        class="bg-white dark:bg-gray-800 text-lp-dark dark:text-gray-100 font-semibold text-lg py-4 px-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 active:scale-95 transition-all"
      >
        View Past Games
      </button>
    </div>
  </div>
</template>

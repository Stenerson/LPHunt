<script setup>
import { useGame } from '../composables/useGame.js'

defineEmits(['navigate'])
const { games } = useGame()
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-[100dvh] px-6 py-12 text-center bg-lp-bg">
    <div class="mb-10">
      <h1 class="font-fredoka text-5xl text-lp-dark mb-3 leading-tight">
        License Plate Hunt
      </h1>
      <p class="text-gray-500 text-lg">How many states can you spot?</p>
    </div>

    <div class="flex flex-col gap-4 w-full max-w-xs">
      <button
        @click="$emit('navigate', 'new-game')"
        class="bg-lp-red text-white font-semibold text-lg py-4 px-6 rounded-2xl shadow-lg active:scale-95 transition-all"
      >
        Start New Game
      </button>

      <button
        v-if="games.length > 0"
        @click="$emit('navigate', 'past-games')"
        class="bg-white text-lp-dark font-semibold text-lg py-4 px-6 rounded-2xl shadow-sm border border-gray-200 active:scale-95 transition-all"
      >
        View Past Games
      </button>
    </div>
  </div>
</template>

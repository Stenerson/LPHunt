<script setup>
import { computed } from 'vue'
import { useGame } from '../composables/useGame.js'
import { STATES } from '../data/states.js'
import { PROVINCES } from '../data/provinces.js'
import ProgressBar from './ProgressBar.vue'

defineEmits(['navigate'])
const { games, activeId, activeGame, setActiveGame, countFound } = useGame()

// Most recent first
const sortedGames = computed(() => [...games.value].reverse())

function resume(gameId) {
  setActiveGame(gameId)
}

function getTotalFound(game) {
  return countFound(game, 'states') +
    (game.includeCanada ? countFound(game, 'provinces') : 0)
}

function getTotal(game) {
  return STATES.length + (game.includeCanada ? PROVINCES.length : 0)
}

function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}
</script>

<template>
  <div class="flex flex-col min-h-[100dvh] bg-lp-bg">
    <header class="bg-lp-dark text-white px-4 py-4 flex items-center gap-3">
      <button
        @click="$emit('navigate', activeGame ? 'game' : 'home')"
        class="text-white/70 hover:text-white transition-colors text-xl leading-none p-1"
      >
        &#8592;
      </button>
      <h1 class="font-fredoka text-2xl">Past Games</h1>
    </header>

    <div v-if="sortedGames.length === 0" class="flex-1 flex items-center justify-center text-gray-400">
      No games yet.
    </div>

    <div v-else class="flex-1 px-4 py-4 space-y-4">
      <div
        v-for="game in sortedGames"
        :key="game.id"
        class="bg-white rounded-2xl shadow-sm p-4 border"
        :class="game.id === activeId ? 'border-lp-green' : 'border-gray-100'"
      >
        <div class="flex items-start justify-between mb-1">
          <div class="flex-1 min-w-0 pr-3">
            <p class="font-semibold text-lp-dark truncate">{{ game.name }}</p>
            <p class="text-xs text-gray-400 mt-0.5">
              {{ formatDate(game.createdAt) }}
              &middot; Starting: {{ game.startingState }}
              <span v-if="game.includeCanada"> &middot; Includes Canada</span>
            </p>
          </div>
          <span
            v-if="game.id === activeId"
            class="text-xs font-medium bg-lp-green/10 text-lp-green px-2 py-1 rounded-full flex-shrink-0"
          >
            Active
          </span>
        </div>

        <div class="mt-3">
          <ProgressBar :found="getTotalFound(game)" :total="getTotal(game)" />
        </div>

        <button
          v-if="game.id !== activeId"
          @click="resume(game.id); $emit('navigate', 'game')"
          class="mt-3 w-full bg-lp-dark text-white font-medium py-3 rounded-xl text-sm active:scale-95 transition-all"
        >
          Resume Game
        </button>
      </div>
    </div>
  </div>
</template>

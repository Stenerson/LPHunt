<script setup>
import { ref, computed } from 'vue'
import { useGame } from '../composables/useGame.js'
import { STATES } from '../data/states.js'
import { PROVINCES } from '../data/provinces.js'
import { encodeGame } from '../composables/useShare.js'
import ProgressBar from './ProgressBar.vue'

defineEmits(['navigate'])
const { games, activeId, activeGame, setActiveGame, countFound, deleteGame } = useGame()

const sortedGames = computed(() => [...games.value].reverse())

const confirmingDelete = ref(null)
const copiedGameId = ref(null)

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

async function shareGame(game) {
  const url = window.location.href.split('#')[0] + '#share=' + encodeGame(game)
  if (navigator.share) {
    try {
      await navigator.share({ url })
    } catch (e) {
      if (e.name !== 'AbortError') {
        await navigator.clipboard.writeText(url)
        copiedGameId.value = game.id
        setTimeout(() => { copiedGameId.value = null }, 2000)
      }
    }
    return
  }
  await navigator.clipboard.writeText(url)
  copiedGameId.value = game.id
  setTimeout(() => { copiedGameId.value = null }, 2000)
}

function doDelete(gameId) {
  deleteGame(gameId)
  confirmingDelete.value = null
}
</script>

<template>
  <div class="flex flex-col min-h-[100dvh] bg-lp-bg dark:bg-gray-900">
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
        class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4 border"
        :class="game.id === activeId ? 'border-lp-green' : 'border-gray-100 dark:border-gray-700'"
      >
        <div class="flex items-start justify-between mb-1">
          <div class="flex-1 min-w-0 pr-3">
            <p class="font-semibold text-lp-dark dark:text-gray-100 truncate">{{ game.name }}</p>
            <p class="text-xs text-gray-400 mt-0.5">
              {{ formatDate(game.createdAt) }}
              &middot; Starting: {{ game.startingState }}
              <span v-if="game.includeCanada"> &middot; Includes Canada</span>
            </p>
          </div>

          <div class="flex items-center gap-2 flex-shrink-0">
            <!-- Share button -->
            <button
              @click="shareGame(game)"
              class="p-1.5 rounded-lg text-gray-400 hover:text-lp-dark dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              :class="copiedGameId === game.id ? 'text-lp-green dark:text-lp-green' : ''"
              title="Share game"
            >
              <!-- Checkmark when copied -->
              <svg v-if="copiedGameId === game.id" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
              </svg>
              <!-- Share icon -->
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
              </svg>
            </button>

            <!-- Delete button -->
            <button
              @click="confirmingDelete = game.id"
              class="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              title="Delete game"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>

            <!-- Active badge -->
            <span
              v-if="game.id === activeId"
              class="text-xs font-medium bg-lp-green/10 text-lp-green px-2 py-1 rounded-full"
            >
              Active
            </span>
          </div>
        </div>

        <div class="mt-3">
          <ProgressBar :found="getTotalFound(game)" :total="getTotal(game)" />
        </div>

        <!-- Delete confirmation -->
        <div v-if="confirmingDelete === game.id" class="mt-3 flex gap-2">
          <button
            @click="confirmingDelete = null"
            class="flex-1 py-2 rounded-xl text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 active:scale-95 transition-all"
          >
            Cancel
          </button>
          <button
            @click="doDelete(game.id)"
            class="flex-1 py-2 rounded-xl text-sm font-medium bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 active:scale-95 transition-all"
          >
            Delete
          </button>
        </div>

        <!-- Resume button -->
        <button
          v-else-if="game.id !== activeId"
          @click="resume(game.id); $emit('navigate', 'game')"
          class="mt-3 w-full bg-lp-dark text-white font-medium py-3 rounded-xl text-sm active:scale-95 transition-all"
        >
          Resume Game
        </button>
      </div>
    </div>
  </div>
</template>

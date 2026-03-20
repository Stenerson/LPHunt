<script setup>
import { ref, computed } from 'vue'
import { STATES } from '../data/states.js'
import { PROVINCES } from '../data/provinces.js'
import { useGame } from '../composables/useGame.js'
import { useDarkMode } from '../composables/useDarkMode.js'
import ProgressBar from './ProgressBar.vue'
import StateCard from './StateCard.vue'

defineEmits(['navigate'])
const { activeGame, toggleRegionEntry, setShowCanada, countFound } = useGame()
const { isDark, toggle: toggleDark } = useDarkMode()

const menuOpen = ref(false)

const showingCanada = computed(() => activeGame.value?.showCanada ?? false)

const currentItems = computed(() =>
  showingCanada.value ? PROVINCES : STATES
)

const currentRegion = computed(() =>
  showingCanada.value ? 'provinces' : 'states'
)

const foundCount = computed(() => {
  if (!activeGame.value) return 0
  return countFound(activeGame.value, currentRegion.value)
})

const totalCount = computed(() => currentItems.value.length)

function switchRegion(toCanada) {
  if (activeGame.value) {
    setShowCanada(activeGame.value.id, toCanada)
  }
}

function handleToggle(abbr) {
  if (activeGame.value) {
    toggleRegionEntry(activeGame.value.id, abbr, currentRegion.value)
  }
}

function isFound(abbr) {
  if (!activeGame.value) return false
  return activeGame.value[currentRegion.value]?.[abbr]?.found ?? false
}
</script>

<template>
  <div v-if="activeGame" class="flex flex-col min-h-[100dvh] bg-lp-bg dark:bg-gray-900">

    <!-- Header -->
    <header class="relative bg-lp-dark text-white px-4 py-4 flex items-center justify-between sticky top-0 z-20">
      <h1 class="font-fredoka text-2xl">License Plate Hunt</h1>
      <button
        @click="menuOpen = !menuOpen"
        class="text-white/80 hover:text-white p-1 transition-colors"
        aria-label="Menu"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
      </button>

      <!-- Dropdown menu -->
      <div
        v-if="menuOpen"
        class="absolute right-0 top-full w-48 bg-white dark:bg-gray-800 shadow-xl z-30 rounded-bl-2xl overflow-hidden"
      >
        <button
          @click="menuOpen = false; $emit('navigate', 'new-game')"
          class="w-full text-left px-4 py-4 text-lp-dark dark:text-gray-100 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 active:bg-gray-100 dark:active:bg-gray-700"
        >
          New Game
        </button>
        <button
          @click="menuOpen = false; $emit('navigate', 'past-games')"
          class="w-full text-left px-4 py-4 text-lp-dark dark:text-gray-100 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 active:bg-gray-100 dark:active:bg-gray-700"
        >
          Past Games
        </button>
        <button
          @click="toggleDark"
          class="w-full text-left px-4 py-4 text-lp-dark dark:text-gray-100 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-700"
        >
          {{ isDark ? 'Light Mode' : 'Dark Mode' }}
        </button>
      </div>
    </header>

    <!-- Click-away backdrop -->
    <div v-if="menuOpen" class="fixed inset-0 z-10" @click="menuOpen = false" />

    <!-- Progress section -->
    <div class="bg-white dark:bg-gray-800 px-4 pt-3 pb-4 shadow-sm">
      <p class="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wide">{{ activeGame.name }}</p>
      <ProgressBar :found="foundCount" :total="totalCount" />
    </div>

    <!-- Region tabs (only if Canada enabled) -->
    <div v-if="activeGame.includeCanada" class="flex bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-4 gap-6">
      <button
        @click="switchRegion(false)"
        class="py-3 text-sm font-semibold border-b-2 transition-colors"
        :class="!showingCanada
          ? 'border-lp-red text-lp-red'
          : 'border-transparent text-gray-400'"
      >
        United States
      </button>
      <button
        @click="switchRegion(true)"
        class="py-3 text-sm font-semibold border-b-2 transition-colors"
        :class="showingCanada
          ? 'border-lp-red text-lp-red'
          : 'border-transparent text-gray-400'"
      >
        Canada
      </button>
    </div>

    <!-- State card grid -->
    <div
      class="flex-1 p-3 grid gap-2 content-start"
      style="grid-template-columns: repeat(auto-fill, minmax(96px, 1fr))"
    >
      <StateCard
        v-for="item in currentItems"
        :key="item.abbr"
        :abbr="item.abbr"
        :name="item.name"
        :found="isFound(item.abbr)"
        @toggle="handleToggle"
      />
    </div>
  </div>

  <!-- Fallback: no active game -->
  <div v-else class="flex items-center justify-center min-h-[100dvh]">
    <button @click="$emit('navigate', 'home')" class="text-lp-red underline">
      Go Home
    </button>
  </div>
</template>

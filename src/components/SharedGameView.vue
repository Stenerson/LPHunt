<script setup>
import { ref, computed } from 'vue'
import { STATES } from '../data/states.js'
import { PROVINCES } from '../data/provinces.js'
import { useGame } from '../composables/useGame.js'
import { useDarkMode } from '../composables/useDarkMode.js'
import ProgressBar from './ProgressBar.vue'

const props = defineProps({
  sharedGame: { type: Object, required: true },
})
const emit = defineEmits(['navigate'])

const { importGame, activeGame } = useGame()
const { isDark, toggle: toggleDark } = useDarkMode()
const showingCanada = ref(false)

const currentItems = computed(() => showingCanada.value ? PROVINCES : STATES)
const currentRegion = computed(() => showingCanada.value ? 'provinces' : 'states')

function isFound(abbr) {
  return props.sharedGame[currentRegion.value]?.[abbr]?.found ?? false
}

function countFound(region) {
  if (!props.sharedGame[region]) return 0
  return Object.values(props.sharedGame[region]).filter(e => e.found).length
}

const foundCount = computed(() => countFound(currentRegion.value))
const totalCount = computed(() => currentItems.value.length)

function goBack() {
  emit('navigate', activeGame.value ? 'game' : 'home')
}

function saveAndPlay() {
  importGame(props.sharedGame)
  emit('navigate', 'game')
}
</script>

<template>
  <div class="flex flex-col min-h-[100dvh] bg-lp-bg dark:bg-gray-900">
    <!-- Same header as GameView -->
    <header class="bg-lp-dark text-white px-4 py-4 flex items-center justify-between sticky top-0 z-20">
      <div class="flex items-center gap-2">
        <svg class="w-5 h-5 text-white/70 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <h1 class="font-fredoka text-2xl">License Plate Hunt</h1>
      </div>
      <button @click="toggleDark" class="text-white/80 hover:text-white p-1 transition-colors">
        <svg v-if="isDark" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z"/>
        </svg>
        <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
        </svg>
      </button>
    </header>

    <!-- Shared game context banner with back button -->
    <div class="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-700/50 px-4 py-3 text-sm text-amber-800 dark:text-amber-300 flex items-center gap-3">
      <button @click="goBack" class="text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 transition-colors text-base leading-none flex-shrink-0">
        &#8592;
      </button>
      <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
      </svg>
      Viewing a shared game — read only
    </div>

    <!-- Progress -->
    <div class="bg-white dark:bg-gray-800 px-4 pt-3 pb-4 shadow-sm">
      <p class="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wide">{{ sharedGame.name }}</p>
      <ProgressBar :found="foundCount" :total="totalCount" />
    </div>

    <!-- Region tabs -->
    <div v-if="sharedGame.includeCanada" class="flex bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-4 gap-6">
      <button
        @click="showingCanada = false"
        class="py-3 text-sm font-semibold border-b-2 transition-colors"
        :class="!showingCanada ? 'border-lp-red text-lp-red' : 'border-transparent text-gray-400'"
      >
        United States
      </button>
      <button
        @click="showingCanada = true"
        class="py-3 text-sm font-semibold border-b-2 transition-colors"
        :class="showingCanada ? 'border-lp-red text-lp-red' : 'border-transparent text-gray-400'"
      >
        Canada
      </button>
    </div>

    <!-- Read-only state grid -->
    <div
      class="flex-1 p-3 grid gap-2 content-start pb-24"
      style="grid-template-columns: repeat(auto-fill, minmax(96px, 1fr))"
    >
      <div
        v-for="item in currentItems"
        :key="item.abbr"
        class="relative flex flex-col items-center justify-center rounded-xl min-h-[96px] p-2 w-full select-none overflow-hidden"
        :class="isFound(item.abbr)
          ? 'bg-lp-green text-white shadow-md'
          : 'bg-white dark:bg-gray-800 text-lp-dark dark:text-gray-100 shadow-sm border border-gray-200 dark:border-gray-700 opacity-40'"
      >
        <span class="font-bold text-base leading-none">{{ item.abbr }}</span>
        <span class="text-[9px] uppercase tracking-normal mt-1 leading-tight text-center opacity-75 w-full px-0.5">{{ item.name }}</span>
        <span v-if="isFound(item.abbr)" class="absolute top-1 right-1.5 text-[10px] opacity-60">&#10003;</span>
      </div>
    </div>

    <!-- Sticky CTA -->
    <div class="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 p-4">
      <button
        @click="saveAndPlay"
        class="w-full bg-lp-red text-white font-semibold text-lg py-4 rounded-2xl shadow-lg active:scale-95 transition-all"
      >
        Continue This Game
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import confetti from 'canvas-confetti'
import { STATES } from '../data/states.js'
import { PROVINCES } from '../data/provinces.js'
import { useGame } from '../composables/useGame.js'
import { useDarkMode } from '../composables/useDarkMode.js'
import { encodeGame } from '../composables/useShare.js'
import ProgressBar from './ProgressBar.vue'
import StateCard from './StateCard.vue'

defineEmits(['navigate'])
const { games, activeGame, toggleRegionEntry, setShowCanada, toggleIncludeCanada, countFound } = useGame()
const { isDark, toggle: toggleDark } = useDarkMode()

const menuOpen = ref(false)

// Keep screen awake while playing
let wakeLock = null
async function acquireWakeLock() {
  if (!('wakeLock' in navigator)) return
  try {
    wakeLock = await navigator.wakeLock.request('screen')
  } catch {}
}
onMounted(() => {
  acquireWakeLock()
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') acquireWakeLock()
  })
})
onUnmounted(() => {
  wakeLock?.release()
  wakeLock = null
})

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

// Always track US states found (regardless of active tab)
const statesFound = computed(() => {
  if (!activeGame.value) return 0
  return countFound(activeGame.value, 'states')
})

// Total found across all regions in this game
const totalFound = computed(() => {
  if (!activeGame.value) return 0
  return countFound(activeGame.value, 'states') +
    (activeGame.value.includeCanada ? countFound(activeGame.value, 'provinces') : 0)
})

// Best total from any other game (excluding current)
const previousBest = computed(() => {
  const others = games.value.filter(g => g.id !== activeGame.value?.id)
  if (others.length === 0) return -1
  return Math.max(0, ...others.map(g =>
    countFound(g, 'states') + (g.includeCanada ? countFound(g, 'provinces') : 0)
  ))
})

// Share
const linkCopied = ref(false)

async function shareGame() {
  const url = window.location.href.split('#')[0] + '#share=' + encodeGame(activeGame.value)
  menuOpen.value = false

  if (navigator.share) {
    try {
      await navigator.share({ url })
    } catch (e) {
      if (e.name !== 'AbortError') {
        await navigator.clipboard.writeText(url)
        linkCopied.value = true
        setTimeout(() => { linkCopied.value = false }, 2500)
      }
    }
    return
  }

  await navigator.clipboard.writeText(url)
  linkCopied.value = true
  setTimeout(() => { linkCopied.value = false }, 2500)
}

// Celebration state
const showAllStatesOverlay = ref(false)
const showHighScoreBanner = ref(false)
const highScoreCount = ref(0)
const celebratedAllStates = ref(false)
const celebratedHighScore = ref(false)

// Reset celebrations when game changes
watch(() => activeGame.value?.id, () => {
  celebratedAllStates.value = false
  celebratedHighScore.value = false
})

// All 50 US states found
watch(statesFound, (newVal, oldVal) => {
  if (newVal === 50 && oldVal < 50 && !celebratedAllStates.value) {
    celebratedAllStates.value = true
    showAllStatesOverlay.value = true
    confetti({
      particleCount: 250,
      spread: 120,
      origin: { y: 0.4 },
      colors: ['#E63946', '#2D6A4F', '#ffffff', '#ffd700'],
    })
  }
})

// New personal best
watch(totalFound, (newVal, oldVal) => {
  if (previousBest.value >= 0 && newVal > previousBest.value && newVal > oldVal && !celebratedHighScore.value) {
    celebratedHighScore.value = true
    highScoreCount.value = newVal
    showHighScoreBanner.value = true
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.1 },
      colors: ['#ffd700', '#ffa500', '#ffffff'],
    })
    setTimeout(() => { showHighScoreBanner.value = false }, 4000)
  }
})

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
      <div class="flex items-center gap-2">
        <svg class="w-5 h-5 text-white/70 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <h1 class="font-fredoka text-2xl">License Plate Hunt</h1>
      </div>
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
        class="absolute right-0 top-full w-52 bg-white dark:bg-gray-800 shadow-xl z-30 rounded-bl-2xl overflow-hidden"
      >
        <button
          @click="menuOpen = false; $emit('navigate', 'new-game')"
          class="w-full text-left px-4 py-3.5 text-lp-dark dark:text-gray-100 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 active:bg-gray-100 dark:active:bg-gray-700 flex items-center gap-3"
        >
          <svg class="w-5 h-5 opacity-60 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          New Game
        </button>
        <button
          @click="menuOpen = false; $emit('navigate', 'past-games')"
          class="w-full text-left px-4 py-3.5 text-lp-dark dark:text-gray-100 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 active:bg-gray-100 dark:active:bg-gray-700 flex items-center gap-3"
        >
          <svg class="w-5 h-5 opacity-60 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          Past Games
        </button>
        <button
          @click="shareGame"
          class="w-full text-left px-4 py-3.5 text-lp-dark dark:text-gray-100 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 active:bg-gray-100 dark:active:bg-gray-700 flex items-center gap-3"
        >
          <svg class="w-5 h-5 opacity-60 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
          </svg>
          Share Game
        </button>
        <button
          v-if="activeGame"
          @click="toggleIncludeCanada(activeGame.id)"
          class="w-full text-left px-4 py-3.5 text-lp-dark dark:text-gray-100 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 active:bg-gray-100 dark:active:bg-gray-700 flex items-center gap-3"
        >
          <!-- Globe -->
          <svg class="w-5 h-5 opacity-60 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          {{ activeGame.includeCanada ? 'Remove Canada' : 'Add Canada' }}
        </button>
        <button
          @click="toggleDark"
          class="w-full text-left px-4 py-3.5 text-lp-dark dark:text-gray-100 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-700 flex items-center gap-3"
        >
          <!-- Sun icon -->
          <svg v-if="isDark" class="w-5 h-5 opacity-60 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z"/>
          </svg>
          <!-- Moon icon -->
          <svg v-else class="w-5 h-5 opacity-60 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
          </svg>
          {{ isDark ? 'Light Mode' : 'Dark Mode' }}
        </button>
      </div>
    </header>

    <!-- Click-away backdrop -->
    <div v-if="menuOpen" class="fixed inset-0 z-10" @click="menuOpen = false" />

    <!-- Link copied toast -->
    <Transition name="slide-down">
      <div
        v-if="linkCopied"
        class="bg-lp-dark text-white text-center py-3 px-4 font-semibold shadow-md z-40"
      >
        Link copied to clipboard!
      </div>
    </Transition>

    <!-- High score banner -->
    <Transition name="slide-down">
      <div
        v-if="showHighScoreBanner"
        class="bg-lp-green text-white text-center py-3 px-4 font-semibold shadow-md z-40"
      >
        New High Score — {{ highScoreCount }} plates found!
      </div>
    </Transition>

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

  <!-- All 50 states overlay -->
  <Transition name="fade">
    <div
      v-if="showAllStatesOverlay"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      @click="showAllStatesOverlay = false"
    >
      <div class="bg-white dark:bg-gray-800 rounded-3xl p-8 mx-6 text-center shadow-2xl">
        <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-lp-green/10 flex items-center justify-center">
          <svg class="w-9 h-9 text-lp-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
          </svg>
        </div>
        <h2 class="font-fredoka text-3xl text-lp-dark dark:text-gray-100 mb-2">All 50 States!</h2>
        <p class="text-gray-500 dark:text-gray-400 text-sm">You found every US license plate on this trip.</p>
        <p class="text-gray-300 dark:text-gray-600 text-xs mt-5">Tap anywhere to continue</p>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.4s ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-100%);
}
</style>

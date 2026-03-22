<script setup>
import { ref, computed } from 'vue'
import { STATES } from '../data/states.js'
import { PROVINCES } from '../data/provinces.js'
import { useGame } from '../composables/useGame.js'
import { useDarkMode } from '../composables/useDarkMode.js'
import { encodeGame } from '../composables/useShare.js'
import ProgressBar from './ProgressBar.vue'

const props = defineProps({
  sharedGame: { type: Object, required: true },
})
const emit = defineEmits(['navigate', 'merge'])

const { importGame, mergeGame, activeGame } = useGame()
const { isDark, toggle: toggleDark } = useDarkMode()
const showingCanada = ref(false)
const showInfoModal = ref(true)
const showShareBackModal = ref(false)
const shareBackCopied = ref(false)

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

const myFoundCount = computed(() => {
  if (!activeGame.value) return foundCount.value
  return currentItems.value.filter(item => isFoundInMyGame(item.abbr)).length
})

const newCount = computed(() => {
  if (!activeGame.value) return 0
  return currentItems.value.filter(item => wouldBeNew(item.abbr)).length
})

function goBack() {
  emit('navigate', activeGame.value ? 'game' : 'home')
}

function isFoundInMyGame(abbr) {
  return activeGame.value?.[currentRegion.value]?.[abbr]?.found ?? false
}

function wouldBeNew(abbr) {
  if (!activeGame.value) return false
  return isFound(abbr) && !isFoundInMyGame(abbr)
}

// Returns one of: 'new' | 'both' | 'found' | 'unfound'
function cardState(abbr) {
  const shared = isFound(abbr)
  const mine   = isFoundInMyGame(abbr)
  if (shared && !mine) return 'new'
  if (shared && mine)  return 'both'
  if (mine)            return 'found'
  return 'unfound'
}

function mergeAndPlay() {
  mergeGame(props.sharedGame)
  showShareBackModal.value = true
}

async function copyToClipboard(url) {
  try {
    await navigator.clipboard.writeText(url)
    return true
  } catch {
    try {
      const ta = document.createElement('textarea')
      ta.value = url
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.focus()
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      return true
    } catch {
      return false
    }
  }
}

async function shareBack() {
  const url = window.location.href.split('#')[0] + '#share/' + encodeGame(activeGame.value)
  if (navigator.share) {
    try {
      await navigator.share({ url })
    } catch (e) {
      if (e.name !== 'AbortError') {
        const ok = await copyToClipboard(url)
        if (ok) { shareBackCopied.value = true }
      }
    }
    return
  }
  const ok = await copyToClipboard(url)
  if (ok) { shareBackCopied.value = true }
}

function finishMerge() {
  emit('merge')
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
      <div class="flex items-center gap-1.5 mb-2">
        <p class="text-xs text-gray-400 font-medium uppercase tracking-wide">{{ sharedGame.name || 'Shared game' }} &middot; {{ foundCount }}/{{ totalCount }} found</p>
        <button @click="showInfoModal = true" aria-label="Show guide" class="text-gray-300 dark:text-gray-600 hover:text-gray-400 dark:hover:text-gray-400 transition-colors">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </button>
      </div>
      <ProgressBar :found="myFoundCount" :total="totalCount" :additional="newCount" />
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
      class="flex-1 p-3 grid gap-2 content-start pb-40"
      style="grid-template-columns: repeat(auto-fill, minmax(140px, 1fr))"
    >
      <div
        v-for="item in currentItems"
        :key="item.abbr"
        class="relative flex flex-col rounded-xl overflow-hidden w-full aspect-[2/1] select-none border-2"
        :class="{
          'bg-amber-100 border-amber-100 shadow-md':                    cardState(item.abbr) === 'new',
          'bg-amber-100 border-lp-green shadow-md':                      cardState(item.abbr) === 'both',
          'bg-white border-lp-green shadow-md':                         cardState(item.abbr) === 'found',
          'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 shadow-sm': cardState(item.abbr) === 'unfound',
        }"
      >
        <!-- Top strip -->
        <div class="h-4 w-full flex-shrink-0" :class="{
          'bg-amber-200':                     cardState(item.abbr) === 'new',
          'bg-lp-green':                      cardState(item.abbr) === 'both' || cardState(item.abbr) === 'found',
          'bg-gray-300 dark:bg-gray-600':     cardState(item.abbr) === 'unfound',
        }"/>

        <!-- Bolt holes -->
        <svg class="absolute top-1.5 left-2 w-2.5 h-2.5" viewBox="0 0 10 10">
          <circle cx="5" cy="5" r="4.5"
            :fill="cardState(item.abbr) === 'unfound' ? '#9CA3AF' : '#D1D5DB'"
            :stroke="cardState(item.abbr) === 'unfound' ? '#6B7280' : '#9CA3AF'"
            stroke-width="0.8"
          />
          <line x1="5" y1="2" x2="5" y2="8" :stroke="cardState(item.abbr) === 'unfound' ? '#6B7280' : '#9CA3AF'" stroke-width="1.5" stroke-linecap="round"/>
          <line x1="2" y1="5" x2="8" y2="5" :stroke="cardState(item.abbr) === 'unfound' ? '#6B7280' : '#9CA3AF'" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        <svg class="absolute top-1.5 right-2 w-2.5 h-2.5" viewBox="0 0 10 10">
          <circle cx="5" cy="5" r="4.5"
            :fill="cardState(item.abbr) === 'unfound' ? '#9CA3AF' : '#D1D5DB'"
            :stroke="cardState(item.abbr) === 'unfound' ? '#6B7280' : '#9CA3AF'"
            stroke-width="0.8"
          />
          <line x1="5" y1="2" x2="5" y2="8" :stroke="cardState(item.abbr) === 'unfound' ? '#6B7280' : '#9CA3AF'" stroke-width="1.5" stroke-linecap="round"/>
          <line x1="2" y1="5" x2="8" y2="5" :stroke="cardState(item.abbr) === 'unfound' ? '#6B7280' : '#9CA3AF'" stroke-width="1.5" stroke-linecap="round"/>
        </svg>

        <!-- Main content -->
        <div class="flex-1 flex flex-col items-center justify-center px-2">
          <span
            class="font-black text-xl leading-none tracking-normal"
            :class="cardState(item.abbr) === 'unfound' ? 'text-gray-500 dark:text-gray-400' : 'text-lp-dark'"
          >{{ item.abbr }}</span>
          <span
            class="text-[9px] uppercase tracking-normal mt-0.5 leading-tight text-center w-full overflow-hidden"
            :class="cardState(item.abbr) === 'unfound' ? 'text-gray-500 dark:text-gray-400 opacity-75' : 'text-lp-dark opacity-60'"
          >{{ item.name }}</span>
        </div>

        <!-- Bottom strip -->
        <div class="h-2 w-full flex-shrink-0" :class="{
          'bg-amber-200':                     cardState(item.abbr) === 'new',
          'bg-lp-green':                      cardState(item.abbr) === 'both' || cardState(item.abbr) === 'found',
          'bg-gray-300 dark:bg-gray-600':     cardState(item.abbr) === 'unfound',
        }"/>
      </div>
    </div>

    <!-- Sticky CTA -->
    <div class="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 p-4 flex flex-col gap-3">
      <button
        v-if="activeGame"
        @click="mergeAndPlay"
        class="w-full bg-amber-100 text-lp-dark font-semibold text-lg py-4 rounded-2xl shadow-lg active:scale-95 transition-all"
      >
        Merge into My Game
      </button>
      <button
        @click="saveAndPlay"
        class="w-full bg-lp-red text-white font-semibold text-lg py-4 rounded-2xl shadow-lg active:scale-95 transition-all"
      >
        Continue as New Game
      </button>
    </div>
  </div>

  <!-- Share-back prompt (shown after merging) -->
  <Transition name="fade">
    <div
      v-if="showShareBackModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <div class="bg-white dark:bg-gray-800 rounded-3xl p-6 mx-6 shadow-2xl max-w-sm w-full">
        <div class="text-4xl mb-3 text-center">🔀</div>
        <h2 class="font-fredoka text-2xl text-lp-dark dark:text-gray-100 text-center mb-2">Merged!</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
          Their finds are now in your game. Want to share back so they can stay in sync?
        </p>

        <button
          @click="shareBack"
          class="w-full font-semibold text-lg py-4 rounded-2xl shadow-lg active:scale-95 transition-all mb-3"
          :class="shareBackCopied
            ? 'bg-lp-green text-white'
            : 'bg-amber-100 text-lp-dark'"
        >
          {{ shareBackCopied ? '✓ Link Copied!' : 'Share My Game' }}
        </button>

        <button
          @click="finishMerge"
          class="w-full text-gray-400 dark:text-gray-500 text-sm py-2 active:opacity-70 transition-opacity"
        >
          Not now
        </button>
      </div>
    </div>
  </Transition>

  <!-- Shared game explainer modal -->
  <Transition name="fade">
    <div
      v-if="showInfoModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      @click.self="showInfoModal = false"
    >
      <div class="bg-white dark:bg-gray-800 rounded-3xl p-6 mx-6 shadow-2xl max-w-sm w-full">

        <!-- Header -->
        <h2 class="font-fredoka text-2xl text-lp-dark dark:text-gray-100 mb-1">{{ sharedGame.name || "Friend's Game" }}</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">Here's how to read the color coding:</p>

        <!-- New plates callout (only when comparing to an active game) -->
        <div
          v-if="activeGame && newCount > 0"
          class="flex items-center gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-2xl px-4 py-3 mb-4"
        >
          <span class="text-2xl leading-none">🎉</span>
          <p class="text-sm text-amber-800 dark:text-amber-300">
            Your friend found
            <strong>{{ newCount }} plate{{ newCount === 1 ? '' : 's' }}</strong>
            you haven't spotted yet!
          </p>
        </div>
        <div
          v-else-if="activeGame && newCount === 0"
          class="flex items-center gap-3 bg-lp-green/10 border border-lp-green/30 rounded-2xl px-4 py-3 mb-4"
        >
          <span class="text-2xl leading-none">✅</span>
          <p class="text-sm text-lp-green font-medium">You've already found everything they have!</p>
        </div>

        <!-- Color legend -->
        <div class="flex flex-col gap-3 mb-5">

          <!-- Amber: new for you (only when activeGame exists) -->
          <div v-if="activeGame" class="flex items-center gap-3">
            <div class="w-16 h-8 rounded-lg overflow-hidden border-2 border-amber-200 shadow-sm flex-shrink-0 flex flex-col">
              <div class="h-2 w-full bg-amber-200"></div>
              <div class="flex-1 bg-amber-100 flex items-center justify-center">
                <span class="font-black text-xs text-lp-dark leading-none">NY</span>
              </div>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-300">Your friend found it — <strong class="text-lp-dark dark:text-gray-100">new for you</strong></p>
          </div>

          <!-- Green: found (by either or both) -->
          <div class="flex items-center gap-3">
            <div class="w-16 h-8 rounded-lg overflow-hidden border-2 border-lp-green shadow-sm flex-shrink-0 flex flex-col">
              <div class="h-2 w-full bg-lp-green"></div>
              <div class="flex-1 bg-white dark:bg-gray-700 flex items-center justify-center">
                <span class="font-black text-xs text-lp-dark dark:text-gray-100 leading-none">CA</span>
              </div>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-300">
              {{ activeGame ? 'Found by you or both of you' : 'Found by your friend' }}
            </p>
          </div>

          <!-- Gray: not found -->
          <div class="flex items-center gap-3">
            <div class="w-16 h-8 rounded-lg overflow-hidden border-2 border-gray-300 dark:border-gray-600 shadow-sm flex-shrink-0 flex flex-col">
              <div class="h-2 w-full bg-gray-300 dark:bg-gray-600"></div>
              <div class="flex-1 bg-white dark:bg-gray-800 flex items-center justify-center">
                <span class="font-black text-xs text-gray-400 leading-none">TX</span>
              </div>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-300">Not found yet</p>
          </div>

        </div>

        <!-- Action explanations -->
        <div class="border-t border-gray-100 dark:border-gray-700 pt-4 mb-5 flex flex-col gap-2.5">
          <div v-if="activeGame" class="flex items-start gap-3">
            <span class="text-base leading-none mt-0.5">🔀</span>
            <p class="text-sm text-gray-600 dark:text-gray-300"><strong class="text-lp-dark dark:text-gray-100">Merge into My Game</strong> — adds their new plates to your current game</p>
          </div>
          <div class="flex items-start gap-3">
            <span class="text-base leading-none mt-0.5">▶️</span>
            <p class="text-sm text-gray-600 dark:text-gray-300"><strong class="text-lp-dark dark:text-gray-100">Continue as New Game</strong> — starts fresh from their progress</p>
          </div>
          <div class="flex items-start gap-3">
            <span class="text-base leading-none mt-0.5">← </span>
            <p class="text-sm text-gray-600 dark:text-gray-300"><strong class="text-lp-dark dark:text-gray-100">Back arrow</strong> — just browse, no changes to your game</p>
          </div>
        </div>

        <button
          @click="showInfoModal = false"
          class="w-full bg-lp-dark dark:bg-gray-700 text-white font-semibold py-3 rounded-2xl active:scale-95 transition-all"
        >
          Got it
        </button>
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
</style>

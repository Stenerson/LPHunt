<script setup>
import { ref, computed, nextTick } from 'vue'
import { useGame } from '../composables/useGame.js'
import { STATES } from '../data/states.js'
import { PROVINCES } from '../data/provinces.js'
import { encodeGame } from '../composables/useShare.js'
import ProgressBar from './ProgressBar.vue'

defineEmits(['navigate'])
const { games, activeId, activeGame, setActiveGame, countFound, deleteGame, renameGame } = useGame()

const editingGameId = ref(null)
const editingName = ref('')

// ── All-time stats ────────────────────────────────────────────────
const stateFoundCounts = computed(() => {
  const counts = {}
  for (const game of games.value) {
    for (const { abbr } of STATES) {
      if (game.states?.[abbr]?.found) counts[abbr] = (counts[abbr] || 0) + 1
    }
  }
  return counts
})

const totalPlatesAllTime = computed(() =>
  games.value.reduce((sum, g) =>
    sum + countFound(g, 'states') + (g.includeCanada ? countFound(g, 'provinces') : 0), 0)
)

const uniqueStatesEverFound = computed(() => Object.keys(stateFoundCounts.value).length)

const bestGame = computed(() => {
  if (!games.value.length) return null
  return games.value.reduce((best, g) => {
    const n = countFound(g, 'states') + (g.includeCanada ? countFound(g, 'provinces') : 0)
    const bN = countFound(best, 'states') + (best.includeCanada ? countFound(best, 'provinces') : 0)
    return n > bN ? g : best
  })
})

const mostSpottedState = computed(() => {
  const counts = stateFoundCounts.value
  if (!Object.keys(counts).length) return null
  const abbr = Object.keys(counts).reduce((a, b) => counts[a] >= counts[b] ? a : b)
  return { abbr, name: STATES.find(s => s.abbr === abbr)?.name, count: counts[abbr] }
})

const rarestCatch = computed(() => {
  const counts = stateFoundCounts.value
  const abbrs = Object.keys(counts)
  if (!abbrs.length) return null
  const abbr = abbrs.reduce((a, b) => counts[a] <= counts[b] ? a : b)
  return { abbr, name: STATES.find(s => s.abbr === abbr)?.name, count: counts[abbr] }
})

const neverFound = computed(() =>
  STATES.filter(s => !stateFoundCounts.value[s.abbr])
)

async function startRename(game) {
  editingGameId.value = game.id
  editingName.value = game.name
  await nextTick()
  document.getElementById(`rename-${game.id}`)?.focus()
}

function commitRename(gameId) {
  if (editingGameId.value !== gameId) return
  renameGame(gameId, editingName.value)
  editingGameId.value = null
}

function cancelRename() {
  editingGameId.value = null
}

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

async function shareGame(game) {
  const url = window.location.href.split('#')[0] + '#share/' + encodeGame(game)
  if (navigator.share) {
    try {
      await navigator.share({ url })
    } catch (e) {
      if (e.name !== 'AbortError') {
        await copyToClipboard(url)
        copiedGameId.value = game.id
        setTimeout(() => { copiedGameId.value = null }, 2000)
      }
    }
    return
  }
  const ok = await copyToClipboard(url)
  if (ok) {
    copiedGameId.value = game.id
    setTimeout(() => { copiedGameId.value = null }, 2000)
  }
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

      <!-- ── Stats section ── -->
      <div class="space-y-3">

        <!-- Headline numbers -->
        <div class="grid grid-cols-3 gap-2">
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-3 text-center border border-gray-100 dark:border-gray-700">
            <p class="font-fredoka text-3xl text-lp-red leading-none">{{ totalPlatesAllTime }}</p>
            <p class="text-[10px] uppercase tracking-wide text-gray-400 mt-1 leading-tight">All-time plates</p>
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-3 text-center border border-gray-100 dark:border-gray-700">
            <p class="font-fredoka text-3xl text-lp-green leading-none">{{ uniqueStatesEverFound }}<span class="text-base text-gray-300 dark:text-gray-600">/50</span></p>
            <p class="text-[10px] uppercase tracking-wide text-gray-400 mt-1 leading-tight">Unique states</p>
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-3 text-center border border-gray-100 dark:border-gray-700">
            <p class="font-fredoka text-3xl text-lp-dark dark:text-gray-100 leading-none">{{ sortedGames.length }}</p>
            <p class="text-[10px] uppercase tracking-wide text-gray-400 mt-1 leading-tight">Games played</p>
          </div>
        </div>

        <!-- Insights card -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">

          <!-- Best game -->
          <div v-if="bestGame" class="flex items-center justify-between px-4 py-3">
            <div class="flex items-center gap-2">
              <svg class="w-5 h-5 opacity-60 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
              </svg>
              <div>
                <p class="text-xs font-semibold text-lp-dark dark:text-gray-100">Best game</p>
                <p class="text-xs text-gray-400 truncate max-w-[160px]">{{ bestGame.name }}</p>
              </div>
            </div>
            <span class="text-sm font-bold text-lp-dark dark:text-gray-100">
              {{ countFound(bestGame, 'states') + (bestGame.includeCanada ? countFound(bestGame, 'provinces') : 0) }} plates
            </span>
          </div>

          <!-- Most spotted -->
          <div v-if="mostSpottedState" class="flex items-center justify-between px-4 py-3">
            <div class="flex items-center gap-2">
              <svg class="w-5 h-5 opacity-60 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
              <div>
                <p class="text-xs font-semibold text-lp-dark dark:text-gray-100">Most spotted</p>
                <p class="text-xs text-gray-400">{{ mostSpottedState.name }}</p>
              </div>
            </div>
            <span class="text-sm font-bold text-lp-dark dark:text-gray-100">
              {{ mostSpottedState.count }}×
            </span>
          </div>

          <!-- Rarest catch (only interesting if more than 1 game) -->
          <div v-if="rarestCatch && sortedGames.length > 1" class="flex items-center justify-between px-4 py-3">
            <div class="flex items-center gap-2">
              <svg class="w-5 h-5 opacity-60 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
              </svg>
              <div>
                <p class="text-xs font-semibold text-lp-dark dark:text-gray-100">Rarest catch</p>
                <p class="text-xs text-gray-400">{{ rarestCatch.name }}</p>
              </div>
            </div>
            <span class="text-sm font-bold text-lp-dark dark:text-gray-100">
              {{ rarestCatch.count }}×
            </span>
          </div>

          <!-- Never found -->
          <div v-if="neverFound.length" class="px-4 py-3">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <svg class="w-5 h-5 opacity-60 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"/>
                </svg>
                <p class="text-xs font-semibold text-lp-dark dark:text-gray-100">Never found</p>
              </div>
              <span class="text-sm font-bold text-lp-dark dark:text-gray-100">{{ neverFound.length }}</span>
            </div>
            <div class="flex flex-wrap gap-1">
              <span
                v-for="s in neverFound"
                :key="s.abbr"
                class="text-[10px] font-semibold bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full"
              >{{ s.abbr }}</span>
            </div>
          </div>

        </div>
      </div>

      <!-- ── Game list ── -->
      <div
        v-for="game in sortedGames"
        :key="game.id"
        class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4 border"
        :class="game.id === activeId ? 'border-lp-green' : 'border-gray-100 dark:border-gray-700'"
      >
        <div class="flex items-start justify-between mb-1">
          <div class="flex-1 min-w-0 pr-3">
            <!-- Inline rename input -->
            <div v-if="editingGameId === game.id" class="flex items-center gap-1 mb-0.5">
              <input
                :id="`rename-${game.id}`"
                v-model="editingName"
                @keydown.enter="commitRename(game.id)"
                @keydown.escape="cancelRename"
                @blur="commitRename(game.id)"
                class="flex-1 min-w-0 font-semibold text-lp-dark dark:text-gray-100 bg-gray-100 dark:bg-gray-700 rounded-lg px-2 py-0.5 text-sm outline-none focus:ring-2 focus:ring-lp-red"
              />
            </div>
            <!-- Static name + pencil -->
            <div v-else class="flex items-center gap-1.5 group">
              <p class="font-semibold text-lp-dark dark:text-gray-100 truncate">{{ game.name }}</p>
              <button
                @click.stop="startRename(game)"
                class="opacity-40 hover:opacity-100 focus:opacity-100 p-2 -m-1 rounded text-gray-400 hover:text-lp-dark dark:hover:text-gray-100 transition-opacity flex-shrink-0"
                title="Rename game"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 2.828L11.828 15.828a2 2 0 01-1.414.586H8v-2.414a2 2 0 01.586-1.414z"/>
                </svg>
              </button>
            </div>
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

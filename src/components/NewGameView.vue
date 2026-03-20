<script setup>
import { ref, computed } from 'vue'
import { STATES } from '../data/states.js'
import { useGame } from '../composables/useGame.js'

const emit = defineEmits(['navigate'])
const { activeGame, createGame, countFound } = useGame()

const startingState = ref(STATES[7].abbr) // Default: Delaware (middle of list)
const includeCanada = ref(false)

const activeFoundCount = computed(() => {
  if (!activeGame.value) return 0
  return countFound(activeGame.value, 'states') +
    (activeGame.value.includeCanada ? countFound(activeGame.value, 'provinces') : 0)
})

function submit() {
  createGame(startingState.value, includeCanada.value)
  emit('navigate', 'game')
}
</script>

<template>
  <div class="flex flex-col min-h-[100dvh] bg-lp-bg">
    <header class="bg-lp-dark text-white px-4 py-4 flex items-center gap-3">
      <button
        v-if="activeGame"
        @click="$emit('navigate', 'game')"
        class="text-white/70 hover:text-white transition-colors text-xl leading-none p-1"
      >
        &#8592;
      </button>
      <h1 class="font-fredoka text-2xl">New Game</h1>
    </header>

    <!-- Warning banner when a game is already active -->
    <div
      v-if="activeGame"
      class="bg-amber-50 border-b border-amber-200 px-4 py-3 text-sm text-amber-800"
    >
      You have a game in progress with
      <strong>{{ activeFoundCount }} {{ activeFoundCount === 1 ? 'plate' : 'plates' }}</strong> found.
      Starting a new game won't delete it — you can always come back.
    </div>

    <div class="flex-1 flex flex-col justify-center px-6 py-8 max-w-md mx-auto w-full">
      <h2 class="font-fredoka text-3xl text-lp-dark mb-2">Where are you starting?</h2>
      <p class="text-gray-400 text-sm mb-8">We'll use this to calculate plate rarity in a future update.</p>

      <div class="space-y-5">
        <div>
          <label class="block text-sm font-medium text-gray-600 mb-2">Starting state</label>
          <select
            v-model="startingState"
            class="w-full border border-gray-300 rounded-xl py-3 px-4 text-lp-dark text-base bg-white focus:outline-none focus:ring-2 focus:ring-lp-red appearance-none"
          >
            <option v-for="s in STATES" :key="s.abbr" :value="s.abbr">
              {{ s.name }}
            </option>
          </select>
        </div>

        <label class="flex items-center gap-3 cursor-pointer py-1">
          <input
            type="checkbox"
            v-model="includeCanada"
            class="w-5 h-5 rounded accent-lp-red flex-shrink-0"
          />
          <div>
            <span class="text-lp-dark font-medium">Include Canadian provinces</span>
            <p class="text-gray-400 text-xs mt-0.5">Adds 13 provinces &amp; territories</p>
          </div>
        </label>

        <button
          @click="submit"
          class="w-full bg-lp-red text-white font-semibold text-lg py-4 rounded-2xl shadow-lg active:scale-95 transition-all mt-2"
        >
          Let's Go!
        </button>
      </div>
    </div>
  </div>
</template>

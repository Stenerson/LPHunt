<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useGame } from './composables/useGame.js'
import { useDarkMode } from './composables/useDarkMode.js'
import { decodeGame } from './composables/useShare.js'
import HomeView from './components/HomeView.vue'
import NewGameView from './components/NewGameView.vue'
import GameView from './components/GameView.vue'
import PastGamesView from './components/PastGamesView.vue'
import SharedGameView from './components/SharedGameView.vue'

const { activeGame } = useGame()
const { isDark } = useDarkMode()
const currentView = ref('home')
const sharedGameData = ref(null)

function tryHandleShareHash() {
  const hash = window.location.hash
  if (hash.startsWith('#share=') || hash.startsWith('#share/')) {
    const encoded = hash.slice(7)
    const data = decodeGame(encoded)
    if (data) {
      sharedGameData.value = data
      currentView.value = 'shared-game'
      history.replaceState(null, '', window.location.pathname + window.location.search)
      return true
    }
  }
  return false
}

onMounted(() => {
  if (!tryHandleShareHash()) {
    currentView.value = activeGame.value ? 'game' : 'home'
  }
  window.addEventListener('hashchange', tryHandleShareHash)
})

onUnmounted(() => {
  window.removeEventListener('hashchange', tryHandleShareHash)
})

function navigate(view) {
  currentView.value = view
}

function handleMerge() {
  currentView.value = 'game'
}
</script>

<template>
  <div :class="['min-h-[100dvh] bg-lp-bg dark:bg-gray-900', { dark: isDark }]">
    <HomeView
      v-if="currentView === 'home'"
      @navigate="navigate"
    />
    <NewGameView
      v-else-if="currentView === 'new-game'"
      @navigate="navigate"
    />
    <GameView
      v-else-if="currentView === 'game'"
      @navigate="navigate"
    />
    <PastGamesView
      v-else-if="currentView === 'past-games'"
      @navigate="navigate"
    />
    <SharedGameView
      v-else-if="currentView === 'shared-game' && sharedGameData"
      :sharedGame="sharedGameData"
      @navigate="navigate"
      @merge="handleMerge"
    />
  </div>
</template>

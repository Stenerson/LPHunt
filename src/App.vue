<script setup>
import { ref, onMounted } from 'vue'
import { useGame } from './composables/useGame.js'
import { useDarkMode } from './composables/useDarkMode.js'
import HomeView from './components/HomeView.vue'
import NewGameView from './components/NewGameView.vue'
import GameView from './components/GameView.vue'
import PastGamesView from './components/PastGamesView.vue'

const { activeGame } = useGame()
const { isDark } = useDarkMode()
const currentView = ref('home')

onMounted(() => {
  currentView.value = activeGame.value ? 'game' : 'home'
})

function navigate(view) {
  currentView.value = view
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
  </div>
</template>

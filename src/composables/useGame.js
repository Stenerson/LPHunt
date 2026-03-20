import { ref, computed } from 'vue'
import { useStorage } from './useStorage.js'
import { STATES } from '../data/states.js'
import { PROVINCES } from '../data/provinces.js'

// Module-level singleton state — all components share the same reactive refs
const storage = useStorage()
const games = ref(storage.getGames())
const activeId = ref(storage.getActiveId())

function persist() {
  storage.saveGames(games.value)
}

export function useGame() {
  const activeGame = computed(
    () => games.value.find(g => g.id === activeId.value) ?? null
  )

  function createGame(startingState, includeCanada) {
    const states = {}
    STATES.forEach(s => { states[s.abbr] = { found: false, foundAt: null } })

    const provinces = {}
    if (includeCanada) {
      PROVINCES.forEach(p => { provinces[p.abbr] = { found: false, foundAt: null } })
    }

    const game = {
      id: crypto.randomUUID(),
      name: _generateName(),
      startingState,
      includeCanada: !!includeCanada,
      showCanada: false,
      createdAt: new Date().toISOString(),
      endedAt: null,
      states,
      provinces,
    }

    games.value.push(game)
    activeId.value = game.id
    storage.setActiveId(game.id)
    persist()
    return game
  }

  function toggleRegionEntry(gameId, abbr, region) {
    const game = games.value.find(g => g.id === gameId)
    if (!game || !game[region]) return
    const entry = game[region][abbr]
    if (!entry) return

    if (entry.found) {
      entry.found = false
      entry.foundAt = null
    } else {
      entry.found = true
      entry.foundAt = new Date().toISOString()
    }
    persist()
  }

  function setShowCanada(gameId, val) {
    const game = games.value.find(g => g.id === gameId)
    if (!game) return
    game.showCanada = val
    persist()
  }

  function setActiveGame(id) {
    activeId.value = id
    storage.setActiveId(id)
  }

  function countFound(game, region) {
    if (!game || !game[region]) return 0
    return Object.values(game[region]).filter(e => e.found).length
  }

  function countTotal(game, region) {
    if (!game || !game[region]) return 0
    return Object.keys(game[region]).length
  }

  function _generateName() {
    return `Road Trip — ${new Date().toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric',
    })}`
  }

  return {
    games,
    activeId,
    activeGame,
    createGame,
    toggleRegionEntry,
    setShowCanada,
    setActiveGame,
    countFound,
    countTotal,
  }
}

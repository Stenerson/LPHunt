const GAMES_KEY = 'lphunt_games'
const ACTIVE_KEY = 'lphunt_active_id'

export function useStorage() {
  function getGames() {
    try {
      return JSON.parse(localStorage.getItem(GAMES_KEY) ?? '[]')
    } catch {
      return []
    }
  }

  function saveGames(games) {
    localStorage.setItem(GAMES_KEY, JSON.stringify(games))
  }

  function getActiveId() {
    return localStorage.getItem(ACTIVE_KEY)
  }

  function setActiveId(id) {
    if (id == null) localStorage.removeItem(ACTIVE_KEY)
    else localStorage.setItem(ACTIVE_KEY, id)
  }

  return { getGames, saveGames, getActiveId, setActiveId }
}

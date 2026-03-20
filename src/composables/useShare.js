import { STATES } from '../data/states.js'
import { PROVINCES } from '../data/provinces.js'

export function encodeGame(game) {
  const data = {
    v: 1,
    n: game.name,
    s: game.startingState,
    c: game.includeCanada ? 1 : 0,
    f: Object.entries(game.states).filter(([, v]) => v.found).map(([k]) => k),
    p: game.includeCanada
      ? Object.entries(game.provinces || {}).filter(([, v]) => v.found).map(([k]) => k)
      : [],
  }
  return btoa(encodeURIComponent(JSON.stringify(data)))
}

export function decodeGame(encoded) {
  try {
    const data = JSON.parse(decodeURIComponent(atob(encoded)))
    if (!data || data.v !== 1) return null

    const states = {}
    STATES.forEach(s => {
      states[s.abbr] = { found: data.f.includes(s.abbr), foundAt: null }
    })

    const provinces = {}
    if (data.c) {
      PROVINCES.forEach(p => {
        provinces[p.abbr] = { found: (data.p || []).includes(p.abbr), foundAt: null }
      })
    }

    return {
      name: data.n,
      startingState: data.s,
      includeCanada: !!data.c,
      states,
      provinces,
    }
  } catch {
    return null
  }
}

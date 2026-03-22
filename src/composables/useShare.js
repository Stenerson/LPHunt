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
  // Compact UTF-8 base64url (no padding, no +/) — much shorter than the old
  // btoa(encodeURIComponent(...)) approach which percent-encodes every char first.
  const b64 = btoa(unescape(encodeURIComponent(JSON.stringify(data))))
  const b64url = b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
  return b64url
}

function _buildGame(data) {
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
    name: data.n || null,
    startingState: data.s,
    includeCanada: !!data.c,
    states,
    provinces,
  }
}

export function decodeGame(encoded) {
  // 1. Try new compact format: base64url of UTF-8 bytes
  try {
    const b64 = encoded.replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(escape(atob(b64)))
    const data = JSON.parse(json)
    const game = _buildGame(data)
    if (game) return game
  } catch {}

  // 2. Fall back to old verbose format: base64 of percent-encoded string (pre-2026 links)
  try {
    const data = JSON.parse(decodeURIComponent(atob(encoded)))
    const game = _buildGame(data)
    if (game) return game
  } catch {}

  return null
}


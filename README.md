# License Plate Hunt

A road trip game for spotting license plates from all 50 US states (and optionally Canadian provinces). No account, no backend — just open it and play.

**[Play it here → stenerson.github.io/LPHunt](https://stenerson.github.io/LPHunt/)**

On iOS/Android, tap Share → Add to Home Screen for a native app experience.

---

## How to Play

1. **Start a new game** — pick the state you're departing from and whether to include Canadian provinces.
2. **Tap a state card** when you spot that plate. It turns green and locks in.
3. **Hold a found card** for half a second to un-mark it if you made a mistake.
4. **Track your progress** with the bar at the top — goal is all 50 states.
5. **Share your game** via the menu to let passengers follow along on their own phone.
6. Your game is saved automatically. Start new games anytime — past games are preserved and accessible from the Past Games screen.

---

## Tech Overview

- **Vue 3** (Composition API, `<script setup>`) — all UI components
- **Vite** — dev server and production bundler
- **Tailwind CSS v3** — utility-first styling
- **canvas-confetti** — celebration effects on finds and milestones
- **vite-plugin-pwa** — web manifest and Workbox service worker for installability and offline support
- **No backend, no auth, no database** — all state lives in `localStorage`

### Key files

| Path | Purpose |
|------|---------|
| `src/composables/useGame.js` | All game logic; singleton module-level state shared across components |
| `src/composables/useStorage.js` | Raw `localStorage` read/write wrappers |
| `src/composables/useShare.js` | URL-based game encoding/decoding for sharing |
| `src/components/GameView.vue` | Main gameplay screen — plate grid, search, progress, celebrations |
| `src/components/StateCard.vue` | Individual plate card with tap-to-find and hold-to-unselect |
| `src/components/PastGamesView.vue` | Game history and all-time stats |
| `src/data/states.js` | 50 US states |
| `src/data/provinces.js` | 13 Canadian provinces and territories |
| `vite.config.js` | Vite + PWA plugin config; uses `/LPHunt/` base path for GitHub Pages |

### Data model

Each game is stored as a plain object:

```js
{
  id, name, startingState, includeCanada, showCanada,
  createdAt, endedAt,
  states:    { AL: { found: true, foundAt: '2026-03-20T...' }, ... },
  provinces: { ON: { found: false, foundAt: null }, ... },
}
```

### Deployment

Pushing to `main` triggers a GitHub Actions workflow (`.github/workflows/deploy.yml`) that runs `vite build` and deploys `dist/` to the `gh-pages` branch, served by GitHub Pages at the URL above.

---

## Local Development

```bash
npm install
npm run dev       # http://localhost:5173/
npm run build     # production build → dist/
```

import { ref } from 'vue'

const stored = localStorage.getItem('lphunt_dark')
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
const isDark = ref(stored !== null ? stored === 'true' : prefersDark)

export function useDarkMode() {
  function toggle() {
    isDark.value = !isDark.value
    localStorage.setItem('lphunt_dark', isDark.value)
  }

  return { isDark, toggle }
}

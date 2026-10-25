import { useCallback, useEffect, useState } from 'react'

export type Theme = 'dark' | 'light'

interface UseThemeResult {
  theme: Theme
  toggleTheme: () => void
}

const STORAGE_KEY = 'theme'

function readTheme(): Theme {
  if (typeof window === 'undefined') return 'dark'
  return localStorage.getItem(STORAGE_KEY) === 'light' ? 'light' : 'dark'
}

export function useTheme(): UseThemeResult {
  const [theme, setTheme] = useState<Theme>(readTheme)

  useEffect(() => {
    const root: HTMLElement = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    root.style.colorScheme = theme
    localStorage.setItem(STORAGE_KEY, theme)
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', theme === 'dark' ? '#0f172a' : '#f8fafc')
  }, [theme])

  const toggleTheme = useCallback((): void => {
    setTheme((prev: Theme) => (prev === 'dark' ? 'light' : 'dark'))
  }, [])

  return { theme, toggleTheme }
}

import { useState, useEffect } from 'react'

export function useDarkMode(): [boolean, (val?: boolean) => void] {
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('cgpa_pro_dark_mode')
      if (saved !== null) {
        return JSON.parse(saved)
      }
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    } catch {
      return false
    }
  })

  useEffect(() => {
    try {
      const root = document.documentElement
      if (isDark) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
      localStorage.setItem('cgpa_pro_dark_mode', JSON.stringify(isDark))
    } catch (e) {
      console.warn('Failed to update dark mode in localStorage:', e)
    }
  }, [isDark])

  const toggleDarkMode = (explicitVal?: boolean) => {
    setIsDark((prev) => (explicitVal !== undefined ? explicitVal : !prev))
  }

  return [isDark, toggleDarkMode]
}

'use client'

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <button
      onClick={toggleTheme}
      className="absolute top-9 left-6 z-50 text-foreground hover:opacity-80 transition"
      aria-label="Toggle theme"
    >
      <Sun className="h-7 w-7 hidden dark:block" />
      <Moon className="h-7 w-7 block dark:hidden" />
    </button>
  )
}

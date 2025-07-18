import { useTheme } from '../hooks/useTheme'

export default function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="px-4 py-2 border rounded bg-gray-100 dark:bg-gray-800 dark:text-white"
    >
      현재 테마: {theme === 'dark' ? '🌙 다크' : '☀️ 라이트'}
    </button>
  )
}

import { useTheme } from "../hooks/useTheme";
import { IoSunnyOutline, IoMoonOutline } from "react-icons/io5";

export default function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full dark:text-gray-200 transition-colors"
    >
      {theme === "dark" ? (
        <IoMoonOutline size={22} />
      ) : (
        <IoSunnyOutline size={22} />
      )}
    </button>
  );
}

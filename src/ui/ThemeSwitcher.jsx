import { useContext } from "react";
import { ThemeContext } from "../contexts/ThemeContext";
import { Sun, Moon, Sparkles } from "lucide-react";

export default function ThemeSwitcher() {
  const { theme, toggleTheme } = useContext(ThemeContext);

  const themes = [
    { value: "light", label: "Sáng", icon: Sun, color: "text-blue-500" },
    { value: "dark", label: "Tối", icon: Moon, color: "text-blue-400" },
    { value: "neon", label: "Neon", icon: Sparkles, color: "text-cyan-400" },
  ];

  return (
    <div className="flex items-center gap-1 p-1 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg border border-gray-200/50">
      {themes.map((t) => {
        const Icon = t.icon;
        const isActive = theme === t.value;
        return (
          <button
            key={t.value}
            onClick={() => toggleTheme(t.value)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all ${
              isActive
                ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md"
                : "hover:bg-gray-100 text-gray-600 hover:text-gray-800"
            }`}
            title={t.label}
          >
            <Icon className={`w-4 h-4 ${isActive ? "text-white" : t.color}`} />
            <span className="text-sm font-medium hidden sm:inline">{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}


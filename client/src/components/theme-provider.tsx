import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "midnight" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);
const THEME_MIGRATION_VERSION = "3";

export function ThemeProvider({
  children,
  defaultTheme = "light",
  storageKey = "pinnacleai-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => {
      const storedTheme = localStorage.getItem(storageKey) as Theme | null;
      const storedVersion = localStorage.getItem(`${storageKey}-version`);

      if (defaultTheme === "midnight" && storedVersion !== THEME_MIGRATION_VERSION) {
        const nextTheme: Theme = "midnight";
        localStorage.setItem(storageKey, nextTheme);
        localStorage.setItem(`${storageKey}-version`, THEME_MIGRATION_VERSION);
        return nextTheme;
      }

      return storedTheme || defaultTheme;
    }
  );

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove("light", "dark", "midnight");
    root.style.colorScheme = "light";

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";

      root.classList.add(systemTheme);
      root.style.colorScheme = systemTheme;
      return;
    }

    if (theme === "midnight") {
      root.classList.add("dark", "midnight");
      root.style.colorScheme = "dark";
      return;
    }

    root.classList.add(theme);
    root.style.colorScheme = theme === "dark" ? "dark" : "light";
  }, [theme]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      localStorage.setItem(`${storageKey}-version`, THEME_MIGRATION_VERSION);
      setTheme(theme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};

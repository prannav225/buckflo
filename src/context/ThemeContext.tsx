/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react-hooks/set-state-in-effect */
import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

export type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved === "light" || saved === "dark" || saved === "system") {
        return saved as Theme;
      }
      return document.documentElement.classList.contains("dark") ? "dark" : "light";
    }
    return "system";
  });

  const applyTheme = (t: Theme) => {
    const root = document.documentElement;
    if (t === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) {
        root.classList.add("dark");
        root.classList.remove("light");
      } else {
        root.classList.add("light");
        root.classList.remove("dark");
      }
    } else if (t === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }
  };

  const setTheme = (nextTheme: Theme) => {
    setThemeState(nextTheme);
    localStorage.setItem("theme", nextTheme);
    applyTheme(nextTheme);
  };

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  };

  // Sync theme when system settings change (only if current theme is system)
  useEffect(() => {
    applyTheme(theme);

    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      applyTheme("system");
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  // Sync with profile updates in DB if profile gets loaded/updated
  useEffect(() => {
    const handleProfileUpdate = (e: Event) => {
      const updatedProfile = (e as CustomEvent).detail;
      if (updatedProfile && updatedProfile.theme) {
        setThemeState(updatedProfile.theme);
        localStorage.setItem("theme", updatedProfile.theme);
        applyTheme(updatedProfile.theme);
      }
    };
    window.addEventListener("flo_profile_updated", handleProfileUpdate);
    return () => {
      window.removeEventListener("flo_profile_updated", handleProfileUpdate);
    };
  }, []);

  // On mount, initialize theme from db or localStorage
  useEffect(() => {
    import("../db/database").then(({ db }) => {
      db.profile.get(1).then((p) => {
        if (p && p.theme) {
          setTheme(p.theme);
        }
      });
    }).catch(err => console.error("Theme init error:", err));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}


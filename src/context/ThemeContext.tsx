/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { hapticFeedback } from "../utils/haptics";


export type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const applyTheme = (t: Theme) => {
  const root = document.documentElement;
  let isDark: boolean;
  
  if (t === "system") {
    isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  } else {
    isDark = t === "dark";
  }

  if (isDark) {
    root.classList.add("dark");
    root.classList.remove("light");
  } else {
    root.classList.add("light");
    root.classList.remove("dark");
  }

  if (typeof window !== "undefined") {
    const metas = document.querySelectorAll('meta[name="theme-color"]');
    const color = isDark ? "#1f1f1e" : "#f8f8f6";
    metas.forEach((meta) => {
      meta.setAttribute("content", color);
      const saved = localStorage.getItem("theme");
      if (saved && saved !== "system") {
        meta.removeAttribute("media");
      } else {
        const content = meta.getAttribute("content");
        if (content === "#f8f8f6") {
          meta.setAttribute("media", "(prefers-color-scheme: light)");
        } else if (content === "#1f1f1e") {
          meta.setAttribute("media", "(prefers-color-scheme: dark)");
        }
      }
    });
  }
};

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

  const setTheme = useCallback((nextTheme: Theme) => {
    hapticFeedback.medium();
    setThemeState(nextTheme);
    localStorage.setItem("theme", nextTheme);
    applyTheme(nextTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    hapticFeedback.medium();
    setThemeState((prev) => {
      const nextTheme = prev === "dark" ? "light" : "dark";
      localStorage.setItem("theme", nextTheme);
      applyTheme(nextTheme);
      return nextTheme;
    });
  }, []);

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
    window.addEventListener("buckflo_profile_updated", handleProfileUpdate);
    return () => {
      window.removeEventListener("buckflo_profile_updated", handleProfileUpdate);
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
  }, [setTheme]);

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


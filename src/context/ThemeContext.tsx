/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { hapticFeedback } from "../utils/haptics";
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";


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

  if (Capacitor.isNativePlatform()) {
    StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light }).catch(console.warn);
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

  const isMountedRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;

    const handleGlobalClick = (e: MouseEvent) => {
      const x = e.clientX || window.innerWidth / 2;
      const y = e.clientY || window.innerHeight / 2;
      const r = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );
      document.documentElement.style.setProperty("--theme-x", `${x}px`);
      document.documentElement.style.setProperty("--theme-y", `${y}px`);
      document.documentElement.style.setProperty("--theme-r", `${r}px`);
    };

    window.addEventListener("click", handleGlobalClick, { capture: true });
    return () => {
      window.removeEventListener("click", handleGlobalClick, { capture: true });
    };
  }, []);

  const setTheme = useCallback((nextTheme: Theme) => {
    hapticFeedback.medium();
    const trigger = () => {
      setThemeState(nextTheme);
      localStorage.setItem("theme", nextTheme);
      applyTheme(nextTheme);
    };

    if (isMountedRef.current && typeof document !== "undefined" && "startViewTransition" in document) {
      document.documentElement.classList.add("theme-transitioning");
      const transition = (document as any).startViewTransition(trigger);
      transition.finished.finally(() => {
        document.documentElement.classList.remove("theme-transitioning");
      });
    } else {
      trigger();
    }
  }, []);

  const toggleTheme = useCallback(() => {
    hapticFeedback.medium();
    const trigger = () => {
      setThemeState((prev) => {
        const nextTheme = prev === "dark" ? "light" : "dark";
        localStorage.setItem("theme", nextTheme);
        applyTheme(nextTheme);
        return nextTheme;
      });
    };

    if (isMountedRef.current && typeof document !== "undefined" && "startViewTransition" in document) {
      document.documentElement.classList.add("theme-transitioning");
      const transition = (document as any).startViewTransition(trigger);
      transition.finished.finally(() => {
        document.documentElement.classList.remove("theme-transitioning");
      });
    } else {
      trigger();
    }
  }, []);

  // Sync theme when system settings change (only if current theme is system)
  useEffect(() => {
    applyTheme(theme);

    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const trigger = () => {
        applyTheme("system");
      };
      if (isMountedRef.current && typeof document !== "undefined" && "startViewTransition" in document) {
        document.documentElement.classList.add("theme-transitioning");
        const transition = (document as any).startViewTransition(trigger);
        transition.finished.finally(() => {
          document.documentElement.classList.remove("theme-transitioning");
        });
      } else {
        trigger();
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  // Sync with profile updates in DB if profile gets loaded/updated
  useEffect(() => {
    const handleProfileUpdate = (e: Event) => {
      const updatedProfile = (e as CustomEvent).detail;
      if (updatedProfile && updatedProfile.theme) {
        const trigger = () => {
          setThemeState(updatedProfile.theme);
          localStorage.setItem("theme", updatedProfile.theme);
          applyTheme(updatedProfile.theme);
        };
        if (isMountedRef.current && typeof document !== "undefined" && "startViewTransition" in document) {
          document.documentElement.classList.add("theme-transitioning");
          const transition = (document as any).startViewTransition(trigger);
          transition.finished.finally(() => {
            document.documentElement.classList.remove("theme-transitioning");
          });
        } else {
          trigger();
        }
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
          // Wrap in a trigger that doesn't trigger transitions to prevent flashes on app boot
          setThemeState(p.theme);
          localStorage.setItem("theme", p.theme);
          applyTheme(p.theme);
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


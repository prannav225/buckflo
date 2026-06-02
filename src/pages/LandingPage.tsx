/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { PixelBanner } from "../components/layout/PixelBanner";
import { LandingHero } from "../components/landing/LandingHero";
import { LandingFeatures } from "../components/landing/LandingFeatures";
import { LandingFooter } from "../components/landing/LandingFooter";

interface LandingPageProps {
  onStart: () => void;
}

export function LandingPage({ onStart }: LandingPageProps) {
  const { theme, toggleTheme } = useTheme();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone
    ) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  return (
    <div className="fade-in w-full pb-24 pt-4 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[700px] opacity-40 dark:opacity-20 pointer-events-none select-none flex justify-center z-0">
        <div className="w-[800px] h-full max-w-[100vw] relative mask-[linear-gradient(to_bottom,black_40%,transparent_100%)]">
          <PixelBanner seed="buckflo-landing-ambient" />
        </div>
      </div>

      <header className="flex justify-between items-center mb-16 sm:mb-24 max-w-[1100px] mx-auto relative z-10">
        <div className="flex items-center gap-1 select-none">
          <img
            src="/buckflo_favicon.svg"
            alt="buckflo"
            className="w-12 object-contain rounded-full"
          />
          <span className="font-display text-3xl font-normal! text-(--accent) italic">
            buckflo
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="inline-flex items-center justify-center w-8 h-8 rounded-full text-(--text-secondary) hover:text-(--text) cursor-pointer transition-colors outline-none"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button
            onClick={onStart}
            className="btn-secondary py-2 px-5 text-sm border-black/8 dark:border-white/6"
            id="btn-landing-top-start"
          >
            Launch App
          </button>
        </div>
      </header>

      <LandingHero
        onStart={onStart}
        deferredPrompt={deferredPrompt}
        handleInstallClick={handleInstallClick}
        isInstalled={isInstalled}
      />

      <LandingFeatures />

      <LandingFooter onStart={onStart} />
    </div>
  );
}

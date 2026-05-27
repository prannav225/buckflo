import { type ReactNode, useState } from "react";
import { useLocation } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { Sun, Moon, Bell } from "lucide-react";
import { BottomNav } from "./BottomNav";
import { useNotificationHub } from "../../hooks/useNotificationHub";
import { NotificationSheet } from "./NotificationSheet";
import { TransferSheet } from "../transactions/TransferSheet";
import { OnboardingFlow } from "../features/onboarding/OnboardingFlow";
import { LandingPage } from "../../pages/LandingPage";
import { format } from "date-fns";
import { getCurrentMonthYear } from "../../utils/dateUtils";
import { useAutopayTrigger } from "../../hooks/useAutopayTrigger";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { theme, toggleTheme } = useTheme();
  const { pathname } = useLocation();
  const isLegalPage = pathname === "/privacy" || pathname === "/terms";

  const [isOnboarded, setIsOnboarded] = useState(
    () => localStorage.getItem("flo_onboarded") === "true",
  );
  const [showOnboarding, setShowOnboarding] = useState(false);

  const handleOnboardingComplete = (skipSetup?: boolean) => {
    localStorage.setItem("flo_onboarded", "true");
    if (skipSetup) {
      localStorage.setItem(
        `flo_skipped_setup_${getCurrentMonthYear()}`,
        "true",
      );
    }
    setIsOnboarded(true);
  };

  // Transfer config state
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [transferConfig, setTransferConfig] = useState<{
    direction: "savings_to_expenditure" | "expenditure_to_savings";
    amount: string;
    note: string;
  }>({
    direction: "savings_to_expenditure",
    amount: "",
    note: "",
  });

  const {
    isNotificationsOpen,
    setIsNotificationsOpen,
    visibleAlerts,
    hasUnread,
    openNotifications,
    handleDismissAlert,
  } = useNotificationHub(setIsTransferOpen, setTransferConfig);

  useAutopayTrigger(isOnboarded);

  return (
    <>
      {isOnboarded ? (
        <>
          <div className="fixed top-0 left-0 right-0 h-[calc(84px+env(safe-area-inset-top,0))] bg-linear-to-b from-(--bg) via-(--bg)/30 to-transparent z-99 pointer-events-none transition-opacity duration-350 ease-[cubic-bezier(0.16,1,0.3,1)]" />
          <main className="pt-[calc(16px+env(safe-area-inset-top,0))] pl-4 pr-4 pb-[calc(90px+env(safe-area-inset-bottom,0))] max-w-[720px] mx-auto w-full">
            {/* ── Persistent Global Header ────────────────────────────────────────── */}
            <header className="sticky top-[calc(12px+env(safe-area-inset-top,0))] z-100 flex items-center justify-between bg-transparent pointer-events-none mb-6 transition-opacity duration-350 ease-[cubic-bezier(0.16,1,0.3,1)]">
              <div className="inline-flex items-center justify-center bg-(--bg-glass-strong) [-webkit-backdrop-filter:var(--glass-blur)] [backdrop-filter:var(--glass-blur)] border border-black/8 dark:border-white/6 rounded-(--r-pill) px-5 py-1.5 shadow-(--glass-shadow) pointer-events-auto transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0">
                <span className="font-display text-2xl text-(--accent-dark) dark:text-(--accent) tracking-wider leading-none italic">
                  flo
                </span>
              </div>
              <div className="inline-flex items-center bg-(--bg-glass-strong) [-webkit-backdrop-filter:var(--glass-blur)] [backdrop-filter:var(--glass-blur)] border border-black/8 dark:border-white/6 rounded-(--r-pill) p-1 shadow-(--glass-shadow) pointer-events-auto gap-1 transition-[transform,box-shadow] duration-200 ease-out active:translate-y-0">
                <button
                  onClick={toggleTheme}
                  className="inline-flex items-center justify-center w-8 h-8 bg-transparent border-0 rounded-full text-(--text-secondary) cursor-pointer transition-[background,color,transform] duration-150 active:scale-90 outline-none"
                  aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
                  title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
                  id="theme-switcher"
                >
                  {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                </button>
                <div className="w-px h-4 bg-(--border)" />

                <button
                  onClick={openNotifications}
                  className="inline-flex items-center justify-center w-8 h-8 bg-transparent border-0 rounded-full text-(--text-secondary) cursor-pointer transition-[background,color,transform] duration-150 active:scale-90 outline-none relative"
                  aria-label="Open notifications"
                  title="Notifications"
                  id="header-notification-btn"
                >
                  <Bell size={16} />
                  {hasUnread && (
                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-(--debit) rounded-full animate-[pulse-glow_2s_infinite] shadow-[0_0_0_0_rgba(217,119,87,0.7)]" />
                  )}
                </button>
              </div>
            </header>

            {children}
          </main>

          <BottomNav />

          {/* Sliding Glassmorphic Notifications sheet */}
          <NotificationSheet
            isOpen={isNotificationsOpen}
            onClose={() => setIsNotificationsOpen(false)}
            alerts={visibleAlerts}
            onDismiss={handleDismissAlert}
          />

          {/* Global Transfer Sheet (for Advisor prompt action) */}
          <TransferSheet
            isOpen={isTransferOpen}
            onClose={() => setIsTransferOpen(false)}
            savingsBalance={0}
            defaultDirection={transferConfig.direction}
            defaultAmount={transferConfig.amount}
            defaultNote={transferConfig.note}
          />
        </>
      ) : isLegalPage ? (
        <main className="pt-[calc(16px+env(safe-area-inset-top,0))] pl-4 pr-4 pb-[calc(90px+env(safe-area-inset-bottom,0))] max-w-[720px] mx-auto w-full">
          {children}
        </main>
      ) : showOnboarding ? (
        <OnboardingFlow
          onComplete={handleOnboardingComplete}
          currentMonthName={format(new Date(), "MMMM")}
        />
      ) : (
        <main className="pt-[calc(16px+env(safe-area-inset-top,0))] pl-4 pr-4 pb-[calc(90px+env(safe-area-inset-bottom,0))] max-w-[1200px] mx-auto w-full">
          <LandingPage onStart={() => setShowOnboarding(true)} />
        </main>
      )}
    </>
  );
}

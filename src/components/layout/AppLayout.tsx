import { type ReactNode, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import { BottomNav } from "./BottomNav";
import { useNotificationHub } from "../../hooks/useNotificationHub";
import { NotificationSheet } from "./NotificationSheet";
import { TransferSheet } from "../transactions/TransferSheet";
import { OnboardingFlow } from "../features/onboarding/OnboardingFlow";
import { format } from "date-fns";
import { getCurrentMonthYear } from "../../utils/dateUtils";
import { useAutopayTrigger } from "../../hooks/useAutopayTrigger";
import { useProfile } from "../../hooks/useProfile";
import { useDatabaseSync } from "../../hooks/useDatabaseSync";
import { BrandedAvatar } from "./BrandedAvatar";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { profile } = useProfile();
  const isLegalPage = pathname === "/privacy" || pathname === "/terms";
  const isMainPage =
    pathname === "/home" ||
    pathname === "/monthly" ||
    pathname === "/insights" ||
    pathname === "/monthly/transactions" ||
    pathname === "/profile" ||
    pathname === "/savings" ||
    pathname === "/profile/about" ||
    pathname === "/profile/edit" ||
    pathname === "/profile/categories";

  const [isOnboarded, setIsOnboarded] = useState(
    () => localStorage.getItem("flo_onboarded") === "true",
  );

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
  useDatabaseSync(isOnboarded);

  return (
    <>
      {isOnboarded ? (
        <>
          {isMainPage && (
            <div className="fixed top-0 left-0 right-0 h-[calc(84px+env(safe-area-inset-top,0))] bg-linear-to-b from-(--bg) via-(--bg)/30 to-transparent z-99 pointer-events-none transition-opacity duration-350 ease-[cubic-bezier(0.16,1,0.3,1)]" />
          )}
          <main
            className={
              isMainPage
                ? "pt-[calc(16px+env(safe-area-inset-top,0))] pl-4 pr-4 pb-[calc(90px+env(safe-area-inset-bottom,0))] max-w-[720px] mx-auto w-full"
                : "pt-[calc(16px+env(safe-area-inset-top,0))] pl-4 pr-4 pb-[calc(24px+env(safe-area-inset-bottom,0))] max-w-[720px] mx-auto w-full"
            }
          >
            {/* ── Persistent Global Header ────────────────────────────────────────── */}
            {isMainPage && (
              <header className="sticky top-[calc(12px+env(safe-area-inset-top,0))] z-100 flex items-center justify-between bg-transparent pointer-events-none mb-6 transition-opacity duration-350 ease-[cubic-bezier(0.16,1,0.3,1)]">
                <div className="inline-flex items-center justify-center bg-(--bg-glass-strong) [-webkit-backdrop-filter:var(--glass-blur)] [backdrop-filter:var(--glass-blur)] border border-black/8 dark:border-white/6 rounded-(--r-pill) px-5 py-1.5 shadow-(--glass-shadow) pointer-events-auto transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0">
                  <span className="font-display text-2xl text-(--accent-dark) dark:text-(--accent) tracking-wider leading-none italic">
                    flo
                  </span>
                </div>
                <div className="flex items-center gap-2 pointer-events-auto">
                  <div className="inline-flex items-center justify-center bg-(--bg-glass-strong) [-webkit-backdrop-filter:var(--glass-blur)] [backdrop-filter:var(--glass-blur)] border border-black/8 dark:border-white/6 rounded-full w-9 h-9 shadow-(--glass-shadow) transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0">
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
                  <button
                    onClick={() => navigate("/profile")}
                    className="inline-flex items-center justify-center bg-(--bg-glass-strong) [-webkit-backdrop-filter:var(--glass-blur)] [backdrop-filter:var(--glass-blur)] border border-black/8 dark:border-white/6 rounded-full w-9 h-9 shadow-(--glass-shadow) transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 cursor-pointer overflow-hidden p-0 outline-none"
                    aria-label="Open profile"
                    title="Profile"
                    id="header-profile-btn"
                  >
                    <BrandedAvatar name={profile?.displayName || "flo"} size={34} className="border-0 bg-transparent" />
                  </button>
                </div>
              </header>
            )}

            {children}
          </main>

          {isMainPage && <BottomNav />}

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
        <main className="pt-[calc(16px+env(safe-area-inset-top,0))] pl-4 pr-4 pb-[calc(24px+env(safe-area-inset-bottom,0))] max-w-[720px] mx-auto w-full">
          {children}
        </main>
      ) : (
        <OnboardingFlow
          onComplete={handleOnboardingComplete}
          currentMonthName={format(new Date(), "MMMM")}
        />
      )}
    </>
  );
}

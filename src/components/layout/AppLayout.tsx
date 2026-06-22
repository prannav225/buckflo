import { type ReactNode, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Bell, Download, X, ChevronLeft } from "lucide-react";
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
import { useAccount, useTransactions } from "../../db/hooks";
import { evaluatePersona } from "../../utils/personaEvaluator";
import { PixelArtAvatar } from "../ui/PixelArtAvatar";

import { usePWAInstall } from "../../hooks/usePWAInstall";
import { ChangelogModal } from "../ui/ChangelogModal";
import { UpdatePrompt } from "../ui/UpdatePrompt";
import { useNotificationPermission } from "../../hooks/useNotificationPermission";
import { NotificationPermissionDialog } from "../NotificationPermissionDialog";
import { toast } from "react-hot-toast";
import { db } from "../../db/database";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { profile } = useProfile();
  const spendingAcc = useAccount("spending");
  const currentMonth = getCurrentMonthYear();
  const transactions = useTransactions(spendingAcc?.id, currentMonth);
  
  const persona = evaluatePersona(transactions);

  const [showPersonaDetails, setShowPersonaDetails] = useState(() => {
    try {
      const saved = localStorage.getItem("buckflo_show_persona_details");
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  const togglePersonaDetails = (val: boolean) => {
    setShowPersonaDetails(val);
    try {
      localStorage.setItem("buckflo_show_persona_details", JSON.stringify(val));
    } catch (e) {
      console.error(e);
    }
    window.dispatchEvent(new CustomEvent("buckflo_persona_toggle", { detail: val }));
  };
  const { requestPermission, isDefault } = useNotificationPermission();
  const [permissionPromptDismissed, setPermissionPromptDismissed] =
    useState(false);

  // Derive whether to show the prompt to avoid cascading renders in useEffect
  const showPermissionPrompt = Boolean(
    !permissionPromptDismissed &&
      profile?.notificationsEnabled &&
      !profile?.notificationPermissionAsked &&
      isDefault,
  );

  const handleEnableNotifications = async () => {
    setPermissionPromptDismissed(true);
    const result = await requestPermission();

    if (result === "granted") {
      toast.success("Notifications enabled!");
    } else if (result === "denied") {
      toast.error("Notifications were denied. You can re-enable in Settings.");
    }
  };

  const handleDisableNotifications = async () => {
    setPermissionPromptDismissed(true);
    if (profile?.id) {
      await db.profile.update(profile.id, {
        notificationsEnabled: false,
        notificationPermissionAsked: true,
      });
    }
  };
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
    pathname === "/profile/categories" ||
    pathname === "/profile/notifications";

  const getPageTitle = () => {
    switch (pathname) {
      case "/monthly":
        return "Monthly";
      case "/monthly/transactions":
        return "All Transactions";
      case "/insights":
        return "Insights";
      case "/savings":
        return "Savings";
      case "/profile":
        return "Profile";
      case "/profile/categories":
        return "Categories";
      case "/profile/about":
        return "About buckflo";
      case "/profile/edit":
        return "Edit Profile";
      case "/profile/notifications":
        return "Notifications";
      default:
        return "";
    }
  };
  const pageTitle = getPageTitle();
  const isSubPage =
    pathname !== "/home" &&
    pathname !== "/monthly" &&
    pathname !== "/insights" &&
    pathname !== "/profile" &&
    pathname !== "/monthly/transactions";

  const [isOnboarded, setIsOnboarded] = useState(
    () =>
      localStorage.getItem("buckflo_onboarded") === "true" ||
      localStorage.getItem("flo_onboarded") === "true",
  );

  const { isInstallable, promptInstall, dismissPrompt } = usePWAInstall();

  const handleOnboardingComplete = (skipSetup?: boolean) => {
    localStorage.setItem("buckflo_onboarded", "true");
    if (skipSetup) {
      localStorage.setItem(
        `buckflo_skipped_setup_${getCurrentMonthYear()}`,
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

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useAutopayTrigger(isOnboarded);
  useDatabaseSync(isOnboarded);

  return (
    <>
      {isOnboarded ? (
        <>
          {isMainPage && (
            <div
              className={`fixed top-0 left-0 right-0 h-[calc(80px+var(--safe-area-inset-top,env(safe-area-inset-top,0px)))] z-99 pointer-events-none transition-opacity duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                scrolled ? "opacity-100" : "opacity-0"
              }`}
              style={{
                background:
                  "linear-gradient(to bottom, var(--bg) 0%, var(--bg) 60%, transparent 100%)",
              }}
            />
          )}
          {isMainPage && (
            <header className="sticky top-0 z-100 flex items-center justify-between bg-transparent pointer-events-none mb-6 transition-opacity duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] max-w-[720px] mx-auto w-full px-4 pt-[calc(16px+var(--safe-area-inset-top,env(safe-area-inset-top,0px)))]">
              {pathname === "/home" ? (
                <button
                  onClick={() => window.location.reload()}
                  className={`pointer-events-auto transition-all duration-300 ease-out flex items-center justify-center rounded-full hover:-translate-y-0.5 active:translate-y-0 border p-0.5 cursor-pointer outline-none ${
                    scrolled
                      ? "bg-(--bg-glass-strong) [-webkit-backdrop-filter:var(--glass-blur)] [backdrop-filter:var(--glass-blur)] border-black/8 dark:border-white/6 shadow-(--glass-shadow)"
                      : "bg-transparent border-transparent shadow-none"
                  }`}
                >
                  <img
                    src="/buckflo_favicon.svg"
                    alt="buckflo"
                    className={`object-contain rounded-full transition-all duration-300 ${
                      scrolled ? "w-8 h-8" : "w-10 h-10"
                    }`}
                  />
                </button>
              ) : (
                <div className="pointer-events-auto flex items-start">
                  {isSubPage && (
                    <ChevronLeft
                      size={24}
                      onClick={() => navigate(-1)}
                      className="-pl-5 m-0 min-h-0 h-auto flex items-center justify-center text-(--text-muted) hover:text-(--text) cursor-pointer bg-transparent border-0 outline-none rounded-full"
                      aria-label="Go back"
                    />
                  )}
                  <h1 className="text-[22px] font-bold text-(--text) tracking-tight m-0 leading-none">
                    {pageTitle}
                  </h1>
                </div>
              )}
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
                 {pathname === "/profile" ? (
                  <button
                    onClick={() => togglePersonaDetails(!showPersonaDetails)}
                    className="inline-flex items-center justify-center bg-(--bg-glass-strong) [-webkit-backdrop-filter:var(--glass-blur)] [backdrop-filter:var(--glass-blur)] border border-black/8 dark:border-white/6 rounded-full w-9 h-9 shadow-(--glass-shadow) transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer overflow-hidden p-0 outline-none"
                    aria-label={showPersonaDetails ? "Switch to Normal Profile" : "View Spending Persona"}
                    title={showPersonaDetails ? "Switch to Normal Profile" : "View Spending Persona"}
                    id="header-profile-btn"
                  >
                    {showPersonaDetails ? (
                      <BrandedAvatar
                        name={profile?.displayName || "buckflo"}
                        size={34}
                        className="border-0 bg-transparent"
                      />
                    ) : (
                      <div 
                        className="w-full h-full flex items-center justify-center"
                        style={{ 
                          background: `radial-gradient(circle at center, ${persona.avatarColors[0]}45, ${persona.avatarColors[0]}15)`
                        }}
                      >
                        <PixelArtAvatar
                          id={persona.id}
                          size={32}
                          colors={persona.avatarColors}
                        />
                      </div>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => navigate("/profile")}
                    className="inline-flex items-center justify-center bg-(--bg-glass-strong) [-webkit-backdrop-filter:var(--glass-blur)] [backdrop-filter:var(--glass-blur)] border border-black/8 dark:border-white/6 rounded-full w-9 h-9 shadow-(--glass-shadow) transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 cursor-pointer overflow-hidden p-0 outline-none"
                    aria-label="Open profile"
                    title="Profile"
                    id="header-profile-btn"
                  >
                    <BrandedAvatar
                      name={profile?.displayName || "buckflo"}
                      size={34}
                      className="border-0 bg-transparent"
                    />
                  </button>
                )}
              </div>
            </header>
          )}
          <main
            className={
              isMainPage
                ? "pl-4 pr-4 pb-[calc(90px+var(--safe-area-inset-bottom,env(safe-area-inset-bottom,0px)))] max-w-[720px] mx-auto w-full"
                : "pt-[calc(16px+var(--safe-area-inset-top,env(safe-area-inset-top,0px)))] pl-4 pr-4 pb-[calc(24px+var(--safe-area-inset-bottom,env(safe-area-inset-bottom,0px)))] max-w-[720px] mx-auto w-full"
            }
          >
            {/* PWA Install Banner */}
            {isInstallable && (
              <div className="flex items-center justify-between p-3 mb-6 rounded-xl bg-(--accent)/10 dark:bg-(--accent)/20 border border-(--accent)/20 fade-in-up">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-(--accent)/20 flex items-center justify-center flex-shrink-0">
                    <Download size={16} className="text-(--accent)" />
                  </div>
                  <div>
                    <h4 className="m-0 text-sm font-semibold text-(--text)">
                      Install buckflo
                    </h4>
                    <p className="m-0 text-xs text-(--text-muted) leading-snug">
                      Add to home screen for offline access.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={promptInstall}
                    className="btn-primary px-3 py-1.5 text-xs min-w-[70px] shadow-sm"
                  >
                    Install
                  </button>
                  <button
                    onClick={dismissPrompt}
                    className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-(--text-muted)"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
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
            defaultDirection={transferConfig.direction}
            defaultAmount={transferConfig.amount}
            defaultNote={transferConfig.note}
          />

          <ChangelogModal />
          <UpdatePrompt />



          {showPermissionPrompt && (
            <NotificationPermissionDialog
              onEnable={handleEnableNotifications}
              onDisable={handleDisableNotifications}
            />
          )}
        </>
      ) : isLegalPage ? (
        <main className="pt-[calc(16px+var(--safe-area-inset-top,env(safe-area-inset-top,0px)))] pl-4 pr-4 pb-[calc(24px+var(--safe-area-inset-bottom,env(safe-area-inset-bottom,0px)))] max-w-[720px] mx-auto w-full">
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

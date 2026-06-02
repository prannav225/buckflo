import { useState } from "react";
import {
  Upload,
  Database,
  X,
  Plus,
  ChevronRight,
  Lightbulb,
  PiggyBank,
  HelpCircle,
} from "lucide-react";
import { formatINR } from "../../utils/currency";
import type { FrequentPreset } from "../../hooks/useAnalytics";
import toast from "react-hot-toast";

interface DataPortabilityCardProps {
  setIsImportOpen: (open: boolean) => void;
  handleDismissImportCard: () => void;
}

export function DataPortabilityCard({
  setIsImportOpen,
  handleDismissImportCard,
}: DataPortabilityCardProps) {
  return (
    <div className="fade-in-up delay-1 mt-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Database size={13} className="text-(--text-muted) shrink-0" />
          <h2 className="text-[11px] font-semibold text-(--text-muted) uppercase tracking-[0.06em] m-0">
            Data & Portability
          </h2>
        </div>
        <button
          onClick={handleDismissImportCard}
          className="btn-ghost p-1 min-h-0 h-auto flex items-center justify-center rounded-full text-(--text-muted) hover:text-(--text) cursor-pointer"
          title="Hide permanently"
        >
          <X size={14} />
        </button>
      </div>
      <div className="glass-card p-4 flex flex-col gap-3">
        <p className="font-sans text-xs text-(--text-muted) m-0 leading-relaxed">
          Your data is stored locally. Import an existing CSV backup file to
          load your ledger.
        </p>
        <button
          onClick={() => setIsImportOpen(true)}
          className="btn-secondary w-full text-xs py-2 px-3 flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Upload size={13} />
          Import CSV
        </button>
      </div>
    </div>
  );
}

interface QuickPresetsProps {
  presets: FrequentPreset[];
  handlePresetClick: (preset: FrequentPreset) => void;
  handleDeletePreset: (presetId: number) => void;
  setPresetToEdit: (preset: FrequentPreset | null) => void;
  setIsCreatePresetOpen: (open: boolean) => void;
}

export function QuickPresets({
  presets,
  handlePresetClick,
  handleDeletePreset,
  setPresetToEdit,
  setIsCreatePresetOpen,
}: QuickPresetsProps) {
  const [isManageMode, setIsManageMode] = useState(false);

  return (
    <div id="quick-presets" className="fade-in-up delay-1 mb-5 mt-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <h2 className="text-[11px] font-semibold text-(--text-muted) uppercase tracking-[0.06em] m-0">
            Quick Presets
          </h2>
          <div className="group relative flex items-center cursor-help">
            <HelpCircle
              size={12}
              className="text-(--text-muted) opacity-70 hover:opacity-100 transition-opacity"
            />
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-2.5 bg-white dark:bg-[#2e2e2c] text-[11px] text-(--text) font-medium rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 text-center border border-black/10 dark:border-white/10 leading-relaxed">
              Quick Presets let you log frequent transactions (like coffee or
              transport) with a single tap.
            </div>
          </div>
        </div>
        {presets.length > 0 && (
          <button
            onClick={() => setIsManageMode(!isManageMode)}
            className="btn-ghost min-h-0 h-auto p-1 text-xs text-(--accent) font-semibold cursor-pointer"
          >
            {isManageMode ? "Done" : "Manage"}
          </button>
        )}
      </div>
      <div className="flex gap-2.5 overflow-x-auto pt-1.5 pb-2.5 w-full">
        {presets
          .filter((preset) => !isManageMode || preset.id !== undefined)
          .map((preset, idx) => (
            <div key={idx} className="relative shrink-0">
              <button
                onClick={() => {
                  if (isManageMode && preset.id) {
                    setPresetToEdit(preset);
                    setIsCreatePresetOpen(true);
                  } else {
                    handlePresetClick(preset);
                  }
                }}
                className={`shrink-0 py-3 px-4 rounded-xl bg-(--bg-glass-strong) border border-white/8 dark:border-black/8 transition-all duration-200 ease-out shadow-sm active:translate-y-0 active:scale-[0.98] flex flex-col items-start gap-1 min-w-[110px] cursor-pointer text-left outline-none ${
                  isManageMode && preset.id ? "pr-7" : ""
                }`}
              >
                <div className="flex items-center gap-1 w-full">
                  <span className="text-xs font-semibold text-(--text) truncate flex-1">
                    {preset.description}
                  </span>
                </div>
                <span className="text-[0.8125rem] font-bold text-(--accent)">
                  {formatINR(preset.amount)}
                </span>
              </button>

              {isManageMode && preset.id && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeletePreset(preset.id!);
                  }}
                  className="absolute top-1 right-1 p-1 rounded-full bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-all z-10 cursor-pointer"
                  title="Delete Preset"
                >
                  <X size={10} />
                </button>
              )}
            </div>
          ))}
        <button
          onClick={() => {
            setPresetToEdit(null);
            setIsCreatePresetOpen(true);
          }}
          className="shrink-0 py-3 px-4 rounded-xl border border-dashed border-(--border) bg-transparent transition-all duration-200 ease-out active:scale-[0.98] flex items-center gap-1.5 min-w-[90px] cursor-pointer text-left outline-none"
          id="btn-create-preset"
        >
          <Plus size={14} className="text-(--accent)" />
          <span className="text-xs font-semibold text-(--accent)">Create</span>
        </button>
      </div>
    </div>
  );
}

interface NotificationPromptProps {
  updateProfile: (data) => Promise<void>;
}

export function NotificationPrompt({ updateProfile }: NotificationPromptProps) {
  return (
    <div className="glass-card p-4 fade-in-up mb-3 flex flex-col gap-3">
      <div>
        <h4 className="text-sm font-semibold text-(--text)">Stay consistent</h4>
        <p className="font-sans text-xs text-(--text-muted) leading-relaxed mt-1">
          Would you like a daily reminder at 8:00 PM to help you log your
          expenses?
        </p>
      </div>
      <div className="flex gap-2 justify-end">
        <button
          onClick={async () => {
            try {
              await updateProfile({ notificationPermissionAsked: true });
              toast.success("Reminder dismissed");
            } catch {
              toast.error("Failed to update profile");
            }
          }}
          className="btn-ghost text-xs px-3 py-1.5 font-semibold text-(--text-secondary) hover:text-(--text) cursor-pointer"
        >
          Dismiss
        </button>
        <button
          onClick={async () => {
            try {
              if (
                !("Notification" in window) ||
                !Notification.requestPermission
              ) {
                toast.error("This browser does not support notifications.");
                await updateProfile({ notificationPermissionAsked: true });
                return;
              }

              if (Notification.permission === "denied") {
                toast.error(
                  "Notifications are blocked by your browser. Please reset site permissions in your address bar.",
                );
                await updateProfile({ notificationPermissionAsked: true });
                return;
              }

              let permission: NotificationPermission;
              try {
                permission = await Notification.requestPermission();
              } catch {
                permission = await new Promise<NotificationPermission>(
                  (resolve) => {
                    Notification.requestPermission(resolve);
                  },
                );
              }

              if (permission === "granted") {
                await updateProfile({
                  notificationsEnabled: true,
                  notificationPermissionAsked: true,
                });
                toast.success("Daily reminders enabled!");
              } else {
                await updateProfile({
                  notificationsEnabled: false,
                  notificationPermissionAsked: true,
                });
                toast.error(
                  "Permission denied. Reminders can be enabled later in Profile -> Notifications.",
                );
              }
            } catch (e) {
              console.error("Notification permission error:", e);
              toast.error(
                "Notification request blocked. If you are in a preview iframe, please open the app in a new tab.",
              );
            }
          }}
          className="btn-primary text-xs px-3.5 py-1.5 font-semibold shrink-0 cursor-pointer"
        >
          Remind me
        </button>
      </div>
    </div>
  );
}

interface SmartAllocationAdvisorCardProps {
  surplus: number;
  suggestedAmount: number;
  onTransfer: (amount: string) => void;
  onDismiss: () => void;
}

export function SmartAllocationAdvisorCard({
  surplus,
  suggestedAmount,
  onTransfer,
  onDismiss,
}: SmartAllocationAdvisorCardProps) {
  return (
    <div className="glass-card fade-in-up p-5 mb-5 relative overflow-hidden bg-linear-to-br from-(--bg-glass) to-[rgba(155,93,229,0.05)] border border-[#9b5de5]/20">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#9b5de5]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-start justify-between mb-3 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#9b5de5]/10 flex items-center justify-center">
            <Lightbulb size={16} className="text-[#9b5de5]" />
          </div>
          <h3 className="text-[13px] font-bold text-(--text) m-0 uppercase tracking-wider">
            Smart Allocation
          </h3>
        </div>
        <button
          onClick={onDismiss}
          className="p-1 rounded-full text-(--text-muted) hover:text-(--text) bg-(--bg-glass-strong) cursor-pointer"
        >
          <X size={14} />
        </button>
      </div>

      <div className="relative z-10">
        <p className="text-[12px] text-(--text-secondary) leading-relaxed mb-4">
          You have a projected surplus of{" "}
          <strong className="text-(--text)">{formatINR(surplus)}</strong>.
          Consider moving{" "}
          <strong className="text-[#9b5de5]">
            {formatINR(suggestedAmount)}
          </strong>{" "}
          to your Savings Wallet to maximize growth while staying well within
          your budget.
        </p>

        <button
          onClick={() => onTransfer(suggestedAmount.toString())}
          className="w-full py-2.5 rounded-xl bg-[#9b5de5] hover:bg-[#834bc2] text-white font-medium text-xs flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
        >
          <PiggyBank size={14} />
          Move to Savings
        </button>
      </div>
    </div>
  );
}

interface SavingsNudgeProps {
  updateProfile: (data) => Promise<void>;
  setShowSavingsNudgeSheet: (show: boolean) => void;
}

export function SavingsNudgeCard({
  updateProfile,
  setShowSavingsNudgeSheet,
}: SavingsNudgeProps) {
  return (
    <div className="glass-card p-4 fade-in-up mb-3 flex flex-col gap-3">
      <div>
        <h4 className="text-sm font-semibold text-(--text)">Savings Wallet</h4>
        <p className="font-sans text-xs text-(--text-muted) leading-relaxed mt-1">
          You haven't set up a Savings Wallet yet. Even setting a little aside
          adds up over time.
        </p>
      </div>
      <div className="flex gap-2 justify-end">
        <button
          onClick={async () => {
            try {
              await updateProfile({ savingsNudgeDismissed: true });
              toast.success("Nudge dismissed");
            } catch {
              toast.error("Failed to update profile");
            }
          }}
          className="btn-ghost text-xs px-3 py-1.5 font-semibold text-(--text-secondary) hover:text-(--text) cursor-pointer"
        >
          Not right now
        </button>
        <button
          onClick={() => setShowSavingsNudgeSheet(true)}
          className="btn-primary text-xs px-3.5 py-1.5 font-semibold shrink-0 cursor-pointer"
        >
          Set it up
        </button>
      </div>
    </div>
  );
}

export function TotalSpentNoBudgetCard({
  spent,
  setShowWizard,
}: {
  spent: number;
  setShowWizard: (s: boolean) => void;
}) {
  return (
    <div className="glass-card fade-in-up delay-1 p-4 mb-3">
      <div className="flex items-center justify-between mb-2">
        <span className="font-sans text-xs text-(--text-muted) font-medium">
          Total spent this month (no budget set)
        </span>
      </div>
      <div className="amount-display text-[1.75rem] text-(--text) mb-3">
        {formatINR(spent)}
      </div>
      <button
        onClick={() => setShowWizard(true)}
        className="btn-ghost text-xs text-(--accent) font-semibold p-0 gap-1"
        id="btn-setup-cta"
      >
        Set up this month <ChevronRight size={14} />
      </button>
    </div>
  );
}

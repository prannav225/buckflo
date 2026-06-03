/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate } from "react-router-dom";
import {
  ChevronRight,
  Wallet,
  PiggyBank,
  Palette,
  Zap,
  Sliders,
  Download,
  Calendar,
  Info,
  Upload,
  Trash2,
  Bell,
  MessageSquare,
  ExternalLink,
} from "lucide-react";
import { formatINR } from "../../utils/currency";
import { CustomDropdown } from "../layout/CustomDropdown";

export function AccountsSection({ spendingAcc, savingsAcc }: any) {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-[11px] font-semibold text-(--text-muted) uppercase tracking-[0.06em] px-1 mb-1">
        ACCOUNTS
      </h3>
      <div className="glass-card overflow-hidden divide-y divide-black/5 dark:divide-white/5">
        <div
          onClick={() => navigate("/home")}
          className="p-4 flex items-center justify-between cursor-pointer text-left w-full hover:bg-black/2 dark:hover:bg-white/2 active:opacity-80 transition-all"
        >
          <div className="flex items-center gap-3.5">
            <Wallet
              size={20}
              strokeWidth={1.5}
              className="text-(--text-secondary) shrink-0"
            />
            <div>
              <div className="font-sans text-[0.9375rem] font-medium text-(--text)">
                Spending Wallet
              </div>
              <div className="font-sans text-xs text-(--text-muted) mt-0.5">
                Daily spending
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-display text-lg font-semibold text-(--text)">
              {spendingAcc ? formatINR(spendingAcc.currentBalance) : "₹0.00"}
            </span>
            <ChevronRight size={16} className="text-(--text-muted)" />
          </div>
        </div>

        <div
          onClick={() => navigate("/savings")}
          className="p-4 flex items-center justify-between cursor-pointer text-left w-full hover:bg-black/2 dark:hover:bg-white/2 active:opacity-80 transition-all"
        >
          <div className="flex items-center gap-3.5">
            <PiggyBank
              size={20}
              strokeWidth={1.5}
              className="text-(--text-secondary) shrink-0"
            />
            <div>
              <div className="font-sans text-[0.9375rem] font-medium text-(--text)">
                Savings Wallet
              </div>
              <div className="font-sans text-xs text-(--text-muted) mt-0.5">
                Future goals
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-display text-lg font-semibold text-(--credit)">
              {savingsAcc ? formatINR(savingsAcc.currentBalance) : "₹0.00"}
            </span>
            <ChevronRight size={16} className="text-(--text-muted)" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function CustomizationSection({
  theme,
  handleThemeChange,
  themeOptions,
  setIsCreatePresetOpen,
}: any) {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-[11px] font-semibold text-(--text-muted) uppercase tracking-[0.06em] px-1 mb-1">
        CUSTOMIZATION
      </h3>
      <div className="glass-card divide-y divide-black/5 dark:divide-white/5 relative z-20">
        <div
          onClick={() => navigate("/profile/categories")}
          className="p-4 flex items-center justify-between cursor-pointer text-left w-full hover:bg-black/2 dark:hover:bg-white/2 active:opacity-80 transition-all rounded-t-xl"
        >
          <div className="flex items-center gap-3.5">
            <Palette
              size={20}
              strokeWidth={1.5}
              className="text-(--text-secondary) shrink-0"
            />
            <div>
              <div className="font-sans text-[0.9375rem] font-medium text-(--text)">
                Categories
              </div>
              <div className="font-sans text-xs text-(--text-muted) mt-0.5">
                Manage your spending categories
              </div>
            </div>
          </div>
          <ChevronRight size={16} className="text-(--text-muted)" />
        </div>

        <div
          onClick={() => setIsCreatePresetOpen(true)}
          className="p-4 flex items-center justify-between cursor-pointer text-left w-full hover:bg-black/2 dark:hover:bg-white/2 active:opacity-80 transition-all"
        >
          <div className="flex items-center gap-3.5">
            <Zap
              size={20}
              strokeWidth={1.5}
              className="text-(--text-secondary) shrink-0"
            />
            <div>
              <div className="font-sans text-[0.9375rem] font-medium text-(--text)">
                Quick Presets
              </div>
              <div className="font-sans text-xs text-(--text-muted) mt-0.5">
                Edit your one-tap shortcuts
              </div>
            </div>
          </div>
          <ChevronRight size={16} className="text-(--text-muted)" />
        </div>

        <div
          onClick={() => navigate("/profile/notifications")}
          className="p-4 flex items-center justify-between cursor-pointer text-left w-full hover:bg-black/2 dark:hover:bg-white/2 active:opacity-80 transition-all"
        >
          <div className="flex items-center gap-3.5">
            <Bell
              size={20}
              strokeWidth={1.5}
              className="text-(--text-secondary) shrink-0"
            />
            <div>
              <div className="font-sans text-[0.9375rem] font-medium text-(--text)">
                Notifications
              </div>
              <div className="font-sans text-xs text-(--text-muted) mt-0.5">
                Configure daily expense logging reminders
              </div>
            </div>
          </div>
          <ChevronRight size={16} className="text-(--text-muted)" />
        </div>

        <div className="p-4 flex items-center justify-between w-full rounded-b-xl">
          <div className="flex items-center gap-3.5">
            <Sliders
              size={20}
              strokeWidth={1.5}
              className="text-(--text-secondary) shrink-0"
            />
            <div>
              <div className="font-sans text-[0.9375rem] font-medium text-(--text)">
                Appearance
              </div>
              <div className="font-sans text-xs text-(--text-muted) mt-0.5">
                Theme and display preferences
              </div>
            </div>
          </div>
          <div className="w-[120px]">
            <CustomDropdown
              options={themeOptions}
              value={theme}
              onChange={handleThemeChange}
              id="appearance-theme-select"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function DataBackupSection({
  setIsMonthSetupOpen,
  setIsExportOpen,
  onBackup,
  onRestoreClick,
}: any) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-[11px] font-semibold text-(--text-muted) uppercase tracking-[0.06em] px-1 mb-1">
        DATA & BACKUPS
      </h3>
      <div className="glass-card overflow-hidden divide-y divide-black/5 dark:divide-white/5">
        <div
          onClick={() => setIsMonthSetupOpen(true)}
          className="p-4 flex items-center justify-between cursor-pointer text-left w-full hover:bg-black/2 dark:hover:bg-white/2 active:opacity-80 transition-all"
        >
          <div className="flex items-center gap-3.5">
            <Calendar
              size={20}
              strokeWidth={1.5}
              className="text-(--text-secondary) shrink-0"
            />
            <div>
              <div className="font-sans text-[0.9375rem] font-medium text-(--text)">
                Month Setup
              </div>
              <div className="font-sans text-xs text-(--text-muted) mt-0.5">
                Review or edit current month details
              </div>
            </div>
          </div>
          <ChevronRight size={16} className="text-(--text-muted)" />
        </div>

        <div
          onClick={() => setIsExportOpen(true)}
          className="p-4 flex items-center justify-between cursor-pointer text-left w-full hover:bg-black/2 dark:hover:bg-white/2 active:opacity-80 transition-all"
        >
          <div className="flex items-center gap-3.5">
            <Download
              size={20}
              strokeWidth={1.5}
              className="text-(--text-secondary) shrink-0"
            />
            <div>
              <div className="font-sans text-[0.9375rem] font-medium text-(--text)">
                Export History
              </div>
              <div className="font-sans text-xs text-(--text-muted) mt-0.5">
                Download CSV spreadsheet of transactions
              </div>
            </div>
          </div>
          <ChevronRight size={16} className="text-(--text-muted)" />
        </div>

        <div
          onClick={onBackup}
          className="p-4 flex items-center justify-between cursor-pointer text-left w-full hover:bg-black/2 dark:hover:bg-white/2 active:opacity-80 transition-all"
        >
          <div className="flex items-center gap-3.5">
            <Download
              size={20}
              strokeWidth={1.5}
              className="text-(--text-secondary) shrink-0 rotate-180"
            />
            <div>
              <div className="font-sans text-[0.9375rem] font-medium text-(--text)">
                Backup Database
              </div>
              <div className="font-sans text-xs text-(--text-muted) mt-0.5">
                Download a full database backup (.json)
              </div>
            </div>
          </div>
          <ChevronRight size={16} className="text-(--text-muted)" />
        </div>

        <div
          onClick={onRestoreClick}
          className="p-4 flex items-center justify-between cursor-pointer text-left w-full hover:bg-black/2 dark:hover:bg-white/2 active:opacity-80 transition-all"
        >
          <div className="flex items-center gap-3.5">
            <Upload
              size={20}
              strokeWidth={1.5}
              className="text-(--text-secondary) shrink-0"
            />
            <div>
              <div className="font-sans text-[0.9375rem] font-medium text-(--text)">
                Restore Database
              </div>
              <div className="font-sans text-xs text-(--text-muted) mt-0.5">
                Upload and restore from a backup file (.json)
              </div>
            </div>
          </div>
          <ChevronRight size={16} className="text-(--text-muted)" />
        </div>
      </div>
    </div>
  );
}

export function AboutSection() {
  const navigate = useNavigate();
  const FEEDBACK_FORM_URL = "https://forms.gle/JGU4iXccCsmu6X9q9";

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-[11px] font-semibold text-(--text-muted) uppercase tracking-[0.06em] px-1 mb-1">
        ABOUT
      </h3>
      <div className="glass-card overflow-hidden divide-y divide-black/5 dark:divide-white/5">
        <div
          onClick={() => navigate("/profile/about")}
          className="p-4 flex items-center justify-between cursor-pointer text-left w-full hover:bg-black/2 dark:hover:bg-white/2 active:opacity-80 transition-all"
        >
          <div className="flex items-center gap-3.5">
            <Info
              size={20}
              strokeWidth={1.5}
              className="text-(--text-secondary) shrink-0"
            />
            <div>
              <div className="font-sans text-[0.9375rem] font-medium text-(--text)">
                About buckflo
              </div>
              <div className="font-sans text-xs text-(--text-muted) mt-0.5">
                Offline-first accounting
              </div>
            </div>
          </div>
          <ChevronRight size={16} className="text-(--text-muted)" />
        </div>

        <div
          onClick={() =>
            window.open(FEEDBACK_FORM_URL, "_blank", "noopener,noreferrer")
          }
          className="p-4 flex items-center justify-between cursor-pointer text-left w-full hover:bg-black/2 dark:hover:bg-white/2 active:opacity-80 transition-all"
        >
          <div className="flex items-center gap-3.5">
            <MessageSquare
              size={20}
              strokeWidth={1.5}
              className="text-(--text-secondary) shrink-0"
            />
            <div>
              <div className="font-sans text-[0.9375rem] font-medium text-(--text)">
                Send Feedback
              </div>
              <div className="font-sans text-xs text-(--text-muted) mt-0.5">
                Help us improve — opens external form
              </div>
            </div>
          </div>
          <ExternalLink size={14} className="text-(--text-muted)" />
        </div>

        {typeof navigator !== "undefined" && "share" in navigator && (
          <div
            onClick={() => {
              navigator
                .share({
                  title: "buckflo",
                  text: "Check out buckflo, an offline-first personal expense tracker!",
                  url: window.location.origin,
                })
                .catch(() => {});
            }}
            className="p-4 flex items-center justify-between cursor-pointer text-left w-full hover:bg-black/2 dark:hover:bg-white/2 active:opacity-80 transition-all"
          >
            <div className="flex items-center gap-3.5">
              <Upload
                size={20}
                strokeWidth={1.5}
                className="text-(--text-secondary) shrink-0"
              />
              <div>
                <div className="font-sans text-[0.9375rem] font-medium text-(--text)">
                  Share App
                </div>
                <div className="font-sans text-xs text-(--text-muted) mt-0.5">
                  Recommend buckflo to a friend
                </div>
              </div>
            </div>
            <ChevronRight size={16} className="text-(--text-muted)" />
          </div>
        )}
      </div>
    </div>
  );
}

export function DangerZoneSection({ onWipeData }: any) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-[11px] font-semibold text-(--text-muted) uppercase tracking-[0.06em] px-1 mb-1 mt-2">
        ADVANCED
      </h3>
      <div className="glass-card overflow-hidden">
        <div
          onClick={onWipeData}
          className="p-4 flex items-center justify-between cursor-pointer text-left w-full hover:bg-red-500/5 dark:hover:bg-red-500/10 active:opacity-80 transition-all"
        >
          <div className="flex items-center gap-3.5">
            <Trash2
              size={20}
              strokeWidth={1.5}
              className="text-(--text-secondary) shrink-0"
            />
            <div>
              <div className="font-sans text-[0.9375rem] font-medium text-(--text)">
                Wipe All Data
              </div>
              <div className="font-sans text-xs text-(--text-muted) mt-0.5">
                Permanently delete all profile, settings, and transaction
                records
              </div>
            </div>
          </div>
          <ChevronRight size={16} className="text-(--text-muted)" />
        </div>
      </div>
    </div>
  );
}

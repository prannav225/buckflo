import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
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
  Pencil,
  Upload,
  Trash2,
} from "lucide-react";
import { useProfile } from "../hooks/useProfile";
import { exportDatabase, importDatabase, wipeDatabase } from "../utils/backup";
import toast from "react-hot-toast";
import { useRef } from "react";
import { useTheme, type Theme } from "../context/ThemeContext";
import { useAccount } from "../db/hooks";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/database";
import { formatINR } from "../utils/currency";
import { getCurrentMonthYear } from "../utils/dateUtils";
import { ExportSheet } from "../components/transactions/ExportSheet";
import { MonthInitModal } from "../components/MonthInitModal";
import { useConfirm } from "../hooks/useConfirm";
import { CreatePresetSheet } from "../components/transactions/CreatePresetSheet";
import { CustomDropdown } from "../components/layout/CustomDropdown";
import { BrandedAvatar } from "../components/layout/BrandedAvatar";

const themeOptions = [
  { value: "light" as const, label: "Light" },
  { value: "dark" as const, label: "Dark" },
  { value: "system" as const, label: "System" },
];

import { PixelBanner } from "../components/layout/PixelBanner";

export function ProfilePage() {
  const navigate = useNavigate();
  const { confirm, dialog } = useConfirm();
  const { profile, updateProfile } = useProfile();
  const { theme, setTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleThemeChange = async (newTheme: Theme) => {
    setTheme(newTheme);
    try {
      await updateProfile({ theme: newTheme });
    } catch (err) {
      console.error("Failed to save theme:", err);
    }
  };

  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isMonthSetupOpen, setIsMonthSetupOpen] = useState(false);
  const [isCreatePresetOpen, setIsCreatePresetOpen] = useState(false);

  const expendAcc = useAccount("expenditure");
  const savingsAcc = useAccount("savings");

  const displayName = profile?.displayName || "buckflo";
  const memberSince = profile?.createdAt
    ? format(new Date(profile.createdAt), "MMMM yyyy")
    : "May 2026";

  const currentMonth = getCurrentMonthYear();
  const transactionCount = useLiveQuery(() => db.transactions.count(), []) ?? 0;

  return (
    <>
      <div className="flex flex-col gap-6 fade-in-up">
        {/* Profile Header (Seamless translucent band, not a card) */}
        <div className="profile-header-card">
          <PixelBanner
            seed={`${displayName}-${profile?.createdAt ? new Date(profile.createdAt).getTime() : "0"}`}
          />
          <div
            className="cursor-pointer flex flex-col items-center select-none group relative z-10 w-full px-6 py-4"
            id="profile-header-trigger"
          >
            <div className="relative select-none mb-3.5">
              <BrandedAvatar
                name={displayName}
                size={88}
                className="shadow-md transition-transform duration-200 group-hover:scale-105 active:scale-95 border-4 border-white dark:border-[#2d2d2c]"
              />
              <button
                type="button"
                className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-(--accent) text-white border-2 border-white dark:border-[#2d2d2c] flex items-center justify-center shadow-md transition-transform duration-200 hover:scale-110 active:scale-90 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/profile/edit");
                }}
                aria-label="Edit Profile Name"
              >
                <Pencil size={12} strokeWidth={2.5} />
              </button>
            </div>
            <h2 className="font-display text-3xl italic font-light! text-(--text) m-0 tracking-normal">
              {displayName}
            </h2>
            <div className="mt-2.5 flex flex-col gap-1 items-center">
              <p className="m-0 text-xs text-(--text-muted) font-medium">
                Member since {memberSince}
              </p>
              <p className="m-0 text-xs text-(--accent) font-semibold tracking-wide">
                {transactionCount}{" "}
                {transactionCount === 1 ? "transaction" : "transactions"} logged
              </p>
            </div>
          </div>
        </div>

        {/* Section: Accounts */}
        <div className="flex flex-col gap-2">
          <h3 className="text-[11px] font-semibold text-(--text-muted) uppercase tracking-[0.06em] px-1 mb-1">
            ACCOUNTS
          </h3>
          <div className="glass-card overflow-hidden divide-y divide-black/5 dark:divide-white/5">
            {/* Expenditure Account Row */}
            <div
              onClick={() => navigate("/")}
              className="p-4 flex items-center justify-between cursor-pointer text-left w-full hover:bg-black/2 dark:hover:bg-white/2 active:opacity-80 transition-all"
              id="profile-row-expenditure"
            >
              <div className="flex items-center gap-3.5">
                <Wallet
                  size={20}
                  strokeWidth={1.5}
                  className="text-(--text-secondary) shrink-0"
                />
                <div>
                  <div className="font-sans text-[0.9375rem] font-medium text-(--text)">
                    Expenditure Account
                  </div>
                  <div className="font-sans text-xs text-(--text-muted) mt-0.5">
                    Daily spending
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-display text-lg font-semibold text-(--text)">
                  {expendAcc ? formatINR(expendAcc.currentBalance) : "₹0.00"}
                </span>
                <ChevronRight size={16} className="text-(--text-muted)" />
              </div>
            </div>

            {/* Savings Account Row */}
            <div
              onClick={() => navigate("/savings")}
              className="p-4 flex items-center justify-between cursor-pointer text-left w-full hover:bg-black/2 dark:hover:bg-white/2 active:opacity-80 transition-all"
              id="profile-row-savings"
            >
              <div className="flex items-center gap-3.5">
                <PiggyBank
                  size={20}
                  strokeWidth={1.5}
                  className="text-(--text-secondary) shrink-0"
                />
                <div>
                  <div className="font-sans text-[0.9375rem] font-medium text-(--text)">
                    Savings Account
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

        {/* Section: Customization */}
        <div className="flex flex-col gap-2">
          <h3 className="text-[11px] font-semibold text-(--text-muted) uppercase tracking-[0.06em] px-1 mb-1">
            CUSTOMIZATION
          </h3>
          <div className="glass-card overflow-hidden divide-y divide-black/5 dark:divide-white/5">
            {/* Categories */}
            <div
              onClick={() => navigate("/profile/categories")}
              className="p-4 flex items-center justify-between cursor-pointer text-left w-full hover:bg-black/2 dark:hover:bg-white/2 active:opacity-80 transition-all"
              id="profile-row-categories"
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

            {/* Quick Presets */}
            <div
              onClick={() => setIsCreatePresetOpen(true)}
              className="p-4 flex items-center justify-between cursor-pointer text-left w-full hover:bg-black/2 dark:hover:bg-white/2 active:opacity-80 transition-all"
              id="profile-row-presets"
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

            {/* Appearance */}
            <div
              className="p-4 flex items-center justify-between w-full"
              id="profile-row-appearance"
            >
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
              <CustomDropdown
                options={themeOptions}
                value={theme}
                onChange={handleThemeChange}
                id="appearance-theme-select"
              />
            </div>
          </div>
        </div>

        {/* Section: Data */}
        <div className="flex flex-col gap-2">
          <h3 className="text-[11px] font-semibold text-(--text-muted) uppercase tracking-[0.06em] px-1 mb-1">
            DATA
          </h3>
          <div className="glass-card overflow-hidden divide-y divide-black/5 dark:divide-white/5">
            {/* Export Data */}
            <div
              onClick={() => setIsExportOpen(true)}
              className="p-4 flex items-center justify-between cursor-pointer text-left w-full hover:bg-black/2 dark:hover:bg-white/2 active:opacity-80 transition-all"
              id="profile-row-export"
            >
              <div className="flex items-center gap-3.5">
                <Download
                  size={20}
                  strokeWidth={1.5}
                  className="text-(--text-secondary) shrink-0"
                />
                <div>
                  <div className="font-sans text-[0.9375rem] font-medium text-(--text)">
                    Export Data
                  </div>
                  <div className="font-sans text-xs text-(--text-muted) mt-0.5">
                    Download your transaction history
                  </div>
                </div>
              </div>
              <ChevronRight size={16} className="text-(--text-muted)" />
            </div>

            {/* Month Setup */}
            <div
              onClick={() => setIsMonthSetupOpen(true)}
              className="p-4 flex items-center justify-between cursor-pointer text-left w-full hover:bg-black/2 dark:hover:bg-white/2 active:opacity-80 transition-all"
              id="profile-row-month-setup"
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
                    Review or edit current month setup
                  </div>
                </div>
              </div>
              <ChevronRight size={16} className="text-(--text-muted)" />
            </div>
          </div>
        </div>

        {/* Section: About */}
        <div className="flex flex-col gap-2">
          <h3 className="text-[11px] font-semibold text-(--text-muted) uppercase tracking-[0.06em] px-1 mb-1">
            ABOUT
          </h3>
          <div className="glass-card overflow-hidden">
            {/* About buckflo */}
            <div
              onClick={() => navigate("/profile/about")}
              className="p-4 flex items-center justify-between cursor-pointer text-left w-full hover:bg-black/2 dark:hover:bg-white/2 active:opacity-80 transition-all"
              id="profile-row-about"
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
          </div>
        </div>

        {/* Footer Text */}
        {/* ── Data Management Section ── */}
        <div className="flex flex-col gap-2">
          <h3 className="text-[11px] font-semibold text-(--text-muted) uppercase tracking-[0.06em] px-1 mb-1 mt-2">
            DATA MANAGEMENT
          </h3>
          <div className="glass-card overflow-hidden">
            <div className="p-4 flex flex-col gap-4 w-full">
              <p className="text-[11px] text-(--text-muted) leading-relaxed m-0">
                Pocket Ledger runs entirely on your device. Use these tools to back
                up your data before switching devices or clearing browser storage.
              </p>
              <div className="flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await exportDatabase();
                      toast.success("Backup downloaded successfully.");
                    } catch (err) {
                      toast.error("Failed to export backup.");
                    }
                  }}
                  className="btn-secondary py-2.5 text-xs flex items-center justify-center gap-1.5"
                >
                  <Download size={14} /> Download Full Backup
                </button>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".json"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      const conf = await confirm({
                        title: "Restore Backup",
                        message: "This will replace all your current data with the backup. Are you sure?",
                        confirmLabel: "Restore",
                        variant: "danger"
                      });
                      if (!conf) return;
                      await importDatabase(file);
                      toast.success("Backup restored! Please restart the app.");
                      setTimeout(() => {
                        window.location.reload();
                      }, 1500);
                    } catch (err) {
                      toast.error("Failed to restore backup.");
                    }
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-secondary py-2.5 text-xs flex items-center justify-center gap-1.5"
                >
                  <Upload size={14} /> Restore from Backup
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Danger Zone ── */}
        <div className="flex flex-col gap-2">
          <h3 className="text-[11px] font-semibold text-[#b82d23] uppercase tracking-[0.06em] px-1 mb-1 mt-2">
            DANGER ZONE
          </h3>
          <div className="glass-card overflow-hidden">
            <div className="p-4 flex flex-col gap-4 w-full">
              <p className="text-[11px] text-(--text-muted) leading-relaxed m-0">
                This will permanently delete your profile, goals, setups, and all
                transactions. This action cannot be undone.
              </p>
              <button
                type="button"
                onClick={async () => {
                  const conf1 = await confirm({
                    title: "Wipe All Data",
                    message: "Are you absolutely sure you want to wipe all data? This is permanent and cannot be undone.",
                    confirmLabel: "Wipe Data",
                    variant: "danger"
                  });
                  if (!conf1) return;
                  
                  try {
                    await wipeDatabase();
                    toast.success("App data wiped successfully.");
                    setTimeout(() => {
                      window.location.href = "/";
                    }, 1000);
                  } catch (err) {
                    toast.error("Failed to wipe data.");
                  }
                }}
                className="w-full bg-[#b82d23]/10 text-[#b82d23] border border-[#b82d23]/20 hover:bg-[#b82d23]/20 rounded-xl py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 size={14} /> Wipe All Data
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center my-4">
          <div className="flex items-center opacity-90 select-none">
            <img
              src="/buckflo_favicon.png"
              alt="buckflo"
              className="w-5 h-5 object-contain rounded-full"
            />
            <span className="font-display text-base tracking-wider italic font-normal! text-(--accent)">
              buckflo
            </span>
          </div>
          <p className="text-center font-sans text-[11px] text-(--text-muted) leading-relaxed m-0">
            Version 1.8
            <br />
            All your data lives solely on this device.
            <br />
            Nothing is ever sent to a server.
          </p>
        </div>
      </div>

      {/* Sheets / Modals */}
      <ExportSheet
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />

      <MonthInitModal
        isOpen={isMonthSetupOpen}
        monthYear={currentMonth}
        onClose={() => setIsMonthSetupOpen(false)}
        onSaved={() => {
          setIsMonthSetupOpen(false);
        }}
        isEdit={true}
      />

      <CreatePresetSheet
        isOpen={isCreatePresetOpen}
        onClose={() => setIsCreatePresetOpen(false)}
      />

      {dialog}
    </>
  );
}

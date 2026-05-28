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
} from "lucide-react";
import { useProfile } from "../hooks/useProfile";
import { useTheme, type Theme } from "../context/ThemeContext";
import { useAccount } from "../db/hooks";
import { formatINR } from "../utils/currency";
import { getCurrentMonthYear } from "../utils/dateUtils";
import { ExportSheet } from "../components/transactions/ExportSheet";
import { MonthInitModal } from "../components/MonthInitModal";
import { CreatePresetSheet } from "../components/transactions/CreatePresetSheet";
import { CustomDropdown } from "../components/layout/CustomDropdown";
import { BrandedAvatar } from "../components/layout/BrandedAvatar";

const themeOptions = [
  { value: "light" as const, label: "Light" },
  { value: "dark" as const, label: "Dark" },
  { value: "system" as const, label: "System" },
];

export function ProfilePage() {
  const navigate = useNavigate();
  const { profile, updateProfile } = useProfile();
  const { theme, setTheme } = useTheme();

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

  const displayName = profile?.displayName || "flo";
  const memberSince = profile?.createdAt
    ? format(new Date(profile.createdAt), "MMMM yyyy")
    : "May 2026";

  const currentMonth = getCurrentMonthYear();

  return (
    <>
      <div className="flex flex-col gap-6 fade-in-up">
        {/* Profile Header */}
        <div className="flex flex-col items-center text-center mt-4">
          <div
            onClick={() => navigate("/profile/edit")}
            className="cursor-pointer flex flex-col items-center select-none group"
            id="profile-header-trigger"
          >
            <div className="relative select-none">
              <BrandedAvatar
                name={displayName}
                size={80}
                className="shadow-md transition-transform duration-200 group-hover:scale-105 active:scale-95"
              />
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-(--accent) text-white border-2 border-(--bg) flex items-center justify-center shadow-md transition-transform duration-200 group-hover:scale-105 active:scale-95">
                <Pencil size={11} strokeWidth={2.5} />
              </div>
            </div>
            <h2 className="font-display text-2xl font-bold text-(--text) mt-3 mb-0.5 tracking-wide group-hover:text-(--accent) transition-colors">
              {displayName}
            </h2>
            <p className="m-0 text-xs text-(--text-muted)">
              Member since {memberSince}
            </p>
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
            {/* About flo */}
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
                    About flo
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
        <p className="text-center font-sans text-xs text-(--text-muted) leading-relaxed mt-4">
          All your data lives on this device.
          <br />
          Nothing is ever sent to a server.
        </p>
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
    </>
  );
}

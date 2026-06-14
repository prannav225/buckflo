import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Pencil } from "lucide-react";
import { useProfile } from "../hooks/useProfile";
import { exportDatabase, importDatabase, wipeDatabase } from "../utils/backup";
import toast from "react-hot-toast";
import { useTheme, type Theme } from "../context/ThemeContext";
import { useAccount } from "../db/hooks";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/database";
import { getCurrentMonthYear } from "../utils/dateUtils";
import { ExportSheet } from "../components/transactions/ExportSheet";
import { MonthInitModal } from "../components/MonthInitModal";
import { useConfirm } from "../hooks/useConfirm";
import { CreatePresetSheet } from "../components/transactions/CreatePresetSheet";
import { BrandedAvatar } from "../components/layout/BrandedAvatar";
import packageJson from "../../package.json";
import { PixelBanner } from "../components/layout/PixelBanner";
import {
  AccountsSection,
  CustomizationSection,
  DataBackupSection,
  AboutSection,
  DangerZoneSection,
} from "../components/profile/ProfileSections";

const themeOptions = [
  { value: "light" as const, label: "Light" },
  { value: "dark" as const, label: "Dark" },
  { value: "system" as const, label: "System" },
];

export function ProfilePage() {
  const navigate = useNavigate();
  const { confirm, dialog } = useConfirm();
  const { profile, updateProfile } = useProfile();
  const { theme, setTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isMonthSetupOpen, setIsMonthSetupOpen] = useState(false);
  const [isCreatePresetOpen, setIsCreatePresetOpen] = useState(false);

  const spendingAcc = useAccount("spending");
  const savingsAcc = useAccount("savings");

  const displayName = profile?.displayName || "buckflo";
  const memberSince = profile?.createdAt
    ? format(new Date(profile.createdAt), "MMMM yyyy")
    : "May 2026";

  const currentMonth = getCurrentMonthYear();
  const transactionCount = useLiveQuery(() => db.transactions.count(), []) ?? 0;

  const handleThemeChange = async (newTheme: Theme) => {
    setTheme(newTheme);
    try {
      await updateProfile({ theme: newTheme });
    } catch (err) {
      console.error("Failed to save theme:", err);
    }
  };

  const handleBackup = async () => {
    try {
      await exportDatabase();
      toast.success("Backup downloaded successfully.");
    } catch {
      toast.error("Failed to export backup.");
    }
  };

  const handleWipeData = async () => {
    const conf1 = await confirm({
      title: "Wipe All Data",
      message:
        "Are you absolutely sure you want to wipe all data? This is permanent and cannot be undone.",
      confirmLabel: "Wipe Data",
      variant: "danger",
    });
    if (!conf1) return;

    try {
      await wipeDatabase(true);
      toast.success("App data wiped successfully.");
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    } catch {
      toast.error("Failed to wipe data.");
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.json')) {
      toast.error("Invalid file format. Please select a .json database backup file (CSV exports cannot be used to restore the full database).");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    try {
      const conf = await confirm({
        title: "Restore Backup",
        message:
          "This will replace all your current data with the backup. Are you sure?",
        confirmLabel: "Restore",
        variant: "danger",
      });
      if (!conf) return;
      await importDatabase(file);
      toast.success("Backup restored! Please restart the app.");
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      console.error("Failed to restore database backup:", err);
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Failed to restore backup: ${msg}`);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <>
      <div className="flex flex-col gap-6 fade-in-up">
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

        <AccountsSection spendingAcc={spendingAcc} savingsAcc={savingsAcc} />

        <CustomizationSection
          theme={theme}
          handleThemeChange={handleThemeChange}
          themeOptions={themeOptions}
          setIsCreatePresetOpen={setIsCreatePresetOpen}
        />

        <DataBackupSection
          setIsMonthSetupOpen={setIsMonthSetupOpen}
          setIsExportOpen={setIsExportOpen}
          onBackup={handleBackup}
          onRestoreClick={() => fileInputRef.current?.click()}
        />

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
        />

        <AboutSection />

        <DangerZoneSection onWipeData={handleWipeData} />

        <div className="flex flex-col items-center">
          <div className="flex items-center opacity-90 select-none">
            <img
              src="/buckflo_favicon.svg"
              alt="buckflo"
              className="w-5 h-5 object-contain rounded-full"
            />
            <span className="font-display text-base tracking-wider italic font-normal! text-(--accent)">
              buckflo
            </span>
          </div>
          <p className="text-center font-sans text-[11px] text-(--text-muted) leading-relaxed m-0">
            Version {packageJson.version}
            <br />
            All your data lives solely on this device.
            <br />
            Nothing is ever sent to a server.
          </p>
        </div>
      </div>

      <ExportSheet
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />

      <MonthInitModal
        isOpen={isMonthSetupOpen}
        monthYear={currentMonth}
        onClose={() => setIsMonthSetupOpen(false)}
        onSaved={() => setIsMonthSetupOpen(false)}
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

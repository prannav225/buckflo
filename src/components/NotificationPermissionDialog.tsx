import { Bell } from "lucide-react";

interface NotificationPermissionDialogProps {
  onEnable: () => void;
  onDisable: () => void;
}

export function NotificationPermissionDialog({
  onEnable,
  onDisable,
}: NotificationPermissionDialogProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#151515] border border-black/10 dark:border-white/10 rounded-2xl max-w-sm p-6 space-y-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-(--accent)/10 flex items-center justify-center">
            <Bell className="w-5 h-5 text-(--accent)" />
          </div>
          <h2 className="font-semibold text-lg text-(--text)">
            Enable Notifications?
          </h2>
        </div>

        <p className="text-(--text-muted) text-sm leading-relaxed">
          Get alerts for budget thresholds, bill reminders, and spending
          insights. You can disable this anytime in Settings.
        </p>

        <div className="flex gap-3 pt-2">
          <button
            onClick={onDisable}
            className="flex-1 px-4 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 text-(--text) hover:bg-black/10 dark:hover:bg-white/10 transition-colors font-medium text-sm"
          >
            Not Now
          </button>
          <button
            onClick={onEnable}
            className="flex-1 px-4 py-2.5 rounded-xl bg-(--accent) hover:bg-(--accent)/90 text-white font-medium transition-colors text-sm"
          >
            Enable
          </button>
        </div>
      </div>
    </div>
  );
}

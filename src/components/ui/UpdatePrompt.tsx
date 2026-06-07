// @ts-expect-error PWA virtual module types
import { useRegisterSW } from "virtual:pwa-register/react";
import { DownloadCloud, X } from "lucide-react";
import { hapticFeedback } from "../../utils/haptics";

export function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r: any) {
      console.log("SW Registered:", r);
    },
    onRegisterError(error: any) {
      console.log("SW registration error", error);
    },
  });

  const close = () => {
    setNeedRefresh(false);
  };

  if (!needRefresh) return null;

  return (
    <div className="fixed bottom-[calc(90px+env(safe-area-inset-bottom,0))] left-4 right-4 z-[90] animate-fade-in-up flex justify-center pointer-events-none">
      <div className="bg-[#1C1C1E]/90 dark:bg-white/10 [-webkit-backdrop-filter:blur(32px)_saturate(200%)] [backdrop-filter:blur(32px)_saturate(200%)] border border-white/10 p-1.5 pr-2 rounded-full shadow-2xl flex items-center justify-between gap-3 pointer-events-auto max-w-sm w-full mx-auto">
        <div className="flex items-center gap-3 pl-1">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-(--accent) text-white shrink-0 shadow-inner">
            <DownloadCloud size={16} strokeWidth={2.5} />
          </div>
          <span className="text-[13px] font-semibold text-white dark:text-(--text) tracking-wide">
            Update Available
          </span>
        </div>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            className="px-4 py-2 text-[11px] font-bold text-white bg-white/10 hover:bg-white/20 rounded-full cursor-pointer transition-colors uppercase tracking-wider"
            onClick={() => {
              hapticFeedback.success();
              updateServiceWorker(true);
            }}
          >
            Update
          </button>
          <button
            type="button"
            className="p-2 rounded-full text-white/50 hover:text-white transition-colors cursor-pointer"
            onClick={close}
            aria-label="Dismiss update"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}

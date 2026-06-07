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
    <div className="fixed bottom-[calc(120px+env(safe-area-inset-bottom,0))] left-4 right-4 z-[90] animate-fade-in-up">
      <div className="bg-(--bg-glass-strong) [-webkit-backdrop-filter:blur(32px)_saturate(200%)] [backdrop-filter:blur(32px)_saturate(200%)] border border-(--accent)/30 p-4 rounded-2xl shadow-[0_8px_30px_rgba(217,119,87,0.2)] flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-(--accent)/10 text-(--accent) shrink-0">
            <DownloadCloud size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-(--text) m-0 mb-0.5 tracking-tight">
              Update Available
            </h4>
            <p className="text-xs text-(--text-muted) m-0 leading-snug">
              A new version is ready.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="btn-primary px-4 py-2 text-xs font-bold shadow-sm rounded-full cursor-pointer hover:scale-105 active:scale-95 transition-transform"
            onClick={() => {
              hapticFeedback.success();
              updateServiceWorker(true);
            }}
          >
            Update Now
          </button>
          <button
            type="button"
            className="p-2 rounded-full text-(--text-muted) hover:text-(--text) hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
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

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Sparkles, CheckCircle2, Wrench, X } from "lucide-react";
import { changelogData } from "../../data/changelog";
import { hapticFeedback } from "../../utils/haptics";

const CHANGELOG_KEY = "last_seen_version";

export function ChangelogModal() {
  const [isOpen, setIsOpen] = useState(false);
  const latestRelease = changelogData[0]; // Assuming index 0 is always the latest

  useEffect(() => {
    if (!latestRelease) return;

    const lastSeenVersion = localStorage.getItem(CHANGELOG_KEY);
    // Only show if the user hasn't seen the latest version
    if (lastSeenVersion !== latestRelease.version) {
      // Small delay to allow the app to render first, making the modal appearance more cinematic
      const timer = setTimeout(() => {
        setIsOpen(true);
        hapticFeedback.light();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [latestRelease]);

  const handleClose = () => {
    hapticFeedback.medium();
    setIsOpen(false);
    // Only mark as seen when the user explicitly closes it
    localStorage.setItem(CHANGELOG_KEY, latestRelease.version);
  };

  if (!isOpen || !latestRelease) return null;

  return createPortal(
    <div
      className="sheet-overlay animate-fade-in z-[100]"
      onClick={handleClose}
    >
      <div
        className="sheet-panel pb-[calc(24px+env(safe-area-inset-bottom,0))] slide-up max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet-handle" />

        <div className="flex items-center justify-between mb-6 mt-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-(--accent)/10 text-(--accent)">
              <Sparkles size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-xl tracking-[-0.02em] m-0 font-bold">
                What's New
              </h3>
              <p className="mt-0.5 text-xs text-(--accent) font-semibold uppercase tracking-wider">
                Version {latestRelease.version}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="btn-ghost p-2 rounded-full min-h-0 h-auto flex items-center justify-center cursor-pointer text-(--text-muted) hover:text-(--text) transition-colors"
            onClick={handleClose}
            aria-label="Close changelog"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col gap-8">
          <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
            <h4 className="text-sm font-semibold mb-3 text-(--text) tracking-wide">
              {latestRelease.title}
            </h4>
            <p className="text-xs text-(--text-muted) mb-0 leading-relaxed">
              We've been hard at work making your experience even better. Here's
              a quick look at the latest updates.
            </p>
          </div>

          {latestRelease.features && latestRelease.features.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-(--text)">
                <CheckCircle2 size={16} className="text-(--credit)" />
                New Features
              </h4>
              <ul className="flex flex-col gap-2 mt-3 list-none">
                {latestRelease.features.map((feature, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 text-sm text-(--text-muted) leading-snug animate-fade-in"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-(--credit) mt-1.5 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {latestRelease.fixes && latestRelease.fixes.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-(--text)">
                <Wrench size={16} className="text-(--accent)" />
                Fixes & Improvements
              </h4>
              <ul className="flex flex-col gap-2 mt-3 list-none">
                {latestRelease.fixes.map((fix, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 text-sm text-(--text-muted) leading-snug animate-fade-in"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-(--accent) mt-1.5 shrink-0" />
                    {fix}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="mt-10">
          <button
            type="button"
            className="btn-primary w-full py-3.5 px-7 rounded-(--r-pill) transition-[background,transform] duration-300 ease-in-out cursor-pointer shadow-[0_6px_20px_rgba(217,119,87,0.25)] text-sm font-bold tracking-wide"
            onClick={handleClose}
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

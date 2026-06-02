import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, ChevronRight, Sparkles, X } from "lucide-react";
import { hapticFeedback } from "../../utils/haptics";

const CURRENT_VERSION = "2.0";

export function ChangelogModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if the user has an existing profile
    const checkVersion = async () => {
      const storedVersion = localStorage.getItem("buckflo_version");
      if (storedVersion !== CURRENT_VERSION) {
        // Assume they are updating from < 2.0 if they don't have the current version
        // We only show this if they've used the app before (we could check if profile exists)
        // But for simplicity, we'll just show it to everyone who doesn't have "2.0" recorded.
        setIsOpen(true);
      }
    };
    checkVersion();
  }, []);

  const handleClose = () => {
    hapticFeedback.light();
    localStorage.setItem("buckflo_version", CURRENT_VERSION);
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="sheet-overlay" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen px-4 pb-12 pt-4">
        <div 
          className="bg-(--bg-glass) [-webkit-backdrop-filter:blur(32px)_saturate(200%)] [backdrop-filter:blur(32px)_saturate(200%)] border border-black/8 dark:border-white/6 shadow-(--glass-shadow-lg) rounded-(--r-2xl) w-full max-w-sm overflow-hidden flex flex-col slide-up relative"
        >
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors z-10"
          >
            <X size={18} className="text-(--text-muted)" />
          </button>

          <div className="p-6 pb-4 border-b border-black/5 dark:border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-(--accent) opacity-10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-(--credit) opacity-10 blur-2xl rounded-full -translate-x-1/2 translate-y-1/2" />
            
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-(--accent) to-(--accent-dark) flex items-center justify-center shadow-lg shadow-(--accent)/20 mb-4 relative z-10">
              <Sparkles className="text-white" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-(--text) tracking-tight relative z-10">
              What's New in v2.0
            </h2>
            <p className="text-sm text-(--text-muted) mt-1 relative z-10">
              A smarter, more premium experience.
            </p>
          </div>

          <div className="p-6 py-5 overflow-y-auto max-h-[50vh] flex flex-col gap-5">
            <div className="flex gap-3">
              <div className="mt-0.5 shrink-0">
                <CheckCircle2 size={18} className="text-(--accent)" />
              </div>
              <div>
                <h4 className="font-semibold text-(--text) text-sm">Wallets, not Accounts</h4>
                <p className="text-xs text-(--text-muted) mt-0.5 leading-relaxed">
                  We've rebranded "Accounts" to "Spending Wallet" and "Savings Wallet" to better reflect how you actually use your money.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="mt-0.5 shrink-0">
                <CheckCircle2 size={18} className="text-(--accent)" />
              </div>
              <div>
                <h4 className="font-semibold text-(--text) text-sm">Income-Based Setup Wizard</h4>
                <p className="text-xs text-(--text-muted) mt-0.5 leading-relaxed">
                  A smarter way to plan your month. Start with your income, subtract fixed costs, and see exactly what's left.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="mt-0.5 shrink-0">
                <CheckCircle2 size={18} className="text-(--accent)" />
              </div>
              <div>
                <h4 className="font-semibold text-(--text) text-sm">Premium Haptics</h4>
                <p className="text-xs text-(--text-muted) mt-0.5 leading-relaxed">
                  Feel your finances. Subtle haptic feedback across the app makes every interaction satisfying.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="mt-0.5 shrink-0">
                <CheckCircle2 size={18} className="text-(--accent)" />
              </div>
              <div>
                <h4 className="font-semibold text-(--text) text-sm">Smart Insights & Monthly Review</h4>
                <p className="text-xs text-(--text-muted) mt-0.5 leading-relaxed">
                  Get deeper insights into your spending patterns and close out your month with a beautiful summary screen.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5">
            <button
              onClick={handleClose}
              className="btn-primary w-full h-12"
            >
              Continue <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

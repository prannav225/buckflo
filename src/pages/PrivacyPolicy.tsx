import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";

export function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="fade-in max-w-[640px] mx-auto pb-12">
      {/* Header */}
      <header className="flex items-center gap-3 mb-6 pt-2">
        <button
          onClick={() => navigate(-1)}
          className="btn-ghost p-2 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
          aria-label="Go Back"
        >
          <ArrowLeft size={20} className="text-(--text)" />
        </button>
        <h2 className="text-xl font-bold tracking-tight m-0 text-(--text)">
          Privacy Policy
        </h2>
      </header>

      {/* Main Glass Content */}
      <div className="glass-card-strong p-6 flex flex-col gap-5 text-sm leading-relaxed text-(--text-secondary) max-h-[75vh] overflow-y-auto scrollbar-thin">
        <div className="flex items-center gap-3 pb-3 border-b border-black/8 dark:border-white/6">
          <div className="w-10 h-10 rounded-xl bg-(--accent)/10 flex items-center justify-center">
            <Shield size={20} className="text-(--accent)" />
          </div>
          <div>
            <div className="text-xs text-(--text-muted) font-medium">Last updated</div>
            <div className="font-semibold text-(--text)">May 27, 2026</div>
          </div>
        </div>

        <p>
          At <strong>buckflo</strong> (pocket_ledger), we hold your financial privacy in the absolute highest regard. This Privacy Policy details our operational data security principles.
        </p>

        <div className="flex flex-col gap-1.5">
          <h3 className="font-bold text-(--text) text-base">1. Offline-First Privacy Architecture</h3>
          <p>
            buckflo is designed as an offline-first client application. <strong>All transactions, account structures, budgets, savings goals, and subscriptions are stored locally</strong> on your own device using browser-native IndexedDB databases.
          </p>
          <p>
            We do not host remote database clusters, and your raw data is never transferred, backed up, or made visible to us or any third parties.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <h3 className="font-bold text-(--text) text-base">2. Data Security & Stewardship</h3>
          <p>
            Because your financial records reside entirely on your local device, the security of your cash flow details depends directly on securing your physical hardware.
          </p>
          <p>
            We recommend setting up secure device locks (biometrics, PINs) and taking advantage of full-disk encryption options supported by your operating system.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <h3 className="font-bold text-(--text) text-base">3. Zero Data Collection</h3>
          <p>
            We do not use tracking pixels, diagnostic crash-upload tools, analytics cookies, or behavioral advertising trackers. Your usage metrics, presets, and financial habits remain exclusively yours.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <h3 className="font-bold text-(--text) text-base">4. Browser Storage Clearances</h3>
          <p>
            Please note that clearing your web browser cookies, site storage caches, or application databases will permanently erase your local IndexedDB records. We recommend backing up your data regularly by exporting records if required.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <h3 className="font-bold text-(--text) text-base">5. Updates to this Policy</h3>
          <p>
            We may refine this policy to align with future standalone localized features. Any updates will take effect immediately upon deployment of the new package code.
          </p>
        </div>
      </div>
    </div>
  );
}

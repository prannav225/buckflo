import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShieldCheck, Sparkles, Database } from "lucide-react";
import packageJson from "../../package.json";

export function AboutPage() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      {/* Header */}
      <div className="sub-header p-0! fade-in-up flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <button
            className="p-0 min-h-0 h-auto flex text-(--text-muted) hover:text-(--text) cursor-pointer bg-transparent border-0 outline-none"
            onClick={() => navigate("/profile")}
            title="Back to profile"
            id="about-btn-back"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="sub-header-title m-0">About buckflo</h2>
        </div>
      </div>

      <div className="flex flex-col gap-6 fade-in-up delay-1">
        {/* Big Branded Hero Card */}
        <div className="glass-card p-6 text-center flex flex-col items-center relative overflow-hidden">
          <span className="font-display text-7xl text-(--accent) tracking-normal leading-none italic select-none drop-shadow-[0_0_20px_rgba(217,119,87,0.15)]">
            buckflo
          </span>
          <p className="font-sans text-[10px] uppercase tracking-[0.2em] font-semibold text-(--text-muted) mt-3">
            Version {packageJson.version}
          </p>
          <p className="font-sans text-sm text-(--text-secondary) leading-relaxed mt-4 max-w-[280px]">
            Track everything. Understand your patterns. Spend better.
          </p>
        </div>

        {/* Core Philosophies list */}
        <div className="flex flex-col gap-4">
          {/* Offline Row */}
          <div className="glass-card p-4.5 flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
              <ShieldCheck size={20} className="text-green-500" />
            </div>
            <div>
              <h4 className="font-sans text-sm font-semibold text-(--text)">
                100% Offline & Private
              </h4>
              <p className="font-sans text-xs text-(--text-muted) leading-relaxed mt-1">
                All your financial logs stay exclusively in your device's
                browser database (IndexedDB). No clouds, no servers, no
                tracking.
              </p>
            </div>
          </div>

          {/* Zero Accounts Row */}
          <div className="glass-card p-4.5 flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
              <Database size={20} className="text-blue-500" />
            </div>
            <div>
              <h4 className="font-sans text-sm font-semibold text-(--text)">
                Zero Sign-up Friction
              </h4>
              <p className="font-sans text-xs text-(--text-muted) leading-relaxed mt-1">
                No accounts, no email addresses, no passwords, and no API keys.
                Just open the app and start managing your cash flow.
              </p>
            </div>
          </div>

          {/* Philosophy Row */}
          <div className="glass-card p-4.5 flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
              <Sparkles size={20} className="text-purple-500" />
            </div>
            <div>
              <h4 className="font-sans text-sm font-semibold text-(--text)">
                Mindful Budgeting
              </h4>
              <p className="font-sans text-xs text-(--text-muted) leading-relaxed mt-1">
                Dual wallets partition your cash cleanly: one for daily spending
                and another to protect your savings goals from impulse buys.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

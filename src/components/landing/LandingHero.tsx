import { ArrowRight, ArrowDownToLine, CheckCircle, Smartphone, Share, PlusSquare } from "lucide-react";
import { FloatingHeroCards } from "./FloatingHeroCards";

interface LandingHeroProps {
  onStart: () => void;
  deferredPrompt: any;
  handleInstallClick: () => void;
  isInstalled: boolean;
  deviceType: "android" | "ios" | "desktop";
  showIosTip: boolean;
  setShowIosTip: (show: boolean) => void;
}

export function LandingHero({
  onStart,
  deferredPrompt,
  handleInstallClick,
  isInstalled,
  deviceType,
  showIosTip,
  setShowIosTip,
}: LandingHeroProps) {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center mb-28 relative z-10 max-w-[1100px] mx-auto">
      <div className="text-left lg:col-span-7 flex flex-col items-start">
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light! font-display tracking-tight text-(--text) mb-6 leading-[1.05]">
          Track everything. <br />
          Understand your patterns. <br />
          <span className="italic font-display tracking-normal text-(--accent)">
            Spend better.
          </span>
        </h1>

        <p className="landing-body text-base sm:text-lg leading-relaxed mb-8 max-w-[500px]">
          <strong className="text-(--accent) font-display tracking-wide italic font-normal!">
            buckflo
          </strong>{" "}
          is an offline-first personal ledger that gives you total clarity
          over your spending. Two wallets, one view, zero cloud dependency.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto items-stretch sm:items-center mb-5 relative">
          <button
            onClick={onStart}
            className="btn-primary py-3.5 px-8 text-base shadow-lg shadow-(--accent)/20 flex justify-center"
            id="btn-landing-hero-start"
          >
            Launch App <ArrowRight size={16} strokeWidth={2.5} />
          </button>

          {deviceType === "android" ? (
            <a
              href="/buckflo.apk"
              download
              className="btn-secondary py-3 px-6 flex items-center justify-center gap-2 border border-black/8 dark:border-white/6 no-underline text-(--text)"
              id="btn-landing-download-apk"
            >
              <Smartphone size={16} /> Download APK
            </a>
          ) : deviceType === "ios" ? (
            <div className="relative flex flex-col items-center">
              <button
                onClick={() => setShowIosTip(!showIosTip)}
                className="btn-secondary py-3 px-6 flex items-center justify-center gap-2 border border-black/8 dark:border-white/6 w-full"
                id="btn-landing-install-ios"
              >
                <ArrowDownToLine size={16} /> Install PWA
              </button>
              {showIosTip && (
                <div className="absolute top-full mt-2 bg-[var(--bg-surface)] text-[var(--text)] border border-black/9 dark:border-white/6 font-sans text-sm rounded-[var(--r-md)] shadow-[var(--glass-shadow-lg)] p-3 w-64 z-50 animate-fade-in-up">
                  <p className="font-semibold mb-2">How to install on iOS:</p>
                  <ol className="list-decimal pl-5 space-y-1 text-xs text-(--text-muted)">
                    <li>Tap the <Share size={12} className="inline mx-1" /> Share button in your browser menu.</li>
                    <li>Scroll down and tap <strong className="text-(--text)"><PlusSquare size={12} className="inline mx-1" /> Add to Home Screen</strong>.</li>
                  </ol>
                </div>
              )}
            </div>
          ) : deferredPrompt ? (
            <button
              onClick={handleInstallClick}
              className="btn-secondary py-3 px-6 flex items-center justify-center gap-2 border border-black/8 dark:border-white/6"
              id="btn-landing-install"
            >
              <ArrowDownToLine size={16} /> Install Desktop App
            </button>
          ) : isInstalled ? (
            <div className="flex items-center justify-center gap-1.5 text-xs text-(--credit) font-semibold py-3.5 px-5 rounded-full bg-(--credit)/8 border border-(--credit)/20">
              <CheckCircle size={14} /> Installed
            </div>
          ) : null}
        </div>

        {/* Sub-line replacing the Stewardship Note */}
        <p className="text-xs text-(--text-muted) leading-relaxed">
          No account needed. Works offline. Installs on your phone.
        </p>
      </div>

      <FloatingHeroCards />
    </section>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Wallet,
  TrendingDown,
  Calendar,
  Sparkles,
  ArrowRight,
  Shield,
  ArrowDownToLine,
  CheckCircle,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { IPhoneMockup } from "../components/landing/IPhoneMockup";
import { FeatureCard } from "../components/landing/FeatureCard";
import { FAQItem } from "../components/landing/FAQItem";
import { PixelBanner } from "../components/layout/PixelBanner";

interface LandingPageProps {
  onStart: () => void;
}

export function LandingPage({ onStart }: LandingPageProps) {
  const { theme, toggleTheme } = useTheme();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone
    ) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  return (
    <div className="fade-in w-full pb-24 pt-4 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* ── Ambient Pixel Matrix Background ─────────────────────────────────── */}
      <div className="absolute top-0 left-0 right-0 h-[700px] opacity-40 dark:opacity-20 pointer-events-none select-none flex justify-center z-0">
        <div className="w-[800px] h-full max-w-[100vw] relative mask-[linear-gradient(to_bottom,black_40%,transparent_100%)]">
          <PixelBanner seed="buckflo-landing-ambient" />
        </div>
      </div>

      {/* ── Minimal Header ────────────────────────────────────────────────── */}
      <header className="flex justify-between items-center mb-16 sm:mb-24 max-w-[1100px] mx-auto relative z-10">
        <div className="flex items-center gap-1 select-none">
          <img
            src="/buckflo_favicon.png"
            alt="buckflo"
            className="w-14 object-contain rounded-full"
          />
          <span className="font-display text-3xl font-normal! text-(--accent) italic">
            buckflo
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="inline-flex items-center justify-center w-8 h-8 rounded-full text-(--text-secondary) hover:text-(--text) cursor-pointer transition-colors outline-none"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button
            onClick={onStart}
            className="btn-secondary py-2 px-5 text-sm border-black/8 dark:border-white/6"
            id="btn-landing-top-start"
          >
            Launch App
          </button>
        </div>
      </header>

      {/* ── Hero Section (Responsive Grid) ────────────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center mb-28 relative z-10 max-w-[1100px] mx-auto">
        {/* Left Column: Branding, Notice & CTAs */}
        <div className="text-left lg:col-span-7 flex flex-col items-start">
          <div className="text-xs uppercase tracking-[0.15em] text-(--accent) font-semibold mb-3">
            Designed for Pocket Screen Use
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light! font-display tracking-tight text-(--text) mb-6 leading-[1.05]">
            Your money, <br />
            flowing{" "}
            <span className="italic font-display tracking-normal text-(--accent)">
              clearly
            </span>
            .
          </h1>

          <p className="text-base sm:text-lg text-(--text-secondary) leading-relaxed mb-8 max-w-[500px]">
            <strong className="text-(--accent) font-display tracking-wide italic font-normal!">
              buckflo
            </strong>{" "}
            is a premium, offline-first personal ledger designed to separate
            daily spending from long-term savings. No cloud accounts, no
            tracking pixels, zero data sync.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto items-stretch sm:items-center mb-8">
            <button
              onClick={onStart}
              className="btn-primary py-3.5 px-8 text-base shadow-lg shadow-(--accent)/20 flex justify-center"
              id="btn-landing-hero-start"
            >
              Get Started <ArrowRight size={16} strokeWidth={2.5} />
            </button>

            {deferredPrompt ? (
              <button
                onClick={handleInstallClick}
                className="btn-secondary py-3 px-6 flex items-center justify-center gap-2 border border-black/8 dark:border-white/6"
                id="btn-landing-install"
              >
                <ArrowDownToLine size={16} /> Download PWA
              </button>
            ) : isInstalled ? (
              <div className="flex items-center justify-center gap-1.5 text-xs text-(--credit) font-semibold py-3.5 px-5 rounded-full bg-(--credit)/8 border border-(--credit)/20">
                <CheckCircle size={14} /> Installed on Home Screen
              </div>
            ) : (
              <span className="text-xs text-(--text-muted) font-medium text-center sm:text-left sm:max-w-[200px]">
                Tip: Add to Home Screen to run standalone.
              </span>
            )}
          </div>

          {/* Desktop Responsive / Device Alert Card (Minimalist Style) */}
          <div className="mt-8 text-xs text-(--text-secondary) max-w-[500px] leading-relaxed border-l-2 border-(--accent)/30 pl-4 py-0.5">
            <strong className="text-(--text) font-semibold block mb-0.5">
              Stewardship Note:
            </strong>
            buckflo is custom-tailored for mobile dimensions to act as a
            distraction-free digital companion. While fully operational on
            desktop, we recommend resizing your window or installing it as a PWA
            for the best mobile experience.
          </div>
        </div>

        {/* Right Column: Mockup Mobile Phone View */}
        <IPhoneMockup />
      </section>

      {/* ── Key Smart Features Section (Apple-style Grid layout) ───────────────── */}
      <section className="mb-24 relative overflow-hidden py-24 border-t border-black/8 dark:border-white/6 max-w-[1100px] mx-auto">
        <div className="absolute -top-25 left-1/2 -translate-x-1/2 w-[1200px] h-[800px] opacity-100 dark:opacity-100 pointer-events-none select-none z-0 mask-[radial-gradient(ellipse_at_center,black_10%,transparent_60%)]">
          <PixelBanner seed="features-matrix-core" />
        </div>

        <div className="relative z-10">
          <div className="text-center mb-16">
            <div className="text-xs uppercase tracking-[0.15em] text-(--text-muted) font-semibold mb-3">
              Engineered for Clarity
            </div>
            <h3 className="text-3xl sm:text-4xl font-bold tracking-tight text-(--text) font-display">
              Advanced Analytical Features
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-t border-l border-black/8 dark:border-white/6 mx-auto max-w-[1100px]">
            <FeatureCard
              icon={<Wallet size={16} className="text-(--accent)" />}
              title="Two Accounts, One View"
              desc="Keep a separate Spending wallet for daily burns and a Savings wallet for goals. buckflo updates balances transactionally."
              borderClasses="border-r border-b border-black/8 dark:border-white/6"
            />
            <FeatureCard
              icon={<TrendingDown size={16} className="text-(--debit)" />}
              title="Burn Rate & Projections"
              desc="Predicts budget exhaustion days and calculates dynamic daily limits based on month-to-date spending velocity."
              borderClasses="border-r border-b border-black/8 dark:border-white/6"
            />
            <FeatureCard
              icon={<Sparkles size={16} className="text-(--accent)" />}
              title="Auto-Preset Logger"
              desc="Learns your repetitive expenses (like coffee or fares) and populates one-tap buttons on your home feed to log in under a second."
              borderClasses="border-r border-b border-black/8 dark:border-white/6 md:border-r-0 lg:border-r"
            />
            <FeatureCard
              icon={<Calendar size={16} className="text-(--credit)" />}
              title="Automatic Subscription Scan"
              desc="Scans database logs to auto-detect monthly subscriptions, alerting you 7 days before recurring payments are due."
              borderClasses="border-r border-b border-black/8 dark:border-white/6 lg:border-r"
            />

            {/* Allocation Advisor - Spans 2 columns on medium & large layouts */}
            <div className="md:col-span-2 lg:col-span-2 p-8 border-r border-b border-black/8 dark:border-white/6 flex flex-col md:flex-row gap-8 items-start md:items-center justify-between hover:bg-neutral-500/2 dark:hover:bg-neutral-500/1 transition-colors duration-300">
              <div className="max-w-[420px] text-left">
                <div className="w-8 h-8 rounded-lg bg-neutral-200/50 dark:bg-neutral-800/30 flex items-center justify-center mb-4 shrink-0">
                  <Shield size={16} className="text-[#9b5de5]" />
                </div>
                <h4 className="text-base font-bold text-(--text) mb-2 tracking-tight">
                  Smart Surplus Allocation Advisor
                </h4>
                <p className="text-[12px] text-(--text-secondary) leading-relaxed">
                  Evaluates average spend and detects idle cash. Advisor
                  recommends how much surplus you can safely move to your
                  savings to optimize interest and goal planning.
                </p>
              </div>

              {/* Advisor Mini Mock Interface */}
              <div className="w-full md:w-auto shrink-0 bg-black/4 dark:bg-white/4 border border-black/5 dark:border-white/5 rounded-xl p-3.5 text-xs flex flex-col gap-2 max-w-[240px] shadow-2xs text-left">
                <div className="flex items-center gap-1.5 text-[#9b5de5] font-bold text-[9px] uppercase tracking-wider">
                  <span>💡 Advisor Recommendation</span>
                </div>
                <p className="text-[10px] text-(--text-secondary) m-0 leading-normal">
                  You have a safe surplus of{" "}
                  <strong className="text-(--text)">₹4,200</strong>. Sweep into
                  Savings?
                </p>
                <div className="flex justify-end mt-1">
                  <button className="py-1 px-3 rounded-full bg-[#9b5de5] text-white font-bold text-[9px] border-0 hover:opacity-90 active:scale-95 transition-all">
                    Move Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Metrics & Performance (NEW SECTION) ───────────────────────────── */}
      <section className="py-24 border-t border-black/8 dark:border-white/6 max-w-[1100px] mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 text-center sm:text-left">
          <div>
            <div className="font-display text-5xl text-(--accent) font-light mb-2">
              0ms
            </div>
            <div className="text-xs uppercase tracking-wider text-(--text-muted) font-semibold">
              Server Latency
            </div>
            <p className="text-[11px] text-(--text-secondary) mt-2 leading-relaxed">
              All transactions load instantaneously because your database lives
              on your physical chip, not in the cloud.
            </p>
          </div>
          <div className="border-t sm:border-t-0 sm:border-l border-black/8 dark:border-white/6 pt-8 sm:pt-0 sm:pl-8">
            <div className="font-display text-5xl text-(--credit) font-light mb-2">
              100%
            </div>
            <div className="text-xs uppercase tracking-wider text-(--text-muted) font-semibold">
              Data Ownership
            </div>
            <p className="text-[11px] text-(--text-secondary) mt-2 leading-relaxed">
              No tracking codes, advertising pixels, or cloud storage. Your data
              remains solely yours, stored in browser IndexedDB.
            </p>
          </div>
          <div className="border-t sm:border-t-0 sm:border-l border-black/8 dark:border-white/6 pt-8 sm:pt-0 sm:pl-8">
            <div className="font-display text-5xl text-[#9b5de5] font-light mb-2">
              1-Tap
            </div>
            <div className="text-xs uppercase tracking-wider text-(--text-muted) font-semibold">
              Preset Logging
            </div>
            <p className="text-[11px] text-(--text-secondary) mt-2 leading-relaxed">
              The smart analytical engine automatically maps your frequent
              expenses, creating quick presets for swift logs.
            </p>
          </div>
        </div>
      </section>

      {/* ── Security & Privacy Section (Simplified/Minimalist Row) ───────────── */}
      <section className="py-24 border-t border-black/8 dark:border-white/6 text-left max-w-[1100px] mx-auto flex flex-col md:flex-row gap-8 items-start">
        <div className="w-12 h-12 rounded-2xl bg-(--accent)/10 flex items-center justify-center shrink-0">
          <Shield size={22} className="text-(--accent)" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-(--text) mb-3 tracking-tight">
            100% Offline, Secure, & Private
          </h3>
          <p className="text-sm text-(--text-secondary) leading-relaxed">
            buckflo relies strictly on browser-native IndexedDB databases. No
            remote data syncing, no tracking pixels, and no analytics
            collection. Your financial profile never leaves your physical
            device.
          </p>
        </div>
      </section>

      {/* ── FAQ Section (NEW SECTION) ────────────────────────────────────── */}
      <section className="py-24 border-t border-black/8 dark:border-white/6 max-w-[1100px] mx-auto text-left relative overflow-hidden">
        <div className="absolute -top-25 left-1/2 -translate-x-1/2 w-full h-[150%] opacity-100 dark:opacity-100 pointer-events-none select-none z-0 mask-[radial-gradient(ellipse_at_center,black_10%,transparent_60%)]">
          <PixelBanner seed="faq-answers-pixels" />
        </div>

        <div className="relative z-10">
          <div className="text-center mb-16">
            <div className="text-xs uppercase tracking-[0.15em] text-(--text-muted) font-semibold mb-3">
              Common Enquiries
            </div>
            <h3 className="text-3xl font-bold tracking-tight text-(--text) font-display">
              Frequently Asked Questions
            </h3>
          </div>

          <div className="flex flex-col border-t border-black/8 dark:border-white/6">
            <FAQItem
              q="How does buckflo store my data without a server?"
              a="buckflo uses IndexedDB, a powerful browser-native database. All your accounts, balances, goals, and transactions are stored directly on your phone or computer. The application does not have a backend server, meaning your private financial transactions cannot be leaked or tracked."
            />
            <FAQItem
              q="Can I access my ledger on multiple devices?"
              a="Because buckflo prioritizes absolute privacy and data stewardship, there is no automatic cloud syncing. Your ledger is stored locally on each device. To back up your history or review it elsewhere, you can export your transactions to a CSV file from the monthly and savings pages."
            />
            <FAQItem
              q="How do I install the app on my phone?"
              a="On iOS, open the link in Safari, tap the 'Share' icon, and select 'Add to Home Screen'. On Android, open the link in Chrome and click the 'Download PWA' button or select 'Install App' from the browser menu. Once added, it runs as a native standalone application."
            />
            <FAQItem
              q="Is the ledger free to use?"
              a="Yes, buckflo is 100% free, open, and client-side software. Since we do not host servers, run databases, or collect advertising metrics, our operational costs are non-existent, letting us distribute this premium finance ledger freely."
            />
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="text-center border-t border-black/6 dark:border-white/6 pt-8 flex flex-col items-center gap-3 max-w-[1100px] mx-auto">
        <div className="flex gap-4 text-xs font-semibold text-(--text-muted)">
          <Link
            to="/privacy"
            className="hover:text-(--text) transition-colors no-underline"
          >
            Privacy Policy
          </Link>
          <span>·</span>
          <Link
            to="/terms"
            className="hover:text-(--text) transition-colors no-underline"
          >
            Terms & Conditions
          </Link>
        </div>
        <p className="text-[10px] text-(--text-muted) m-0">
          &copy; {new Date().getFullYear()} buckflo. All rights reserved.
          Locally persisted client software.
        </p>
      </footer>
    </div>
  );
}

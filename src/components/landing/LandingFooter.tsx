import { Shield } from "lucide-react";
import { FAQItem } from "./FAQItem";
import { PixelBanner } from "../layout/PixelBanner";
import { Link } from "react-router-dom";

interface LandingFooterProps {
  onStart?: () => void;
}

export function LandingFooter({ onStart }: LandingFooterProps = {}) {
  return (
    <>
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
              Frequent expenses become one-tap shortcuts automatically.
            </p>
          </div>
        </div>
      </section>

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
              a="Because buckflo prioritizes absolute privacy and data stewardship, there is no automatic cloud syncing. Your ledger is stored locally on each device. To back up your history or review it elsewhere, you can export your transactions to a CSV file from the profile page."
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

      <section className="py-24 border-t border-black/8 dark:border-white/6 text-center max-w-[1100px] mx-auto flex flex-col items-center justify-center">
        <h3 className="text-3xl font-bold tracking-tight text-(--text) font-display pb-4">
          Ready to track smarter?
        </h3>
        <button
          onClick={onStart}
          className="btn-primary py-3.5 px-8 text-base shadow-lg shadow-(--accent)/20 cursor-pointer"
        >
          Launch App
        </button>
      </section>

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
    </>
  );
}

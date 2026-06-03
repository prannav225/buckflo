import {
  Wallet,
  TrendingDown,
  Sparkles,
  Calendar,
  Search,
  Lightbulb,
} from "lucide-react";
import { FeatureCard } from "./FeatureCard";
import { PixelBanner } from "../layout/PixelBanner";

export function LandingFeatures() {
  return (
    <section className="mb-24 relative overflow-hidden py-24 border-t border-black/8 dark:border-white/6 max-w-[1100px] mx-auto">
      {/* Top-right offset pixel accent — standardized to 1200x400 for consistent pixel sizing */}
      <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-[1200px] h-[400px] opacity-25 dark:opacity-15 pointer-events-none select-none z-0 mask-[radial-gradient(circle_at_center,black_10%,transparent_60%)]">
        <PixelBanner seed="features-accent" />
      </div>

      <div className="relative z-10">
        <div className="text-center mb-16">
          <div className="landing-eyebrow mb-3">What You Get</div>
          <h3 className="landing-headline">
            Built for the way you actually spend.
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-t border-l border-black/8 dark:border-white/6 mx-auto max-w-[1100px]">
          <FeatureCard
            icon={<Wallet size={16} className="text-(--accent)" />}
            title="Two Wallets, One View"
            desc="Spending money and savings live in separate mental buckets. buckflo makes that real — your daily spending wallet shows only what you can actually use today, so your savings stay untouched and invisible when you're making decisions."
            borderClasses="border-r border-b border-black/8 dark:border-white/6"
          />
          <FeatureCard
            icon={<TrendingDown size={16} className="text-(--debit)" />}
            title="Burn Rate & Velocity"
            desc="It's the 22nd and you've already spent 80% of your budget. buckflo tells you this — and projects the exact day you'll run out if you keep spending at this pace."
            borderClasses="border-r border-b border-black/8 dark:border-white/6"
          />
          <FeatureCard
            icon={<Sparkles size={16} className="text-(--accent)" />}
            title="Auto-Preset Logger"
            desc="You buy coffee every morning for ₹80. After a few logs, buckflo creates a one-tap shortcut so 'Coffee ₹80' is always right there on your home screen. No typing, no searching."
            borderClasses="border-r border-b border-black/8 dark:border-white/6 md:border-r-0 lg:border-r"
          />
          <FeatureCard
            icon={<Calendar size={16} className="text-(--credit)" />}
            title="Monthly Carryover"
            desc="First of the month. Your income is set, your bills are deducted, and your spending wallet shows exactly what's left. buckflo does this automatically — you just open the app and start fresh."
            borderClasses="border-r border-b border-black/8 dark:border-white/6 lg:border-r"
          />

          {/* Pattern Recognition — wide card with insight mock */}
          <div className="md:col-span-2 lg:col-span-2 p-8 border-r border-b border-black/8 dark:border-white/6 flex flex-col md:flex-row gap-8 items-center justify-between hover:bg-neutral-500/2 dark:hover:bg-neutral-500/1 transition-colors duration-300">
            {/* Insight Mock Interface */}
            <div className="w-full md:flex-1 shrink-0 bg-black/4 dark:bg-white/4 border border-black/5 dark:border-white/5 rounded-2xl p-6 text-sm flex flex-col gap-3 shadow-lg shadow-black/5 dark:shadow-white/5 text-left transform md:scale-105 transition-transform hover:scale-110 duration-500">
              <div className="flex items-center gap-2 text-[#9b5de5] font-bold text-[11px] uppercase tracking-wider">
                <Lightbulb size={12} />
                <span>Insight</span>
              </div>
              <p className="text-sm text-(--text-secondary) m-0 leading-relaxed">
                You typically spend{" "}
                <strong className="text-(--text) text-base">₹4,200</strong> on
                dining by this time of the month.
              </p>
            </div>

            <div className="w-full md:w-[280px] shrink-0 text-left">
              <div className="w-8 h-8 rounded-lg bg-neutral-200/50 dark:bg-neutral-800/30 flex items-center justify-center mb-4 shrink-0">
                <Search size={16} className="text-[#9b5de5]" />
              </div>
              <h4 className="text-base font-bold text-(--text) mb-2 tracking-tight">
                Pattern Recognition
              </h4>
              <p className="text-[12px] text-(--text-secondary) leading-relaxed">
                You typically spend ₹4,200 on dining by this time of the month.
                buckflo surfaces this without you asking — not to judge, just so
                you know.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

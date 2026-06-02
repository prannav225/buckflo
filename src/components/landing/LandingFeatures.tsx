import { Wallet, TrendingDown, Sparkles, Calendar, Search } from "lucide-react";
import { FeatureCard } from "./FeatureCard";
import { PixelBanner } from "../layout/PixelBanner";

export function LandingFeatures() {
  return (
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
            title="Two Wallets, One View"
            desc="Use your Spending Wallet for everyday expenses, and optionally track your Savings Wallet. Complete visibility without judgment."
            borderClasses="border-r border-b border-black/8 dark:border-white/6"
          />
          <FeatureCard
            icon={<TrendingDown size={16} className="text-(--debit)" />}
            title="Burn Rate & Velocity"
            desc="Understand your spending patterns. See daily averages and track how fast your monthly budget is being utilized."
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
            title="Monthly Carryover"
            desc="Start each month fresh or carry over your remaining balances automatically. Setup is guided and simple."
            borderClasses="border-r border-b border-black/8 dark:border-white/6 lg:border-r"
          />

          {/* Pattern Recognition - Replaces Advisor to align with PRD v2.0 */}
          <div className="md:col-span-2 lg:col-span-2 p-8 border-r border-b border-black/8 dark:border-white/6 flex flex-col md:flex-row gap-8 items-center justify-between hover:bg-neutral-500/2 dark:hover:bg-neutral-500/1 transition-colors duration-300">
            {/* Insight Mock Interface - Now the Hero */}
            <div className="w-full md:flex-1 shrink-0 bg-black/4 dark:bg-white/4 border border-black/5 dark:border-white/5 rounded-2xl p-6 text-sm flex flex-col gap-3 shadow-lg shadow-black/5 dark:shadow-white/5 text-left transform md:scale-105 transition-transform hover:scale-110 duration-500">
              <div className="flex items-center gap-2 text-[#9b5de5] font-bold text-[11px] uppercase tracking-wider">
                <span>💡 Insight</span>
              </div>
              <p className="text-sm text-(--text-secondary) m-0 leading-relaxed">
                You typically spend <strong className="text-(--text) text-base">₹4,200</strong> on
                dining by this time of the month.
              </p>
            </div>

            <div className="w-full md:w-[280px] shrink-0 text-left">
              <div className="w-8 h-8 rounded-lg bg-neutral-200/50 dark:bg-neutral-800/30 flex items-center justify-center mb-4 shrink-0">
                <Search size={16} className="text-[#9b5de5]" />
              </div>
              <h4 className="text-base font-bold text-(--text) mb-2 tracking-tight">
                Pattern Recognition Insights
              </h4>
              <p className="text-[12px] text-(--text-secondary) leading-relaxed">
                Buckflo quietly analyzes your transaction logs to surface
                meaningful patterns. Without lecturing you on what to save, it
                highlights recurring costs and average spends so you can make
                informed decisions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import { memo } from "react";
import { Flame, TrendingUp } from "lucide-react";
import { PixelBanner } from "../layout/PixelBanner";

/* ─── Mini UI Snippets ──────────────────────────────────────────────────────── */

/** Step 1 — Income wizard showing committed expenses being deducted */
const IncomeWizardSnippet = memo(function IncomeWizardSnippet() {
  return (
    <div className="snippet-card text-left space-y-4">
      <div>
        <div className="text-[9px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--accent)" }}>
          Month Setup
        </div>
        <h4 className="text-xs font-bold" style={{ color: "var(--text)" }}>June 2026</h4>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-[9px] font-semibold uppercase tracking-wider mb-1 block" style={{ color: "var(--text-muted)" }}>
            Starting Balance (₹)
          </label>
          <div className="rounded-lg py-2 px-3 text-xs font-semibold flex justify-between items-center transition-all select-none" style={{ background: "var(--bg-glass-strong)", border: "1px solid var(--border)" }}>
            <span style={{ color: "var(--text)" }}>45,000</span>
            <span className="text-[9px] font-normal" style={{ color: "var(--text-muted)" }}>Auto-carried</span>
          </div>
        </div>

        <div>
          <label className="text-[9px] font-semibold uppercase tracking-wider mb-1 block" style={{ color: "var(--text-muted)" }}>
            Monthly Budget (₹)
          </label>
          <div className="rounded-lg py-2 px-3 text-xs font-semibold transition-all select-none" style={{ background: "var(--bg-glass-strong)", border: "1.5px solid var(--accent)", boxShadow: "0 0 0 3px rgba(217, 119, 87, 0.14)" }}>
            <span style={{ color: "var(--text)" }}>30,000</span>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t flex justify-between items-center" style={{ borderColor: "var(--border)" }}>
        <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Daily Limit</span>
        <span className="text-xs font-bold" style={{ color: "var(--accent)" }}>₹1,000/day</span>
      </div>
    </div>
  );
});

/** Step 2 — Add Entry form with preset chips */
const AddEntrySnippet = memo(function AddEntrySnippet() {
  return (
    <div className="snippet-card text-left space-y-4 relative bg-black/5 dark:bg-white/5 rounded-[var(--r-2xl)] p-5 border border-black/5 dark:border-white/5 shadow-inner">
      {/* Mini TransactionAmountCard */}
      <div className="hero-card hero-card-orange cursor-default">
        <div className="hero-card-orb-lg" style={{ top: -60, right: -40, width: 140, height: 140 }} />
        <div className="hero-card-orb-sm" />
        <div className="flex items-center justify-between mb-2 relative z-10">
          <span className="font-sans text-[0.6875rem] font-semibold text-[rgba(255,255,255,0.65)] tracking-[0.08em] uppercase">
            Amount
          </span>
          <span className="font-sans text-[0.6875rem] text-[rgba(255,255,255,0.50)] tracking-wider">
            Tap to edit
          </span>
        </div>
        <div className="amount-display flex items-baseline text-white relative z-10">
          <span
            className="text-[2.25rem] mr-1.5 font-medium opacity-85 leading-none"
            style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
          >
            ₹
          </span>
          <span
            className="text-[3rem] leading-none"
            style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
          >
            80
          </span>
        </div>
      </div>

      {/* Preset chips matching actual app design */}
      <div className="space-y-2">
        <div className="text-[0.6875rem] font-semibold uppercase tracking-wider text-(--text-muted)">
          Quick Presets
        </div>
        <div className="flex flex-wrap gap-2 pt-1 select-none">
          <div className="chip chip-active py-2 px-4 text-[0.8125rem] flex items-center gap-1.5">
            <span>Coffee</span>
            <span className="opacity-70 font-semibold">₹80</span>
          </div>
          <div className="chip py-2 px-4 text-[0.8125rem] flex items-center gap-1.5 opacity-70">
            <span>Metro</span>
            <span className="opacity-50 font-semibold">₹30</span>
          </div>
          <div className="chip py-2 px-4 text-[0.8125rem] flex items-center gap-1.5 opacity-70">
            <span>Lunch</span>
            <span className="opacity-50 font-semibold">₹150</span>
          </div>
        </div>
      </div>
    </div>
  );
});

/** Step 3 — Insights snippet with burn rate + pattern */
const InsightsSnippet = memo(function InsightsSnippet() {
  return (
    <div className="snippet-card text-left space-y-3.5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "rgba(224, 85, 69, 0.15)", color: "var(--debit)" }}>
          <Flame size={12} strokeWidth={2.5} />
        </div>
        <div>
          <h4 className="text-[10px] font-bold uppercase tracking-wider m-0" style={{ color: "var(--text)" }}>
            Burn Velocity
          </h4>
          <span className="text-[8px] font-medium" style={{ color: "var(--text-muted)" }}>
            Pacing over budget limits
          </span>
        </div>
      </div>

      {/* Metrics */}
      <div className="flex justify-between items-end">
        <div className="flex flex-col">
          <span className="text-[9px] font-medium" style={{ color: "var(--text-secondary)" }}>
            Projected EOM Spend
          </span>
          <span className="font-display text-lg leading-none" style={{ color: "var(--debit)" }}>
            ₹30,600
          </span>
        </div>
        <div className="text-right">
          <span className="text-[8px] font-medium block" style={{ color: "var(--text-muted)" }}>
            Monthly Budget
          </span>
          <span className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
            ₹30,000
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="h-1.5 rounded-full overflow-hidden w-full flex" style={{ background: "var(--border)" }}>
          <div className="h-full rounded-full" style={{ width: "100%", background: "var(--debit)" }} />
        </div>
        <div className="text-[8px] flex justify-between" style={{ color: "var(--text-muted)" }}>
          <span>102% projected</span>
          <span>Day 22 of 30</span>
        </div>
      </div>

      {/* Narrative Analysis */}
      <div className="p-2.5 rounded-xl border flex gap-2 items-start" style={{ background: "var(--bg-glass-strong)", borderColor: "var(--border)" }}>
        <TrendingUp size={12} style={{ color: "var(--debit)", flexShrink: 0, marginTop: "1px" }} />
        <p className="text-[9px] leading-relaxed m-0" style={{ color: "var(--text-secondary)" }}>
          You are projected to exceed your budget. At this rate, funds will run out by <strong style={{ color: "var(--debit)" }}>Day 29</strong>.
        </p>
      </div>
    </div>
  );
});

/* ─── Main Component ────────────────────────────────────────────────────────── */

const steps = [
  {
    number: "01",
    title: "Set up your month",
    description:
      "Tell buckflo your income and what's already committed — rent, bills, subscriptions. It calculates exactly what's left to spend.",
    snippet: <IncomeWizardSnippet />,
  },
  {
    number: "02",
    title: "Log as you go",
    description:
      "Tap + and log an expense in 5 seconds. Quick Presets auto-detect your habits so Coffee ₹80 is always one tap away.",
    snippet: <AddEntrySnippet />,
  },
  {
    number: "03",
    title: "Understand your patterns",
    description:
      "buckflo tracks your daily burn rate, flags budget breaches, and tells you what's recurring — without you asking.",
    snippet: <InsightsSnippet />,
  },
];

export function LandingHowItWorks() {
  return (
    <section
      className="py-24 border-t border-black/8 dark:border-white/6 max-w-[1100px] mx-auto relative overflow-hidden"
      id="section-how-it-works"
    >
      {/* Off-center bottom-left pixel accent — standardized to 1200x400 for consistent pixel sizing */}
      <div className="absolute bottom-[-150px] left-[-300px] w-[1200px] h-[400px] -rotate-[10deg] opacity-35 dark:opacity-18 pointer-events-none select-none z-0 mask-[radial-gradient(ellipse_at_center,black_20%,transparent_70%)]">
        <PixelBanner seed="how-it-works-accent" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="landing-eyebrow mb-3">Simple by Design</div>
          <h2 className="landing-headline">Up and running in 3 minutes.</h2>
        </div>

        {/* Steps grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
          {steps.map((step) => (
            <div key={step.number} className="flex flex-col">
              {/* Step number */}
              <div className="step-number mb-3">{step.number}</div>

              {/* Title */}
              <h3 className="text-lg font-bold tracking-tight mb-2" style={{ color: "var(--text)" }}>
                {step.title}
              </h3>

              {/* Description */}
              <p className="landing-body text-sm mb-6">{step.description}</p>

              {/* UI snippet */}
              {step.snippet}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

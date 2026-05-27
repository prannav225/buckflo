import { memo } from "react";
import {
  Sun,
  Bell,
  PiggyBank,
  ChevronRight,
  Home,
  Calendar,
  BarChart2,
  Plus,
} from "lucide-react";

export const IPhoneMockup = memo(function IPhoneMockup() {
  return (
    <div className="hidden lg:flex justify-center items-center lg:col-span-5 relative">
      {/* Glowing backdrops behind mockup */}
      <div className="absolute -top-10 -left-10 w-72 h-72 bg-(--accent)/18 dark:bg-(--accent)/24 rounded-full blur-3xl opacity-70 pointer-events-none mix-blend-screen" />
      <div className="absolute -bottom-10 -right-10 w-72 h-72 bg-(--credit)/12 dark:bg-(--credit)/18 rounded-full blur-3xl opacity-70 pointer-events-none mix-blend-screen" />

      {/* Phone Frame */}
      <div className="relative w-[310px] h-[620px] rounded-[52px] border-[12px] border-neutral-900 dark:border-neutral-800 bg-(--bg) shadow-[0_24px_60px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_28px_70px_-15px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden select-none transition-transform duration-500 hover:scale-[1.02] hover:-rotate-1 z-10">
        {/* Physical Buttons */}
        <div className="absolute -left-[14px] top-[95px] w-[2px] h-[16px] bg-neutral-600 dark:bg-neutral-700 rounded-l-md" />{" "}
        {/* Silent Switch */}
        <div className="absolute -left-[14px] top-[130px] w-[2px] h-[30px] bg-neutral-600 dark:bg-neutral-700 rounded-l-md" />{" "}
        {/* Volume Up */}
        <div className="absolute -left-[14px] top-[175px] w-[2px] h-[30px] bg-neutral-600 dark:bg-neutral-700 rounded-l-md" />{" "}
        {/* Volume Down */}
        <div className="absolute -right-[14px] top-[150px] w-[2px] h-[45px] bg-neutral-600 dark:bg-neutral-700 rounded-r-md" />{" "}
        {/* Power Button */}
        {/* Screen Bezel Ring */}
        <div className="absolute inset-0 rounded-[40px] border border-black/40 dark:border-white/5 pointer-events-none z-30" />
        {/* Screen Notch (Dynamic Island) */}
        <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-[100px] h-[26px] bg-black rounded-full z-40 flex items-center justify-between px-3 border border-neutral-900 shadow-inner">
          <div className="w-2.5 h-2.5 rounded-full bg-radial-gradient from-blue-900/60 to-neutral-950 border border-neutral-800/50 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500/20" />
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-neutral-950 flex items-center justify-center">
            <div className="w-0.5 h-0.5 rounded-full bg-neutral-900" />
          </div>
        </div>
        {/* Screen Glass Reflection Layer */}
        <div className="absolute inset-0 bg-linear-to-tr from-transparent via-white/3 to-white/8 pointer-events-none z-35" />
        {/* Home Indicator */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-32 h-1 bg-black dark:bg-white opacity-35 rounded-full z-50 pointer-events-none" />
        {/* Screen Content */}
        <div className="flex-1 flex flex-col pt-9 px-4 pb-4 overflow-hidden text-xs">
          {/* Mock Status Bar */}
          <div className="flex justify-between items-center text-[9px] text-(--text-muted) px-2 mb-3.5 font-semibold">
            <span>9:41</span>
            <div className="flex items-center gap-1.5">
              {/* Signal bars */}
              <div className="flex items-end gap-0.5 h-2">
                <div className="w-0.5 h-0.5 bg-(--text-muted) rounded-2xs" />
                <div className="w-0.5 h-1 bg-(--text-muted) rounded-2xs" />
                <div className="w-0.5 h-1.5 bg-(--text-muted) rounded-2xs" />
                <div className="w-0.5 h-2 bg-(--text) rounded-2xs" />
              </div>
              <span>5G</span>
              {/* Battery icon */}
              <div className="w-5 h-2.5 rounded-sm border border-(--text-muted) p-0.5 flex items-center relative">
                <div className="w-[85%] h-full bg-(--text) rounded-2xs" />
                <div className="w-[1.5px] h-1 bg-(--text-muted) absolute -right-[2.5px] top-1/2 -translate-y-1/2 rounded-r-2xs" />
              </div>
            </div>
          </div>

          {/* Mock Header */}
          <div className="flex justify-between items-center mb-3 px-1">
            <div className="inline-flex items-center justify-center bg-(--bg-glass-strong) border border-black/8 dark:border-white/6 rounded-full px-3 py-1 shadow-sm">
              <span className="font-display text-base text-(--accent) tracking-wider italic leading-none font-bold">
                flo
              </span>
            </div>
            <div className="inline-flex items-center bg-(--bg-glass-strong) border border-black/8 dark:border-white/6 rounded-full p-0.5 shadow-sm gap-1">
              <div className="w-5.5 h-5.5 rounded-full flex items-center justify-center text-(--text-secondary)">
                <Sun size={11} />
              </div>
              <div className="w-px h-3 bg-(--border)" />
              <div className="w-5.5 h-5.5 rounded-full flex items-center justify-center text-(--text-secondary) relative">
                <span className="absolute top-1.5 right-1.5 w-1 h-1 bg-(--debit) rounded-full" />
                <Bell size={11} />
              </div>
            </div>
          </div>

          {/* Mock Hero Expenditure Card */}
          <div className="hero-card hero-card-orange text-white p-4 mb-3.5 rounded-2xl flex flex-col gap-2.5 relative overflow-hidden text-left shadow-md">
            <div className="hero-card-orb-lg" />
            <div>
              <span className="text-[8px] opacity-75 uppercase tracking-wider font-semibold block">
                Expenditure Balance
              </span>
              <span className="amount-display text-2xl font-normal leading-none mt-1 block">
                ₹12,450.00
              </span>
            </div>
            <div className="relative z-10 flex flex-col gap-1">
              <div className="flex justify-between text-[8px] opacity-90">
                <span>Monthly Budget Used</span>
                <span>64% Spent</span>
              </div>
              <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full w-[64%]" />
              </div>
            </div>
            <div className="relative z-10 flex justify-between items-center pt-1.5 mt-1 border-t border-white/10 text-[8px]">
              <div>
                <span className="opacity-75 block">Daily budget left</span>
                <strong className="font-bold text-[9px]">₹830 / day</strong>
              </div>
              <button className="py-0.5 px-3 rounded-full bg-white text-(--accent-dark) font-bold scale-90 shadow-sm border-0 active:scale-95 transition-transform">
                Top Up
              </button>
            </div>
          </div>

          {/* Mock Savings Card (Quick Card) */}
          <div className="glass-card p-3 mb-3.5 border border-black/8 dark:border-white/6 rounded-xl flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[rgba(90,158,111,0.13)] flex items-center justify-center">
                <PiggyBank size={15} className="text-(--credit)" />
              </div>
              <div className="text-left">
                <div className="font-sans text-[10px] text-(--text-muted) font-medium mb-0.5 leading-none">
                  Savings Account
                </div>
                <div className="amount-display text-base text-(--credit) tracking-tight leading-none mt-0.5">
                  ₹48,000.00
                </div>
              </div>
            </div>
            <ChevronRight size={14} className="text-(--text-muted)" />
          </div>

          {/* Mock Quick Presets */}
          <div className="mb-4 text-left">
            <span className="text-[8px] font-semibold text-(--text-muted) uppercase tracking-wider px-1 block mb-1.5">
              Quick Presets
            </span>
            <div className="flex gap-1.5 overflow-hidden">
              <div className="shrink-0 py-2 px-3 rounded-xl bg-(--bg-glass-strong) border border-white/8 dark:border-black/8 flex flex-col items-start gap-0.5 min-w-[76px] shadow-xs">
                <span className="font-semibold text-[8px] text-(--text) truncate w-full">
                  Coffee
                </span>
                <span className="text-[8px] font-bold text-(--accent)">
                  ₹80.00
                </span>
              </div>
              <div className="shrink-0 py-2 px-3 rounded-xl bg-(--bg-glass-strong) border border-white/8 dark:border-black/8 flex flex-col items-start gap-0.5 min-w-[76px] shadow-xs">
                <span className="font-semibold text-[8px] text-(--text) truncate w-full">
                  Metro
                </span>
                <span className="text-[8px] font-bold text-(--accent)">
                  ₹40.00
                </span>
              </div>
              <div className="shrink-0 py-2 px-3 rounded-xl bg-(--bg-glass-strong) border border-white/8 dark:border-black/8 flex flex-col items-start gap-0.5 min-w-[76px] shadow-xs">
                <span className="font-semibold text-[8px] text-(--text) truncate w-full">
                  Lunch
                </span>
                <span className="text-[8px] font-bold text-(--accent)">
                  ₹220.00
                </span>
              </div>
            </div>
          </div>

          {/* Mock Recent Activity */}
          <div className="flex-1 flex flex-col min-h-0 text-left">
            <div className="flex justify-between items-center mb-2 px-1">
              <span className="text-[8px] font-semibold text-(--text-muted) uppercase tracking-wider">
                Recent Activity
              </span>
              <span className="text-[8px] text-(--accent) font-semibold flex items-center gap-0.5">
                See all <ChevronRight size={10} />
              </span>
            </div>
            <div className="flex flex-col gap-1.5 overflow-hidden">
              {/* Starbucks Debit Transaction */}
              <div className="p-2 rounded-xl bg-(--bg-glass-strong) border border-black/8 dark:border-white/6 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-neutral-200/50 dark:bg-neutral-800/50 flex items-center justify-center text-xs">
                    ☕
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-[9px] text-(--text) leading-tight">
                      Starbucks
                    </span>
                    <span className="text-[7px] text-(--text-secondary) leading-none mt-0.5">
                      Expenditure
                    </span>
                  </div>
                </div>
                <span className="font-bold text-(--text) text-[9px]">{`-₹80.00`}</span>
              </div>

              {/* Dividend Credit Transaction */}
              <div className="p-2 rounded-xl bg-(--bg-glass-strong) border border-black/8 dark:border-white/6 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-neutral-200/50 dark:bg-neutral-800/50 flex items-center justify-center text-xs">
                    💼
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-[9px] text-(--text) leading-tight">
                      Dividend
                    </span>
                    <span className="text-[7px] text-(--text-secondary) leading-none mt-0.5">
                      Savings
                    </span>
                  </div>
                </div>
                <span className="font-bold text-(--credit) text-[9px]">{`+₹1,200.00`}</span>
              </div>
            </div>
          </div>

          {/* Mock Navigation Tabs Symmetrical Pill */}
          <div className="flex flex-col justify-start items-center pt-1.5 pb-5 mt-auto -mx-4 px-4 bg-transparent">
            <div className="flex items-center gap-0.5 p-[5px_7px] bg-(--bg-glass-strong) border border-black/8 dark:border-white/6 rounded-full shadow-sm scale-[0.95]">
              <div className="flex flex-col items-center gap-0.5 p-[4px_8px] rounded-full text-(--accent) bg-(--accent)/10 leading-none">
                <Home size={11} strokeWidth={2.2} />
                <span className="text-[6px] font-bold">Home</span>
              </div>
              <div className="flex flex-col items-center gap-0.5 p-[4px_8px] rounded-full text-(--text-muted) leading-none">
                <Calendar size={11} strokeWidth={2} />
                <span className="text-[6px] font-semibold">Monthly</span>
              </div>
              <div className="flex items-center justify-center text-white w-5.5 h-5.5 rounded-full bg-(--accent) shadow-sm leading-none shrink-0 mx-1">
                <Plus size={12} strokeWidth={3} />
              </div>
              <div className="flex flex-col items-center gap-0.5 p-[4px_8px] rounded-full text-(--text-muted) leading-none">
                <BarChart2 size={11} strokeWidth={2} />
                <span className="text-[6px] font-semibold">Insights</span>
              </div>
              <div className="flex flex-col items-center gap-0.5 p-[4px_8px] rounded-full text-(--text-muted) leading-none">
                <PiggyBank size={11} strokeWidth={2} />
                <span className="text-[6px] font-semibold">Savings</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

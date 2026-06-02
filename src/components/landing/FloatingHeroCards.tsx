import { memo } from "react";
import { PiggyBank } from "lucide-react";

export const FloatingHeroCards = memo(function FloatingHeroCards() {
  return (
    <div className="w-full lg:col-span-5 relative flex flex-col items-center justify-center perspective-distant mt-16 lg:mt-0">
      {/* Glowing backdrops behind mockup */}
      <div className="absolute -top-10 -left-10 w-72 h-72 bg-(--accent)/18 dark:bg-(--accent)/24 rounded-full blur-3xl opacity-70 pointer-events-none mix-blend-screen" />
      <div className="absolute -bottom-10 -right-10 w-72 h-72 bg-(--credit)/12 dark:bg-(--credit)/18 rounded-full blur-3xl opacity-70 pointer-events-none mix-blend-screen" />

      {/* Group of floating cards */}
      <div className="relative w-full max-w-[340px] transform-gpu lg:-rotate-y-6 lg:rotate-x-4 lg:-rotate-z-2 transition-transform duration-700 hover:rotate-0 hover:scale-[1.02]">
        {/* Mock Hero Spending Card */}
        <div className="hero-card hero-card-orange p-5 mb-4 rounded-4xl flex flex-col relative overflow-hidden text-left shadow-[0_25px_60px_-12px_rgba(0,0,0,0.35)] dark:shadow-[0_25px_60px_-12px_rgba(0,0,0,0.6)] z-20 transition-transform duration-500 hover:-translate-y-2">
          <div className="hero-card-orb-lg" />
          <div className="hero-card-orb-sm" />

          <div className="relative z-10 flex justify-between items-start mb-2">
            <span className="text-[10px] text-white/90 uppercase tracking-widest font-semibold">
              Spending Balance
            </span>
            <span className="text-[11px] text-white/80">June 2026</span>
          </div>
          <div className="relative z-10 mb-5">
            <span className="font-display text-[2.75rem] font-normal leading-none text-white tracking-tight">
              ₹5,888.00
            </span>
          </div>

          <div className="relative z-10 w-full h-px bg-white/20 mb-4" />

          <div className="relative z-10 flex justify-between items-center text-[10px] text-white/90 font-semibold">
            <div>
              <span className="font-bold text-white text-[11px]">
                ₹12.00 spent
              </span>{" "}
              of ₹5,900.00
            </div>
            <div className="font-bold text-[11px]">₹203.03/day left</div>
          </div>

          <div className="relative z-10 flex justify-between items-center mt-5">
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/15 text-[rgba(255,220,205,0.95)] border border-white/15 shadow-sm text-[10px] font-semibold">
              ↑ 2.4% vs last month
            </span>
            <button className="py-2 px-4 rounded-full bg-white/20 border border-white/30 text-white font-semibold text-[11px] flex items-center gap-1.5 shadow-sm backdrop-blur-md">
              <PiggyBank size={12} strokeWidth={2.5} /> Transfer
            </button>
          </div>
        </div>

        {/* Mock Savings Card (Tucked underneath) */}
        <div className="p-4 bg-white/90 dark:bg-(--bg-glass-strong) border border-black/8 dark:border-white/5 rounded-[1.75rem] flex items-center justify-between shadow-[0_15px_40px_-10px_rgba(0,0,0,0.15)] dark:shadow-[0_15px_40px_-10px_rgba(0,0,0,0.4)] absolute -bottom-12 -right-4 lg:-right-10 w-[95%] z-10 transform-gpu rotate-3 backdrop-blur-xl transition-transform duration-500 hover:translate-x-4 hover:-rotate-1">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-(--credit)/10 dark:bg-[#2a382b] flex items-center justify-center">
              <PiggyBank size={20} className="text-(--credit)" />
            </div>
            <div className="text-left">
              <div className="font-sans text-xs text-(--text-muted) font-medium mb-0.5 leading-none">
                Savings Wallet
              </div>
              <div className="font-display text-xl text-(--credit) tracking-tight leading-none mt-1">
                ₹50,500.00
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

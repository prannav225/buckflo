import { useState, useEffect } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";

interface OnboardingFlowProps {
  onComplete: () => void;
  currentMonthName: string;
}

export function OnboardingFlow({ onComplete, currentMonthName }: OnboardingFlowProps) {
  const [currentScreen, setCurrentScreen] = useState(0);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        if (currentScreen < 4) setCurrentScreen(s => s + 1);
      } else if (e.key === "ArrowLeft") {
        if (currentScreen > 0) setCurrentScreen(s => s - 1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentScreen]);

  // Touch swipe support
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentScreen < 4) {
      setCurrentScreen(s => s + 1);
    }
    if (isRightSwipe && currentScreen > 0) {
      setCurrentScreen(s => s - 1);
    }
  };

  const screens = [
    {
      id: "hero",
      visual: (
        <div className="flex flex-col items-center justify-center flex-1 h-full">
          <div className="relative mb-12">
            <span
              className="font-display text-8xl text-(--accent) tracking-wider leading-none italic animate-pulse-slow"
            >
              flo
            </span>
          </div>
        </div>
      ),
      headline: "Your money, flowing clearly.",
      subtext: "A simple, personal expense tracker built for how you actually spend.",
    },
    {
      id: "two-accounts",
      visual: (
        <div className="flex items-center justify-center gap-4 flex-1 h-full w-full max-w-[300px] mx-auto">
          <div className="flex-1 aspect-[4/5] rounded-2xl bg-(--bg-glass-strong) border border-(--accent)/30 shadow-lg shadow-(--accent)/10 flex flex-col items-center justify-center p-4">
            <span className="text-(--accent) font-semibold text-lg">Expenditure</span>
            <div className="w-12 h-1 bg-(--accent)/50 rounded-full mt-4" />
            <div className="w-8 h-1 bg-(--accent)/30 rounded-full mt-2" />
          </div>
          <div className="flex-1 aspect-[4/5] rounded-2xl bg-(--bg-glass-strong) border border-[#788c5d]/30 shadow-lg shadow-[#788c5d]/10 flex flex-col items-center justify-center p-4">
            <span className="text-[#788c5d] font-semibold text-lg">Savings</span>
            <div className="w-12 h-1 bg-[#788c5d]/50 rounded-full mt-4" />
            <div className="w-8 h-1 bg-[#788c5d]/30 rounded-full mt-2" />
          </div>
        </div>
      ),
      headline: "Two accounts. One view.",
      subtext: "Keep your spending money separate from savings. flo tracks both and tells you exactly where you stand.",
    },
    {
      id: "monthly-budget",
      visual: (
        <div className="flex flex-col items-center justify-center flex-1 h-full w-full max-w-[280px] mx-auto">
          <div className="w-full h-4 bg-(--bg-glass) rounded-full overflow-hidden border border-white/10 mb-4">
            <div className="h-full bg-(--accent) rounded-full animate-[progress-fill_1.5s_ease-out_forwards] w-0" />
          </div>
          <div className="flex justify-between w-full text-xs text-(--text-muted) font-semibold">
            <span>₹0</span>
            <span>Monthly Limit</span>
          </div>
        </div>
      ),
      headline: "Set a budget. Stick to it.",
      subtext: "Allocate money at the start of every month. flo tracks your daily burn rate so you never run out before the 30th.",
    },
    {
      id: "presets",
      visual: (
        <div className="flex flex-col items-center justify-center flex-1 h-full w-full max-w-[280px] mx-auto gap-3">
          <div className="flex gap-3 w-full">
            <div className="flex-1 bg-(--bg-glass-strong) rounded-xl p-3 border border-white/5 flex flex-col">
              <span className="text-sm font-semibold">Coffee</span>
              <span className="text-xs text-(--accent) mt-1">₹80</span>
            </div>
            <div className="flex-1 bg-(--bg-glass-strong) rounded-xl p-3 border border-white/5 flex flex-col">
              <span className="text-sm font-semibold">Metro</span>
              <span className="text-xs text-(--accent) mt-1">₹50</span>
            </div>
          </div>
          <div className="w-full h-[60px] bg-(--bg-glass-strong) rounded-xl border border-white/5 mt-2 flex items-end p-2 gap-2">
             <div className="flex-1 bg-(--accent)/30 rounded-t-sm h-[30%]" />
             <div className="flex-1 bg-(--accent)/50 rounded-t-sm h-[60%]" />
             <div className="flex-1 bg-(--accent)/70 rounded-t-sm h-[40%]" />
             <div className="flex-1 bg-(--accent)/90 rounded-t-sm h-[80%]" />
             <div className="flex-1 bg-(--accent) rounded-t-sm h-[50%]" />
          </div>
        </div>
      ),
      headline: "Log in seconds. Understand in minutes.",
      subtext: "Preset your frequent expenses for one-tap logging. Watch your spending patterns emerge over time.",
    },
    {
      id: "setup",
      visual: (
        <div className="flex flex-col items-center justify-center flex-1 h-full">
          <div className="w-24 h-24 rounded-3xl bg-(--bg-glass-strong) border border-(--accent)/20 flex items-center justify-center shadow-2xl shadow-(--accent)/20 mb-6 relative overflow-hidden">
             <div className="absolute inset-0 bg-linear-to-tr from-(--accent)/20 to-transparent opacity-50" />
             <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
               <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
               <line x1="16" y1="2" x2="16" y2="6"></line>
               <line x1="8" y1="2" x2="8" y2="6"></line>
               <line x1="3" y1="10" x2="21" y2="10"></line>
             </svg>
          </div>
        </div>
      ),
      headline: `Let's set up your ${currentMonthName}.`,
      subtext: "Add your opening balance and monthly budget to get started. Takes 30 seconds.",
    }
  ];

  return (
    <div 
      className="fixed inset-0 z-[99999] bg-[#141413] flex flex-col text-(--text) font-sans animate-fade-in"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Top Header - Skip button */}
      <div className="absolute top-0 right-0 p-6 z-10">
        {currentScreen > 0 && currentScreen < 4 && (
          <button 
            onClick={onComplete}
            className="text-sm font-semibold text-(--text-muted) hover:text-(--text) transition-colors bg-transparent border-0 cursor-pointer"
          >
            Skip
          </button>
        )}
      </div>

      {/* Screen Content - Swipeable Container */}
      <div className="flex-1 relative overflow-hidden">
        <div 
          className="absolute inset-0 flex transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
          style={{ transform: `translateX(-${currentScreen * 100}%)` }}
        >
          {screens.map((screen, idx) => (
            <div key={screen.id} className="w-full h-full flex-shrink-0 flex flex-col px-8 pt-12 pb-32">
              {/* Visual Area */}
              <div className="flex-1 flex flex-col justify-end pb-12">
                {screen.visual}
              </div>
              
              {/* Text Area */}
              <div className="h-[180px] flex flex-col items-center text-center transition-opacity duration-500">
                <h1 className="text-3xl font-bold tracking-tight mb-4 text-(--text)">
                  {screen.headline}
                </h1>
                <p className="text-[15px] text-(--text-muted) leading-relaxed max-w-[320px]">
                  {screen.subtext}
                </p>

                {idx === 4 && (
                  <div className="w-full flex flex-col gap-3 mt-8">
                    <button 
                      onClick={onComplete}
                      className="w-full py-4 rounded-xl bg-(--accent) text-white font-semibold text-lg shadow-lg shadow-(--accent)/20 active:scale-[0.98] transition-transform border-0 cursor-pointer"
                    >
                      Set Up This Month
                    </button>
                    <button 
                      onClick={onComplete}
                      className="w-full py-3 rounded-xl bg-transparent text-(--text-muted) font-semibold text-sm active:scale-[0.98] transition-transform border-0 cursor-pointer"
                    >
                      Skip for now
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Navigation / Progress Indicators */}
      <div className="absolute bottom-0 left-0 right-0 p-8 flex items-center justify-between pb-[calc(2rem+env(safe-area-inset-bottom,0))]">
        <button 
          onClick={() => currentScreen > 0 && setCurrentScreen(s => s - 1)}
          className={`p-3 rounded-full bg-(--bg-glass-strong) border border-white/5 transition-opacity ${currentScreen > 0 ? 'opacity-100 cursor-pointer' : 'opacity-0 pointer-events-none'}`}
        >
          <ChevronLeft size={20} />
        </button>

        <div className="flex items-center gap-2">
          {screens.map((_, idx) => (
            <div 
              key={idx}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentScreen 
                  ? 'w-6 bg-(--accent)' 
                  : 'w-2 bg-(--bg-glass-strong) border border-white/10'
              }`}
            />
          ))}
        </div>

        <button 
          onClick={() => currentScreen < 4 && setCurrentScreen(s => s + 1)}
          className={`p-3 rounded-full transition-all ${
            currentScreen < 4 
              ? 'bg-(--accent) text-white opacity-100 cursor-pointer shadow-lg shadow-(--accent)/20' 
              : 'opacity-0 pointer-events-none'
          } border-0`}
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}

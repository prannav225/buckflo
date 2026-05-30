import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, ChevronLeft, CreditCard, PiggyBank } from "lucide-react";
import { useProfile } from "../../../hooks/useProfile";


interface OnboardingFlowProps {
  onComplete: (skipSetup?: boolean) => void;
  currentMonthName: string;
}

export function OnboardingFlow({
  onComplete,
  currentMonthName,
}: OnboardingFlowProps) {
  const [currentScreen, setCurrentScreen] = useState(0);
  const { profile } = useProfile();


  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        if (currentScreen < 4) setCurrentScreen((s) => s + 1);
      } else if (e.key === "ArrowLeft") {
        if (currentScreen > 0) setCurrentScreen((s) => s - 1);
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

  const onTouchMove = (e: React.TouchEvent) =>
    setTouchEnd(e.targetTouches[0].clientX);

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentScreen < 4) {
      setCurrentScreen((s) => s + 1);
    }
    if (isRightSwipe && currentScreen > 0) {
      setCurrentScreen((s) => s - 1);
    }
  };

  const screens = [
    {
      id: "hero",
      visual: (
        <div className="flex flex-col items-center justify-center flex-1 h-full animate-fade-in">
          <div className="relative mb-12 flex items-center justify-center">
            <div className="absolute w-40 h-40 rounded-full border border-(--accent)/15 animate-[ping_3s_infinite]" />
            <div className="absolute w-32 h-32 rounded-full border border-(--accent)/25 animate-pulse" />
            <span className="font-display text-8xl text-(--accent) tracking-wider leading-none italic animate-pulse-slow drop-shadow-[0_0_35px_rgba(217,119,87,0.35)] relative z-10">
              buckflo
            </span>
          </div>
        </div>
      ),
      headline: "Your money, flowing clearly.",
      subtext:
        "A simple, personal expense tracker built for how you actually spend.",
    },
    {
      id: "two-accounts",
      visual: (
        <div className="flex items-center justify-center gap-4 flex-1 h-full w-full max-w-[300px] mx-auto">
          <div className="flex-1 aspect-4/5 rounded-2xl bg-white/5 dark:bg-white/3 border border-black/8 dark:border-white/6 shadow-md flex flex-col items-center justify-center p-5 text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-linear-to-b from-(--accent)/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="w-12 h-12 rounded-full bg-(--accent)/10 flex items-center justify-center mb-3.5 relative z-10">
              <CreditCard size={22} className="text-(--accent)" />
            </div>
            <span className="text-(--text) font-bold text-sm tracking-wide relative z-10">
              Expenditure
            </span>
            <span className="text-[10px] text-(--text-muted) mt-1 leading-normal relative z-10">
              Daily Spending
            </span>
          </div>
          <div className="flex-1 aspect-4/5 rounded-2xl bg-white/5 dark:bg-white/3 border border-black/8 dark:border-white/6 shadow-md flex flex-col items-center justify-center p-5 text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-linear-to-b from-(--credit)/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="w-12 h-12 rounded-full bg-(--credit)/10 flex items-center justify-center mb-3.5 relative z-10">
              <PiggyBank size={22} className="text-(--credit)" />
            </div>
            <span className="text-(--text) font-bold text-sm tracking-wide relative z-10">
              Savings
            </span>
            <span className="text-[10px] text-(--text-muted) mt-1 leading-normal relative z-10">
              Future Goals
            </span>
          </div>
        </div>
      ),
      headline: "Two accounts. One view.",
      subtext:
        "Keep your spending money separate from savings. buckflo tracks both and tells you exactly where you stand.",
    },
    {
      id: "monthly-budget",
      visual: (
        <div className="flex flex-col items-center justify-center flex-1 h-full w-full max-w-[280px] mx-auto">
          <div className="w-full h-5 bg-black/10 dark:bg-white/5 rounded-full overflow-hidden border border-black/8 dark:border-white/6 mb-4 p-0.5 relative">
            <div className="h-full bg-linear-to-r from-(--accent)/80 to-(--accent) rounded-full animate-[progress-fill_1.5s_ease-out_forwards] w-0 shadow-[0_0_12px_rgba(217,119,87,0.3)]" />
          </div>
          <div className="flex justify-between w-full text-[10px] text-(--text-muted) font-bold tracking-wider uppercase">
            <span>₹0 Spent</span>
            <span className="text-(--accent) font-extrabold">
              ₹30,000 Budget
            </span>
          </div>
        </div>
      ),
      headline: "Set a budget. Stick to it.",
      subtext:
        "Allocate money at the start of every month. buckflo tracks your daily burn rate so you never run out before the 30th.",
    },
    {
      id: "presets",
      visual: (
        <div className="flex flex-col items-center justify-center flex-1 h-full w-full max-w-[280px] mx-auto gap-4">
          <div className="flex gap-3 w-full">
            <div className="flex-1 bg-white/5 dark:bg-white/3 rounded-xl p-3.5 border border-black/8 dark:border-white/6 flex flex-col items-start gap-1 shadow-sm">
              <span className="text-[10px] font-bold text-(--text-muted) uppercase tracking-wider">
                Coffee
              </span>
              <span className="text-[1.125rem] font-extrabold text-(--accent)">
                ₹80
              </span>
            </div>
            <div className="flex-1 bg-white/5 dark:bg-white/3 rounded-xl p-3.5 border border-black/8 dark:border-white/6 flex flex-col items-start gap-1 shadow-sm">
              <span className="text-[10px] font-bold text-(--text-muted) uppercase tracking-wider">
                Metro
              </span>
              <span className="text-[1.125rem] font-extrabold text-(--accent)">
                ₹50
              </span>
            </div>
          </div>
          <div className="w-full h-[64px] bg-white/5 dark:bg-white/3 rounded-xl border border-black/8 dark:border-white/6 flex items-end p-3 gap-2">
            <div className="flex-1 bg-(--accent)/15 rounded-t-md h-[30%]" />
            <div className="flex-1 bg-(--accent)/35 rounded-t-md h-[60%]" />
            <div className="flex-1 bg-(--accent)/55 rounded-t-md h-[40%]" />
            <div className="flex-1 bg-(--accent)/75 rounded-t-md h-[80%] shadow-[0_-2px_8px_rgba(217,119,87,0.15)]" />
            <div className="flex-1 bg-(--accent) rounded-t-md h-[50%]" />
          </div>
        </div>
      ),
      headline: "Log in seconds. Understand in minutes.",
      subtext:
        "Preset your frequent expenses for one-tap logging. Watch your spending patterns emerge over time.",
    },
    {
      id: "setup",
      visual: (
        <div className="flex flex-col items-center justify-center flex-1 h-full relative">
          <div className="absolute w-36 h-36 rounded-full border border-(--accent)/10 animate-pulse" />
          <div className="w-24 h-24 rounded-3xl bg-white/5 dark:bg-white/3 border border-(--accent)/20 flex items-center justify-center shadow-xl shadow-(--accent)/5 mb-6 relative overflow-hidden z-10">
            <div className="absolute inset-0 bg-linear-to-tr from-(--accent)/10 to-transparent opacity-50" />
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="relative z-10"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
        </div>
      ),
      headline: `Let's set up your ${currentMonthName}.`,
      subtext:
        "Add your opening balance and monthly budget to get started. Takes 30 seconds.",
    },
  ];

  return (
    <div
      className="fixed inset-0 z-99999 bg-(--bg) flex flex-col text-(--text) font-sans animate-fade-in overflow-hidden"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Background ambient radial glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-(--accent)/12 dark:bg-(--accent)/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-(--credit)/10 dark:bg-(--credit)/12 blur-3xl pointer-events-none" />
      <div className="absolute top-[20%] left-[20%] w-[320px] h-[320px] rounded-full bg-[#7c3aed]/5 dark:bg-[#7c3aed]/8 blur-3xl pointer-events-none" />

      {/* Top Header - Skip button */}
      <div className="absolute top-0 right-0 p-6 z-10">
        {currentScreen > 0 && currentScreen < 4 && (
          <button
            onClick={() => onComplete(true)}
            className="text-sm font-semibold text-(--text-muted) hover:text-(--text) transition-colors bg-transparent border-0 cursor-pointer outline-none focus:outline-none"
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
            <div
              key={screen.id}
              className="w-full h-full shrink-0 flex flex-col px-8 pt-12 pb-32"
            >
              {/* Visual Area */}
              <div className="flex-1 flex flex-col justify-end pb-12">
                {screen.visual}
              </div>

              {/* Text Area */}
              <div className="min-h-[180px] flex flex-col items-center text-center transition-opacity duration-500">
                <h1 className="text-3xl font-bold font-display tracking-tight mb-4 text-(--text)">
                  {screen.headline}
                </h1>
                <p className="text-[15px] text-(--text-muted) leading-relaxed max-w-[320px]">
                  {screen.subtext}
                </p>

                {idx === 4 && (
                  <div className="w-full flex flex-col gap-3 mt-8">
                    <button
                      onClick={() => onComplete(false)}
                      className="btn-primary w-full"
                    >
                      {profile?.displayName ? `Start tracking, ${profile.displayName}` : "Set Up This Month"}
                    </button>

                    <button
                      onClick={() => onComplete(true)}
                      className="btn-ghost w-full py-3 text-sm font-semibold hover:text-(--text) active:scale-95 transition-all"
                    >
                      Skip for now
                    </button>
                    <p className="text-[10px] text-(--text-muted) mt-3 text-center leading-normal">
                      By setting up, you agree to our{" "}
                      <Link
                        to="/privacy"
                        className="underline hover:text-(--text) cursor-pointer text-(--text-muted)"
                      >
                        Privacy Policy
                      </Link>{" "}
                      and{" "}
                      <Link
                        to="/terms"
                        className="underline hover:text-(--text) cursor-pointer text-(--text-muted)"
                      >
                        Terms & Conditions
                      </Link>
                      .
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Navigation / Progress Indicators */}
      <div className="absolute bottom-0 left-0 right-0 p-8 flex items-center justify-between pb-[calc(2rem+env(safe-area-inset-bottom,0))] pointer-events-none">
        <button
          onClick={() => currentScreen > 0 && setCurrentScreen((s) => s - 1)}
          className={`p-3 rounded-full bg-white/5 dark:bg-white/4 border border-black/8 dark:border-white/6 text-(--text) transition-all duration-200 outline-none focus:outline-none pointer-events-auto ${currentScreen > 0 ? "opacity-100 cursor-pointer" : "opacity-0 pointer-events-none"}`}
        >
          <ChevronLeft size={20} />
        </button>

        <div className="flex items-center gap-2 pointer-events-auto">
          {screens.map((_, idx) => (
            <div
              key={idx}
              className={`h-2 rounded-full transition-all duration-350 ${
                idx === currentScreen
                  ? "w-6 bg-(--accent)"
                  : "w-2 bg-neutral-300 dark:bg-neutral-700"
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => currentScreen < 4 && setCurrentScreen((s) => s + 1)}
          className={`p-3 rounded-full transition-all duration-200 outline-none focus:outline-none pointer-events-auto ${
            currentScreen < 4
              ? "bg-(--accent) text-white opacity-100 cursor-pointer shadow-md shadow-(--accent)/15 active:scale-95"
              : "opacity-0 pointer-events-none"
          } border-0`}
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}

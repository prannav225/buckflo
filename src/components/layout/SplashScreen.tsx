interface SplashScreenProps {
  isExiting: boolean;
}

export function SplashScreen({ isExiting }: SplashScreenProps) {
  return (
    <div
      className={`fixed inset-0 z-99999 flex flex-col items-center justify-center bg-(--bg) text-(--text) font-sans select-none overflow-hidden transition-all duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isExiting
          ? "opacity-0 scale-98 pointer-events-none"
          : "opacity-100 scale-100"
      }`}
    >
      {/* Background ambient radial glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-(--accent)/10 dark:bg-(--accent)/12 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-(--credit)/10 dark:bg-(--credit)/12 blur-3xl pointer-events-none" />

      {/* Centered logo & title */}
      <div className="flex flex-col items-center justify-center z-10">
        <div className="relative mb-6 flex items-center justify-center">
          <div className="absolute w-40 h-40 rounded-full border border-(--accent)/15 animate-[ping_3s_infinite]" />
          <div className="absolute w-32 h-32 rounded-full border border-(--accent)/20 animate-pulse" />
          <span className="font-display text-8xl text-(--accent) tracking-wider leading-none italic animate-pulse-slow drop-shadow-[0_0_35px_rgba(217,119,87,0.3)] relative z-10 select-none">
            flo
          </span>
        </div>
        <p className="text-[10px] uppercase tracking-[0.25em] font-semibold text-(--text-muted) opacity-80 mt-2">
          Your money, flowing clearly.
        </p>

        {/* Thin loader bar */}
        <div className="h-[2px] w-24 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden mt-10">
          <div className="h-full bg-(--accent) rounded-full w-1/2 animate-loading-bar" />
        </div>
      </div>
    </div>
  );
}

import { NavLink } from "react-router-dom";
import { Calendar, Home, Plus, BarChart2, History } from "lucide-react";
import { hapticFeedback } from "../../utils/haptics";

const navItems = [
  { to: "/home", end: false, label: "Home", id: "nav-home", Icon: Home },
  {
    to: "/monthly",
    end: true,
    label: "Monthly",
    id: "nav-monthly",
    Icon: Calendar,
  },
  { to: "/add", label: "Create entry", id: "nav-add", Icon: Plus, isFab: true },
  { to: "/insights", label: "Insights", id: "nav-insights", Icon: BarChart2 },
  {
    to: "/monthly/transactions",
    label: "History",
    id: "nav-history",
    Icon: History,
  },
];

export function BottomNav() {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 h-[calc(110px+env(safe-area-inset-bottom,0))] pointer-events-none flex justify-center items-end pb-[calc(16px+env(safe-area-inset-bottom,0))] nav-wrapper"
      style={{
        background:
          "linear-gradient(to top, color-mix(in srgb, var(--bg) 75%, transparent) 0%, color-mix(in srgb, var(--bg) 40%, transparent) 40%, color-mix(in srgb, var(--bg) 15%, transparent) 70%, transparent 100%)",
      }}
      role="navigation"
      aria-label="App navigation"
    >
      {/* Symmetrical 5-tab glass navigation pill */}
      <nav
        className="flex items-center gap-[clamp(2px,0.5vw,4px)] p-[clamp(6px,1.5vw,10px)_clamp(8px,2.5vw,16px)] bg-[color-mix(in_srgb,var(--bg)_75%,transparent)] dark:bg-[color-mix(in_srgb,var(--bg)_45%,transparent)] [-webkit-backdrop-filter:blur(32px)_saturate(200%)] [backdrop-filter:blur(32px)_saturate(200%)] border border-black/8 dark:border-white/6 rounded-(--r-pill) shadow-(--glass-shadow-lg) pointer-events-auto nav-pill"
        aria-label="Main navigation"
      >
        {navItems.map(({ to, end, label, id, Icon, isFab }) => (
          <NavLink
            key={id}
            to={to}
            end={end}
            replace={!isFab}
            viewTransition
            onClick={() => hapticFeedback.light()}
            className={({ isActive }) =>
              isFab
                ? `flex items-center justify-center text-white w-[clamp(46px,13vw,60px)] h-[clamp(46px,13vw,60px)] rounded-full shadow-[0_4px_14px_rgba(217,119,87,0.35)] transition-[transform,background] duration-200 active:scale-90 cursor-pointer mx-[clamp(4px,1.5vw,12px)] shrink-0 nav-item-fab ${
                    isActive ? "active bg-(--accent-dark)" : "bg-(--accent)"
                  }`
                : `flex flex-col items-center gap-0.5 no-underline font-sans text-[clamp(9px,2.5vw,11px)] font-medium tracking-wider border-0 bg-transparent cursor-pointer p-[clamp(8px,2vw,12px)_clamp(12px,3.5vw,22px)] rounded-(--r-pill) transition-all duration-220 ease-[cubic-bezier(0.34,1.56,0.64,1)] nav-item ${
                    isActive ? "active text-(--accent)" : "text-(--text-muted)"
                  }`
            }
            aria-label={label}
            id={id}
          >
            {Icon && (
              <Icon
                size={
                  isFab
                    ? "clamp(24px, 6.5vw, 30px)"
                    : "clamp(20px, 5.5vw, 26px)"
                }
                strokeWidth={isFab ? 2 : 1.8}
              />
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

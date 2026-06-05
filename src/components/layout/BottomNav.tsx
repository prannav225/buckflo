import { NavLink } from "react-router-dom";
import { Calendar, Home, Plus, BarChart2, History } from "lucide-react";
import { hapticFeedback } from "../../utils/haptics";

const navItems = [
  { to: "/home", end: false, label: "Home", id: "nav-home", Icon: Home },
  { to: "/monthly", end: true, label: "Monthly", id: "nav-monthly", Icon: Calendar },
  { to: "/add", label: "Create entry", id: "nav-add", Icon: Plus, isFab: true },
  { to: "/insights", label: "Insights", id: "nav-insights", Icon: BarChart2 },
  { to: "/monthly/transactions", label: "History", id: "nav-history", Icon: History },
];

export function BottomNav() {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 h-[calc(110px+env(safe-area-inset-bottom,0))] bg-linear-to-t from-(--bg) via-(--bg)/15 to-transparent pointer-events-none flex justify-center items-end pb-[calc(16px+env(safe-area-inset-bottom,0))] nav-wrapper"
      role="navigation"
      aria-label="App navigation"
    >
      {/* Symmetrical 5-tab glass navigation pill */}
      <nav
        className="flex items-center gap-0.5 p-[6px_8px] bg-(--bg-glass-strong) [-webkit-backdrop-filter:blur(32px)_saturate(200%)] [backdrop-filter:blur(32px)_saturate(200%)] border border-black/8 dark:border-white/6 rounded-(--r-pill) shadow-(--glass-shadow-lg) pointer-events-auto nav-pill"
        aria-label="Main navigation"
      >
        {navItems.map(({ to, end, label, id, Icon, isFab }) => (
          <NavLink
            key={id}
            to={to}
            end={end}
            viewTransition
            onClick={() => hapticFeedback.light()}
            className={({ isActive }) =>
              isFab
                ? `flex items-center justify-center text-white w-10 h-10 rounded-full shadow-[0_4px_14px_rgba(217,119,87,0.35)] transition-[transform,background] duration-200 active:scale-90 cursor-pointer mx-1.5 shrink-0 nav-item-fab ${
                    isActive ? "active bg-(--accent-dark)" : "bg-(--accent)"
                  }`
                : `flex flex-col items-center gap-0.5 no-underline font-sans text-[10px] font-medium tracking-wider border-0 bg-transparent cursor-pointer p-[9px_16px] rounded-(--r-pill) transition-all duration-220 ease-[cubic-bezier(0.34,1.56,0.64,1)] nav-item ${
                    isActive ? "active text-(--accent)" : "text-(--text-muted)"
                  }`
            }
            aria-label={label}
            id={id}
          >
            {Icon && <Icon size={20} strokeWidth={1.8} />}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}


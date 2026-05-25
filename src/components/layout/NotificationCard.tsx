import {
  Check,
  ArrowRight,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Calendar,
  PiggyBank,
  Lightbulb,
  Bell,
} from "lucide-react";
import { type NotificationItem } from "../../hooks/useNotificationHub";

interface NotificationCardProps {
  alert: NotificationItem;
  onDismiss: (id: string) => void;
  onCloseSheet: () => void;
}

export function NotificationCard({
  alert,
  onDismiss,
  onCloseSheet,
}: NotificationCardProps) {
  const getAlertIcon = (iconName: string) => {
    switch (iconName) {
      case "alert":
        return <AlertTriangle size={18} />;
      case "budget":
        return <TrendingDown size={18} />;
      case "trend-up":
        return <TrendingUp size={18} />;
      case "trend-down":
        return <TrendingUp size={18} className="rotate-180" />;
      case "sub":
        return <Calendar size={18} />;
      case "goal":
        return <PiggyBank size={18} />;
      case "advisor":
        return <Lightbulb size={18} />;
      default:
        return <Bell size={18} />;
    }
  };

  const typeClasses = {
    danger: "bg-[rgba(217,119,87,0.08)] text-[var(--debit)]",
    warning: "bg-[rgba(217,119,87,0.08)] text-[var(--accent)]",
    info: "bg-[rgba(74,134,232,0.08)] text-[#4a86e8]",
    success: "bg-[rgba(90,158,111,0.08)] text-[var(--credit)]",
  };

  return (
    <div
      className="flex gap-3 p-3.5 bg-[var(--bg-glass)] border border-black/8 dark:border-white/6 rounded-[var(--r-lg)] shadow-[var(--glass-shadow)] transition-[transform,background] duration-150 ease-out hover:bg-[var(--bg-glass-strong)] fade-in-up"
    >
      <div className={`flex items-center justify-center w-[34px] h-[34px] rounded-lg shrink-0 ${typeClasses[alert.type] || typeClasses.info}`}>
        {getAlertIcon(alert.iconName)}
      </div>
      <div className="flex-1">
        <div className="flex items-start justify-between gap-2 mb-[3px]">
          <h4 className="font-sans text-sm font-semibold text-[var(--text)] m-0 leading-[1.3]">{alert.title}</h4>
          <button
            onClick={() => onDismiss(alert.id)}
            className="inline-flex items-center justify-center w-5 h-5 border-0 bg-transparent text-[var(--text-muted)] rounded cursor-pointer transition-[background,color] duration-150 p-0 shrink-0 hover:bg-black/5 dark:hover:bg-white/8 hover:text-[var(--text)]"
            title="Dismiss notification"
            aria-label="Dismiss"
          >
            <Check size={14} />
          </button>
        </div>
        <p className="font-sans text-[0.8125rem] text-[var(--text-secondary)] leading-[1.4] m-0">{alert.description}</p>
        {alert.action && (
          <button
            onClick={() => {
              alert.action?.onClick();
              onCloseSheet();
            }}
            className="inline-flex items-center gap-1 mt-2.5 px-3 py-1.5 bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--r-pill)] font-sans text-xs font-semibold text-[var(--text-secondary)] cursor-pointer transition-[background,color,border-color] duration-150 hover:bg-[var(--border)] hover:text-[var(--text)] hover:border-[var(--text-muted)]"
          >
            <span>{alert.action.label}</span>
            <ArrowRight size={12} />
          </button>
        )}
      </div>
    </div>
  );
}

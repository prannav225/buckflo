import { type ReactNode } from "react";
import { Tooltip } from "../ui/Tooltip";

export type InsightColorScheme = "accent" | "credit" | "debit";

interface CollapsibleInsightCardProps {
  isOpen: boolean;
  onOpen: () => void;
  title: string;
  tooltipText: string;
  tooltipId: string;
  actionText: string;
  icon: ReactNode;
  colorScheme: InsightColorScheme;
  delayClass?: string;
  children: ReactNode;
}

export function CollapsibleInsightCard({
  isOpen,
  onOpen,
  title,
  tooltipText,
  tooltipId,
  actionText,
  icon,
  colorScheme,
  delayClass = "delay-1",
  children,
}: CollapsibleInsightCardProps) {
  const styles = {
    accent: {
      blur: "bg-(--accent)",
      iconBg: "bg-linear-to-br from-(--accent)/20 to-(--accent)/5 border-(--accent)/20",
      iconText: "text-(--accent)",
      actionText: "text-(--accent)",
    },
    credit: {
      blur: "bg-credit",
      iconBg: "bg-credit/20 border-credit/20",
      iconText: "text-[#64b079]",
      actionText: "text-[#64b079]",
    },
    debit: {
      blur: "bg-(--debit)",
      iconBg: "bg-(--debit)/20 border-(--debit)/20",
      iconText: "text-(--debit)",
      actionText: "text-(--debit)",
    },
  }[colorScheme];

  return (
    <div className={`glass-card fade-in-up ${delayClass} mb-4 overflow-hidden border border-black/5 dark:border-white/5 bg-(--bg-glass-strong)`}>
      {!isOpen ? (
        <div
          onClick={onOpen}
          className="p-3.5 px-4 flex items-center justify-between cursor-pointer bg-linear-to-r from-transparent via-black/5 to-transparent dark:via-white/5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <div
                className={`absolute inset-0 blur-[8px] opacity-20 group-hover:opacity-40 transition-opacity duration-300 rounded-full ${styles.blur}`}
              />
              <div
                className={`relative w-9 h-9 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border shadow-sm ${styles.iconBg} ${styles.iconText}`}
              >
                {icon}
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-[14px] font-bold m-0 tracking-wide text-(--text)">
                {title}
              </h3>
              <div onClick={(e) => e.stopPropagation()}>
                <Tooltip
                  id={tooltipId}
                  text={tooltipText}
                  preferredPosition="top"
                />
              </div>
            </div>
          </div>
          <div
            className={`text-[11px] font-semibold uppercase tracking-wider opacity-80 group-hover:opacity-100 transition-opacity pr-1 ${styles.actionText}`}
          >
            {actionText}
          </div>
        </div>
      ) : (
        children
      )}
    </div>
  );
}

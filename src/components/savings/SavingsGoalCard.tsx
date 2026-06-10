import { Calendar } from "lucide-react";
import { type SavingGoal } from "../../db/database";
import { formatINR } from "../../utils/currency";
import { formatDate } from "../../utils/dateUtils";

interface Props {
  goal: SavingGoal;
  etaMonths?: number | null;
  onClick: () => void;
}

export function SavingsGoalCard({ goal, etaMonths, onClick }: Props) {
  const percent = Math.min(
    100,
    Math.max(
      0,
      goal.targetAmount > 0
        ? (goal.currentAllocated / goal.targetAmount) * 100
        : 0,
    ),
  );
  const isCompleted = percent >= 100;

  // SVG Progress ring math
  const radius = 24;
  const stroke = 3;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <div
      className={`bg-(--bg-glass) border border-black/8 dark:border-white/6 rounded-[var(--r-xl)] p-[18px_14px] flex flex-col items-center text-center relative cursor-pointer transition-[border-color,background] duration-200 active:bg-black/5 dark:active:bg-white/5 ${
        isCompleted
          ? "border-[rgba(90,158,111,0.3)] bg-linear-to-br from-[rgba(90,158,111,0.03)] to-(--bg-glass)"
          : ""
      }`}
      onClick={onClick}
    >
      <div className="relative w-16 h-16 flex items-center justify-center mb-2.5">
        <svg width="60" height="60" viewBox="0 0 60 60">
          {/* Background circle */}
          <circle
            stroke="var(--border)"
            fill="transparent"
            strokeWidth={stroke}
            r={radius}
            cx="30"
            cy="30"
          />
          {/* Foreground progress circle */}
          <circle
            className="transition-[stroke-dashoffset] duration-350 ease-out origin-center -rotate-90"
            stroke={isCompleted ? "var(--credit)" : "var(--accent)"}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={`${circumference} ${circumference}`}
            style={{ strokeDashoffset }}
            r={radius}
            cx="30"
            cy="30"
          />
        </svg>
        <span className="absolute font-sans text-xs font-bold text-(--text)">
          {Math.round(percent)}%
        </span>
      </div>
      <div className="font-sans text-[13px] font-semibold text-(--text) mb-1 leading-tight line-clamp-2 h-8 w-full">
        {goal.name}
      </div>
      
      {isCompleted ? (
        <div className="flex flex-col items-center mt-2">
          <div className="font-sans text-[11px] font-bold text-(--credit) px-2.5 py-0.5 bg-(--credit)/10 rounded-full border border-(--credit)/20 uppercase tracking-wider mb-1">
            Goal reached
          </div>
          <div className="font-sans text-xs font-semibold text-(--text)">
            {formatINR(goal.currentAllocated)} / {formatINR(goal.targetAmount)}
          </div>
        </div>
      ) : (
        <>
          <div className="font-sans text-xs font-medium text-(--text-secondary) mb-1">
            {formatINR(goal.currentAllocated)}
          </div>
          <div className="flex flex-col items-center gap-1 mt-1.5">
            {goal.deadline && (
              <div className="flex items-center gap-0.75 justify-center text-[11px] text-(--text-muted)">
                <Calendar size={10} />
                <span>{formatDate(goal.deadline)}</span>
              </div>
            )}
            {etaMonths !== undefined && etaMonths !== null && etaMonths > 0 && (
              <div className="text-[9px] font-semibold tracking-wider uppercase bg-(--accent)/10 text-(--accent) px-2 py-0.5 rounded-full border border-(--accent)/20 inline-block mt-0.5">
                Velocity ETA: {etaMonths} {etaMonths === 1 ? 'mo' : 'mos'}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

import { CalendarDays, Check, Undo2 } from "lucide-react";
import { formatINR } from "../../utils/currency";
import type { MonthSetup } from "../../db/schema";

interface Props {
  monthSetup: MonthSetup;
  committedTotal: number;
  committedPaid: number;
  handleUndoPaid: (idx: number) => void;
  handleMarkAsPaid: (idx: number) => void;
  setShowEditModal: (show: boolean) => void;
}

export function CommittedExpensesList({
  monthSetup,
  committedTotal,
  committedPaid,
  handleUndoPaid,
  handleMarkAsPaid,
}: Props) {
  const expenses = monthSetup.committedExpenses || [];

  if (expenses.length === 0) {
    return (
      <div className="glass-card text-center py-8 px-4 rounded-xl">
        <p className="text-(--text-secondary) dark:text-white/60 mb-0 text-sm">
          No committed expenses set for this month.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="glass-card-strong px-5 py-3.5 flex items-center justify-between mb-3 fade-in-up">
        <div>
          <div className="text-[10px] font-semibold text-(--text-muted) uppercase tracking-wider mb-0.5">
            Committed Total
          </div>
          <div className="text-xl font-display text-(--text)">
            {formatINR(committedTotal)}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-semibold text-(--text-muted) uppercase tracking-wider mb-0.5">
            Paid
          </div>
          <div className="text-lg font-display text-(--credit)">
            {formatINR(committedPaid)}{" "}
            <span className="text-xs text-(--text-muted)">
              / {formatINR(committedTotal)}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-6 fade-in-up">
        {expenses.map((expense, idx) => {
          const today = new Date().getDate();
          const isDue =
            expense.dueDay !== undefined &&
            today >= expense.dueDay &&
            !expense.isPaid;

          return (
            <div
              key={`${expense.name}-${idx}`}
              className={`glass-card p-4 rounded-xl transition-all duration-200 ${
                expense.isPaid
                  ? "opacity-75"
                  : isDue
                    ? "ring-1 ring-(--accent)/40"
                    : ""
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-(--text) dark:text-white text-sm">
                      {expense.name}
                    </span>
                    {expense.isPaid && (
                      <span className="text-[0.625rem] font-medium px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-500/20">
                        Paid ✓
                      </span>
                    )}
                    {isDue && (
                      <span className="text-[0.625rem] font-medium px-2 py-0.5 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-full border border-orange-500/20 animate-pulse">
                        Due
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-(--text-muted)">
                    {expense.category !== expense.name && (
                      <span className="whitespace-nowrap">
                        {expense.category}
                      </span>
                    )}
                    {expense.dueDay && (
                      <>
                        {expense.category !== expense.name && (
                          <span className="opacity-50">•</span>
                        )}
                        <span className="inline-flex items-center gap-1 whitespace-nowrap">
                          <CalendarDays size={10} />
                          Due on {expense.dueDay}
                          {expense.dueDay === 1
                            ? "st"
                            : expense.dueDay === 2
                              ? "nd"
                              : expense.dueDay === 3
                                ? "rd"
                                : "th"}
                        </span>
                      </>
                    )}
                    {expense.paidDate && (
                      <>
                        {(expense.category !== expense.name ||
                          expense.dueDay) && (
                          <span className="opacity-50">•</span>
                        )}
                        <span className="text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                          Paid {expense.paidDate}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-right flex flex-col items-end gap-2.5 shrink-0">
                  <span className="font-display text-base font-bold text-(--text) dark:text-white whitespace-nowrap">
                    {formatINR(expense.amount)}
                  </span>
                  {expense.isPaid ? (
                    <button
                      onClick={() => handleUndoPaid(idx)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-(--text-muted) hover:text-(--text) transition-colors cursor-pointer"
                    >
                      <Undo2 size={12} /> Undo
                    </button>
                  ) : (
                    <button
                      onClick={() => handleMarkAsPaid(idx)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[rgba(217,119,87,0.1)] text-(--accent) rounded-lg font-semibold text-[11px] border border-(--accent)/20 hover:bg-(--accent) hover:text-white transition-all cursor-pointer whitespace-nowrap"
                    >
                      <Check size={12} strokeWidth={3} /> Mark Paid
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

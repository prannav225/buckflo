import { formatINR } from "../../utils/currency";
import { formatMonthYear } from "../../utils/dateUtils";

interface Props {
  monthYear: string;
  spent: number;
  setShowInitModal: (show: boolean) => void;
}

export function MonthlySetupPlaceholder({ monthYear, spent, setShowInitModal }: Props) {
  return (
    <div className="glass-card fade-in-up delay-1 mb-4 text-center py-5.5 px-5">
      <p className="text-(--text-secondary) m-0 mb-3.5 text-sm">
        No budget or opening balance setup found for{" "}
        {formatMonthYear(monthYear)}.
      </p>

      {spent > 0 && (
        <div className="mb-4 bg-black/2 dark:bg-white/2 border border-black/5 dark:border-white/5 rounded-xl p-3.5 inline-block min-w-[220px]">
          <span className="font-sans text-[10px] font-semibold text-(--text-muted) uppercase tracking-wider block mb-1">
            Total Spent This Month
          </span>
          <span className="font-display text-2xl font-bold text-(--debit) block">
            {formatINR(spent)}
          </span>
        </div>
      )}

      <div>
        <button
          className="btn-primary text-[0.8125rem] py-2.5 px-5 h-auto min-h-0 cursor-pointer"
          onClick={() => setShowInitModal(true)}
          id="btn-init-month"
        >
          Configure {formatMonthYear(monthYear).split(" ")[0]} Setup
        </button>
      </div>
    </div>
  );
}

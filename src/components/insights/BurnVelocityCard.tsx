import { Flame, CheckCircle, TrendingUp } from "lucide-react";
import { type BurnRateResult } from "../../hooks/analytics/useBurnRate";
import { formatCurrency } from "../../utils/currency";

interface BurnVelocityCardProps {
  burnRateData: BurnRateResult;
  budget: number;
}

export function BurnVelocityCard({ burnRateData, budget }: BurnVelocityCardProps) {
  const {
    avgDailySpend,
    projectedTotalSpend,
    isOverrunProjected,
    dayOfExhaustion,
    daysRemaining,
  } = burnRateData;

  const isSafe = !isOverrunProjected;
  
  // Calculate width for the progress bar (max 100%)
  const percentage = Math.min(100, Math.round((projectedTotalSpend / budget) * 100));

  return (
    <div className="glass-card p-5 fade-in-up delay-2 mb-4 relative overflow-hidden group">
      {isOverrunProjected && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-(--debit)/10 blur-3xl pointer-events-none group-hover:bg-(--debit)/20 transition-colors duration-500" />
      )}
      <div className="flex items-center gap-2 mb-4 relative z-10">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isSafe ? 'bg-[#5a9e6f]/20 text-[#64b079]' : 'bg-(--debit)/20 text-(--debit)'}`}>
          {isSafe ? <CheckCircle size={16} /> : <Flame size={16} />}
        </div>
        <div>
          <h3 className="text-[13px] font-bold text-(--text) m-0 uppercase tracking-wider">
            Burn Velocity
          </h3>
          <p className="text-[10px] text-(--text-muted) font-medium">
            Based on your average daily spend of {formatCurrency(avgDailySpend)}
          </p>
        </div>
      </div>

      <div className="relative z-10">
        <div className="flex justify-between items-end mb-2">
          <div className="flex flex-col">
            <span className="text-[11px] text-(--text-secondary) font-medium mb-1">Projected EOM Spend</span>
            <span className={`text-xl font-display leading-none tracking-tight ${isSafe ? 'text-(--text)' : 'text-(--debit)'}`}>
              {formatCurrency(projectedTotalSpend)}
            </span>
          </div>
          <div className="text-right">
             <span className="text-[10px] text-(--text-muted) font-medium mb-1 block">Monthly Budget</span>
             <span className="text-sm font-semibold text-(--text-secondary)">{formatCurrency(budget)}</span>
          </div>
        </div>

        {/* Bar */}
        <div className="h-2 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden w-full mb-3 flex relative">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ease-out ${isSafe ? 'bg-[#5a9e6f]' : 'bg-(--debit)'}`} 
            style={{ width: `${percentage}%` }}
          />
          {/* Budget line indicator */}
          <div className="absolute top-0 bottom-0 right-[0px] w-0.5 bg-black/20 dark:bg-white/20 z-10" />
        </div>

        {/* Narrative Analysis */}
        <div className="p-3 bg-black/4 dark:bg-white/4 rounded-xl border border-black/5 dark:border-white/5">
          {isSafe ? (
             <p className="text-[12px] text-(--text-secondary) m-0 leading-relaxed">
               You're pacing well. If you maintain this velocity, you will finish the month safely under budget with roughly <strong className="text-(--text)">{formatCurrency(budget - projectedTotalSpend)}</strong> to spare.
             </p>
          ) : (
             <div className="flex gap-2.5 items-start">
               <TrendingUp size={14} className="text-(--debit) shrink-0 mt-0.5" />
               <p className="text-[12px] text-(--text-secondary) m-0 leading-relaxed">
                 You are currently projected to exceed your budget. At this rate, your funds will run out around <strong className="text-(--debit)">Day {dayOfExhaustion}</strong> ({daysRemaining} days remaining).
               </p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}

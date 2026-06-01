import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { format } from "date-fns";
import { ChevronRight, Award, TrendingUp, PieChart, CalendarCheck, Wallet } from "lucide-react";
import { updateSheetOpenState } from "../../utils/modalHelper";
import { db } from "../../db/database";
import { formatINR } from "../../utils/currency";

interface MonthlyCloseSummaryProps {
  isOpen: boolean;
  onNext: () => void;
  previousMonthYear: string; // e.g. "2026-05"
}

export function MonthlyCloseSummary({ isOpen, onNext, previousMonthYear }: MonthlyCloseSummaryProps) {
  const [stats, setStats] = useState<{
    txCount: number;
    biggestCategory: string;
    totalSpent: number;
    daysActive: number;
    leftover: number;
  } | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    updateSheetOpenState();

    const loadStats = async () => {
      try {
        const txs = await db.transactions
          .filter((tx) => {
            const txMonth = tx.date.substring(0, 7);
            return txMonth === previousMonthYear && tx.category !== "transfer";
          })
          .toArray();

        let monthNet = 0;
        let total = 0;
        const catMap: Record<string, number> = {};
        const daysSet = new Set<string>();

        for (const tx of txs) {
          daysSet.add(tx.date);
          if (tx.type === "debit") {
            total += tx.amount;
            monthNet -= tx.amount;
            if (tx.category) {
              catMap[tx.category] = (catMap[tx.category] || 0) + tx.amount;
            }
          } else {
            monthNet += tx.amount;
          }
        }

        let biggestCat = "None";
        let maxAmt = 0;
        for (const [cat, amt] of Object.entries(catMap)) {
          if (amt > maxAmt) {
            maxAmt = amt;
            biggestCat = cat;
          }
        }
        
        let leftover = 0;
        const prevSetup = await db.monthSetups
          .where("monthYear")
          .equals(previousMonthYear)
          .first();
          
        if (prevSetup) {
           leftover = prevSetup.openingBalance + monthNet;
        }

        setStats({
          txCount: txs.length,
          biggestCategory: biggestCat,
          totalSpent: total,
          daysActive: daysSet.size,
          leftover,
        });
      } catch (err) {
        console.error("Failed to load month stats", err);
        setStats({ txCount: 0, biggestCategory: "None", totalSpent: 0, daysActive: 0, leftover: 0 });
      }
    };

    loadStats();

    return () => {
      setTimeout(updateSheetOpenState, 0);
    };
  }, [isOpen, previousMonthYear]);

  if (!isOpen || !stats) return null;

  const [y, m] = previousMonthYear.split("-");
  const monthName = format(new Date(parseInt(y), parseInt(m) - 1, 1), "MMMM");

  return createPortal(
    <div className="fixed inset-0 z-[100] bg-(--bg)" role="dialog" aria-modal="true">
      <div className="w-full h-full max-w-md mx-auto flex flex-col p-6 relative overflow-y-auto pt-16">
        
        {stats.txCount === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center fade-in-up">
            <div className="w-20 h-20 rounded-full bg-(--accent)/10 flex items-center justify-center mb-6">
              <CalendarCheck size={40} className="text-(--accent)" />
            </div>
            
            <h2 className="text-3xl font-display italic font-light text-(--text) text-center mb-2">
              Welcome to {format(new Date(), "MMMM")}!
            </h2>
            <p className="text-sm text-(--text-muted) text-center mb-10 max-w-[280px]">
              Let's get your budget set up for this month so you can start tracking your journey.
            </p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center fade-in-up">
            <div className="w-20 h-20 rounded-full bg-(--accent)/10 flex items-center justify-center mb-6">
              <Award size={40} className="text-(--accent)" />
            </div>
            
            <h2 className="text-3xl font-display italic font-light text-(--text) text-center mb-2">
              {monthName} is wrapped!
            </h2>
            <p className="text-sm text-(--text-muted) text-center mb-6 max-w-[280px]">
              Here is a quick look at your ledger from last month.
            </p>

            <div className="w-full flex flex-col gap-3">
              <div className="glass-card p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[rgba(64,160,192,0.15)] flex items-center justify-center shrink-0">
                  <TrendingUp size={20} className="text-[#40a0c0]" />
                </div>
                <div>
                  <p className="text-xs text-(--text-muted) font-semibold uppercase tracking-wider m-0 mb-1">Total Spent</p>
                  <p className="text-xl font-display font-semibold text-(--text) m-0">{formatINR(stats.totalSpent)}</p>
                </div>
              </div>

              <div className="glass-card p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[rgba(90,158,111,0.15)] flex items-center justify-center shrink-0">
                  <Wallet size={20} className="text-(--credit)" />
                </div>
                <div>
                  <p className="text-xs text-(--text-muted) font-semibold uppercase tracking-wider m-0 mb-1">Wallet Left Over</p>
                  <p className="text-xl font-display font-semibold text-(--text) m-0">{formatINR(stats.leftover)}</p>
                </div>
              </div>

              <div className="glass-card p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[rgba(144,96,176,0.15)] flex items-center justify-center shrink-0">
                  <PieChart size={20} className="text-[#9060b0]" />
                </div>
                <div>
                  <p className="text-xs text-(--text-muted) font-semibold uppercase tracking-wider m-0 mb-1">Top Category</p>
                  <p className="text-lg font-sans font-semibold text-(--text) m-0">{stats.biggestCategory}</p>
                </div>
              </div>

              <div className="glass-card p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center shrink-0">
                  <CalendarCheck size={20} className="text-(--text)" />
                </div>
                <div>
                  <p className="text-xs text-(--text-muted) font-semibold uppercase tracking-wider m-0 mb-1">Activity</p>
                  <p className="text-lg font-sans font-semibold text-(--text) m-0">{stats.txCount} transactions across {stats.daysActive} days</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <button
          className="btn-primary w-full py-4 mt-8 flex items-center justify-center gap-2"
          onClick={onNext}
        >
          Set up {format(new Date(), "MMMM")} <ChevronRight size={18} />
        </button>

      </div>
    </div>,
    document.body
  );
}

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { format } from "date-fns";
import {
  ChevronRight,
  Award,
  TrendingUp,
  PieChart,
  CalendarCheck,
  Wallet,
  Sparkles,
} from "lucide-react";
import { updateSheetOpenState } from "../../utils/modalHelper";
import { db } from "../../db/database";
import { formatINR } from "../../utils/currency";
import { PixelArtBackground } from "../ui/PixelArtBackground";

interface MonthlyCloseSummaryProps {
  isOpen: boolean;
  onNext: () => void;
  previousMonthYear: string; // e.g. "2026-05"
}

export function MonthlyCloseSummary({
  isOpen,
  onNext,
  previousMonthYear,
}: MonthlyCloseSummaryProps) {
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
        setStats({
          txCount: 0,
          biggestCategory: "None",
          totalSpent: 0,
          daysActive: 0,
          leftover: 0,
        });
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
    <div
      className="fixed inset-0 z-[100] bg-[#0d0c0b] text-white"
      role="dialog"
      aria-modal="true"
    >
      <PixelArtBackground pattern="portal" opacity={1.0} baseColor="#d97757" />
      
      <div className="w-full h-full max-w-md mx-auto flex flex-col p-6 relative z-10 overflow-y-auto pt-12 pb-24">
        {stats.txCount === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center fade-in-up delay-1">
            <div className="w-24 h-24 rounded-full bg-(--accent)/20 flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(217,119,87,0.3)]">
              <CalendarCheck size={48} className="text-(--accent)" />
            </div>

            <h2 className="text-5xl font-display italic font-normal text-white text-center mb-4 tracking-tight drop-shadow-md">
              Welcome to <span className="text-(--accent)">{format(new Date(), "MMMM")}</span>!
            </h2>
            <p className="text-base text-white/70 text-center mb-10 max-w-[280px]">
              Let's get your budget set up for this month so you can start
              tracking your journey.
            </p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-start mt-8">
            <div className="fade-in-up delay-1 flex flex-col items-center w-full">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-(--accent) to-[#9a4726] flex items-center justify-center mb-6 shadow-[0_8px_32px_rgba(217,119,87,0.4)]">
                <Sparkles size={36} className="text-white" />
              </div>

              <h2 className="text-5xl font-display italic font-normal text-white text-center mb-2 tracking-tight drop-shadow-lg">
                <span className="text-(--accent)">{monthName}</span> is wrapped!
              </h2>
              <p className="text-sm text-white/60 text-center mb-10 max-w-[280px] uppercase tracking-widest font-semibold">
                Your Monthly Ledger
              </p>
            </div>

            {/* Bento Box Grid */}
            <div className="w-full grid grid-cols-2 gap-3 mt-2">
              {/* Hero Item - Full Width */}
              <div className="col-span-2 glass-card-strong bg-black/40 backdrop-blur-xl border-white/10 p-5 rounded-3xl flex flex-col items-center justify-center fade-in-up delay-2 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-(--accent)/20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                <div className="flex items-center gap-2 mb-2 z-10">
                  <TrendingUp size={16} className="text-(--accent)" />
                  <p className="text-[11px] text-white/60 font-bold uppercase tracking-widest m-0">
                    Total Spent
                  </p>
                </div>
                <p className="text-4xl font-display font-semibold text-white m-0 z-10 drop-shadow-sm">
                  {formatINR(stats.totalSpent)}
                </p>
              </div>

              {/* Left Item - Half Width */}
              <div className="col-span-1 glass-card bg-black/40 backdrop-blur-xl border-white/10 p-5 rounded-3xl flex flex-col fade-in-up delay-3 shadow-xl">
                <div className="w-10 h-10 rounded-2xl bg-[rgba(90,158,111,0.2)] border border-[rgba(90,158,111,0.3)] flex items-center justify-center shrink-0 mb-4 shadow-[0_4px_16px_rgba(90,158,111,0.2)]">
                  <Wallet size={20} className="text-[#6bb582]" />
                </div>
                <p className="text-[10px] text-white/60 font-bold uppercase tracking-widest m-0 mb-1">
                  Left Over
                </p>
                <p className="text-xl font-display font-semibold text-white m-0">
                  {formatINR(stats.leftover)}
                </p>
              </div>

              {/* Right Item - Half Width */}
              <div className="col-span-1 glass-card bg-black/40 backdrop-blur-xl border-white/10 p-5 rounded-3xl flex flex-col fade-in-up delay-3 shadow-xl">
                <div className="w-10 h-10 rounded-2xl bg-[rgba(144,96,176,0.2)] border border-[rgba(144,96,176,0.3)] flex items-center justify-center shrink-0 mb-4 shadow-[0_4px_16px_rgba(144,96,176,0.2)]">
                  <PieChart size={20} className="text-[#b582d9]" />
                </div>
                <p className="text-[10px] text-white/60 font-bold uppercase tracking-widest m-0 mb-1">
                  Top Category
                </p>
                <p className="text-lg font-sans font-semibold text-white m-0 line-clamp-1 leading-tight mt-1">
                  {stats.biggestCategory}
                </p>
              </div>

              {/* Footer Item - Full Width */}
              <div className="col-span-2 glass-card bg-black/40 backdrop-blur-xl border-white/10 p-4 rounded-3xl flex items-center gap-4 fade-in-up delay-4 shadow-xl mt-1">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/5">
                  <CalendarCheck size={22} className="text-white/80" />
                </div>
                <div>
                  <p className="text-[10px] text-white/60 font-bold uppercase tracking-widest m-0 mb-1">
                    Activity Record
                  </p>
                  <p className="text-sm font-sans font-medium text-white/90 m-0 leading-snug">
                    {stats.txCount} transactions across {stats.daysActive} days
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-auto pt-8 fade-in-up delay-4 w-full">
          <button
            className="w-full py-4 rounded-full bg-white text-black font-bold text-base flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-transform active:scale-95"
            onClick={onNext}
          >
            Start {format(new Date(), "MMMM")} <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

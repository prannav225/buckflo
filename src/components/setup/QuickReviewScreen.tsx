import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { format } from "date-fns";
import { CheckCircle2, Edit2, ArrowRight } from "lucide-react";
import { updateSheetOpenState } from "../../utils/modalHelper";
import { db, getSpendingWallet, type MonthSetup } from "../../db/database";
import { formatINR } from "../../utils/currency";
import toast from "react-hot-toast";

interface QuickReviewScreenProps {
  isOpen: boolean;
  onComplete: () => void;
  onEdit: () => void; // Triggered if they click "Something changed"
  monthYear: string;
  previousMonthYear: string;
}

export function QuickReviewScreen({
  isOpen,
  onComplete,
  onEdit,
  monthYear,
  previousMonthYear,
}: QuickReviewScreenProps) {
  const [prevSetup, setPrevSetup] = useState<MonthSetup | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    updateSheetOpenState();

    const loadPrev = async () => {
      try {
        const setup = await db.monthSetups
          .where("monthYear")
          .equals(previousMonthYear)
          .first();
        setPrevSetup(setup || null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadPrev();

    return () => {
      setTimeout(updateSheetOpenState, 0);
    };
  }, [isOpen, previousMonthYear]);

  if (!isOpen) return null;

  const handleLooksGood = async () => {
    setLoading(true);
    try {
      const spendingAcc = await getSpendingWallet();
      if (!spendingAcc?.id) throw new Error("Spending account not found");

      // Auto-calculate the opening balance for the new month based on the closing of the previous month.
      // Wait, currentBalance in accounts is the live balance. We can just use that!
      const openingBal = spendingAcc.currentBalance;

      await db.monthSetups.add({
        monthYear,
        openingBalance: openingBal,
        monthlyBudget: prevSetup?.monthlyBudget || 0,
        accountId: spendingAcc.id,
        categoryBudgets: prevSetup?.categoryBudgets || {},
      });

      toast.success("Ready for " + format(new Date(), "MMMM") + "!");
      onComplete();
    } catch (err) {
      console.error(err);
      toast.error("Failed to setup month.");
    } finally {
      setLoading(false);
    }
  };

  const currentMonthName = format(new Date(), "MMMM");
  const prevMonthName = format(new Date(parseInt(previousMonthYear.split("-")[0]), parseInt(previousMonthYear.split("-")[1]) - 1, 1), "MMMM");

  if (loading) return null;

  return createPortal(
    <div className="sheet-overlay" role="dialog" aria-modal="true">
      <div 
        className="sheet-panel" 
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          height: '85dvh', 
          maxHeight: '85dvh',
          padding: 0, 
          overflow: 'hidden' 
        }}
      >
        <div className="sheet-handle shrink-0 mt-4" />
        
        <div className="flex-1 overflow-y-auto px-6 pb-6 mt-2">
          <h2 className="text-2xl font-bold text-(--text) mb-2">Ready for {currentMonthName}?</h2>
          <p className="text-sm text-(--text-muted) mb-6 leading-relaxed">
            Here is your budget plan carried over from {prevMonthName}. Let's make this month count!
          </p>

          {prevSetup ? (
            <div className="flex flex-col gap-4 mb-2">
              <div className="glass-card p-5">
                <p className="text-xs text-(--text-muted) font-semibold uppercase tracking-wider mb-1">Monthly Budget</p>
                <p className="text-2xl font-display font-semibold text-(--text) m-0">
                  {formatINR(prevSetup.monthlyBudget)}
                </p>
              </div>

              {prevSetup.categoryBudgets && Object.keys(prevSetup.categoryBudgets).length > 0 && (
                <div className="glass-card p-5">
                  <p className="text-xs text-(--text-muted) font-semibold uppercase tracking-wider mb-4">Category Limits</p>
                  <div className="flex flex-col gap-3">
                    {Object.entries(prevSetup.categoryBudgets).map(([cat, amt]) => (
                      <div key={cat} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-(--text)">{cat}</span>
                        <span className="text-sm font-semibold text-(--text-muted)">{formatINR(amt)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="glass-card p-5 mb-4">
              <p className="text-sm text-(--text-muted) m-0">No previous setup found. Let's create a fresh one for {currentMonthName}.</p>
            </div>
          )}
        </div>

        <div className="px-6 py-4 pb-[calc(16px+env(safe-area-inset-bottom,16px))] border-t border-black/5 dark:border-white/5 flex flex-col gap-3 bg-white/70 dark:bg-black/70 backdrop-blur-md shrink-0">
          {prevSetup && (
            <button
              className="btn-primary w-full py-3.5 text-sm"
              onClick={handleLooksGood}
              disabled={loading}
            >
              <CheckCircle2 size={18} /> Looks good to me
            </button>
          )}
          <button
            className="btn-secondary w-full py-3.5 text-sm"
            onClick={onEdit}
            disabled={loading}
          >
            {prevSetup ? <><Edit2 size={16} /> Major life change? Start fresh</> : <><ArrowRight size={16} /> Setup {currentMonthName}</>}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

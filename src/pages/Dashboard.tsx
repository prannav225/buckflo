/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Wallet } from "lucide-react";
import { db, deletePreset } from "../db/database";
import { ImportModal } from "../components/transactions/ImportModal";
import { format } from "date-fns";
import {
  useAccount,
  useMonthSetup,
  useRecentTransactions,
  useMonthSummary,
  useTransactions,
} from "../db/hooks";
import { TransactionCard } from "../components/transactions/TransactionRow";
import { TransferSheet } from "../components/transactions/TransferSheet";
import { IncomeWizard } from "../components/setup/IncomeWizard";
import { MonthlyCloseSummary } from "../components/setup/MonthlyCloseSummary";
import { QuickReviewScreen } from "../components/setup/QuickReviewScreen";
import {
  DashboardHeroCard,
  SavingsQuickCard,
} from "../components/DashboardCards";
import {
  getCurrentMonthYear,
  getDaysRemainingInMonth,
} from "../utils/dateUtils";
import {
  useFrequentPresets,
  type FrequentPreset,
  useSmartAllocationPrompt,
} from "../hooks/useAnalytics";
import { useMonthComparison } from "../hooks/useMonthComparison";
import { CreatePresetSheet } from "../components/transactions/CreatePresetSheet";
import toast from "react-hot-toast";
import { useProfile } from "../hooks/useProfile";
import { useLiveQuery } from "dexie-react-hooks";
import { SavingsNudgeSheet } from "../components/savings/SavingsNudgeSheet";
import { useRecognitionCopy } from "../hooks/useRecognitionCopy";
import {
  DataPortabilityCard,
  QuickPresets,
  SavingsNudgeCard,
  TotalSpentNoBudgetCard,
  SmartAllocationAdvisorCard,
} from "../components/dashboard/DashboardWidgets";
import { useQuickPresetLog } from "../hooks/useQuickPresetLog";

export function Dashboard() {
  const navigate = useNavigate();
  const { profile, updateProfile } = useProfile();

  const [showTransfer, setShowTransfer] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isImportDismissed, setIsImportDismissed] = useState(
    () => localStorage.getItem("buckflo_import_dismissed") === "true",
  );
  const [isCreatePresetOpen, setIsCreatePresetOpen] = useState(false);
  const [presetToEdit, setPresetToEdit] = useState<FrequentPreset | null>(null);

  const [showWizard, setShowWizard] = useState(false);
  const [showCloseSummary, setShowCloseSummary] = useState(false);
  const [showQuickReview, setShowQuickReview] = useState(false);
  const [showSavingsNudgeSheet, setShowSavingsNudgeSheet] = useState(false);
  const [advisorDismissed, setAdvisorDismissed] = useState(false);

  const handleDismissImportCard = () => {
    localStorage.setItem("buckflo_import_dismissed", "true");
    setIsImportDismissed(true);
  };

  useEffect(() => {
    const checkEmptyDB = async () => {
      try {
        const allTxs = await db.transactions.toArray();
        const realTxs = allTxs.filter(
          (tx) =>
            tx.category !== "adjustment" &&
            tx.category !== "transfer" &&
            tx.category !== "Transfer" &&
            tx.category !== "starting-transfer",
        );
        if (realTxs.length === 0) {
          localStorage.removeItem("buckflo_import_dismissed");
          setIsImportDismissed(false);
        }
      } catch (err) {
        console.error("Failed to check database transaction records:", err);
      }
    };
    checkEmptyDB();
  }, []);

  const [transferConfig, setTransferConfig] = useState<{
    direction: "savings_to_expenditure" | "expenditure_to_savings";
    amount: string;
    note: string;
  }>({
    direction: "savings_to_expenditure",
    amount: "",
    note: "",
  });

  const handleTopUp = () => {
    setTransferConfig({
      direction: "savings_to_expenditure",
      amount: "",
      note: "Transfer to Spending",
    });
    setShowTransfer(true);
  };

  const monthYear = getCurrentMonthYear();

  const isMonthSkipped =
    localStorage.getItem(`buckflo_skipped_setup_${monthYear}`) === "true";
  const monthSetup = useMonthSetup(monthYear);
  const hasAutoPrompted = useRef(false);

  useEffect(() => {
    if (
      monthSetup === null &&
      !isMonthSkipped &&
      !hasAutoPrompted.current &&
      profile
    ) {
      if (profile.wizardCompleted === false) {
        setShowWizard(true);
      } else {
        setShowCloseSummary(true);
      }
      hasAutoPrompted.current = true;
    }
  }, [monthSetup, isMonthSkipped, profile]);

  const handleQuickReviewEdit = () => {
    setShowQuickReview(false);
    setShowWizard(true);
  };

  const getPreviousMonthStr = () => {
    const [yearStr, monthStr] = monthYear.split("-");
    let y = parseInt(yearStr, 10);
    let m = parseInt(monthStr, 10) - 1;
    if (m === 0) {
      m = 12;
      y -= 1;
    }
    return `${y}-${m.toString().padStart(2, "0")}`;
  };

  const spendingAcc = useAccount("spending");
  const savingsAcc = useAccount("savings");

  const hasSavingsTxs = useLiveQuery(
    async () => {
      if (!savingsAcc?.id) return false;
      const count = await db.transactions
        .where("accountId")
        .equals(savingsAcc.id)
        .count();
      return count > 0;
    },
    [savingsAcc?.id],
    false,
  );

  const hasSavingsData = (savingsAcc?.currentBalance ?? 0) > 0 || hasSavingsTxs;
  const isNudgeDismissed = profile?.savingsNudgeDismissed === true;

  const shouldShowSavingsCard = hasSavingsData || isNudgeDismissed;
  const isSavingsDeEmphasized = !hasSavingsData && isNudgeDismissed;

  const recentTxs = useRecentTransactions(undefined, 5);
  const allMonthTxs = useTransactions(spendingAcc?.id, monthYear);
  const summary = useMonthSummary(allMonthTxs, monthSetup?.openingBalance ?? 0);
  const monthComparison = useMonthComparison();
  const recognitionText = useRecognitionCopy();
  // const transactionCount = useLiveQuery(() => db.transactions.count(), []) ?? 0;

  const daysLeft = getDaysRemainingInMonth();
  const budget = monthSetup?.monthlyBudget ?? 0;
  const spent = summary.totalExpense;
  const remaining = budget - spent;
  const spentPct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  const overBudget = spent > budget && budget > 0;
  const dailyRemaining =
    daysLeft > 0
      ? Math.max(0, Math.min(remaining, summary.closingBalance)) / daysLeft
      : 0;

  const presets = useFrequentPresets(6);
  const advisorData = useSmartAllocationPrompt();

  const handleDismissAdvisor = () => {
    localStorage.setItem("buckflo_advisor_dismissed", Date.now().toString());
    setAdvisorDismissed(true);
  };

  const { logQuickPreset } = useQuickPresetLog();

  const handlePresetClick = (preset: FrequentPreset) => {
    logQuickPreset(preset);
  };

  const handleDeletePreset = async (presetId: number) => {
    try {
      await deletePreset(presetId);
      toast.success("Preset deleted");
    } catch {
      toast.error("Failed to delete preset");
    }
  };

  return (
    <>
      {monthSetup === undefined ? (
        <div className="px-0">
          <div className="skeleton h-[220px] mb-3" />
          <div className="skeleton h-[72px] mb-3" />
          <div className="skeleton h-[300px]" />
        </div>
      ) : (
        <>
          <div className="pb-4 px-1 fade-in-up flex items-center justify-between">
            <h2 className="font-display text-2xl font-normal! text-(--text) italic tracking-wide m-0 leading-none">
              <span className="italic text-(--text-secondary)">
                {new Date().getHours() < 12
                  ? "Good morning,"
                  : new Date().getHours() < 17
                    ? "Good afternoon,"
                    : "Good evening,"}
              </span>{" "}
              {profile?.displayName || "Sir"} !
            </h2>
            <p className="font-sans text-[10px] font-normal! text-(--accent) uppercase tracking-widest mb-1.5 flex items-center justify-start gap-1.5 whitespace-nowrap">
              {format(new Date(), "EEE, MMM do")}
              <span className="w-1.5 h-1.5 rounded-full bg-(--accent)" />
            </p>
          </div>
          <DashboardHeroCard
            balance={spendingAcc?.currentBalance ?? 0}
            monthSetup={monthSetup}
            monthYear={monthYear}
            spent={spent}
            budget={budget}
            spentPct={spentPct}
            overBudget={overBudget}
            dailyRemaining={dailyRemaining}
            onTopUp={handleTopUp}
            onSetup={isMonthSkipped ? undefined : () => setShowWizard(true)}
            monthComparison={monthComparison}
            recognitionText={recognitionText}
          />

          {!monthSetup && spent > 0 && (
            <TotalSpentNoBudgetCard
              spent={spent}
              setShowWizard={setShowWizard}
            />
          )}

          {advisorData?.shouldShow && !advisorDismissed && (
            <SmartAllocationAdvisorCard
              surplus={advisorData.surplus}
              suggestedAmount={advisorData.suggestedAmount}
              onTransfer={(amount) => {
                setTransferConfig({
                  direction: "expenditure_to_savings",
                  amount: amount,
                  note: "Smart Allocation Transfer",
                });
                setShowTransfer(true);
              }}
              onDismiss={handleDismissAdvisor}
            />
          )}

          {shouldShowSavingsCard && (
            <SavingsQuickCard
              savingsBalance={savingsAcc?.currentBalance ?? 0}
              onClick={() => navigate("/savings")}
              deEmphasized={isSavingsDeEmphasized}
            />
          )}

          {!hasSavingsData && !isNudgeDismissed && profile && monthSetup && (
            <SavingsNudgeCard
              updateProfile={updateProfile}
              setShowSavingsNudgeSheet={setShowSavingsNudgeSheet}
            />
          )}

          {!isImportDismissed && (
            <DataPortabilityCard
              setIsImportOpen={setIsImportOpen}
              handleDismissImportCard={handleDismissImportCard}
            />
          )}

          <QuickPresets
            presets={presets}
            handlePresetClick={handlePresetClick}
            handleDeletePreset={handleDeletePreset}
            setPresetToEdit={setPresetToEdit}
            setIsCreatePresetOpen={setIsCreatePresetOpen}
          />

          <div className="fade-in-up delay-2 mt-8">
            <div className="flex justify-between items-center mb-3.5">
              <div className="flex items-center gap-2">
                <h2 className="text-[11px] font-semibold text-(--text-muted) uppercase tracking-[0.06em] m-0">
                  Recent Transactions
                </h2>
              </div>
              <button
                className="btn-ghost text-[0.8125rem] py-1 px-2 gap-0.5"
                onClick={() =>
                  navigate(`/monthly/transactions?month=${monthYear}`)
                }
                id="btn-view-all"
              >
                See all <ChevronRight size={14} />
              </button>
            </div>

            {recentTxs.length === 0 ? (
              <div className="glass-card empty-state">
                <Wallet size={32} className="empty-state-icon" />
                <p className="empty-state-title">No transactions logged yet</p>
                <p className="empty-state-desc">
                  Tap <strong>+</strong> in the header to log your first entry.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {recentTxs.map((tx) => (
                  <TransactionCard key={tx.id} transaction={tx} />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {showTransfer && (
        <TransferSheet
          isOpen={showTransfer}
          onClose={() => setShowTransfer(false)}
          defaultDirection={transferConfig.direction}
          defaultAmount={transferConfig.amount}
          defaultNote={transferConfig.note}
        />
      )}

      {isImportOpen && (
        <ImportModal
          isOpen={isImportOpen}
          onClose={() => setIsImportOpen(false)}
          onSuccess={() => setIsImportOpen(false)}
          activeTab={"spending"}
        />
      )}

      {isCreatePresetOpen && (
        <CreatePresetSheet
          isOpen={isCreatePresetOpen}
          onClose={() => setIsCreatePresetOpen(false)}
          presetToEdit={presetToEdit || undefined}
        />
      )}

      {showWizard && (
        <IncomeWizard
          isOpen={showWizard}
          onComplete={() => setShowWizard(false)}
          onClose={() => setShowWizard(false)}
        />
      )}

      {showCloseSummary && (
        <MonthlyCloseSummary
          isOpen={showCloseSummary}
          onNext={() => {
            setShowCloseSummary(false);
            if (monthSetup === null && !isMonthSkipped) {
              setShowQuickReview(true);
            }
          }}
          previousMonthYear={getPreviousMonthStr()}
        />
      )}

      {showQuickReview && (
        <QuickReviewScreen
          isOpen={showQuickReview}
          monthYear={monthYear}
          previousMonthYear={getPreviousMonthStr()}
          onEdit={handleQuickReviewEdit}
          onComplete={() => setShowQuickReview(false)}
        />
      )}

      {showSavingsNudgeSheet && (
        <SavingsNudgeSheet
          isOpen={showSavingsNudgeSheet}
          onClose={() => setShowSavingsNudgeSheet(false)}
          spendingBalance={summary.closingBalance}
          onSuccess={() => setShowSavingsNudgeSheet(false)}
        />
      )}
    </>
  );
}

/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Line } from "react-chartjs-2";
import { Calendar, Sparkles, BrainCircuit } from "lucide-react";
import {
  RichWordFadeIn,
  type WordSegment,
} from "../components/ui/rich-word-fade-in";
import { commonOptions } from "../utils/chartConfig";
import { getCurrentMonthYear, formatMonthYear } from "../utils/dateUtils";
import { formatCurrency } from "../utils/currency";
import { useAccount, useMonthSetup, useTransactions } from "../db/hooks";
import {
  useHistoricalData,
  useWeekOverWeek,
  useMonthOverMonth,
  useBurnRate,
} from "../hooks/useAnalytics";
import { MonthPicker } from "../components/MonthPicker";
import { BurnVelocityCard } from "../components/insights/BurnVelocityCard";
import { SegmentedControl } from "../components/ui/SegmentedControl";
import { CollapsibleInsightCard } from "../components/insights/CollapsibleInsightCard";
import { BudgetOverviewCard } from "../components/monthly/BudgetOverviewCard";

const SMART_SUMMARY_STORAGE_KEY = "buckflo_smart_summary_state";

function loadSummaryState() {
  try {
    const data = localStorage.getItem(SMART_SUMMARY_STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch {
    /* empty */
  }
  return { isOpen: false, seenHashes: {} };
}

function saveSummaryState(state: {
  isOpen: boolean;
  seenHashes: Record<string, string>;
}) {
  localStorage.setItem(SMART_SUMMARY_STORAGE_KEY, JSON.stringify(state));
}

export function Insights() {
  const [searchParams, setSearchParams] = useSearchParams();
  const monthYear = searchParams.get("month") || getCurrentMonthYear();

  const spendingAcc = useAccount("spending");
  const monthSetup = useMonthSetup(monthYear);
  const transactions = useTransactions(spendingAcc?.id, monthYear);

  const [chartRange, setChartRange] = useState<"3" | "6" | "12">("6");
  const historicalData = useHistoricalData(parseInt(chartRange));

  // Spend breakdown by category (for debits only)
  const categorySpend: { [key: string]: number } = {};
  let totalExpense = 0;

  for (const tx of transactions) {
    if (tx.type === "debit") {
      if (
        tx.isCommitted ||
        tx.category === "transfer" ||
        tx.category === "Transfer" ||
        tx.category === "starting-transfer"
      ) {
        continue;
      }
      const cat = tx.category || "Other";
      categorySpend[cat] = (categorySpend[cat] || 0) + tx.amount;
      totalExpense += tx.amount;
    }
  }

  const sortedCategories = Object.entries(categorySpend)
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount);

  const handleMonthChange = (newMonth: string) => {
    setSearchParams({ month: newMonth }, { replace: true });
  };

  const wowData = useWeekOverWeek();
  const momData = useMonthOverMonth(monthYear);
  const highestCategory =
    sortedCategories.length > 0 ? sortedCategories[0].name : null;

  const burnRateData = useBurnRate(
    monthSetup?.monthlyBudget || 0,
    totalExpense,
  );

  const [isGenerating, setIsGenerating] = useState(false);
  const [summaryState, setSummaryState] = useState(loadSummaryState());

  const isCurrentMonth = monthYear === getCurrentMonthYear();

  // Compute the summary segments unconditionally to generate the hash
  const summarySegments: WordSegment[] = [];
  if (isCurrentMonth) {
    summarySegments.push({ text: "You spent " });
    summarySegments.push({
      text: formatCurrency(wowData.thisWeekTotal),
      className: "font-bold text-(--text)",
    });
    summarySegments.push({ text: " over the last 7 days." });

    if (wowData.lastWeekTotal > 0) {
      summarySegments.push({ text: "This is " });
      summarySegments.push({
        text: `${Math.abs(wowData.percentChange)}% ${wowData.percentChange > 0 ? "more" : "less"}`,
        className: `font-bold ${wowData.percentChange > 0 ? "text-[#b82d23]" : "text-(--credit)"}`,
      });
      summarySegments.push({ text: " than the previous week." });
    }

    if (highestCategory) {
      summarySegments.push({
        text: `Your highest drain for ${formatMonthYear(monthYear)} is `,
      });
      summarySegments.push({
        text: highestCategory,
        className: "font-bold text-(--text)",
      });
      summarySegments.push({ text: "." });
    }
  } else {
    // Historical Month Narrative
    summarySegments.push({
      text: `In ${formatMonthYear(monthYear)}, you spent a total of `,
    });
    summarySegments.push({
      text: formatCurrency(momData.thisMonthTotal),
      className: "font-bold text-(--text)",
    });
    summarySegments.push({ text: "." });

    if (momData.lastMonthTotal > 0) {
      summarySegments.push({ text: " That was " });
      summarySegments.push({
        text: `${Math.abs(momData.percentChange)}% ${momData.percentChange > 0 ? "more" : "less"}`,
        className: `font-bold ${momData.percentChange > 0 ? "text-[#b82d23]" : "text-(--credit)"}`,
      });
      summarySegments.push({ text: " than the month prior." });
    }

    if (highestCategory) {
      summarySegments.push({ text: " Your highest spending category was " });
      summarySegments.push({
        text: highestCategory,
        className: "font-bold text-(--text)",
      });
      summarySegments.push({ text: "." });
    } else {
      summarySegments.push({ text: " You had no recorded expenses." });
    }
  }

  const currentHash = summarySegments.map((s) => s.text).join("");
  const hasNewSummary =
    summaryState.seenHashes[monthYear] &&
    summaryState.seenHashes[monthYear] !== currentHash;
  const shouldShowSummary = summaryState.isOpen && !hasNewSummary;

  // Auto-save the hash for a newly visited month if the widget is globally open
  useEffect(() => {
    if (summaryState.isOpen && !summaryState.seenHashes[monthYear]) {
      const newState = {
        ...summaryState,
        seenHashes: { ...summaryState.seenHashes, [monthYear]: currentHash },
      };
      setSummaryState(newState);
      saveSummaryState(newState);
    }
  }, [
    summaryState.isOpen,
    summaryState.seenHashes,
    monthYear,
    currentHash,
    summaryState,
  ]);

  const handleGenerateSummary = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      const newState = {
        isOpen: true,
        seenHashes: { ...summaryState.seenHashes, [monthYear]: currentHash },
      };
      setSummaryState(newState);
      saveSummaryState(newState);
    }, 1500);
  };

  return (
    <>
      {/* ── Compact Month Filter ────────────────────────────────────────── */}
      <div className="fade-in-up flex justify-center mb-5">
        <MonthPicker
          monthYear={monthYear}
          onChange={handleMonthChange}
          compact={true}
        />
      </div>

      {/* ── Burn Velocity Meter (Current Month Only) ────────────────────── */}
      {isCurrentMonth &&
      monthSetup?.monthlyBudget &&
      monthSetup.monthlyBudget > 0 &&
      totalExpense > 0 ? (
        <BurnVelocityCard
          burnRateData={burnRateData}
          budget={monthSetup.monthlyBudget}
        />
      ) : null}

      {/* ── Narrative Insights Card ─────────────────────────────────────── */}
      <CollapsibleInsightCard
        isOpen={shouldShowSummary || isGenerating}
        onOpen={handleGenerateSummary}
        title="Smart Summary"
        tooltipText="Tap to analyze your recent spending patterns."
        tooltipId="smart-summary-info"
        actionText="Generate"
        icon={<Sparkles size={16} />}
        colorScheme="accent"
        delayClass="delay-1"
      >
        <div className="p-5 relative">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-linear-to-br from-(--accent)/20 to-transparent flex items-center justify-center">
              <BrainCircuit size={14} className="text-(--accent)" />
            </div>
            <h3 className="text-[13px] font-bold text-(--text) m-0 uppercase tracking-wider opacity-80">
              Smart Analysis
            </h3>
          </div>

          {isGenerating ? (
            <div className="flex flex-col gap-2.5 animate-pulse">
              <div className="h-3.5 bg-black/5 dark:bg-white/5 rounded-full w-full"></div>
              <div className="h-3.5 bg-black/5 dark:bg-white/5 rounded-full w-[85%]"></div>
              <div className="h-3.5 bg-black/5 dark:bg-white/5 rounded-full w-[60%]"></div>
            </div>
          ) : (
            <div className="text-[14px] leading-[1.6] text-(--text-secondary) font-medium">
              <RichWordFadeIn segments={summarySegments} delay={0.1} />
            </div>
          )}
        </div>
      </CollapsibleInsightCard>

      {/* ── Category Spend breakdown ────────────────────────────────────── */}
      {sortedCategories.length > 0 ? (
        <BudgetOverviewCard
          sortedCategories={sortedCategories}
          monthSetup={monthSetup || undefined}
          totalExpense={totalExpense}
        />
      ) : (
        <div className="glass-card empty-state px-5 py-10 mt-3 fade-in-up delay-3">
          <Calendar size={32} className="empty-state-icon" />
          <p className="empty-state-title">No category spend recorded</p>
          <p className="empty-state-desc">
            No spending entries logged for {formatMonthYear(monthYear)}.
          </p>
        </div>
      )}

      {/* ── Spending Trend Chart Card ───────────────────────────────────── */}
      <div className="glass-card fade-in-up delay-2 mb-4 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-xs font-semibold text-(--text-secondary) uppercase tracking-wider mb-1">
              Spending Trend
            </h3>
            <p className="text-[0.6875rem] text-(--text-muted) m-0">
              Your overall spending trends over time
            </p>
          </div>
          <div className="w-[180px] sm:w-[200px]">
            <SegmentedControl
              options={["3", "6", "12"] as const}
              value={chartRange}
              onChange={(val) => setChartRange(val)}
              renderLabel={(val) => `${val} M`}
              idPrefix="range"
            />
          </div>
        </div>

        {historicalData.length > 0 ? (
          <div className="h-[180px] w-full mt-2">
            <Line
              data={{
                labels: historicalData.map((d) => d.label),
                datasets: [
                  {
                    label: "Spend",
                    data: historicalData.map((d) => d.totalDebited),
                    borderColor: "#d97757", // var(--accent)
                    backgroundColor: (context) => {
                      const ctx = context.chart.ctx;
                      const gradient = ctx.createLinearGradient(0, 0, 0, 150);
                      gradient.addColorStop(0, "rgba(217, 119, 87, 0.2)");
                      gradient.addColorStop(1, "rgba(217, 119, 87, 0)");
                      return gradient;
                    },
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 4,
                    borderWidth: 2.5,
                  },
                ],
              }}
              options={commonOptions}
            />
          </div>
        ) : (
          <div className="py-12 text-center text-(--text-muted) text-xs">
            No historical spending trend records found
          </div>
        )}
      </div>

      {/* ── Savings Trend Chart Card ─────────────────────────────────────── */}
      <div className="glass-card fade-in-up delay-2 mb-4 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-xs font-semibold text-(--text-secondary) uppercase tracking-wider mb-1">
              Savings Trend
            </h3>
            <p className="text-[0.6875rem] text-(--text-muted) m-0">
              Your overall savings balance over time
            </p>
          </div>
        </div>

        {historicalData.length > 0 ? (
          <div className="h-[180px] w-full mt-2">
            <Line
              data={{
                labels: historicalData.map((d) => d.label),
                datasets: [
                  {
                    label: "Savings Balance",
                    data: historicalData.map((d) => d.savingsBalance),
                    borderColor: "#5a9e6f", // var(--credit)
                    backgroundColor: (context) => {
                      const ctx = context.chart.ctx;
                      const gradient = ctx.createLinearGradient(0, 0, 0, 150);
                      gradient.addColorStop(0, "rgba(90, 158, 111, 0.2)");
                      gradient.addColorStop(1, "rgba(90, 158, 111, 0)");
                      return gradient;
                    },
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 4,
                    borderWidth: 2.5,
                  },
                ],
              }}
              options={commonOptions}
            />
          </div>
        ) : (
          <div className="py-12 text-center text-(--text-muted) text-xs">
            No historical savings trend records found
          </div>
        )}
      </div>
    </>
  );
}

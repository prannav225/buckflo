import { useState } from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { SegmentedControl } from "../ui/SegmentedControl";
import { hapticFeedback } from "../../utils/haptics";

interface TransactionFiltersProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  minAmount: string;
  setMinAmount: (val: string) => void;
  maxAmount: string;
  setMaxAmount: (val: string) => void;
  sortBy: "date_desc" | "amount_desc" | "amount_asc";
  setSortBy: (val: "date_desc" | "amount_desc" | "amount_asc") => void;
  txTypeFilter: "all" | "expense" | "income" | "transfer";
  setTxTypeFilter: (val: "all" | "expense" | "income" | "transfer") => void;
  onResetPage: () => void;
}

export function TransactionFilters({
  searchQuery,
  setSearchQuery,
  minAmount,
  setMinAmount,
  maxAmount,
  setMaxAmount,
  sortBy,
  setSortBy,
  txTypeFilter,
  setTxTypeFilter,
  onResetPage,
}: TransactionFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="fade-in-up delay-2 flex flex-col gap-2 mb-4">
      <div className="flex items-center gap-2">
        <div className="bg-(--bg-glass) [backdrop-filter:var(--glass-blur)] [-webkit-backdrop-filter:var(--glass-blur)] border border-black/8 dark:border-white/6 rounded-xl flex-1 flex items-center gap-2 px-3 h-[38px]">
          <Search size={15} className="text-(--text-muted) shrink-0" />
          <input
            type="text"
            placeholder="Search desc, category, amount..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              onResetPage();
            }}
            className="w-full bg-transparent border-none outline-none text-[0.8125rem] text-(--text) py-1 placeholder-(--text-muted)"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                onResetPage();
              }}
              className="bg-transparent border-none cursor-pointer p-0.5 flex items-center justify-center text-(--text-muted) hover:text-(--text)"
            >
              <X size={13} />
            </button>
          )}
        </div>

        <button
          onClick={() => {
            hapticFeedback.light();
            setShowFilters(!showFilters);
          }}
          className={`p-0 rounded-xl flex items-center justify-center cursor-pointer shrink-0 transition-all w-[38px] h-[38px] outline-none ${
            showFilters
              ? "bg-(--accent)/10 text-(--accent) border border-(--accent)/40 shadow-xs"
              : "bg-(--bg-glass) text-(--text-muted) border border-black/8 dark:border-white/6 hover:text-(--text) [backdrop-filter:var(--glass-blur)] [-webkit-backdrop-filter:var(--glass-blur)]"
          }`}
          title="Filter & Sort Options"
        >
          <SlidersHorizontal size={15} />
        </button>
      </div>

      {/* Expandable Filter Panel */}
      {showFilters && (
        <div className="glass-card p-4 flex flex-col gap-4 text-xs animate-slide-down">
          {/* Cost Filter Fields */}
          <div className="grid grid-cols-2 gap-3 text-left">
            <div>
              <label className="block text-(--text-muted) font-semibold mb-1">
                Min Amount (Cost)
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-2.5 text-(--text-muted)">
                  ₹
                </span>
                <input
                  type="number"
                  placeholder="Min"
                  value={minAmount}
                  onChange={(e) => {
                    setMinAmount(e.target.value);
                    onResetPage();
                  }}
                  className="w-full pl-6 pr-2 py-1.5 bg-black/5 dark:bg-white/5 border border-black/8 dark:border-white/6 rounded-xl outline-none text-(--text)"
                />
              </div>
            </div>
            <div>
              <label className="block text-(--text-muted) font-semibold mb-1">
                Max Amount (Cost)
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-2.5 text-(--text-muted)">
                  ₹
                </span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxAmount}
                  onChange={(e) => {
                    setMaxAmount(e.target.value);
                    onResetPage();
                  }}
                  className="w-full pl-6 pr-2 py-1.5 bg-black/5 dark:bg-white/5 border border-black/8 dark:border-white/6 rounded-xl outline-none text-(--text)"
                />
              </div>
            </div>
          </div>

          {/* Quick Min Cost Presets */}
          <div className="text-left">
            <span className="block text-(--text-muted) font-semibold mb-1.5">
              Quick Cost Thresholds
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: "All", value: "" },
                { label: "≥ ₹100", value: "100" },
                { label: "≥ ₹500", value: "500" },
                { label: "≥ ₹1,000", value: "1000" },
                { label: "≥ ₹5,000", value: "5000" },
              ].map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => {
                    hapticFeedback.light();
                    setMinAmount(preset.value);
                    onResetPage();
                  }}
                  className={`py-1 px-2.5 rounded-full text-[10px] font-semibold border cursor-pointer transition-colors ${
                    minAmount === preset.value
                      ? "bg-(--accent) text-white border-transparent"
                      : "bg-black/5 dark:bg-white/5 border-black/8 dark:border-white/6 text-(--text)"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Transaction Type Filter */}
          <div className="text-left">
            <label className="block text-(--text-muted) font-semibold mb-1.5">
              Transaction Type
            </label>
            <SegmentedControl
              options={["all", "expense", "income", "transfer"] as const}
              value={txTypeFilter}
              onChange={(val) => {
                setTxTypeFilter(val);
                onResetPage();
              }}
              idPrefix="tx-type"
              className="w-full"
            />
          </div>

          {/* Sorting Options */}
          <div className="text-left">
            <label className="block text-(--text-muted) font-semibold mb-1.5">
              Sort Transactions By
            </label>
            <SegmentedControl
              options={["date_desc", "amount_desc", "amount_asc"] as const}
              value={sortBy}
              onChange={(val) => {
                setSortBy(val);
                onResetPage();
              }}
              idPrefix="sort"
              renderLabel={(val) => {
                if (val === "date_desc") return "Date";
                if (val === "amount_desc") return "Cost (High)";
                return "Cost (Low)";
              }}
              className="w-full"
            />
          </div>

          {/* Reset Filters */}
          {(minAmount || maxAmount || sortBy !== "date_desc" || txTypeFilter !== "all") && (
            <div className="flex justify-end pt-1 border-t border-black/5 dark:border-white/5">
              <button
                onClick={() => {
                  hapticFeedback.light();
                  setMinAmount("");
                  setMaxAmount("");
                  setSortBy("date_desc");
                  setTxTypeFilter("all");
                  onResetPage();
                }}
                className="text-(--accent) hover:underline font-semibold border-0 bg-transparent cursor-pointer p-0 font-sans text-xs"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

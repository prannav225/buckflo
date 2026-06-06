import { useState, useRef, useEffect } from "react";
import {
  Search,
  X,
  SlidersHorizontal,
  Calendar,
  ArrowDown,
  ArrowUp,
} from "lucide-react";
import { hapticFeedback } from "../../utils/haptics";
import { useCategories } from "../../hooks/useCategories";
import { CustomDropdown } from "../layout/CustomDropdown";

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
  categoryFilter: string;
  setCategoryFilter: (val: string) => void;
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
  categoryFilter,
  setCategoryFilter,
  onResetPage,
}: TransactionFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleBtnRef = useRef<HTMLButtonElement>(null);
  const categories = useCategories();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        showFilters &&
        panelRef.current &&
        !panelRef.current.contains(target) &&
        toggleBtnRef.current &&
        !toggleBtnRef.current.contains(target)
      ) {
        setShowFilters(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showFilters]);

  const categoryOptions = [
    { value: "all", label: "All Categories" },
    { value: "Uncategorized", label: "Uncategorized" },
    ...categories.map((c) => ({ value: c.name, label: c.name })),
  ];

  const hasAdvancedFilters = minAmount || maxAmount;

  return (
    <div className="fade-in-up delay-2 flex flex-col gap-2 mb-4 relative z-50">
      {/* Top Row: Search */}
      <div className="bg-(--bg-glass) [backdrop-filter:var(--glass-blur)] border border-black/8 dark:border-white/6 rounded-full flex items-center gap-2 px-3 h-[38px] w-full">
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

      {/* Quick Filters Row (Always Visible) */}
      <div className="flex flex-wrap items-center gap-2">
        <CustomDropdown
          variant="chip"
          containerClassName="flex-1 min-w-0"
          isActive={txTypeFilter !== "all"}
          value={txTypeFilter}
          onChange={(val) => {
            setTxTypeFilter(val);
            onResetPage();
          }}
          options={[
            { value: "all", label: "All Types" },
            { value: "expense", label: "Expense" },
            { value: "income", label: "Income" },
            { value: "transfer", label: "Transfer" },
          ]}
        />

        <CustomDropdown
          variant="chip"
          containerClassName="flex-1 min-w-0"
          isActive={categoryFilter !== "all"}
          value={categoryFilter}
          onChange={(val) => {
            setCategoryFilter(val);
            onResetPage();
          }}
          options={categoryOptions}
        />

        <CustomDropdown
          variant="chip"
          isActive={sortBy !== "date_desc"}
          align="right"
          value={sortBy}
          onChange={(val) => {
            setSortBy(val);
            onResetPage();
          }}
          options={[
            {
              value: "date_desc",
              label: "Sort: Date",
              icon: <Calendar size={14} />,
            },
            {
              value: "amount_desc",
              label: "Sort: Cost (High)",
              icon: <ArrowDown size={14} />,
            },
            {
              value: "amount_asc",
              label: "Sort: Cost (Low)",
              icon: <ArrowUp size={14} />,
            },
          ]}
          iconOnly={true}
        />

        <button
          ref={toggleBtnRef}
          onClick={() => {
            hapticFeedback.light();
            setShowFilters(!showFilters);
          }}
          className={`ml-auto relative p-1.5 aspect-square rounded-full flex items-center justify-center cursor-pointer shrink-0 transition-colors outline-none select-none ${
            showFilters || hasAdvancedFilters
              ? "bg-(--accent) text-white border border-transparent"
              : "bg-black/5 dark:bg-white/5 text-(--text) border border-black/8 dark:border-white/8 hover:bg-black/10 dark:hover:bg-white/10"
          }`}
          title="Filter Options"
        >
          <SlidersHorizontal
            size={14}
            className={
              showFilters || hasAdvancedFilters
                ? "text-white/80"
                : "text-(--text-muted)"
            }
          />
          {hasAdvancedFilters && (
            <span className="absolute top-0 right-0 w-2 h-2 bg-(--accent) rounded-full border-2 border-white dark:border-[#2d2d2c]"></span>
          )}
        </button>
      </div>

      {/* Expandable Advanced Filter Panel */}
      {showFilters && (
        <div
          ref={panelRef}
          className="absolute top-[calc(100%+8px)] left-0 w-full bg-[#e2e2df] dark:bg-[#2d2d2c] border border-black/8 dark:border-white/8 rounded-2xl p-4 flex flex-col gap-4 text-xs animate-slide-down z-[100] shadow-2xl"
        >
          {/* Cost Filter Fields */}
          <div className="grid grid-cols-2 gap-3 text-left">
            <div>
              <label className="block text-(--text-muted) font-semibold mb-1">
                Min Amount (Cost)
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-2.5 text-(--text-muted)">₹</span>
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
                <span className="absolute left-2.5 text-(--text-muted)">₹</span>
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

          {/* Reset Filters */}
          {(minAmount ||
            maxAmount ||
            sortBy !== "date_desc" ||
            txTypeFilter !== "all" ||
            categoryFilter !== "all") && (
            <div className="flex justify-end pt-2 border-t border-black/5 dark:border-white/5">
              <button
                onClick={() => {
                  hapticFeedback.light();
                  setMinAmount("");
                  setMaxAmount("");
                  setSortBy("date_desc");
                  setTxTypeFilter("all");
                  setCategoryFilter("all");
                  onResetPage();
                }}
                className="text-(--accent) hover:underline font-semibold border-0 bg-transparent cursor-pointer p-0 font-sans text-xs"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

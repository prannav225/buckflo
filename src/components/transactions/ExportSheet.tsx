import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Download } from "lucide-react";
import { useAccount } from "../../db/hooks";
import { exportTransactionsCSV } from "../../utils/csvExport";
import { getCurrentMonthYear } from "../../utils/dateUtils";
import { MonthPicker } from "../MonthPicker";
import { CustomDatePicker } from "../CustomDatePicker";
import { updateSheetOpenState } from "../../utils/modalHelper";
import { db } from "../../db/database";

interface ExportSheetProps {
  isOpen: boolean;
  onClose: () => void;
  defaultAccount?: "all" | "expenditure" | "savings";
}

export function ExportSheet({
  isOpen,
  onClose,
  defaultAccount = "all",
}: ExportSheetProps) {
  const [rangeType, setRangeType] = useState<
    "current" | "specific" | "range" | "all"
  >("current");
  const [specificMonth, setSpecificMonth] = useState(getCurrentMonthYear());
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [accountType, setAccountType] = useState<
    "all" | "expenditure" | "savings"
  >(defaultAccount);
  const [exporting, setExporting] = useState(false);

  const expendAcc = useAccount("expenditure");
  const savingsAcc = useAccount("savings");

  // Keep body styling in sync with modal state
  useEffect(() => {
    updateSheetOpenState();
    return () => {
      setTimeout(updateSheetOpenState, 0);
    };
  }, [isOpen]);

  const handleExport = async () => {
    setExporting(true);
    try {
      let query = db.transactions.toCollection();

      // 1. Account Filter
      if (accountType === "expenditure" && expendAcc?.id) {
        query = db.transactions.where("accountId").equals(expendAcc.id);
      } else if (accountType === "savings" && savingsAcc?.id) {
        query = db.transactions.where("accountId").equals(savingsAcc.id);
      }

      let txs = await query.toArray();

      // 2. Date Filter
      if (rangeType === "current") {
        const currentMonth = getCurrentMonthYear();
        txs = txs.filter((tx) => tx.date.startsWith(currentMonth));
      } else if (rangeType === "specific") {
        txs = txs.filter((tx) => tx.date.startsWith(specificMonth));
      } else if (rangeType === "range") {
        if (fromDate) txs = txs.filter((tx) => tx.date >= fromDate);
        if (toDate) txs = txs.filter((tx) => tx.date <= toDate);
      }

      // Sort by date descending
      txs.sort((a, b) => b.date.localeCompare(a.date));

      // Generate filename
      let filename = "buckflo-export";
      if (rangeType === "current") filename += `-${getCurrentMonthYear()}`;
      else if (rangeType === "specific") filename += `-${specificMonth}`;
      else if (rangeType === "range")
        filename += `-${fromDate || "start"}-to-${toDate || "end"}`;
      else filename += "-all-time";

      filename += `-${accountType}.csv`;

      // Assign account names for the export
      const exportsTxs = txs.map((tx) => {
        return {
          ...tx,
          accountName:
            tx.accountId === expendAcc?.id
              ? "Expenditure"
              : tx.accountId === savingsAcc?.id
                ? "Savings"
                : "Unknown",
        };
      });

      exportTransactionsCSV(exportsTxs, filename);
      onClose();
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setExporting(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet-panel" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />

        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-(--text) m-0">
            Export Transactions
          </h3>
          <button
            onClick={onClose}
            className="btn-ghost p-1.5 min-h-0 h-auto rounded-full"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-5">
          {/* Range Selection */}
          <div className="form-group m-0">
            <span className="label">Date Range</span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className={`chip py-2 px-3 ${rangeType === "current" ? "chip-active" : ""}`}
                onClick={() => setRangeType("current")}
              >
                Current Month
              </button>
              <button
                type="button"
                className={`chip py-2 px-3 ${rangeType === "specific" ? "chip-active" : ""}`}
                onClick={() => setRangeType("specific")}
              >
                Specific Month
              </button>
              <button
                type="button"
                className={`chip py-2 px-3 ${rangeType === "range" ? "chip-active" : ""}`}
                onClick={() => setRangeType("range")}
              >
                Custom Range
              </button>
              <button
                type="button"
                className={`chip py-2 px-3 ${rangeType === "all" ? "chip-active" : ""}`}
                onClick={() => setRangeType("all")}
              >
                All Time
              </button>
            </div>
          </div>

          {/* Conditional Date Inputs */}
          {rangeType === "specific" && (
            <div className="fade-in-up">
              <MonthPicker
                monthYear={specificMonth}
                onChange={setSpecificMonth}
                compact={false}
              />
            </div>
          )}

          {rangeType === "range" && (
            <div className="fade-in-up grid grid-cols-2 gap-3 w-full">
              <div className="form-group m-0 min-w-0">
                <label className="label text-[11px]" htmlFor="export-from">
                  From
                </label>
                <CustomDatePicker
                  id="export-from"
                  value={fromDate}
                  onChange={setFromDate}
                />
              </div>
              <div className="form-group m-0 min-w-0">
                <label className="label text-[11px]" htmlFor="export-to">
                  To
                </label>
                <CustomDatePicker
                  id="export-to"
                  value={toDate}
                  onChange={setToDate}
                  align="right"
                />
              </div>
            </div>
          )}

          {/* Account Selection */}
          <div className="form-group m-0 mt-2">
            <span className="label">Account</span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className={`chip py-2 px-4 ${accountType === "all" ? "chip-active" : ""}`}
                onClick={() => setAccountType("all")}
              >
                All Accounts
              </button>
              <button
                type="button"
                className={`chip py-2 px-4 ${accountType === "expenditure" ? "chip-active" : ""}`}
                onClick={() => setAccountType("expenditure")}
              >
                Expenditure
              </button>
              <button
                type="button"
                className={`chip py-2 px-4 ${accountType === "savings" ? "chip-active-green" : ""}`}
                onClick={() => setAccountType("savings")}
              >
                Savings
              </button>
            </div>
          </div>

          {/* Export Button */}
          <button
            className="btn-primary w-full py-3.5 mt-3"
            onClick={handleExport}
            disabled={
              exporting || (rangeType === "range" && !fromDate && !toDate)
            }
          >
            {exporting ? (
              "Exporting…"
            ) : (
              <>
                <Download size={18} /> Export to CSV
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

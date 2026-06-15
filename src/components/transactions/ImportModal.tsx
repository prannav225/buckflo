import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { AlertCircle, CheckCircle2, Upload, X, Lightbulb } from "lucide-react";
import { parseCSV, mapRowsToTransactions, importTransactionsToDB } from "../../utils/csvImport";
import type { ParsedCSVRow } from "../../utils/csvImport";
import { useAccount } from "../../db/hooks";
import { SegmentedControl } from "../ui/SegmentedControl";
import { updateSheetOpenState } from "../../utils/modalHelper";
import { useBackHandler } from "../../hooks/useBackHandler";
import toast from "react-hot-toast";

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  activeTab: "all" | "spending" | "savings";
}

export function ImportModal({ isOpen, onClose, onSuccess, activeTab }: ImportModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedCSVRow[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useBackHandler(isOpen, () => handleCancel());

  // Destination account default if not specified inside CSV rows
  const [destAccount, setDestAccount] = useState<"spending" | "savings">(
    activeTab === "savings" ? "savings" : "spending"
  );

  const [isImporting, setIsImporting] = useState(false);

  const spendingAcc = useAccount("spending");
  const savingsAcc = useAccount("savings");

  // Keep background scroll disabled when modal is open
  useEffect(() => {
    updateSheetOpenState();
    return () => {
      setTimeout(updateSheetOpenState, 0);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Check type
    if (!selectedFile.name.endsWith(".csv") && selectedFile.type !== "text/csv") {
      setErrorMsg("Please select a valid CSV file.");
      setParsedRows([]);
      setFile(null);
      return;
    }

    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const rows = parseCSV(text);
        const mapped = mapRowsToTransactions(rows);
        if (mapped.length === 0) {
          throw new Error("No valid transactions found in the CSV file.");
        }
        setParsedRows(mapped);
      } catch (err) {
        const error = err as Error;
        setErrorMsg(error.message || "Failed to parse CSV file.");
        setParsedRows([]);
        setFile(null);
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      if (droppedFile.name.endsWith(".csv") || droppedFile.type === "text/csv") {
        const fakeEvent = {
          target: {
            files: e.dataTransfer.files,
          },
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        handleFileChange(fakeEvent);
      } else {
        setErrorMsg("Please drop a valid CSV file.");
      }
    }
  };

  const executeImport = async () => {
    if (parsedRows.length === 0 || !spendingAcc || !savingsAcc) return;

    const expendId = spendingAcc.id;
    const savingsId = savingsAcc.id;
    if (expendId === undefined || savingsId === undefined) return;

    setIsImporting(true);
    try {
      const defaultId = destAccount === "savings" ? savingsId : expendId;
      const summary = await importTransactionsToDB(
        parsedRows,
        defaultId,
        expendId,
        savingsId
      );

      toast.success(
        `Imported ${summary.insertedCount} transactions successfully.${
          summary.duplicateCount > 0
            ? ` (${summary.duplicateCount} duplicate entries skipped)`
            : ""
        }`
      );

      onSuccess();
      handleCancel();
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || "Import failed.");
    } finally {
      setIsImporting(false);
    }
  };

  const handleCancel = () => {
    setFile(null);
    setParsedRows([]);
    setErrorMsg(null);
    onClose();
  };

  const hasExplicitAccounts = parsedRows.some((row) => row.accountType !== undefined);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      onClick={(e) => e.target === e.currentTarget && handleCancel()}
      className="fixed inset-0 bg-[#0a0908]/55 [backdrop-filter:blur(10px)] [-webkit-backdrop-filter:blur(10px)] z-500 flex items-center justify-center p-6 animate-fade-in"
    >
      <div className="glass-card-strong pop-in w-full max-w-[340px] bg-(--bg-surface) border border-black/8 dark:border-white/6 rounded-(--r-xl) shadow-(--glass-shadow-lg) p-6 flex flex-col gap-4 relative">
        {/* Close Button */}
        <button
          onClick={handleCancel}
          className="absolute top-4 right-4 bg-transparent border-0 text-(--text-muted) hover:text-(--text) cursor-pointer outline-none p-1 flex items-center justify-center rounded-full"
        >
          <X size={18} />
        </button>

        {/* Title */}
        <div className="text-left">
          <h3 className="font-sans text-base font-bold tracking-tight text-(--text) m-0">
            Import Transactions CSV
          </h3>
          <p className="font-sans text-xs text-(--text-muted) mt-1 m-0">
            Upload CSV matching: Date, Description, Category, Amount, Type
          </p>
        </div>

        {/* Error Indicator */}
        {errorMsg && (
          <div className="flex gap-2 p-3 bg-(--debit)/8 border border-(--debit)/20 rounded-xl text-xs text-(--debit) items-start text-left">
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Dropzone */}
        {!file ? (
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border border-dashed border-(--border) hover:border-(--accent-dark)/30 rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-neutral-500/2 dark:hover:bg-neutral-500/1 transition-all"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="w-10 h-10 rounded-full bg-(--accent)/8 flex items-center justify-center text-(--accent)">
              <Upload size={18} />
            </div>
            <div className="text-center">
              <span className="text-xs font-semibold text-(--text) block">
                Click to browse files
              </span>
              <span className="text-[10px] text-(--text-muted) mt-1 block">
                or drag and drop your .csv file here
              </span>
            </div>
          </div>
        ) : (
          /* File Preview Summary */
          <div className="flex flex-col gap-4 text-left">
            <div className="flex items-center gap-2.5 p-3 bg-(--credit)/8 border border-(--credit)/20 rounded-xl text-xs text-(--credit)">
              <CheckCircle2 size={16} className="shrink-0" />
              <div className="truncate flex-1">
                <span className="font-semibold block text-(--text) truncate">
                  {file.name}
                </span>
                <span className="text-[10px] text-(--text-secondary) mt-0.5 block">
                  Found {parsedRows.length} valid transaction rows.
                </span>
              </div>
            </div>

            {/* Target Account Selector if not explicitly marked in rows */}
            {!hasExplicitAccounts && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-(--text-muted) uppercase tracking-wider">
                  Target Destination Account
                </label>
                <SegmentedControl
                  options={["spending", "savings"] as const}
                  value={destAccount}
                  onChange={setDestAccount}
                  idPrefix="import-dest"
                  renderLabel={(val) =>
                    val === "savings" ? "Savings" : "Spending"
                  }
                  className="w-full"
                />
              </div>
            )}

            {hasExplicitAccounts && (
              <p className="text-[10px] text-(--text-muted) leading-relaxed m-0 italic bg-black/3 dark:bg-white/3 p-2.5 rounded-lg border border-black/5 dark:border-white/5 flex gap-1.5 items-start">
                <Lightbulb size={12} className="shrink-0 mt-0.5 text-(--accent)" />
                <span>Note: This CSV contains row-level account declarations. Transactions will be routed to their respective accounts.</span>
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2.5 mt-2">
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 py-2.5 px-4 rounded-xl border border-(--border) bg-transparent text-(--text-secondary) font-sans text-xs font-semibold cursor-pointer active:bg-black/5 dark:active:bg-white/5 transition-colors outline-none"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={parsedRows.length === 0 || isImporting}
            onClick={executeImport}
            className={`flex-1 py-2.5 px-4 rounded-xl border-none text-white font-sans text-xs font-semibold cursor-pointer transition-all outline-none flex items-center justify-center gap-1.5 ${
              parsedRows.length === 0 || isImporting
                ? "bg-neutral-500/20 text-neutral-500 cursor-not-allowed opacity-50"
                : "bg-(--accent) shadow-lg shadow-(--accent)/15 active:scale-98"
            }`}
          >
            {isImporting ? "Importing..." : "Import Data"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

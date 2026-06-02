import { Wallet } from "lucide-react";
import { SectionHeader } from "./SectionHeader";

interface SpendingSectionProps {
  expendBalance: string;
  setExpendBalance: (val: string) => void;
  budget: string;
  setBudget: (val: string) => void;
  handleBlur: (val: string, setter: (val: string) => void) => void;
  isEdit: boolean;
  copyFromPreviousMonth: () => void;
}

export function SpendingSection({
  expendBalance,
  setExpendBalance,
  budget,
  setBudget,
  handleBlur,
  isEdit,
  copyFromPreviousMonth,
}: SpendingSectionProps) {
  return (
    <>
      <SectionHeader
        icon={<Wallet size={15} className="text-(--accent)" />}
        bgClassName="bg-[rgba(217,119,87,0.12)]"
        label="Spending Wallet"
      />

      <div className="form-group">
        <label htmlFor="modal-expend-balance" className="label">
          Starting Balance (₹)
        </label>
        <input
          id="modal-expend-balance"
          type="text"
          inputMode="decimal"
          placeholder="e.g. 25,000"
          value={expendBalance}
          onChange={(e) => setExpendBalance(e.target.value)}
          onBlur={() => handleBlur(expendBalance, setExpendBalance)}
          className="input-field"
          required
          autoFocus={!isEdit}
        />
      </div>

      <div className="form-group relative">
        <div className="flex items-center justify-between mb-1">
          <label htmlFor="modal-monthly-budget" className="label mb-0!">
            Monthly Budget (₹)
          </label>
          {!isEdit && (
            <button
              type="button"
              onClick={copyFromPreviousMonth}
              className="text-[10px] text-(--accent) font-semibold hover:underline bg-transparent border-0 p-0 cursor-pointer"
            >
              Copy from last month
            </button>
          )}
        </div>
        <input
          id="modal-monthly-budget"
          type="text"
          inputMode="decimal"
          placeholder="e.g. 30,000"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          onBlur={() => handleBlur(budget, setBudget)}
          className="input-field"
          required
        />
      </div>
    </>
  );
}

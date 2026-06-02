import React from "react";
import { PiggyBank, ArrowRight, Wallet } from "lucide-react";
import { SectionHeader } from "./SectionHeader";

interface SavingsSectionProps {
  savingsBalance: string;
  setSavingsBalance: (val: string) => void;
  handleBlur: (val: string, setter: (val: string) => void) => void;
  isEdit: boolean;
  includeTransfer: boolean;
  setIncludeTransfer: React.Dispatch<React.SetStateAction<boolean>>;
  transferAmount: string;
  setTransferAmount: (val: string) => void;
}

export function SavingsSection({
  savingsBalance,
  setSavingsBalance,
  handleBlur,
  isEdit,
  includeTransfer,
  setIncludeTransfer,
  transferAmount,
  setTransferAmount,
}: SavingsSectionProps) {
  return (
    <>
      <div className="divider my-5" />

      <SectionHeader
        icon={<PiggyBank size={15} className="text-(--credit)" />}
        bgClassName="bg-[rgba(90,158,111,0.12)]"
        label="Savings Wallet"
      />

      <div className="form-group">
        <label htmlFor="modal-savings-balance" className="label">
          Starting Balance (₹)&nbsp;
          <span className="font-normal opacity-70">— optional</span>
        </label>
        <input
          id="modal-savings-balance"
          type="text"
          inputMode="decimal"
          placeholder="e.g. 1,50,000"
          value={savingsBalance}
          onChange={(e) => setSavingsBalance(e.target.value)}
          onBlur={() => handleBlur(savingsBalance, setSavingsBalance)}
          className="input-field"
        />
      </div>

      {!isEdit && (
        <>
          <div
            className={`flex items-center gap-2.5 cursor-pointer py-2.5 px-0 select-none ${
              includeTransfer ? "mb-3.5" : "mb-0"
            }`}
            onClick={() => setIncludeTransfer((v) => !v)}
            role="checkbox"
            aria-checked={includeTransfer}
            tabIndex={0}
            onKeyDown={(e) => e.key === " " && setIncludeTransfer((v) => !v)}
            id="modal-toggle-starting-transfer"
          >
            <div
              className={`w-[22px] h-[22px] rounded-[6px] border-2 flex items-center justify-center transition-all duration-180 ease-[cubic-bezier(0.34,1.56,0.64,1)] shrink-0 ${
                includeTransfer
                  ? "border-(--accent) bg-(--accent)"
                  : "border-(--text-muted) bg-transparent"
              }`}
            >
              {includeTransfer && (
                <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                  <path
                    d="M1 4L4.5 7.5L11 1"
                    stroke="#fff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
            <span className="font-sans text-sm font-medium">
              Log an opening transfer from Savings
            </span>
          </div>

          {includeTransfer && (
            <div className="form-group p-3.5 bg-(--bg-glass-weak) rounded-(--r-lg) border border-(--accent)/25">
              <label htmlFor="modal-transfer-amt" className="label">
                Transfer Amount (₹)
              </label>
              <div className="flex items-center gap-2">
                <PiggyBank size={15} className="text-(--credit) shrink-0" />
                <ArrowRight size={13} className="text-(--text-muted) shrink-0" />
                <Wallet size={15} className="text-(--accent) shrink-0" />
                <input
                  id="modal-transfer-amt"
                  type="text"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  onBlur={() => handleBlur(transferAmount, setTransferAmount)}
                  className="input-field flex-1 mb-0!"
                />
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}

import { useRef, useEffect } from "react";
import { CurrencyInput } from "../../ui/CurrencyInput";

interface TransactionAmountCardProps {
  type: "debit" | "credit";
  amount: string;
  setAmount: (val: string) => void;
  parsedAmt: number;
  isEdit: boolean;
  fetching: boolean;
}

export function TransactionAmountCard({
  type,
  amount,
  setAmount,
  parsedAmt,
  isEdit,
  fetching,
}: TransactionAmountCardProps) {
  const amountInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!fetching && !isEdit) {
      const t = setTimeout(() => amountInputRef.current?.focus(), 200);
      return () => clearTimeout(t);
    }
  }, [fetching, isEdit]);

  return (
    <div
      className={`hero-card ${type === "debit" ? "hero-card-orange" : "hero-card-green"} cursor-text mb-2`}
      onClick={() => amountInputRef.current?.focus()}
    >
      <div className="hero-card-orb-lg" />
      <div className="hero-card-orb-sm" />

      <div className="flex items-center justify-between mb-2">
        <span className="font-sans text-[0.6875rem] font-semibold text-[rgba(255,255,255,0.65)] tracking-[0.08em] uppercase">
          Amount
        </span>
        <span className="font-sans text-[0.6875rem] text-[rgba(255,255,255,0.50)] tracking-wider">
          Tap to edit
        </span>
      </div>

      <div className="amount-display flex items-baseline text-white relative z-10">
        <span
          className="text-[clamp(1.75rem,8vw,2.25rem)] mr-1.5 font-medium opacity-85"
          style={{
            fontFamily: "'Instrument Serif', Georgia, serif",
            fontSize: "clamp(1.75rem, 8vw, 2.25rem)",
          }}
        >
          ₹
        </span>
        <CurrencyInput
          id="page-tx-amount"
          ref={amountInputRef}
          value={amount}
          onChange={(val) => setAmount(val)}
          placeholder="0"
          required
          className={`bg-transparent border-none outline-none text-[clamp(2.25rem,10vw,3rem)] ${
            parsedAmt > 0 ? "text-white" : "text-[rgba(255,255,255,0.40)]"
          } w-full p-0 m-0 shadow-none leading-none font-normal`}
          style={{
            fontFamily: "'Instrument Serif', Georgia, serif",
            fontSize: "clamp(2.25rem, 10vw, 3rem)",
          }}
        />
      </div>
    </div>
  );
}

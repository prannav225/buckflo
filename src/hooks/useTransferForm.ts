import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { recordTransferBidirectional } from "../db/database";
import { todayISO } from "../utils/dateUtils";

interface UseTransferFormProps {
  defaultDirection?: "savings_to_expenditure" | "expenditure_to_savings";
  defaultAmount?: string;
  defaultNote?: string;
  onClose: () => void;
  savingsBalance: number;
  expenditureBalance: number;
}

export function useTransferForm({
  defaultDirection = "savings_to_expenditure",
  defaultAmount = "",
  defaultNote = "",
  onClose,
  savingsBalance,
  expenditureBalance,
}: UseTransferFormProps) {
  const [direction, setDirection] = useState<
    "savings_to_expenditure" | "expenditure_to_savings"
  >(defaultDirection);
  const [amount, setAmount] = useState(defaultAmount);
  const [note, setNote] = useState(defaultNote);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      toast.error("Enter a valid amount");
      return;
    }

    const currentSourceBalance =
      direction === "savings_to_expenditure"
        ? savingsBalance
        : expenditureBalance;
    if (amt > currentSourceBalance) {
      toast.error(
        `Amount exceeds ${
          direction === "savings_to_expenditure" ? "savings" : "expenditure"
        } balance`,
      );
      return;
    }

    setLoading(true);
    try {
      const fromType =
        direction === "savings_to_expenditure" ? "savings" : "expenditure";
      const toType =
        direction === "savings_to_expenditure" ? "expenditure" : "savings";
      const defaultNoteText =
        direction === "savings_to_expenditure"
          ? "Transfer to Expenditure"
          : "Transfer to Savings";

      await recordTransferBidirectional(
        amt,
        todayISO(),
        fromType,
        toType,
        note || defaultNoteText,
        "transfer",
      );
      toast.success(`${amt} moved successfully ✓`);
      onClose();
    } catch (err) {
      toast.error("Transfer failed. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const parsedAmt = parseFloat(amount) || 0;
  const currentSourceBalance =
    direction === "savings_to_expenditure"
      ? savingsBalance
      : expenditureBalance;
  const afterSourceBalance = currentSourceBalance - parsedAmt;

  return {
    direction,
    setDirection,
    amount,
    setAmount,
    note,
    setNote,
    loading,
    inputRef,
    handleSubmit,
    parsedAmt,
    currentSourceBalance,
    afterSourceBalance,
  };
}

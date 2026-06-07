import { useState, useEffect } from "react";
import type { Dispatch, SetStateAction, FormEvent } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  addTransaction,
  updateTransaction,
  deleteTransaction,
  db,
} from "../db/database";
import { useAccounts } from "../db/hooks";
import { todayISO } from "../utils/dateUtils";
import toast from "react-hot-toast";
import { hapticFeedback } from "../utils/haptics";

export interface TransactionFormState {
  date: string;
  setDate: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  amount: string;
  setAmount: Dispatch<SetStateAction<string>>;
  type: "debit" | "credit";
  setType: (v: "debit" | "credit") => void;
  accountId: number | "";
  setAccountId: (v: number | "") => void;
  category: string;
  setCategory: (v: string) => void;
  loading: boolean;
  fetching: boolean;
  isEdit: boolean;
  spendingAcc: ReturnType<typeof useAccounts>[number] | undefined;
  savingsAcc: ReturnType<typeof useAccounts>[number] | undefined;
  handleSubmit: (e: FormEvent) => Promise<void>;
  /** Pass a confirmFn that resolves true/false; the hook performs the delete only if confirmed. */
  handleDelete: (confirmFn?: () => Promise<boolean>) => Promise<void>;
}

export function useTransactionForm(): TransactionFormState {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const accounts = useAccounts();

  const isEdit = id !== undefined;

  const [date, setDate] = useState(todayISO());
  const [description, setDescription] = useState(
    () => (!isEdit && searchParams.get("desc")) || "",
  );
  const [amount, setAmount] = useState(
    () => (!isEdit && searchParams.get("amt")) || "",
  );
  const [type, setType] = useState<"debit" | "credit">("debit");
  const [accountId, setAccountId] = useState<number | "">("");
  const [category, setCategory] = useState(
    () => (!isEdit && searchParams.get("cat")) || "",
  );
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  const spendingAcc = accounts.find((a) => a.type === "spending");
  const savingsAcc = accounts.find((a) => a.type === "savings");

  // Derived: fall back to spending wallet when user hasn't manually chosen one yet
  const effectiveAccountId: number | "" =
    accountId !== "" ? accountId : (spendingAcc?.id ?? "");

  useEffect(() => {
    if (!isEdit) return;

    // fetching is already initialised to `true` when isEdit is true (line 44)
    // All setState calls here are inside async .then()/.catch()/.finally() — no sync setState.
    db.transactions
      .get(Number(id))
      .then((tx) => {
        if (tx) {
          setDate(tx.date);
          setDescription(tx.description);
          setAmount(tx.amount.toString());
          setType(tx.type);
          setAccountId(tx.accountId);
          setCategory(tx.category || "");
        } else {
          toast.error("Transaction not found");
          navigate("/", { replace: true });
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load transaction");
      })
      .finally(() => setFetching(false));
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Smart category guessing: search for a previous transaction matching the description
  useEffect(() => {
    if (!description.trim() || isEdit || category !== "") return;

    const guessCategory = async () => {
      const searchDesc = description.trim().toLowerCase();
      const match = await db.transactions
        .filter(tx => tx.description.toLowerCase() === searchDesc)
        .last();

      if (match && match.category) {
        setCategory(match.category);
      }
    };

    const timeout = setTimeout(guessCategory, 250); // debounce database lookup
    return () => clearTimeout(timeout);
  }, [description, isEdit, category]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    if (!effectiveAccountId) {
      toast.error("Select an account");
      return;
    }
    if (!description.trim()) {
      toast.error("Add a description");
      return;
    }

    setLoading(true);
    try {
      const txData = {
        date,
        description: description.trim(),
        amount: amt,
        type,
        accountId: Number(effectiveAccountId),
        category: category.trim() || undefined,
      };

      if (isEdit) {
        await updateTransaction(Number(id), txData);
        toast.success("Entry updated ✓");
      } else {
        await addTransaction(txData);
        toast.success("Entry logged ✓");
      }
      hapticFeedback.success();
      if (window.history.state && window.history.state.idx > 0) {
        navigate(-1);
      } else {
        navigate("/home", { replace: true });
      }
    } catch (err) {
      toast.error("Failed to save. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (confirmFn?: () => Promise<boolean>) => {
    if (!isEdit) return;
    if (confirmFn) {
      const confirmed = await confirmFn();
      if (!confirmed) return;
    }

    setLoading(true);
    try {
      await deleteTransaction(Number(id));
      toast.success("Entry deleted ✓");
      hapticFeedback.heavy();
      if (window.history.state && window.history.state.idx > 0) {
        navigate(-1);
      } else {
        navigate("/home", { replace: true });
      }
    } catch (err) {
      toast.error("Failed to delete. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return {
    date,
    setDate,
    description,
    setDescription,
    amount,
    setAmount,
    type,
    setType,
    accountId: effectiveAccountId,
    setAccountId,
    category,
    setCategory,
    loading,
    fetching,
    isEdit,
    spendingAcc,
    savingsAcc,
    handleSubmit,
    handleDelete,
  };
}

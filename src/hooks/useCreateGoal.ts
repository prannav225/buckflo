import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import { addSavingGoal } from "../db/database";
import { formatINR } from "../utils/currency";

export function useCreateGoal(unallocatedBalance: number, onClose: () => void) {
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [initialAllocation, setInitialAllocation] = useState("");
  const [deadline, setDeadline] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter a goal name");
      return;
    }
    const target = parseFloat(targetAmount);
    if (!target || target <= 0) {
      toast.error("Please enter a valid target amount");
      return;
    }
    const initial = parseFloat(initialAllocation) || 0;
    if (initial < 0) {
      toast.error("Initial allocation cannot be negative");
      return;
    }
    if (initial > unallocatedBalance) {
      toast.error(
        `Initial allocation exceeds available unallocated savings (${formatINR(unallocatedBalance)})`
      );
      return;
    }
    if (initial > target) {
      toast.error("Initial allocation cannot exceed target amount");
      return;
    }

    setLoading(true);
    try {
      await addSavingGoal({
        name: name.trim(),
        targetAmount: target,
        currentAllocated: initial,
        deadline: deadline || undefined,
      });
      toast.success(`Savings Goal "${name}" created!`);
      onClose();
    } catch (err) {
      toast.error("Failed to create goal.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const parsedTarget = parseFloat(targetAmount) || 0;
  const parsedInitial = parseFloat(initialAllocation) || 0;

  return {
    name,
    setName,
    targetAmount,
    setTargetAmount,
    initialAllocation,
    setInitialAllocation,
    deadline,
    setDeadline,
    loading,
    inputRef,
    handleSubmit,
    parsedTarget,
    parsedInitial,
  };
}

import { useState } from "react";
import toast from "react-hot-toast";
import {
  updateSavingGoal,
  deleteSavingGoal,
  type SavingGoal,
} from "../db/database";
import { formatINR } from "../utils/currency";
import { useConfirm } from "./useConfirm";

export function useManageGoal(
  goal: SavingGoal,
  unallocatedBalance: number,
  onClose: () => void,
) {
  const [name, setName] = useState(goal.name);
  const [targetAmount, setTargetAmount] = useState(
    goal.targetAmount.toString(),
  );
  const [allocated, setAllocated] = useState(goal.currentAllocated.toString());
  const [deadline, setDeadline] = useState(goal.deadline || "");
  const [loading, setLoading] = useState(false);
  const { confirm, dialog: confirmDialog } = useConfirm();

  const maxAllowed = unallocatedBalance + goal.currentAllocated;

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: "Delete Goal",
      message: `Delete "${goal.name}"? The allocated ${formatINR(goal.currentAllocated)} will be returned to your unallocated savings.`,
      confirmLabel: "Delete",
      variant: "danger",
    });
    if (!confirmed) return;

    setLoading(true);
    try {
      await deleteSavingGoal(goal.id!);
      toast.success(`Goal "${goal.name}" deleted.`);
      onClose();
    } catch (err) {
      toast.error("Failed to delete goal.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
    const alloc = parseFloat(allocated) || 0;
    if (alloc < 0) {
      toast.error("Allocation cannot be negative");
      return;
    }
    if (alloc > maxAllowed) {
      toast.error(
        `Allocation exceeds maximum allowed amount (${formatINR(maxAllowed)})`,
      );
      return;
    }
    if (alloc > target) {
      toast.error("Allocation cannot exceed target amount");
      return;
    }

    setLoading(true);
    try {
      await updateSavingGoal(goal.id!, {
        name: name.trim(),
        targetAmount: target,
        currentAllocated: alloc,
        deadline: deadline || undefined,
      });
      toast.success(`Goal "${name.trim()}" updated!`);
      onClose();
    } catch (err) {
      toast.error("Failed to update goal.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const parsedTarget = parseFloat(targetAmount) || 0;
  const parsedAlloc = parseFloat(allocated) || 0;

  return {
    name,
    setName,
    targetAmount,
    setTargetAmount,
    allocated,
    setAllocated,
    deadline,
    setDeadline,
    loading,
    maxAllowed,
    handleDelete,
    handleSubmit,
    parsedTarget,
    parsedAlloc,
    confirmDialog,
  };
}

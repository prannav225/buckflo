import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import type { SavingGoal } from '../db/database';
import { useAccount } from '../db/hooks';

export function useSavingsGoals() {
  const savingsAcc = useAccount('savings');
  const savingGoals = useLiveQuery(() => db.savingGoals.toArray(), [], [] as SavingGoal[]);

  const totalAllocated = savingGoals.reduce((sum, goal) => sum + goal.currentAllocated, 0);
  const currentSavingsBalance = savingsAcc?.currentBalance ?? 0;
  const unallocatedBalance = currentSavingsBalance - totalAllocated;

  return {
    savingGoals,
    totalAllocated,
    unallocatedBalance,
    currentSavingsBalance
  };
}

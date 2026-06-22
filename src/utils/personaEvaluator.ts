import { type Transaction } from "../db/schema";

export interface SpendingPersona {
  id: string;
  title: string;
  iconId: string;
  avatarSeed: string;
  avatarColors: string[];
  description: string;
  statsHighlight: string;
  recommendation: string;
}

export function evaluatePersona(transactions: Transaction[]): SpendingPersona {
  // Filter for valid debit transactions (excluding adjustments, starting balances, and transfers)
  const debits = transactions.filter(
    (tx) =>
      tx.type === "debit" &&
      tx.category !== "transfer" &&
      tx.category !== "Transfer" &&
      tx.category !== "starting-transfer" &&
      tx.category !== "adjustment"
  );

  const totalSpent = debits.reduce((sum, tx) => sum + tx.amount, 0);
  const totalCount = debits.length;

  // 1. Silent Observer
  if (totalCount < 8) {
    return {
      id: "silent_observer",
      title: "The Silent Observer",
      iconId: "silent_observer",
      avatarSeed: "silent-observer-wallet",
      avatarColors: ["#d97757", "#c2633e", "#fef3c7"], // Brand orange shades with warm cream details
      description: "You log transactions sparingly or spend very little. You are a shadow in the forest of consumerism—observing your wallets from a quiet distance.",
      statsHighlight: `Only logged ${totalCount} transaction${totalCount === 1 ? "" : "s"} this month.`,
      recommendation: "Keep logging consistently. The more data you record, the clearer your patterns will become."
    };
  }

  // Calculate category breakdowns
  const categoryAmounts: Record<string, number> = {};
  const categoryCounts: Record<string, number> = {};
  
  // Calculate weekend spending
  let discretionaryWeekendSpent = 0;
  let totalDiscretionarySpent = 0;

  const discretionaryCategories = ["Food", "Entertainment", "Shopping", "Other"];

  // Analyze transaction dates
  const activeDays = new Set<string>();

  for (const tx of debits) {
    activeDays.add(tx.date);
    const cat = tx.category || "Other";
    categoryAmounts[cat] = (categoryAmounts[cat] || 0) + tx.amount;
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;

    // Check day of week
    if (discretionaryCategories.includes(cat)) {
      totalDiscretionarySpent += tx.amount;
      
      const dateObj = new Date(tx.date);
      const day = dateObj.getDay();
      if (day === 0 || day === 5 || day === 6) {
        discretionaryWeekendSpent += tx.amount;
      }
    }
  }

  // 2. Subscription Squirrel
  const billsAndRentAmount = (categoryAmounts["Bills"] || 0) + (categoryAmounts["Rent"] || 0);
  if (totalSpent > 0 && billsAndRentAmount / totalSpent > 0.4) {
    const pct = Math.round((billsAndRentAmount / totalSpent) * 100);
    return {
      id: "subscription_squirrel",
      title: "The Subscription Squirrel",
      iconId: "subscription_squirrel",
      avatarSeed: "subscription-squirrel-wallet",
      avatarColors: ["#d97757", "#c2633e", "#5a9e6f"], // Brand orange, dark orange, and brand green
      description: "Your monthly spending is dominated by committed outflows like rent, bills, or subscription renewals. You store away resources for your digital nest.",
      statsHighlight: `${pct}% of spending went to Bills & Rent.`,
      recommendation: "Review your recurring subscriptions periodically to ensure you still extract value from each one."
    };
  }

  // 3. Cafe Connoisseur
  const foodCount = categoryCounts["Food"] || 0;
  const foodAmount = categoryAmounts["Food"] || 0;
  const isFoodHeavyCount = foodCount / totalCount > 0.4;
  const isFoodHeavyAmount = totalSpent > 0 && foodAmount / totalSpent > 0.4;

  if (isFoodHeavyCount || isFoodHeavyAmount) {
    const detailText = isFoodHeavyAmount 
      ? `${Math.round((foodAmount / totalSpent) * 100)}% of your budget`
      : `${foodCount} out of ${totalCount} transactions`;
    return {
      id: "cafe_connoisseur",
      title: "The Cafe Connoisseur",
      iconId: "cafe_connoisseur",
      avatarSeed: "cafe-connoisseur-wallet",
      avatarColors: ["#d97757", "#78350f", "#fef3c7"], // Brand orange, coffee brown, and warm cream
      description: "Food runs, coffee runs, and dining out are your primary spending drivers. You prioritize taste, culinary experiences, and social snacking.",
      statsHighlight: `Food spend: ${detailText} this month.`,
      recommendation: "Notice whether dining out is a deliberate choice or a fallback when cooking feels like a chore."
    };
  }

  // 4. Weekend Warrior
  const hasSubstantialDiscretionary = totalDiscretionarySpent / totalSpent > 0.2;
  const isWeekendSpike = totalDiscretionarySpent > 0 && (discretionaryWeekendSpent / totalDiscretionarySpent) > 0.6;

  if (hasSubstantialDiscretionary && isWeekendSpike) {
    const pct = Math.round((discretionaryWeekendSpent / totalDiscretionarySpent) * 100);
    return {
      id: "weekend_warrior",
      title: "The Weekend Warrior",
      iconId: "weekend_warrior",
      avatarSeed: "weekend-warrior-wallet",
      avatarColors: ["#e05545", "#d97757", "#fef3c7"], // Brand debit red, brand orange, and warm cream
      description: "Your week is quiet, but you let loose from Friday to Sunday. Weekend outings, entertainment, and weekend shopping dominate your discretionary ledger.",
      statsHighlight: `${pct}% of discretionary spend on weekends.`,
      recommendation: "Weekend relaxation is valuable. Spreading your budget evenly can prevent a Friday frenzy."
    };
  }

  // 5. Steady Streamer
  if (activeDays.size >= 15) {
    return {
      id: "steady_streamer",
      title: "The Steady Streamer",
      iconId: "steady_streamer",
      avatarSeed: "steady-streamer-wallet",
      avatarColors: ["#5a9e6f", "#0ea5e9", "#fef3c7"], // Brand green, stream blue, and cream
      description: "You maintain a continuous, highly disciplined rhythm of logging transactions day after day. Your ledger flows steadily like a stream.",
      statsHighlight: `Logged transactions on ${activeDays.size} different days.`,
      recommendation: "Your logging consistency is excellent. Continue observing how this high awareness shapes your choices."
    };
  }

  // 6. Balanced Sage (Fallback)
  return {
    id: "balanced_sage",
    title: "The Balanced Sage",
    iconId: "balanced_sage",
    avatarSeed: "balanced-sage-wallet",
    avatarColors: ["#5a9e6f", "#d97757", "#1f1f1e"], // Brand credit green, brand orange, and contrast charcoal
    description: "Your transactions are evenly distributed across categories and timing. You navigate your purchases with stability and balance.",
    statsHighlight: "Harmonious balance across all categories.",
    recommendation: "Keep observing your patterns. You are maintaining a comfortable awareness of your cash flow."
  };
}

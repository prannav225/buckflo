import { useState, useEffect } from "react";
import { type Subscription } from "../db/database";
import { updateSheetOpenState } from "../utils/modalHelper";

export function useInsightsData() {
  const [activeTab, setActiveTab] = useState<"overview" | "subscriptions">(
    "overview",
  );
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingSub, setEditingSub] = useState<Subscription | null>(null);

  useEffect(() => {
    updateSheetOpenState();
    return () => {
      setTimeout(updateSheetOpenState, 0);
    };
  }, [showFormModal]);

  const openForm = (sub: Subscription | null = null) => {
    setEditingSub(sub);
    setShowFormModal(true);
  };

  return {
    activeTab,
    setActiveTab,
    showFormModal,
    setShowFormModal,
    editingSub,
    openForm,
  };
}

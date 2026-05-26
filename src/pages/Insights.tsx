import { useState, useEffect } from "react";
import { type Subscription } from "../db/database";
import { updateSheetOpenState } from "../utils/modalHelper";
import { InsightsOverviewTab } from "../components/insights/InsightsOverviewTab";
import { InsightsSubscriptionsTab } from "../components/insights/InsightsSubscriptionsTab";
import { SubscriptionFormSheet } from "../components/insights/SubscriptionFormSheet";
import { SegmentedControl } from "../components/ui/SegmentedControl";

export function Insights() {
  const [activeTab, setActiveTab] = useState<"overview" | "subscriptions">(
    "overview",
  );
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingSub, setEditingSub] = useState<Subscription | null>(null);

  // Handle active overlay body class for inactive background visual dimming
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

  return (
    <>
      {/* ── Page Title ──────────────────────────────────────────────────── */}
      <div className="sub-header fade-in-up">
        <h2 className="sub-header-title">Insights</h2>
      </div>

      {/* ── Navigation Tabs ──────────────────────────────────────────────── */}
      <SegmentedControl
        options={["overview", "subscriptions"] as const}
        value={activeTab}
        onChange={(val) => setActiveTab(val)}
        idPrefix="tab"
        className="fade-in-up max-w-[320px] mx-auto mb-5"
      />

      {/* ── Tab Content ─────────────────────────────────────────── */}
      {activeTab === "overview" && <InsightsOverviewTab />}

      {activeTab === "subscriptions" && (
        <InsightsSubscriptionsTab openForm={openForm} />
      )}

      {/* ── Manual Add / Edit Modal Overlay ─────────────────────────────── */}
      {showFormModal && (
        <SubscriptionFormSheet
          showFormModal={showFormModal}
          setShowFormModal={setShowFormModal}
          editingSub={editingSub}
        />
      )}
    </>
  );
}

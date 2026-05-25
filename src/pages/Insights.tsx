import { InsightsOverviewTab } from "../components/insights/InsightsOverviewTab";
import { InsightsSubscriptionsTab } from "../components/insights/InsightsSubscriptionsTab";
import { SubscriptionFormSheet } from "../components/insights/SubscriptionFormSheet";
import { useInsightsData } from "../hooks/useInsightsData";

export function Insights() {
  const {
    activeTab,
    setActiveTab,
    showFormModal,
    setShowFormModal,
    editingSub,
    openForm,
  } = useInsightsData();

  return (
    <>
      {/* ── Page Title ──────────────────────────────────────────────────── */}
      <div className="sub-header fade-in-up">
        <h2 className="sub-header-title">Insights</h2>
      </div>

      {/* ── Navigation Tabs ──────────────────────────────────────────────── */}
      <div className="seg-control fade-in-up mb-5">
        <button
          type="button"
          className={`seg-option ${activeTab === "overview" ? "seg-option-active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          type="button"
          className={`seg-option ${activeTab === "subscriptions" ? "seg-option-active" : ""}`}
          onClick={() => setActiveTab("subscriptions")}
        >
          Subscriptions
        </button>
      </div>

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

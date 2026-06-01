import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { AppLayout } from "../components/layout/AppLayout";
import { Dashboard } from "../pages/Dashboard";
import { MonthlyView } from "../pages/MonthlyView";
import { SavingsView } from "../pages/SavingsView";
import { AddEditTransaction } from "../pages/AddEditTransaction";
import { MonthlyTransactionsView } from "../pages/MonthlyTransactionsView";
import { Insights } from "../pages/Insights";
import { useMonthSetup } from "../db/hooks";
import { PrivacyPolicy } from "../pages/PrivacyPolicy";
import { TermsConditions } from "../pages/TermsConditions";
import { ProfilePage } from "../pages/ProfilePage";
import { EditProfilePage } from "../pages/EditProfilePage";
import { ProfileSetupPage } from "../pages/ProfileSetupPage";
import { AboutPage } from "../pages/AboutPage";
import { ManageCategoriesPage } from "../pages/ManageCategoriesPage";
import { useProfile } from "../hooks/useProfile";
import { LandingPage } from "../pages/LandingPage";
import { NotificationsPage } from "../pages/NotificationsPage";
import { useNotificationScheduler } from "../hooks/useNotificationScheduler";

const routesConfig = [
  { path: "/home", element: <Dashboard />, isTab: true },
  { path: "/monthly", element: <MonthlyView />, isTab: true },
  {
    path: "/monthly/transactions",
    element: <MonthlyTransactionsView />,
    isTab: true,
  },
  { path: "/insights", element: <Insights />, isTab: true },
  { path: "/savings", element: <SavingsView />, isTab: false }, // Savings is now deep-linked
  { path: "/add", element: <AddEditTransaction />, isTab: false },
  { path: "/edit/:id", element: <AddEditTransaction />, isTab: false },
  { path: "/profile", element: <ProfilePage />, isTab: false }, // Profile page replaces Settings in BottomNav
  { path: "/profile/edit", element: <EditProfilePage />, isTab: false },
  { path: "/profile/about", element: <AboutPage />, isTab: false },
  {
    path: "/profile/categories",
    element: <ManageCategoriesPage />,
    isTab: false,
  },
  {
    path: "/profile/notifications",
    element: <NotificationsPage />,
    isTab: false,
  },
];

function LandingPageWrapper({ hasProfile }: { hasProfile: boolean }) {
  const navigate = useNavigate();

  // Synchronous check to avoid any visual flicker on load
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as unknown as { standalone?: boolean }).standalone ||
    document.referrer.includes("android-app://");

  if (isStandalone && hasProfile) {
    return <Navigate to="/home" replace />;
  }

  return (
    <LandingPage
      onStart={() => {
        if (hasProfile) {
          navigate("/home");
        } else {
          navigate("/setup");
        }
      }}
    />
  );
}

export function AppRoutes() {
  const monthSetup = useMonthSetup();
  const { profileExists, isLoading: profileLoading } = useProfile();

  const dbLoaded = monthSetup !== undefined && !profileLoading;
  const hasProfile = profileExists();

  useNotificationScheduler();

  if (!dbLoaded) return null;

  return (
    <Routes>
      <Route
        path="/"
        element={<LandingPageWrapper hasProfile={hasProfile} />}
      />
      <Route
        path="/setup"
        element={
          !hasProfile ? <ProfileSetupPage /> : <Navigate to="/home" replace />
        }
      />
      <Route
        path="/privacy"
        element={
          <AppLayout>
            <div className="page-transition-sheet">
              <PrivacyPolicy />
            </div>
          </AppLayout>
        }
      />
      <Route
        path="/terms"
        element={
          <AppLayout>
            <div className="page-transition-sheet">
              <TermsConditions />
            </div>
          </AppLayout>
        }
      />
      <Route
        path="/*"
        element={
          hasProfile ? (
            <AppLayout>
              <Routes>
                {routesConfig.map(({ path, element, isTab }) => (
                  <Route
                    key={path}
                    path={path}
                    element={
                      <div
                        className={
                          isTab
                            ? "page-transition-tab"
                            : "page-transition-sheet"
                        }
                      >
                        {element}
                      </div>
                    }
                  />
                ))}
                <Route path="*" element={<Navigate to="/home" replace />} />
              </Routes>
            </AppLayout>
          ) : (
            <Navigate to="/setup" replace />
          )
        }
      />
    </Routes>
  );
}

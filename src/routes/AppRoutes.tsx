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
  { path: "/privacy", element: <PrivacyPolicy />, isTab: false },
  { path: "/terms", element: <TermsConditions />, isTab: false },
  { path: "/profile", element: <ProfilePage />, isTab: false }, // Profile page replaces Settings in BottomNav
  { path: "/profile/edit", element: <EditProfilePage />, isTab: false },
  { path: "/profile/about", element: <AboutPage />, isTab: false },
  {
    path: "/profile/categories",
    element: <ManageCategoriesPage />,
    isTab: false,
  },
];

function LandingPageWrapper({ hasProfile }: { hasProfile: boolean }) {
  const navigate = useNavigate();
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

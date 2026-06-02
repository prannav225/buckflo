import { Suspense, lazy } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { AppLayout } from "../components/layout/AppLayout";
import { useMonthSetup } from "../db/hooks";
import { useProfile } from "../hooks/useProfile";
import { useNotificationScheduler } from "../hooks/useNotificationScheduler";

// Lazy loaded pages
const Dashboard = lazy(() =>
  import("../pages/Dashboard").then((m) => ({ default: m.Dashboard })),
);
const MonthlyView = lazy(() =>
  import("../pages/MonthlyView").then((m) => ({ default: m.MonthlyView })),
);
const SavingsView = lazy(() =>
  import("../pages/SavingsView").then((m) => ({ default: m.SavingsView })),
);
const AddEditTransaction = lazy(() =>
  import("../pages/AddEditTransaction").then((m) => ({
    default: m.AddEditTransaction,
  })),
);
const MonthlyTransactionsView = lazy(() =>
  import("../pages/MonthlyTransactionsView").then((m) => ({
    default: m.MonthlyTransactionsView,
  })),
);
const Insights = lazy(() =>
  import("../pages/Insights").then((m) => ({ default: m.Insights })),
);
const PrivacyPolicy = lazy(() =>
  import("../pages/PrivacyPolicy").then((m) => ({ default: m.PrivacyPolicy })),
);
const TermsConditions = lazy(() =>
  import("../pages/TermsConditions").then((m) => ({
    default: m.TermsConditions,
  })),
);
const ProfilePage = lazy(() =>
  import("../pages/ProfilePage").then((m) => ({ default: m.ProfilePage })),
);
const EditProfilePage = lazy(() =>
  import("../pages/EditProfilePage").then((m) => ({
    default: m.EditProfilePage,
  })),
);
const ProfileSetupPage = lazy(() =>
  import("../pages/ProfileSetupPage").then((m) => ({
    default: m.ProfileSetupPage,
  })),
);
const AboutPage = lazy(() =>
  import("../pages/AboutPage").then((m) => ({ default: m.AboutPage })),
);
const ManageCategoriesPage = lazy(() =>
  import("../pages/ManageCategoriesPage").then((m) => ({
    default: m.ManageCategoriesPage,
  })),
);
const LandingPage = lazy(() =>
  import("../pages/LandingPage").then((m) => ({ default: m.LandingPage })),
);
const NotificationsPage = lazy(() =>
  import("../pages/NotificationsPage").then((m) => ({
    default: m.NotificationsPage,
  })),
);

const routesConfig = [
  { path: "/home", element: <Dashboard />, isTab: true },
  { path: "/monthly", element: <MonthlyView />, isTab: true },
  {
    path: "/monthly/transactions",
    element: <MonthlyTransactionsView />,
    isTab: true,
  },
  { path: "/insights", element: <Insights />, isTab: true },
  { path: "/savings", element: <SavingsView />, isTab: false },
  { path: "/add", element: <AddEditTransaction />, isTab: false },
  { path: "/edit/:id", element: <AddEditTransaction />, isTab: false },
  { path: "/profile", element: <ProfilePage />, isTab: false },
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

function SuspenseFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] w-full">
      <div className="w-8 h-8 border-3 border-(--border) border-t-(--accent) rounded-full animate-spin my-8" />
    </div>
  );
}

function LandingPageWrapper({ hasProfile }: { hasProfile: boolean }) {
  const navigate = useNavigate();

  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as unknown as { standalone?: boolean }).standalone ||
    document.referrer.includes("android-app://");

  if (isStandalone && hasProfile) {
    return <Navigate to="/home" replace />;
  }

  return (
    <Suspense fallback={<SuspenseFallback />}>
      <LandingPage
        onStart={() => {
          if (hasProfile) {
            navigate("/home");
          } else {
            navigate("/setup");
          }
        }}
      />
    </Suspense>
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
          !hasProfile ? (
            <Suspense fallback={<SuspenseFallback />}>
              <ProfileSetupPage />
            </Suspense>
          ) : (
            <Navigate to="/home" replace />
          )
        }
      />
      <Route
        path="/privacy"
        element={
          <AppLayout>
            <div className="page-transition-sheet">
              <Suspense fallback={<SuspenseFallback />}>
                <PrivacyPolicy />
              </Suspense>
            </div>
          </AppLayout>
        }
      />
      <Route
        path="/terms"
        element={
          <AppLayout>
            <div className="page-transition-sheet">
              <Suspense fallback={<SuspenseFallback />}>
                <TermsConditions />
              </Suspense>
            </div>
          </AppLayout>
        }
      />
      <Route
        path="/*"
        element={
          hasProfile ? (
            <AppLayout>
              <Suspense fallback={<SuspenseFallback />}>
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
              </Suspense>
            </AppLayout>
          ) : (
            <Navigate to="/setup" replace />
          )
        }
      />
    </Routes>
  );
}

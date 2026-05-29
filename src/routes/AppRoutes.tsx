/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "../components/layout/AppLayout";
import { Dashboard } from "../pages/Dashboard";
import { MonthlyView } from "../pages/MonthlyView";
import { SavingsView } from "../pages/SavingsView";
import { AddEditTransaction } from "../pages/AddEditTransaction";
import { MonthlyTransactionsView } from "../pages/MonthlyTransactionsView";
import { Insights } from "../pages/Insights";
import { useMonthSetup } from "../db/hooks";
import { SplashScreen } from "../components/layout/SplashScreen";
import { PrivacyPolicy } from "../pages/PrivacyPolicy";
import { TermsConditions } from "../pages/TermsConditions";
import { ProfilePage } from "../pages/ProfilePage";
import { EditProfilePage } from "../pages/EditProfilePage";
import { ProfileSetupPage } from "../pages/ProfileSetupPage";
import { AboutPage } from "../pages/AboutPage";
import { ManageCategoriesPage } from "../pages/ManageCategoriesPage";
import { useProfile } from "../hooks/useProfile";

const routesConfig = [
  { path: "/", element: <Dashboard />, isTab: true },
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

export function AppRoutes() {
  const monthSetup = useMonthSetup();
  const { profileExists, isLoading: profileLoading } = useProfile();
  const [showSplash, setShowSplash] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const [timerDone, setTimerDone] = useState(false);

  // 1. Enforce minimum 1.5s delay to play the entry branding animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setTimerDone(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const dbLoaded = monthSetup !== undefined && !profileLoading;
  const shouldExit = dbLoaded && timerDone;

  // 2. Trigger the exit transition and unmount after fade animation (600ms)
  useEffect(() => {
    if (shouldExit && !isExiting) {
      setIsExiting(true);
      const unmountTimer = setTimeout(() => {
        setShowSplash(false);
      }, 600);
      return () => clearTimeout(unmountTimer);
    }
  }, [shouldExit, isExiting]);

  const hasProfile = profileExists();

  return (
    <>
      {showSplash && <SplashScreen isExiting={isExiting} />}
      {dbLoaded ? (
        !hasProfile ? (
          <ProfileSetupPage />
        ) : (
          <AppLayout>
            <Routes>
              {routesConfig.map(({ path, element, isTab }) => (
                <Route
                  key={path}
                  path={path}
                  element={
                    <div
                      className={
                        isTab ? "page-transition-tab" : "page-transition-sheet"
                      }
                    >
                      {element}
                    </div>
                  }
                />
              ))}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AppLayout>
        )
      ) : null}
    </>
  );
}

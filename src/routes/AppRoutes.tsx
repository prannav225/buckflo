import { Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "../components/layout/AppLayout";
import { Home } from "../pages/Home";
import { MonthlyView } from "../pages/MonthlyView";
import { SavingsView } from "../pages/SavingsView";
import { AddEditTransaction } from "../pages/AddEditTransaction";
import { MonthlyTransactionsView } from "../pages/MonthlyTransactionsView";
import { Insights } from "../pages/Insights";
import { useMonthSetup } from "../db/hooks";

const routesConfig = [
  { path: "/", element: <Home />, isTab: true },
  { path: "/monthly", element: <MonthlyView />, isTab: true },
  {
    path: "/monthly/transactions",
    element: <MonthlyTransactionsView />,
    isTab: false,
  },
  { path: "/insights", element: <Insights />, isTab: true },
  { path: "/savings", element: <SavingsView />, isTab: true },
  { path: "/add", element: <AddEditTransaction />, isTab: false },
  { path: "/edit/:id", element: <AddEditTransaction />, isTab: false },
];

export function AppRoutes() {
  const monthSetup = useMonthSetup();

  // While Dexie is loading (undefined), show nothing to avoid redirect flicker
  if (monthSetup === undefined) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-(--bg)">
        <div className="w-10 h-10 border-[3px] border-solid border-(--border) border-t-(--accent) rounded-full animate-spin" />
      </div>
    );
  }

  return (
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
  );
}

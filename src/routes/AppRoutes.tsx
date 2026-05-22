import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { Dashboard } from '../pages/Dashboard';
import { MonthlyView } from '../pages/MonthlyView';
import { SavingsView } from '../pages/SavingsView';
import { AddEditTransaction } from '../pages/AddEditTransaction';
import { useMonthSetup } from '../db/hooks';

export function AppRoutes() {
  const monthSetup = useMonthSetup();

  // While Dexie is loading (undefined), show nothing to avoid redirect flicker
  if (monthSetup === undefined) {
    return (
      <div style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg)',
      }}>
        <div style={{
          width: 40,
          height: 40,
          border: '3px solid var(--border)',
          borderTopColor: 'var(--accent)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
      </div>
    );
  }

  return (
    <AppShell>
      <Routes>
        <Route path="/"        element={<Dashboard />} />
        <Route path="/monthly" element={<MonthlyView />} />
        <Route path="/savings" element={<SavingsView />} />
        <Route path="/add"     element={<AddEditTransaction />} />
        <Route path="/edit/:id" element={<AddEditTransaction />} />
        <Route path="*"        element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}

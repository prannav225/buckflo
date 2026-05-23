import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { Dashboard } from '../pages/Dashboard';
import { MonthlyView } from '../pages/MonthlyView';
import { SavingsView } from '../pages/SavingsView';
import { AddEditTransaction } from '../pages/AddEditTransaction';
import { useMonthSetup } from '../db/hooks';

export function AppRoutes() {
  const monthSetup = useMonthSetup();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let touchStartX = 0;
    let touchStartY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndX = e.changedTouches[0].screenX;
      const touchEndY = e.changedTouches[0].screenY;
      
      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;
      
      // Trigger horizontal swipe if movement > 80px and mostly horizontal
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 80) {
        const mainTabs = ['/', '/monthly', '/savings'];
        const currentIndex = mainTabs.indexOf(location.pathname);
        
        if (currentIndex === -1) return; // Only allow swiping on main tabs

        if (deltaX < 0) {
          // Swiped left -> next tab
          if (currentIndex < mainTabs.length - 1) {
            if (navigator.vibrate) navigator.vibrate(15);
            navigate(mainTabs[currentIndex + 1]);
          }
        } else {
          // Swiped right -> previous tab
          if (currentIndex > 0) {
            if (navigator.vibrate) navigator.vibrate(15);
            navigate(mainTabs[currentIndex - 1]);
          }
        }
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [location.pathname, navigate]);

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

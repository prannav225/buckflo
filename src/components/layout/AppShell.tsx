import { type ReactNode } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Plus, ArrowLeft } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BottomNav } from './BottomNav';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const isAddOrEdit = location.pathname.startsWith('/add') || location.pathname.startsWith('/edit');

  const { theme, toggleTheme } = useTheme();

  return (
    <>
      <main className="page">
        {/* ── Persistent Global Header ────────────────────────────────────────── */}
        <header className="page-header fade-in-up">
          <h1 className="brand-title">flo</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={toggleTheme}
              className="theme-btn"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              id="theme-switcher"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={() => {
                if (isAddOrEdit) {
                  navigate(-1);
                } else {
                  navigate('/add');
                }
              }}
              className="header-accent-btn"
              aria-label={isAddOrEdit ? 'Go back' : 'Add entry'}
              title={isAddOrEdit ? 'Go back' : 'Add entry'}
              id="header-action-btn"
            >
              {isAddOrEdit ? (
                <>
                  <ArrowLeft size={16} strokeWidth={2.5} />
                  <span>Back</span>
                </>
              ) : (
                <>
                  <Plus size={16} strokeWidth={2.5} />
                  <span>Add</span>
                </>
              )}
            </button>
          </div>
        </header>

        {children}
      </main>

      <BottomNav />
    </>
  );
}


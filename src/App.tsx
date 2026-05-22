import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import { AppRoutes } from './routes/AppRoutes';

export function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'var(--bg-surface)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
              fontFamily: "'Poppins', sans-serif",
              fontSize: '0.875rem',
              borderRadius: '8px',
            },
            success: {
              iconTheme: { primary: '#788c5d', secondary: '#faf9f5' },
            },
            error: {
              iconTheme: { primary: '#c0392b', secondary: '#faf9f5' },
            },
          }}
        />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;

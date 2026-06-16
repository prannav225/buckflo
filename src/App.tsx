import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "./context/ThemeContext";
import { TooltipProvider } from "./context/TooltipContext";
import { AppRoutes } from "./routes/AppRoutes";
import { Analytics } from "@vercel/analytics/react";
import { App as CapApp } from '@capacitor/app';
import { syncWidgetData, checkWidgetIntent, setupWidgetSyncHooks } from "./lib/widgetSync";

export function App() {
  useEffect(() => {
    // Check if launched from Widget
    const handleWidgetIntent = async () => {
      const res = await checkWidgetIntent();
      if (res?.action === 'add_transaction') {
        // Soft navigate using History API so React Router picks it up without a hard reload
        const url = res.category ? `/add?cat=${encodeURIComponent(res.category)}` : '/add';
        window.history.pushState({}, '', url);
        window.dispatchEvent(new Event('popstate'));
      }
    };
    handleWidgetIntent();

    // Initial sync for Android Widget
    syncWidgetData();
    setupWidgetSyncHooks();

    // Listen for app resume to check intents
    const resumeListener = CapApp.addListener('appStateChange', ({ isActive }) => {
      if (isActive) {
        handleWidgetIntent();
        syncWidgetData();
      }
    });

    return () => {
      resumeListener.then(l => l.remove());
    };
  }, []);

  return (
    <ThemeProvider>
      <BrowserRouter>
        <TooltipProvider>
          <AppRoutes />
          <Toaster
            position="top-center"
            containerStyle={{
              top: "calc(16px + env(safe-area-inset-top, 0px))",
            }}
            toastOptions={{
              duration: 3000,
              className:
                "bg-[var(--bg-surface)] text-[var(--text)] border border-black/9 dark:border-white/6 font-sans text-sm rounded-[var(--r-md)] shadow-[var(--glass-shadow-lg)] [backdrop-filter:blur(8px)] [-webkit-backdrop-filter:blur(8px)]",
              success: {
                iconTheme: { primary: "#788c5d", secondary: "#faf9f5" },
              },
              error: {
                iconTheme: { primary: "#c0392b", secondary: "#faf9f5" },
              },
            }}
          />
          <Analytics debug={false} />
        </TooltipProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;

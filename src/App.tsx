import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "./context/ThemeContext";
import { TooltipProvider } from "./context/TooltipContext";
import { AppRoutes } from "./routes/AppRoutes";

import { Analytics } from "@vercel/analytics/react";

export function App() {
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

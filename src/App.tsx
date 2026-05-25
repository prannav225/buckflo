import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "./context/ThemeContext";
import { AppRoutes } from "./routes/AppRoutes";

export function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-center"
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
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;

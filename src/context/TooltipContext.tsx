import { createContext, useContext, useState, type ReactNode } from "react";

interface TooltipContextType {
  activeTooltipId: string | null;
  setActiveTooltipId: (id: string | null) => void;
}

const TooltipContext = createContext<TooltipContextType | undefined>(undefined);

export function TooltipProvider({ children }: { children: ReactNode }) {
  const [activeTooltipId, setActiveTooltipId] = useState<string | null>(null);

  return (
    <TooltipContext.Provider value={{ activeTooltipId, setActiveTooltipId }}>
      {children}
    </TooltipContext.Provider>
  );
}

export function useTooltipContext() {
  const context = useContext(TooltipContext);
  if (context === undefined) {
    throw new Error("useTooltipContext must be used within a TooltipProvider");
  }
  return context;
}

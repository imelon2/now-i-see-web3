"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

interface GlobalErrorState {
  message: string;
  id: number;
}

interface GlobalErrorContextValue {
  error: GlobalErrorState | null;
  showError: (message: string) => void;
  clearError: () => void;
}

const GlobalErrorContext = createContext<GlobalErrorContextValue>({
  error: null,
  showError: () => {},
  clearError: () => {},
});

export function GlobalErrorProvider({ children }: { children: ReactNode }) {
  const [error, setError] = useState<GlobalErrorState | null>(null);

  const showError = useCallback((message: string) => {
    setError({ message, id: Date.now() });
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <GlobalErrorContext.Provider value={{ error, showError, clearError }}>
      {children}
    </GlobalErrorContext.Provider>
  );
}

export function useGlobalError() {
  return useContext(GlobalErrorContext);
}

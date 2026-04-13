"use client";

import type { ReactNode } from "react";
import { GlobalErrorProvider } from "@/context/GlobalErrorContext";
import { GlobalErrorBanner } from "@/components/ui/GlobalErrorBanner";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <GlobalErrorProvider>
      <GlobalErrorBanner />
      {children}
    </GlobalErrorProvider>
  );
}

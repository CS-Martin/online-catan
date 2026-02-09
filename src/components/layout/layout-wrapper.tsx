"use client";

import { ReactNode } from "react";
import ErrorBoundary from "@/components/ui/error-boundary";
import { Navigation } from "./navigation";

interface LayoutWrapperProps {
  children: ReactNode;
  showNavigation?: boolean;
}

export function LayoutWrapper({ children, showNavigation = true }: LayoutWrapperProps) {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        {showNavigation && <Navigation />}
        <main className="flex-1">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </div>
    </ErrorBoundary>
  );
}

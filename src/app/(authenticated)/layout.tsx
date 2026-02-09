"use client";

import { ReactNode } from "react";
import { Navigation } from "@/components/layout/navigation";
import { Sidebar as AppSidebar } from "@/components/layout/sidebar";
import {
  SidebarInset,
  SidebarProvider,
  Sidebar,
} from "@/components/ui/sidebar";

export default function AuthenticatedLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <SidebarProvider>
      <Sidebar collapsible="offcanvas">
        <AppSidebar />
      </Sidebar>

      <SidebarInset>
        <div className="min-h-screen bg-background text-foreground">
          {/* Top Navigation Bar */}
          <Navigation />

          {/* Main Content Area */}
          <main className="flex-1 p-6 pb-20">{children}</main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

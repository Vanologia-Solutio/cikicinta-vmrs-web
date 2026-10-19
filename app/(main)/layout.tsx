import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ReactNode } from "react";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-w-0 overflow-x-clip">
        <SiteHeader />
        <div className="flex min-w-0 flex-1 flex-col gap-4 p-4 pt-0 overflow-x-clip">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

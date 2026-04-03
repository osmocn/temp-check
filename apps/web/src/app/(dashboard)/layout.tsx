import {
  SidebarInset,
  SidebarProvider,
} from "@coco-kit/ui/components/ui/sidebar";
import { UserSidebar } from "@/components/sidebar/user-sidebar";

export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <UserSidebar variant="sidebar" />
      <SidebarInset>
        <div className="flex flex-1 flex-col max-w-5xl mx-auto w-full py-16 px-8">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

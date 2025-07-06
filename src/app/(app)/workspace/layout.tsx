import { AppSidebar } from "@/components/app-sidebar"; 
import { DynamicBreadcrumbs } from "@/components/ui/dynamic-breadcrumbs";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"; 

export default function RootLayout({
children,
}: Readonly<{
children: React.ReactNode;
}>) {
return (  
    <SidebarProvider> 
      <AppSidebar /> 
      <main className="flex-1 overflow-auto px-4 grid grid-rows-[auto_1fr] "> 
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 flex-grow">
            <SidebarTrigger className="-ml-1" /> 
            <DynamicBreadcrumbs />
          </div>
        </header>
        <div className="mb-4 overflow-auto">
          {children}
        </div>
      </main>
    </SidebarProvider>  
  );
}
import { Card } from "@/components/ui/card";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { DynamicBreadcrumbs } from "@/components/ui/dynamic-breadcrumbs";


export default function Page() {

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
    <div className="flex flex-col w-full h-full items-center justify-center">
    <Card className="w-full h-full bg-background">
        {/* This is the app content */}
    </Card>
  </div>;
    </div>
  </main>
</SidebarProvider>  
}
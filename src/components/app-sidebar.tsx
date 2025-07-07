"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Building2, Calendar, Presentation, FileText, ListTodo, Plus, Users } from "lucide-react"
import { SidebarLogo } from "./app-sidebar-logo"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { AuthButton } from "@/components/auth-button"

export function AppSidebar() {
  const pathname = usePathname()

  const handleCreateMeeting = () => {
    console.log("Create meeting clicked")
  }

  const handleCreateContact = () => {
    console.log("Create contact clicked")
  }

  const handleCreateCompany = () => {
    console.log("Create company clicked")
  }

  const handleCreateTask = () => {
    console.log("Create task clicked")
  }

  const handleCreateNote = () => {
    console.log("Create note clicked")
  }

  const handleCreateDiagram = () => {
    console.log("Create diagram clicked")
  }

  const navigationItems = [
    {
      label: "Diagrams",
      href: "/workspace/diagram",
      icon: Presentation,
      action: handleCreateDiagram,
      actionAriaLabel: "Create new diagram",
    },
    {
      label: "Notes",
      href: "/workspace/note",
      icon: FileText,
      action: handleCreateNote,
      actionAriaLabel: "Create new note",
    },
    {
      label: "Tasks",
      href: "/workspace/task",
      icon: ListTodo,
      action: handleCreateTask,
      actionAriaLabel: "Create new task",
    },
    {
      label: "Meetings",
      href: "/workspace/meeting",
      icon: Calendar,
      action: handleCreateMeeting,
      actionAriaLabel: "Create new meeting",
    },
    {
      label: "Person",
      href: "/workspace/person",
      icon: Users,
      action: handleCreateContact,
      actionAriaLabel: "Create new contact",
    },
    {
      label: "Company",
      href: "/workspace/company",
      icon: Building2,
      action: handleCreateCompany,
      actionAriaLabel: "Create new company",
    },
  ]


  return (
    <>
      <Sidebar>
        <SidebarHeader>
          <SidebarLogo />
        </SidebarHeader>
        <SidebarContent className="flex flex-col">

          {/* Navigation */}
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationItems.map((item) => (
                  <SidebarMenuItem key={item.href} className="">
                    <SidebarMenuButton 
                      asChild
                      className={cn(
                        " w-full justify-start",
                        pathname.startsWith(item.href)
                          ? "bg-muted/50 hover:bg-muted font-semibold"
                          : "hover:bg-muted"
                      )}
                    >
                      <Link href={item.href}>
                        <item.icon className="size-3.5 mr-2 flex-none text-muted-foreground" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                    {item.action && (
                      <SidebarMenuAction asChild className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={item.action}
                          className="disabled:cursor-not-allowed text-muted-foreground hover:text-foreground"
                          aria-label={item.actionAriaLabel}
                        >
                            <Plus className="size-4 text-muted-foreground" />
                        </button>
                      </SidebarMenuAction>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

        </SidebarContent>
        <SidebarFooter>
          <AuthButton />
        </SidebarFooter>
      </Sidebar>
    </>
  )
}
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
import { Building2, Calendar, Presentation, File, ListTodo, Plus, Users } from "lucide-react"
import { SidebarLogo } from "./app-sidebar-logo"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { AuthButton } from "@/components/auth-button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { useState } from "react"
import { ContactAddForm } from "@/app/(app)/workspace/person/_components/form-wrapper"
import { MeetingAddForm } from "@/app/(app)/workspace/meeting/_components/form-wrapper"
import { CompanyAddForm } from "@/app/(app)/workspace/company/_components/form-wrapper"
import { TaskAddForm } from "@/app/(app)/workspace/task/_components/form-wrapper"
import { NoteAddForm } from "@/app/(app)/workspace/note/_components/form-wrapper"
import { createPerson } from "@/app/(app)/workspace/person/_lib/actions"
import { createMeeting } from "@/app/(app)/workspace/meeting/_lib/actions"
import { createCompany } from "@/app/(app)/workspace/company/_lib/actions"
import { createTask } from "@/app/(app)/workspace/task/_lib/actions"
import { createNote } from "@/app/(app)/workspace/note/_lib/actions"

export function AppSidebar() {
  const pathname = usePathname()
  const [isContactSheetOpen, setIsContactSheetOpen] = useState(false)
  const [isMeetingSheetOpen, setIsMeetingSheetOpen] = useState(false)
  const [isCompanySheetOpen, setIsCompanySheetOpen] = useState(false)
  const [isTaskSheetOpen, setIsTaskSheetOpen] = useState(false)
  const [isNoteSheetOpen, setIsNoteSheetOpen] = useState(false)

  const handleCreateMeeting = () => {
    setIsMeetingSheetOpen(true)
  }

  const handleCreateContact = () => {
    setIsContactSheetOpen(true)
  }

  const handleCreateCompany = () => {
    setIsCompanySheetOpen(true)
  }

  const handleCreateTask = () => {
    setIsTaskSheetOpen(true)
  }

  const handleCreateNote = () => {
    setIsNoteSheetOpen(true)
  }

  const handleCreateDiagram = () => {
    console.log("Create diagram clicked")
  }

  const navigationItems = [
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
    {
      label: "Meeting",
      href: "/workspace/meeting",
      icon: Calendar,
      action: handleCreateMeeting,
      actionAriaLabel: "Create new meeting",
    },
    {
      label: "Note",
      href: "/workspace/note",
      icon: File,
      action: handleCreateNote,
      actionAriaLabel: "Create new note",
    },
    {
      label: "Task",
      href: "/workspace/task",
      icon: ListTodo,
      action: handleCreateTask,
      actionAriaLabel: "Create new task",
    },
    {
      label: "Diagram",
      href: "/workspace/diagram",
      icon: Presentation,
      action: handleCreateDiagram,
      actionAriaLabel: "Create new diagram",
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

      {/* Contact Creation Sheet */}
      <Sheet open={isContactSheetOpen} onOpenChange={setIsContactSheetOpen}>
        <SheetContent className="flex flex-col sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Add New Contact</SheetTitle>
            <SheetDescription>Add a new contact to your CRM.</SheetDescription>
          </SheetHeader>
          
          <div className="flex-1 overflow-hidden">
            <ContactAddForm
              onSuccess={() => setIsContactSheetOpen(false)}
              onCancel={() => setIsContactSheetOpen(false)}
              createAction={createPerson}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Meeting Creation Sheet */}
      <Sheet open={isMeetingSheetOpen} onOpenChange={setIsMeetingSheetOpen}>
        <SheetContent className="flex flex-col sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Add New Meeting</SheetTitle>
            <SheetDescription>Add a new meeting to your CRM.</SheetDescription>
          </SheetHeader>
          
          <div className="flex-1 overflow-hidden">
            <MeetingAddForm
              onSuccess={() => setIsMeetingSheetOpen(false)}
              onCancel={() => setIsMeetingSheetOpen(false)}
              createAction={createMeeting}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Company Creation Sheet */}
      <Sheet open={isCompanySheetOpen} onOpenChange={setIsCompanySheetOpen}>
        <SheetContent className="flex flex-col sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Add New Company</SheetTitle>
            <SheetDescription>Add a new company to your CRM.</SheetDescription>
          </SheetHeader>
          
          <div className="flex-1 overflow-hidden">
            <CompanyAddForm
              onSuccess={() => setIsCompanySheetOpen(false)}
              onCancel={() => setIsCompanySheetOpen(false)}
              createAction={createCompany}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Task Creation Sheet */}
      <Sheet open={isTaskSheetOpen} onOpenChange={setIsTaskSheetOpen}>
        <SheetContent className="flex flex-col sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Add New Task</SheetTitle>
            <SheetDescription>Add a new task to your CRM.</SheetDescription>
          </SheetHeader>
          
          <div className="flex-1 overflow-hidden">
            <TaskAddForm
              onSuccess={() => setIsTaskSheetOpen(false)}
              onCancel={() => setIsTaskSheetOpen(false)}
              createAction={createTask}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Note Creation Sheet */}
      <Sheet open={isNoteSheetOpen} onOpenChange={setIsNoteSheetOpen}>
        <SheetContent className="flex flex-col sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Add New Note</SheetTitle>
            <SheetDescription>Add a new note to your CRM.</SheetDescription>
          </SheetHeader>
          
          <div className="flex-1 overflow-hidden">
            <NoteAddForm
              onSuccess={() => setIsNoteSheetOpen(false)}
              onCancel={() => setIsNoteSheetOpen(false)}
              createAction={createNote}
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
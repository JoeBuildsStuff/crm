"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { NoteWithRelations } from "../_lib/validations"
import {ClipboardList, User, GitBranch, FileText } from "lucide-react"

export const columns: ColumnDef<NoteWithRelations>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    meta: {
      excludeFromForm: true,
    },
  },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader 
        column={column} 
        title="Title" 
        icon={<FileText className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />}
      />
    ),
    cell: ({ row }) => {
      const title = row.getValue("title") as string
      return (
        <div className="flex items-center gap-2">
          <span className="font-medium max-w-[400px] truncate">{title || "—"}</span>
        </div>
      )
    },
    meta: {
      label: "Title",
      variant: "text",
      placeholder: "Enter note title...",
    },
    enableColumnFilter: true,
  },
  {
    accessorKey: "content",
    header: ({ column }) => (
      <DataTableColumnHeader 
        column={column} 
        title="Content" 
        icon={<ClipboardList className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />}
      />
    ),
    cell: ({ row }) => {
      const content = row.getValue("content") as string
      return (
        <div className="flex items-center gap-2">
          <span className="font-medium max-w-[400px] truncate">{content || "—"}</span>
        </div>
      )
    },
    meta: {
      label: "Content",
      variant: "text",
      placeholder: "Enter note content...",
    },
    enableColumnFilter: true,
  },
  {
    id: "meeting",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Meeting" icon={<GitBranch className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />} />,
    cell: ({ row }) => {
      const meeting = row.original.meetings
      return <div className="text-sm text-muted-foreground">{meeting?.title || "—"}</div>
    },
    accessorKey: "meeting_id",
    meta: {
      label: "Meeting",
      variant: "select",
      // This would need to be populated from a query
      options: [],
    },
  },
  {
    id: "contact",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Contact" icon={<User className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />} />,
    cell: ({ row }) => {
      const contact = row.original.contacts
      if (!contact || (!contact.first_name && !contact.last_name)) return <div className="text-muted-foreground">—</div>
      const fullName = `${contact.first_name || ""} ${contact.last_name || ""}`.trim()
      return <div className="text-sm text-muted-foreground">{fullName || "—"}</div>
    },
    accessorKey: "contact_id",
    meta: {
      label: "Contact",
      variant: "select",
      // This would need to be populated from a query
      options: [],
    },
  },
]
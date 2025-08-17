"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { NoteWithRelations } from "../_lib/validations"
import { User, Type, Pilcrow, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"

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
        icon={<Type className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />}
      />
    ),
    cell: ({ row }) => {
      const title = row.getValue("title") as string
      return (
        <div className="flex items-center gap-2">
          <Badge 
            key={row.original.id}
            variant="indigo" 
            className="text-sm font-normal"
            href={`/workspace/note/${row.original.id}`}
          >
            {title || "Untitled Note"}
          </Badge>
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
        icon={<Pilcrow className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />}
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
    header: ({ column }) => <DataTableColumnHeader column={column} title="Meeting" icon={<Calendar className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />} />,
    cell: ({ row }) => {
      const meeting = row.original.meetings
      if (!meeting?.title) return <div className="text-muted-foreground">—</div>
      return (
        <Badge 
          variant="green" 
          className="text-sm font-normal"
          href={`/workspace/meeting/${meeting.id}`}
        >
          {meeting.title}
        </Badge>
      )
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
      return (
        <Badge 
          variant="blue" 
          className="text-sm font-normal"
          href={`/workspace/person/${contact.id}`}
        >
          {fullName || "—"}
        </Badge>
      )
    },
    accessorKey: "contact_id",
    meta: {
      label: "Contact",
      variant: "select",
      // This would need to be populated from a query
      options: [],
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Created" icon={<Calendar className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />} />,
    cell: ({ row }) => {
      const createdAt = row.getValue("created_at") as string
      if (!createdAt) return <div className="text-muted-foreground">—</div>
      
      const date = new Date(createdAt)
      const formatted = new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(date)
      
      return <div className="text-sm text-muted-foreground">{formatted}</div>
    },
    meta: {
      label: "Created",
      variant: "date",
      readOnly: true,
    },
    enableColumnFilter: true,
  },
  {
    accessorKey: "updated_at",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Updated" icon={<Calendar className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />}  />,
    cell: ({ row }) => {
      const updatedAt = row.getValue("updated_at") as string
      if (!updatedAt) return <div className="text-muted-foreground">—</div>
      
      const date = new Date(updatedAt)
      const formatted = new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(date)
      
      return <div className="text-sm text-muted-foreground">{formatted}</div>
    },
    meta: {
      label: "Updated",
      variant: "date",
      readOnly: true,
    },
    enableColumnFilter: true,
  },
]
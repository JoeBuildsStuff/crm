"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { TaskWithRelations } from "../_lib/validations"
import { Badge } from "@/components/ui/badge"
import {Calendar, User, Milestone, Pilcrow, ArrowUpRight, Type } from "lucide-react"
import Link from "next/link"

export const columns: ColumnDef<TaskWithRelations>[] = [
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
          <Link 
            href={`/workspace/task/${row.original.id}`}
            className="hover:underline cursor-pointer"
          >
            <span className="flex items-center gap-1">
              {title || "Untitled Task"} <ArrowUpRight className="size-4" strokeWidth={1.5} />
            </span>
          </Link>
        </div>
      )
    },
    meta: {
      label: "Title",
      variant: "text",
      placeholder: "Enter task title...",
    },
    enableColumnFilter: true,
  },
  {
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader 
        column={column} 
        title="Description" 
        icon={<Pilcrow className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />}
      />
    ),
    cell: ({ row }) => {
      const description = row.getValue("description") as string
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {description || "No description"}
          </span>
        </div>
      )
    },
    meta: {
      label: "Description",
      variant: "text",
      placeholder: "Enter task description...",
    },
    enableColumnFilter: true,
    enableHiding: true,
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader 
        column={column} 
        title="Status" 
        icon={<Milestone className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />}
      />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      if (!status) return <div className="text-muted-foreground">—</div>
      return <Badge variant="outline">{status}</Badge>
    },
    meta: {
      label: "Status",
      variant: "select",
      options: [
        { label: "To Do", value: "TO_DO" },
        { label: "In Progress", value: "IN_PROGRESS" },
        { label: "Done", value: "DONE" },
        { label: "Cancelled", value: "CANCELLED" },
      ]
    },
    enableColumnFilter: true,
  },
  {
    accessorKey: "due_date",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Due Date" icon={<Calendar className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />} />,
    cell: ({ row }) => {
      const dueDate = row.getValue("due_date") as string
      if (!dueDate) return <div className="text-muted-foreground">—</div>
      
      const date = new Date(dueDate)
      const formatted = new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(date)
      
      return <div className="text-sm text-muted-foreground">{formatted}</div>
    },
    meta: {
      label: "Due Date",
      variant: "date",
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
        <Link 
          href={`/workspace/meeting/${meeting.id}`}
          className="inline-flex items-center gap-1 group cursor-pointer"
        >
          <Badge 
            variant="green" 
            className="text-sm font-normal transition-all duration-200 group-hover:pr-6"
          >
            {meeting.title}
          </Badge>
          <ArrowUpRight className="size-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 -ml-7 text-green-600 dark:text-green-400" />
        </Link>
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
    id: "assignee",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Assignee" icon={<User className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />} />,
    cell: ({ row }) => {
      const contact = row.original.contacts
      if (!contact || (!contact.first_name && !contact.last_name)) return <div className="text-muted-foreground">—</div>
      const fullName = `${contact.first_name || ""} ${contact.last_name || ""}`.trim()
      return (
        <Link 
          href={`/workspace/person/${contact.id}`}
          className="inline-flex items-center gap-1 group cursor-pointer"
        >
          <Badge 
            variant="blue" 
            className="text-sm font-normal transition-all duration-200 group-hover:pr-6"
          >
            {fullName || "—"}
          </Badge>
          <ArrowUpRight className="size-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 -ml-7 text-blue-600 dark:text-blue-400" />
        </Link>
      )
    },
    accessorKey: "assigned_to_contact_id",
    meta: {
      label: "Assignee",
      variant: "select",
      // This would need to be populated from a query
      options: [],
    },
  },
]
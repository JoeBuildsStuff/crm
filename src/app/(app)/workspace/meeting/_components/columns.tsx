"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { Meeting } from "../_lib/validations"
import { Calendar, Clock, FileText, CheckCircle, CircleX, Circle, PlayCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export const columns: ColumnDef<Meeting>[] = [
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
        title="Meeting Title" 
        icon={<FileText className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />}
      />
    ),
    cell: ({ row }) => {
      const title = row.getValue("title") as string
      return (
        <div className="flex items-center gap-2">
          <span className="font-medium">{title || "—"}</span>
        </div>
      )
    },
    meta: {
      label: "Meeting Title",
      variant: "text",
      placeholder: "Enter meeting title...",
    },
    enableColumnFilter: true,
  },
  {
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader 
        column={column} 
        title="Description" 
        icon={<FileText className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />}
      />
    ),
    cell: ({ row }) => {
      const description = row.getValue("description") as string
      if (!description) return <div className="text-muted-foreground">—</div>
      
      // Truncate description for display
      const truncated = description.length > 100 ? description.substring(0, 100) + "..." : description
      
      return (
        <div className="text-sm text-muted-foreground max-w-[300px] truncate" title={description}>
          {truncated}
        </div>
      )
    },
    meta: {
      label: "Description",
      variant: "text",
      placeholder: "Enter meeting description...",
    },
    enableColumnFilter: true,
  },
  {
    accessorKey: "start_time",
    header: ({ column }) => (
      <DataTableColumnHeader 
        column={column} 
        title="Start Time" 
        icon={<Clock className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />}
      />
    ),
    cell: ({ row }) => {
      const startTime = row.getValue("start_time") as string
      if (!startTime) return <div className="text-muted-foreground">—</div>
      
      const date = new Date(startTime)
      const formattedDate = new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(date)
      const formattedTime = new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).format(date)
      
      return (
        <div className="text-sm">
          <div className="font-medium">{formattedDate}</div>
          <div className="text-muted-foreground">{formattedTime}</div>
        </div>
      )
    },
    meta: {
      label: "Start Time",
      variant: "date",
      placeholder: "Select start time...",
    },
    enableColumnFilter: true,
  },
  {
    accessorKey: "end_time",
    header: ({ column }) => (
      <DataTableColumnHeader 
        column={column} 
        title="End Time" 
        icon={<Clock className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />}
      />
    ),
    cell: ({ row }) => {
      const endTime = row.getValue("end_time") as string
      if (!endTime) return <div className="text-muted-foreground">—</div>
      
      const date = new Date(endTime)
      const formattedDate = new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(date)
      const formattedTime = new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).format(date)
      
      return (
        <div className="text-sm">
          <div className="font-medium">{formattedDate}</div>
          <div className="text-muted-foreground">{formattedTime}</div>
        </div>
      )
    },
    meta: {
      label: "End Time",
      variant: "date",
      placeholder: "Select end time...",
    },
    enableColumnFilter: true,
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader 
        column={column} 
        title="Status" 
        icon={<CheckCircle className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />}
      />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      if (!status) return <div className="text-muted-foreground">—</div>
      
      const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
          case 'completed':
            return <CheckCircle className="size-3" />
          case 'cancelled':
            return <CircleX className="size-3" />
          case 'in_progress':
            return <PlayCircle className="size-3" />
          default:
            return <Circle className="size-3" />
        }
      }
      
      const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
        switch (status.toLowerCase()) {
          case 'completed':
            return 'default'
          case 'cancelled':
            return 'destructive'
          case 'in_progress':
            return 'secondary'
          default:
            return 'outline'
        }
      }
      
      return (
        <Badge variant={getStatusVariant(status)} className="gap-1">
          {getStatusIcon(status)}
          {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
        </Badge>
      )
    },
    meta: {
      label: "Status",
      variant: "select",
      placeholder: "Select status...",
      options: [
        { label: "Scheduled", value: "scheduled" },
        { label: "In Progress", value: "in_progress" },
        { label: "Completed", value: "completed" },
        { label: "Cancelled", value: "cancelled" }
      ]
    },
    enableColumnFilter: true,
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
]
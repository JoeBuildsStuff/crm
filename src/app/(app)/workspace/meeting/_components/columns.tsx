"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { MeetingWithRelations } from "../_lib/validations"
import { Calendar, CheckCircle, CircleX, Circle, PlayCircle, Timer, Pilcrow, Type, Users, ArrowUpRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import Link from "next/link"

export const columns: ColumnDef<MeetingWithRelations>[] = [
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
            href={`/workspace/meeting/${row.original.id}`}
            className="hover:underline cursor-pointer"
          >
            <span className="flex items-center gap-1">
              {title || "Untitled Meeting"} <ArrowUpRight className="size-4" strokeWidth={1.5} />
            </span>
          </Link>
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
        icon={<Pilcrow className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />}
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
        title="Date" 
        icon={<Calendar className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />}
      />
    ),
    cell: ({ row }) => {
      const startTime = row.getValue("start_time") as string
      if (!startTime) return <div className="text-muted-foreground">—</div>
      
      const date = new Date(startTime)
      const formatted = format(date, "E, LLL d @ h:mm a")
      
      return (
        <div className="text-sm font-medium">
          {formatted}
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
    id: "duration",
    accessorFn: (row) => {
      if (!row.start_time || !row.end_time) {
        return null
      }
      const start = new Date(row.start_time)
      const end = new Date(row.end_time)
      return Math.round((end.getTime() - start.getTime()) / (1000 * 60))
    },
    header: ({ column }) => (
      <DataTableColumnHeader 
        column={column} 
        title="Duration" 
        icon={<Timer className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />}
      />
    ),
    cell: ({ row }) => {
      const durationInMinutes = row.getValue("duration") as number | null

      if (durationInMinutes === null || durationInMinutes < 0) {
        return <div className="text-muted-foreground">—</div>
      }
      
      const hours = Math.floor(durationInMinutes / 60)
      const minutes = durationInMinutes % 60
      
      const parts = []
      if (hours > 0) {
        parts.push(`${hours}h`)
      }
      if (minutes > 0 || hours === 0) {
        parts.push(`${minutes}m`)
      }
      
      return <div className="text-sm font-medium">{parts.join(" ")}</div>
    },
    meta: {
      label: "Duration",
      excludeFromForm: true,
    },
    enableSorting: true,
  },
  {
    id: "attendees_count",
    header: ({ column }) => (
      <DataTableColumnHeader 
        column={column} 
        title="Attendees" 
        icon={<Users className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />}
      />
    ),
    cell: ({ row }) => {
      const attendees = row.original.attendees || []
      
      if (attendees.length === 0) {
        return <div className="text-muted-foreground">—</div>
      }
      
      return (
        <div className="flex items-center gap-1 flex-wrap">
          {attendees.map((attendee) => {
            // Determine the display name
            let displayName = "Unknown"
            
            if (attendee.contact) {
              // Use contact information if available
              const firstName = attendee.contact.first_name || ""
              const lastName = attendee.contact.last_name || ""
              displayName = `${firstName} ${lastName}`.trim() || "Unknown Contact"
            } else if (attendee.external_name) {
              // Use external name if no contact linked
              displayName = attendee.external_name
            } else if (attendee.external_email) {
              // Use external email as fallback
              displayName = attendee.external_email
            }
            
            return (
              <Badge 
                key={attendee.id} 
                variant="secondary" 
                className="text-xs font-normal"
              >
                {displayName}
              </Badge>
            )
          })}
        </div>
      )
    },
    meta: {
      label: "Attendees",
      variant: "multiSelect",
      placeholder: "Select attendees...",
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
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { Company } from "../_lib/validations"
import { Building2, Pilcrow, Calendar, ArrowUpRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export const columns: ColumnDef<Company>[] = [
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
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader 
        column={column} 
        title="Company Name" 
        icon={<Building2 className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />}
      />
    ),
    cell: ({ row }) => {
      const name = row.getValue("name") as string
      return (
        <div className="flex items-center gap-2">
          <Link 
            href={`/workspace/company/${row.original.id}`}
            className="inline-flex items-center gap-1 group cursor-pointer"
          >
            <Badge 
              variant="outline" 
              className="text-sm font-normal transition-all duration-200 group-hover:pr-6"
            >
              {name || "Untitled Company"}
            </Badge>
            <ArrowUpRight className="size-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 -ml-7 text-muted-foreground" />
          </Link>
        </div>
      )
    },
    meta: {
      label: "Name",
      variant: "text",
      placeholder: "Enter company name...",
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
      placeholder: "Enter company description...",
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
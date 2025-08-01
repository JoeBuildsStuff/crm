import { createClient } from "@/lib/supabase/server"
import { parseSearchParams, SearchParams } from "@/lib/data-table"
import { NoteWithRelations } from "./validations"
import { PostgrestError } from "@supabase/supabase-js"
import { Person } from "../../person/_lib/validations"
import { Meeting } from "../../meeting/_lib/validations"
import { Company } from "../../company/_lib/validations"

export async function getNotes(searchParams: SearchParams): Promise<{
  data: NoteWithRelations[],
  count: number,
  error: PostgrestError | null
}> {
  const supabase = await createClient()
  const {
    pagination,
    sorting,
    columnFilters
  } = parseSearchParams(searchParams)

  const { pageIndex, pageSize } = pagination ?? { pageIndex: 0, pageSize: 10 }
  const sort = sorting ?? []
  const filters = columnFilters ?? []

  let query = supabase
    .schema("registry")
    .from("notes")
    .select("*, meetings(id, title), contacts(id, first_name, last_name)", { count: "exact" })

  // Sorting
  if (sort.length > 0) {
    sort.forEach((s: { id: string; desc: boolean }) => {
      query = query.order(s.id, { ascending: !s.desc })
    })
  } else {
    query = query.order("created_at", { ascending: false })
  }

  // Filtering
  filters.forEach((filter: { id: string; value: unknown }) => {
    const { id: columnId, value: filterValue } = filter
    if (typeof filterValue === 'object' && filterValue !== null && 'operator' in filterValue) {
      const { operator, value } = filterValue as { operator: string, value: unknown }

      if (!operator || value === null || value === undefined || (typeof value === 'string' && value === '')) return

      // Handle regular columns
      switch (operator) {
        case "iLike":
          query = query.ilike(columnId, `%${value}%`)
          break
        case "notILike":
          query = query.not(columnId, 'ilike', `%${value}%`)
          break
        case "eq":
          query = query.eq(columnId, value)
          break
        case "ne":
          query = query.neq(columnId, value)
          break
        case "lt":
          query = query.lt(columnId, value)
          break
        case "gt":
          query = query.gt(columnId, value)
          break
        case "inArray":
          query = query.in(columnId, value as (string | number)[])
          break
        case "notInArray":
          query = query.not(columnId, 'in', `(${(value as (string | number)[]).join(',')})`)
          break
        case "isEmpty":
          query = query.or(`${columnId}.is.null,${columnId}.eq.""`)
          break
        case "isNotEmpty":
          query = query.not(columnId, 'is', null).not(columnId, 'eq', '""')
          break
        case "isBetween":
          if (Array.isArray(value) && value.length === 2) {
            query = query.gte(columnId, value[0]).lte(columnId, value[1])
          }
          break
        default:
          break
      }
    }
  })

  // Pagination
  const from = pageIndex * pageSize
  const to = from + pageSize - 1
  query = query.range(from, to)

  const { data, count, error } = await query

  return {
    data: (data as NoteWithRelations[]) || [],
    count: count ?? 0,
    error
  }
}

export async function getNote(id: string): Promise<{
  data: NoteWithRelations | null,
  error: PostgrestError | null
}> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .schema("registry")
    .from("notes")
    .select("*, meetings(id, title), contacts(id, first_name, last_name)")
    .eq("id", id)
    .single()

  return {
    data: data as NoteWithRelations | null,
    error
  }
}


export async function getAssignableContacts(): Promise<{
  data: Pick<Person, "id" | "first_name" | "last_name">[],
  error: PostgrestError | null
}> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .schema("registry")
        .from("contacts")
        .select("id, first_name, last_name")
        .order("first_name", { ascending: true })
        .order("last_name", { ascending: true })
    
    return { data: data ?? [], error }
}

export async function getLinkableMeetings(): Promise<{
  data: Pick<Meeting, "id" | "title">[],
  error: PostgrestError | null
}> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .schema("registry")
        .from("meetings")
        .select("id, title")
        .order("title", { ascending: true })
    
    return { data: data ?? [], error }
}

export async function getAvailableCompanies(): Promise<{
  data: Pick<Company, "id" | "name">[],
  error: PostgrestError | null
}> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .schema("registry")
        .from("companies")
        .select("id, name")
        .order("name", { ascending: true })
    
    return { data: data ?? [], error }
}


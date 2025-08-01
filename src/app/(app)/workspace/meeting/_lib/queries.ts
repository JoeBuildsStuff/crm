import { createClient } from "@/lib/supabase/server"
import { parseSearchParams, SearchParams } from "@/lib/data-table"
import { MeetingWithRelations } from "./validations"
import { PostgrestError } from "@supabase/supabase-js"
import { Person } from "../../person/_lib/validations"

export async function getMeeting(id: string): Promise<{
  data: MeetingWithRelations | null,
  error: PostgrestError | null
}> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .schema("registry")
    .from("meetings")
    .select(`
      *,
      attendees:meeting_attendees(
        *,
        contact:contacts(id, first_name, last_name)
      )
    `)
    .eq("id", id)
    .single()
  
  return { data: data ?? null, error }
}

export async function getAvailableContacts(): Promise<{
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

export async function getMeetings(searchParams: SearchParams): Promise<{
  data: MeetingWithRelations[],
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
    .from("meetings")
    .select(`
      *,
      attendees:meeting_attendees(
        *,
        contact:contacts(id, first_name, last_name)
      )
    `, { count: "exact" })

  // Sorting
  if (sort.length > 0) {
    sort.forEach(s => {
      // Handle computed columns
      switch (s.id) {
        case "attendees_count":
          // Sort by meeting title as fallback since we can't easily sort by attendee count
          query = query.order("title", { ascending: !s.desc })
          break
        default:
          query = query.order(s.id, { ascending: !s.desc })
      }
    })
  } else {
    query = query.order("start_time", { ascending: false })
  }

  // Filtering
  filters.forEach(filter => {
    const { id: columnId, value: filterValue } = filter
    if (typeof filterValue === 'object' && filterValue !== null && 'operator' in filterValue) {
      const { operator, value } = filterValue as { operator: string, value: unknown }

      if (!operator || value === null || value === undefined || (typeof value === 'string' && value === '')) return

      // Handle computed columns
      switch (columnId) {
        case "attendees_count":
          // Skip filtering by attendee count for now
          console.warn("Attendee count filtering not implemented at query level")
          break
        default:
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
    }
  })

  // Pagination
  const from = pageIndex * pageSize
  const to = from + pageSize - 1
  query = query.range(from, to)

  const { data, count, error } = await query

  return {
    data: data || [],
    count: count ?? 0,
    error
  }
}


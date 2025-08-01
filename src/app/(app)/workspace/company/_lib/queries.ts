import { createClient } from "@/lib/supabase/server"
import { parseSearchParams, SearchParams } from "@/lib/data-table"
import { Company } from "./validations"
import { PostgrestError } from "@supabase/supabase-js"

export async function getCompany(id: string): Promise<{
  data: Company | null,
  error: PostgrestError | null
}> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .schema("registry")
    .from("companies")
    .select("*")
    .eq("id", id)
    .single()
  
  return { data: data ?? null, error }
}

export async function getCompanies(searchParams: SearchParams): Promise<{
  data: Company[],
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
    .from("companies")
    .select("*", { count: "exact" })

  // Sorting
  if (sort.length > 0) {
    sort.forEach(s => {
      query = query.order(s.id, { ascending: !s.desc })
    })
  } else {
    query = query.order("name", { ascending: true })
  }

  // Filtering
  filters.forEach(filter => {
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
    data: data || [],
    count: count ?? 0,
    error
  }
}


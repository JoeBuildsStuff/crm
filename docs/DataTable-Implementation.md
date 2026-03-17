# dashboard Data Table CRUD Pattern

This guide documents the standard CRM pattern for building a new dashboard page backed by a Supabase table, using the shared data table stack.

Use this when someone gives you:
- a Supabase schema/table name
- a new route like `/dashboard/<entity>`
- a requirement for filter/sort/pagination + add/edit/delete + multi-edit/multi-delete

## 1) What is already standardized

- Base UI table primitives: `src/components/ui/table.tsx`
- Shared table behavior: `src/components/data-table/data-table.tsx`
  - server-driven pagination
  - server-driven sorting/filtering
  - row selection
  - add/edit/multi-edit/delete actions in toolbar
- URL state sync for table state: `src/lib/data-table`

You should build new dashboard tables by composing these pieces, not reinventing a table implementation.

## 2) Reference implementations

- Simple single-table CRUD:
  - `company`
  - `task`
  - `note`
- Relational CRUD (main table + child tables):
  - `person` (`contacts` + `contact_emails` + `contact_phones`)
  - `meeting` (`meetings` + `meeting_attendees`)

## 3) Required file structure for a new entity

Assume entity `todo` at route `/dashboard/todo`.

Create:

1. `src/app/(app)/dashboard/todo/page.tsx`
2. `src/app/(app)/dashboard/todo/_components/table.tsx`
3. `src/app/(app)/dashboard/todo/_components/columns.tsx`
4. `src/app/(app)/dashboard/todo/_components/form.tsx`
5. `src/app/(app)/dashboard/todo/_components/form-wrapper.tsx`
6. `src/app/(app)/dashboard/todo/_lib/queries.ts`
7. `src/app/(app)/dashboard/todo/_lib/actions.ts`
8. `src/app/(app)/dashboard/todo/_lib/validations.ts`

Then update:

1. `src/components/app-sidebar.tsx` (navigation item, and optionally quick-create sheet)

## 4) Implementation sequence (do this in order)

### Step A: Supabase read query (`_lib/queries.ts`)

Create `getTodos(searchParams)` pattern:

- Use `createClient()`
- Parse URL state with `parseSearchParams(searchParams)`
- Start query with:
  - `schema("<schema_name>")` (or your target schema)
  - `.from("<table_name>")`
  - `.select(..., { count: "exact" })`
- Apply sorting from parsed `sorting`
- Apply filtering from parsed `columnFilters`
- Apply pagination with `.range(from, to)`
- Return `{ data: data || [], count: count ?? 0, error }`

This is required so table filter/sort/pagination controls actually work.

### Step B: Supabase write actions (`_lib/actions.ts`)

Implement:

1. `createTodo(data)`
2. `updateTodo(id, data)`
3. `multiUpdateTodos(ids, data)`
4. `deleteTodos(ids)`

Patterns:

- Always wrap in try/catch
- Return consistent result objects:
  - success + optional error + optional count/data
- For multi-update, update only provided fields:
  - filter out `undefined` values before `.update(...)`
- For relational entities, delete children first (or rely on DB cascade rules)
- Always `revalidatePath("/dashboard/<entity>")` after writes

### Step C: Columns (`_components/columns.tsx`)

Define `ColumnDef<Todo>[]` with:

- `select` checkbox column (`id: "select"`, `excludeFromForm: true`)
- data columns with:
  - `accessorKey`
  - `DataTableColumnHeader` (enables sortable/filter-friendly header UX)
  - `meta` for shared table field config (`label`, `variant`, `placeholder`, etc.)
  - `enableColumnFilter: true` where relevant

Important:
- custom forms are the standard for all current entities.
- `meta` should still be maintained because it supports shared table behavior and the fallback `DataTableRowForm` path.
- Set `readOnly: true` for non-editable columns (`created_at`, etc.).

### Step D: Add/Edit forms (`_components/form.tsx` + `form-wrapper.tsx`)

- Build domain form component (`form.tsx`) for proper UX/validation.
- In `form-wrapper.tsx`, create:
  - `TodoAddForm`
  - `TodoEditForm`
  - `TodoMultiEditForm`
- Convert form state to DB payload via a small transformer function.
- Call passed server actions (`createAction`, `updateAction`, `updateActionMulti`).
- On success: `router.refresh()`, call `onSuccess`, show toast.

Note on multi-edit wiring:
- `DataTableRowEditMulti` injects selected row IDs.
- In custom multi forms, the prop name is `updateActionMulti`.
- Custom multi forms can call `updateActionMulti([], payload)`; the wrapper replaces IDs with selected rows.

### Step D.1: Todo add-sheet example (table toolbar standard)

This is the standard add-sheet pattern used across CRM tables:

- define `TodoAddForm` in `form-wrapper.tsx`
- pass it to `DataTable` as `customAddForm`
- let the shared toolbar (`DataTableRowAdd`) open the sheet
- submit via `createAction`, then `router.refresh()`, toast, and `onSuccess()`

```tsx
// src/app/(app)/dashboard/todo/_components/form-wrapper.tsx
"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { X, Plus } from "lucide-react"
import { toast } from "sonner"
import TodoForm from "./form"
import { Todo } from "../_lib/validations"

interface TodoFormData {
  title: string
  description?: string
}

function transformFormDataToTodo(formData: TodoFormData): Partial<Todo> {
  return {
    title: formData.title,
    description: formData.description || null,
  }
}

export function TodoAddForm({
  onSuccess,
  onCancel,
  createAction,
}: {
  onSuccess?: () => void
  onCancel?: () => void
  createAction?: (data: Partial<Todo>) => Promise<{ success: boolean; error?: string }>
}) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<TodoFormData | null>(null)

  const handleFormDataChange = useCallback((data: TodoFormData) => {
    setFormData(data)
  }, [])

  const handleSubmit = async () => {
    if (!formData || !createAction) return
    setIsSubmitting(true)

    try {
      const payload = transformFormDataToTodo(formData)
      const result = await createAction(payload)
      if (result.success) {
        router.refresh()
        onSuccess?.()
        toast.success("Todo created successfully")
      } else {
        toast.error("Failed to create todo", { description: result.error })
      }
    } catch {
      toast.error("An unexpected error occurred while creating the todo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        <TodoForm onChange={handleFormDataChange} />
      </div>
      <div className="flex justify-between gap-2 p-4 border-t bg-background">
        <Button type="button" variant="outline" onClick={onCancel} className="w-1/2">
          <X className="size-4 shrink-0" /> Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting || !formData} className="w-1/2">
          <Plus className="size-4 shrink-0" />
          {isSubmitting ? "Adding..." : "Add Todo"}
        </Button>
      </div>
    </div>
  )
}
```

```tsx
// src/app/(app)/dashboard/todo/_components/table.tsx
<DataTable
  columns={tableColumns}
  data={tableData}
  pageCount={pageCount}
  initialState={initialState}
  createAction={createTodo}
  updateActionSingle={updateTodo}
  updateActionMulti={multiUpdateTodos}
  deleteAction={deleteTodos}
  customAddForm={TodoAddForm}
  customEditFormSingle={TodoEditForm}
  customEditFormMulti={TodoMultiEditForm}
/>
```

### Step E: Entity table wrapper (`_components/table.tsx`)

Pattern:

1. `await getTodos(searchParams)`
2. Parse table state with `parseSearchParams`
3. Compute `pageCount = Math.ceil(count / pageSize)`
4. Pass into shared `<DataTable />`:
   - `columns`
   - `data`
   - `pageCount`
   - `initialState`
   - CRUD actions
   - custom form wrappers

### Step F: Route page (`page.tsx`)

Use the standard server page shape:

- Read `searchParams`
- Render `<DataTableTodo searchParams={params} />`

### Step G: Sidebar navigation (`src/components/app-sidebar.tsx`)

Add new nav item:

- `label: "Todo"`
- `href: "/dashboard/todo"`
- icon + optional `action` for quick-create

If quick-create is wanted:

- add local sheet state
- import `TodoAddForm` + `createTodo`
- add `<Sheet>` block like other entities

Sidebar quick-create sheet example:

```tsx
// src/components/app-sidebar.tsx (pattern)
const [isTodoSheetOpen, setIsTodoSheetOpen] = useState(false)

// In navigationItems:
{
  label: "Todo",
  href: "/dashboard/todo",
  icon: CheckSquare,
  action: () => setIsTodoSheetOpen(true),
  actionAriaLabel: "Create new todo",
}

// Sheet block:
<Sheet open={isTodoSheetOpen} onOpenChange={setIsTodoSheetOpen}>
  <SheetContent className="flex flex-col sm:max-w-md">
    <SheetHeader>
      <SheetTitle>Add New Todo</SheetTitle>
      <SheetDescription>Add a new todo record.</SheetDescription>
    </SheetHeader>
    <div className="flex-1 overflow-hidden">
      <TodoAddForm
        onSuccess={() => setIsTodoSheetOpen(false)}
        onCancel={() => setIsTodoSheetOpen(false)}
        createAction={createTodo}
      />
    </div>
  </SheetContent>
</Sheet>
```

If placeholder only:

- add nav item with `href` only; skip action/sheet until form is ready.

## 5) Minimal "Todo" backend template

```ts
// _lib/queries.ts
export async function getTodos(searchParams: SearchParams) {
  const supabase = await createClient()
  const { pagination, sorting, columnFilters } = parseSearchParams(searchParams)
  const { pageIndex, pageSize } = pagination ?? { pageIndex: 0, pageSize: 10 }

  let query = supabase
    .schema("<schema_name>")
    .from("<table_name>")
    .select("*", { count: "exact" })

  if (sorting?.length) {
    sorting.forEach((s) => {
      query = query.order(s.id, { ascending: !s.desc })
    })
  } else {
    query = query.order("created_at", { ascending: false })
  }

  columnFilters?.forEach((filter) => {
    const v = filter.value as { operator?: string; value?: unknown }
    if (!v?.operator) return
    if (v.value === null || v.value === undefined || v.value === "") return
    switch (v.operator) {
      case "iLike":
        query = query.ilike(filter.id, `%${v.value}%`)
        break
      case "notILike":
        query = query.not(filter.id, "ilike", `%${v.value}%`)
        break
      case "eq":
        query = query.eq(filter.id, v.value)
        break
      case "ne":
        query = query.neq(filter.id, v.value)
        break
      case "lt":
        query = query.lt(filter.id, v.value)
        break
      case "gt":
        query = query.gt(filter.id, v.value)
        break
      case "inArray":
        query = query.in(filter.id, v.value as (string | number)[])
        break
      case "notInArray":
        query = query.not(filter.id, "in", `(${(v.value as (string | number)[]).join(",")})`)
        break
      case "isEmpty":
        query = query.or(`${filter.id}.is.null,${filter.id}.eq.""`)
        break
      case "isNotEmpty":
        query = query.not(filter.id, "is", null).not(filter.id, "eq", '""')
        break
      case "isBetween":
        if (Array.isArray(v.value) && v.value.length === 2) {
          query = query.gte(filter.id, v.value[0]).lte(filter.id, v.value[1])
        }
        break
      default:
        break
    }
  })

  const from = pageIndex * pageSize
  const to = from + pageSize - 1
  const { data, count, error } = await query.range(from, to)

  return { data: data || [], count: count ?? 0, error }
}
```

```ts
// _lib/actions.ts
export async function createTodo(data: Record<string, unknown>) { /* insert + revalidatePath */ }
export async function updateTodo(id: string, data: Record<string, unknown>) { /* update + revalidatePath */ }
export async function multiUpdateTodos(ids: string[], data: Record<string, unknown>) { /* filtered update + revalidatePath */ }
export async function deleteTodos(ids: string[]) { /* delete in ids + revalidatePath */ }
```

## 6) Junior developer checklist (must pass)

1. Route renders and loads rows from Supabase table.
2. Pagination changes URL params and fetches the next page.
3. Sorting changes URL params and fetches sorted rows.
4. Column filters change URL params and fetch filtered rows.
5. Add button opens sheet and creates a row in Supabase.
6. Selecting one row shows single-edit and updates that row.
7. Selecting 2+ rows shows multi-edit and updates all selected rows.
8. Selecting row(s) shows delete and deletes all selected rows.
9. After every write, table refreshes and shows latest data.
10. Sidebar has a visible link to `/dashboard/<entity>`.

## 7) Common mistakes to avoid

1. Forgetting `{ count: "exact" }` in select (breaks total page count).
2. Doing client-side pagination/sorting with server data tables.
3. Not calling `revalidatePath("/dashboard/<entity>")` after writes.
4. Missing `meta` on columns, which hurts shared table behavior and fallback form generation.
5. Enabling edit/delete actions but not returning consistent action result objects.
6. For multi-edit, accidentally overwriting fields with empty strings; filter out unchanged values.
7. Building a custom table instead of using shared `DataTable`.

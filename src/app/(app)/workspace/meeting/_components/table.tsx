import { columns } from "./columns"
import { DataTable } from "@/components/data-table/data-table"
import { parseSearchParams, SearchParams } from "@/lib/data-table"
import { getMeetings } from "../_lib/queries"
import { deleteMeetings, createMeeting, updateMeeting, multiUpdateMeetings } from "../_lib/actions"
import { MeetingAddForm, MeetingEditForm, MeetingMultiEditForm } from "./form-wrapper"
import { ColumnDef } from "@tanstack/react-table"
import { TableWithPageContext } from "@/components/chat/table-with-context"

interface DataTableMeetingProps {
  searchParams?: SearchParams
}

export default async function DataTableMeeting({ 
  searchParams = {} 
}: DataTableMeetingProps) {
  const { data, count, error } = await getMeetings(searchParams)
  const { pagination } = parseSearchParams(searchParams)

  if (error) {
    // TODO: Add a toast notification
    console.error(error)
  }

  const pageCount = Math.ceil((count ?? 0) / (pagination?.pageSize ?? 10))
  const initialState = {
    ...parseSearchParams(searchParams),
    columnVisibility: {
      description: false,
    },
  }

  // Cast the data and actions to match DataTable's expected types
  const tableData = data as unknown as Record<string, unknown>[]
  const tableColumns = columns as ColumnDef<Record<string, unknown>, unknown>[]
  
  const tableDeleteAction = deleteMeetings as (ids: string[]) => Promise<{ success: boolean; error?: string; deletedCount?: number }>
  const tableCreateAction = createMeeting as unknown as (data: Record<string, unknown>) => Promise<{ success: boolean; error?: string }>
  const tableUpdateActionSingle = updateMeeting as unknown as (id: string, data: Record<string, unknown>) => Promise<{ success: boolean; error?: string }>
  const tableUpdateActionMulti = multiUpdateMeetings as unknown as (ids: string[], data: Record<string, unknown>) => Promise<{ success: boolean; error?: string; updatedCount?: number }>
  
  // Cast the custom forms to match expected types
  const AddForm = MeetingAddForm as React.ComponentType<{
    onSuccess?: () => void
    onCancel?: () => void
    createAction?: (data: Record<string, unknown>) => Promise<{ success: boolean; error?: string }>
  }>
  
  const EditFormSingle = MeetingEditForm as React.ComponentType<{
    data: Record<string, unknown>
    onSuccess?: () => void
    onCancel?: () => void
    updateAction?: (id: string, data: Record<string, unknown>) => Promise<{ success: boolean; error?: string }>
  }>

  const EditFormMulti = MeetingMultiEditForm as React.ComponentType<{
    selectedCount: number
    onSuccess?: () => void
    onCancel?: () => void
    updateActionMulti?: (ids: string[], data: Record<string, unknown>) => Promise<{ success: boolean; error?: string; updatedCount?: number }>
  }>

  return (
    <TableWithPageContext data={tableData} count={count ?? 0}>
      <DataTable 
        columns={tableColumns} 
        data={tableData} 
        pageCount={pageCount}
        initialState={initialState}
        deleteAction={tableDeleteAction}
        createAction={tableCreateAction}
        updateActionSingle={tableUpdateActionSingle}
        updateActionMulti={tableUpdateActionMulti}
        customAddForm={AddForm}
        customEditFormSingle={EditFormSingle}
        customEditFormMulti={EditFormMulti}
      />
    </TableWithPageContext>
  )
}
import { columns } from "./columns"
import { DataTable } from "@/components/data-table/data-table"
import { parseSearchParams, SearchParams } from "@/lib/data-table"
import { getCompanies } from "../_lib/queries"
import { deleteCompanies, createCompany, updateCompany, multiUpdateCompanies } from "../_lib/actions"
import { CompanyAddForm, CompanyEditForm, CompanyMultiEditForm } from "./form-wrapper"
import { ColumnDef } from "@tanstack/react-table"
import { TableWithPageContext } from "@/components/chat/table-with-context"

interface DataTableCompanyProps {
  searchParams?: SearchParams
}

export default async function DataTableCompany({ 
  searchParams = {} 
}: DataTableCompanyProps) {
  const { data, count, error } = await getCompanies(searchParams)
  const { pagination } = parseSearchParams(searchParams)

  if (error) {
    // TODO: Add a toast notification
    console.error(error)
  }

  const pageCount = Math.ceil((count ?? 0) / (pagination?.pageSize ?? 10))
  const initialState = {
    ...parseSearchParams(searchParams),
  }

  // Cast the data and actions to match DataTable's expected types
  const tableData = data as unknown as Record<string, unknown>[]
  const tableColumns = columns as ColumnDef<Record<string, unknown>, unknown>[]
  
  const tableDeleteAction = deleteCompanies as (ids: string[]) => Promise<{ success: boolean; error?: string; deletedCount?: number }>
  const tableCreateAction = createCompany as unknown as (data: Record<string, unknown>) => Promise<{ success: boolean; error?: string }>
  const tableUpdateActionSingle = updateCompany as unknown as (id: string, data: Record<string, unknown>) => Promise<{ success: boolean; error?: string }>
  const tableUpdateActionMulti = multiUpdateCompanies as unknown as (ids: string[], data: Record<string, unknown>) => Promise<{ success: boolean; error?: string; updatedCount?: number }>
  
  // Cast the custom forms to match expected types
  const AddForm = CompanyAddForm as React.ComponentType<{
    onSuccess?: () => void
    onCancel?: () => void
    createAction?: (data: Record<string, unknown>) => Promise<{ success: boolean; error?: string }>
  }>
  
  const EditFormSingle = CompanyEditForm as React.ComponentType<{
    data: Record<string, unknown>
    onSuccess?: () => void
    onCancel?: () => void
    updateAction?: (id: string, data: Record<string, unknown>) => Promise<{ success: boolean; error?: string }>
  }>

  const EditFormMulti = CompanyMultiEditForm as React.ComponentType<{
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
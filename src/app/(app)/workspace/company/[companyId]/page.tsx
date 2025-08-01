import CompanyForm from "../_components/form"
import { getCompany } from "../_lib/queries"

export default async function Page({ params }: { params: Promise<{ companyId: string }> }) {
  const { companyId } = await params

  // Fetch data on the server
  const companyResult = await getCompany(companyId)

  if (companyResult.error) {
    console.error("Error fetching company:", companyResult.error)
    return (
      <div className="flex flex-col gap-4 p-1">
        <div className="text-center text-muted-foreground">
          Error loading company
        </div>
      </div>
    )
  }

  if (!companyResult.data) {
    return (
      <div className="flex flex-col gap-4 p-1">
        <div className="text-center text-muted-foreground">
          Company not found
        </div>
      </div>
    )
  }

  const company = companyResult.data

  return (
    <div className="flex flex-col gap-4 p-1">
      <CompanyForm 
        initialName={company.name || ""}
        initialDescription={company.description || ""}
      />
    </div>
  )
} 
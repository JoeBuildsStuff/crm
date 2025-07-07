"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import CompanyForm from "./form"
import { Company } from "../_lib/validations"
import { Button } from "@/components/ui/button"
import { X, Plus, Save } from "lucide-react"
import { toast } from "sonner"

interface CompanyFormData {
  name: string
  description: string
}

// Helper function to transform form data to database format
function transformFormDataToCompany(formData: CompanyFormData): Partial<Company> {
  return {
    name: formData.name,
    description: formData.description,
  }
}

// Add Form Wrapper
export function CompanyAddForm({
  onSuccess,
  onCancel,
  createAction
}: {
  onSuccess?: () => void
  onCancel?: () => void
  createAction?: (data: Partial<Company>) => Promise<{ success: boolean; error?: string }>
}) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<CompanyFormData | null>(null)

  const handleFormDataChange = useCallback((data: CompanyFormData) => {
    setFormData(data)
  }, [])

  const handleSubmit = async () => {
    if (!formData || !createAction) return

    setIsSubmitting(true)
    try {
      const companyData = transformFormDataToCompany(formData)
      const result = await createAction(companyData)
      
      if (result.success) {
        router.refresh()
        onSuccess?.()
        toast.success("Company created successfully")
      } else {
        console.error("Failed to create company:", result.error)
        toast.error("Failed to create company", { description: result.error })
      }
    } catch (error) {
      console.error("Error creating company:", error)
      toast.error("An unexpected error occurred while creating the company.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        <CompanyForm
          onChange={handleFormDataChange}
        />
      </div>
      
      <div className="flex justify-between gap-2 p-4 border-t bg-background">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="w-1/2"
        >
          <X className="size-4 shrink-0" /> Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !formData}
          className="w-1/2"
        >
          <Plus className="size-4 shrink-0" />
          {isSubmitting ? "Adding..." : "Add Company"}
        </Button>
      </div>
    </div>
  )
}

// Edit Form Wrapper
export function CompanyEditForm({
  data,
  onSuccess,
  onCancel,
  updateAction
}: {
  data: Company
  onSuccess?: () => void
  onCancel?: () => void
  updateAction?: (id: string, data: Partial<Company>) => Promise<{ success: boolean; error?: string }>
}) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<CompanyFormData | null>(null)

  const handleFormDataChange = useCallback((formData: CompanyFormData) => {
    setFormData(formData)
  }, [])

  const handleSubmit = async () => {
    if (!formData || !updateAction) return

    setIsSubmitting(true)
    try {
      const companyData = transformFormDataToCompany(formData)
      const result = await updateAction(data.id, companyData)
      
      if (result.success) {
        router.refresh()
        onSuccess?.()
        toast.success("Company updated successfully")
      } else {
        console.error("Failed to update company:", result.error)
        toast.error("Failed to update company", { description: result.error })
      }
    } catch (error) {
      console.error("Error updating company:", error)
      toast.error("An unexpected error occurred while updating the company.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        <CompanyForm
          initialName={data.name || ""}
          initialDescription={data.description || ""}
          onChange={handleFormDataChange}
        />
      </div>
      
      <div className="flex justify-between gap-2 p-4 border-t bg-background">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="w-1/2"
        >
          <X className="size-4 shrink-0" /> Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !formData}
          className="w-1/2"
        >
          <Save className="size-4 shrink-0" />
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  )
}

// Multi Edit Form Wrapper
export function CompanyMultiEditForm({
  selectedCount,
  onSuccess,
  onCancel,
  updateActionMulti
}: {
  selectedCount: number
  onSuccess?: () => void
  onCancel?: () => void
  updateActionMulti?: (ids: string[], data: Partial<Company>) => Promise<{ success: boolean; error?: string; updatedCount?: number }>
}) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<CompanyFormData | null>(null)

  const handleFormDataChange = useCallback((data: CompanyFormData) => {
    setFormData(data)
  }, [])

  const handleSubmit = async () => {
    if (!formData || !updateActionMulti) return

    setIsSubmitting(true)
    try {
      const companyData = transformFormDataToCompany(formData)
      
      // Filter out undefined values for multi edit - only update fields that were actually modified
      const filteredData = Object.fromEntries(
        Object.entries(companyData).filter(([, value]) => {
          if (value === undefined || value === null) return false
          if (typeof value === 'string' && value.trim() === '') return false
          return true
        })
      )
      
      // The updateActionMulti function will be called with the selected company IDs
      // by the DataTableRowEditMulti component
      const result = await updateActionMulti([], filteredData)
      
      if (result.success) {
        router.refresh()
        onSuccess?.()
        toast.success("Companies updated successfully", {
          description: `${result.updatedCount || selectedCount} company${(result.updatedCount || selectedCount) > 1 ? 's' : ''} updated.`
        })
      } else {
        console.error("Failed to update companies:", result.error)
        toast.error("Failed to update companies", { description: result.error })
      }
    } catch (error) {
      console.error("Error updating companies:", error)
      toast.error("An unexpected error occurred while updating the companies.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        <CompanyForm
          onChange={handleFormDataChange}
          // Start with empty values for multi edit
          initialName=""
          initialDescription=""
        />
      </div>
      
      <div className="flex justify-between gap-2 p-4 border-t bg-background">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="w-1/2"
        >
          <X className="size-4 shrink-0" /> Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !formData}
          className="w-1/2"
        >
          <Save className="size-4 shrink-0" />
          {isSubmitting ? "Updating..." : `Update ${selectedCount} Company${selectedCount > 1 ? 's' : ''}`}
        </Button>
      </div>
    </div>
  )
}
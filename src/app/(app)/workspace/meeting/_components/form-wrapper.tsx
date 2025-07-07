"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import MeetingForm from "./form"
import { Meeting } from "../_lib/validations"
import { Button } from "@/components/ui/button"
import { X, Plus, Save } from "lucide-react"
import { toast } from "sonner"

interface MeetingFormData {
  title: string
  description: string
  start_time: string
  end_time: string
  status: string
}

// Helper function to transform form data to database format
function transformFormDataToMeeting(formData: MeetingFormData): Partial<Meeting> {
  return {
    title: formData.title,
    description: formData.description,
    start_time: formData.start_time,
    end_time: formData.end_time,
    status: formData.status,
  }
}

// Add Form Wrapper
export function MeetingAddForm({
  onSuccess,
  onCancel,
  createAction
}: {
  onSuccess?: () => void
  onCancel?: () => void
  createAction?: (data: Partial<Meeting>) => Promise<{ success: boolean; error?: string }>
}) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<MeetingFormData | null>(null)

  const handleFormDataChange = useCallback((data: MeetingFormData) => {
    setFormData(data)
  }, [])

  const handleSubmit = async () => {
    if (!formData || !createAction) return

    setIsSubmitting(true)
    try {
      const meetingData = transformFormDataToMeeting(formData)
      const result = await createAction(meetingData)
      
      if (result.success) {
        router.refresh()
        onSuccess?.()
        toast.success("Meeting created successfully")
      } else {
        console.error("Failed to create meeting:", result.error)
        toast.error("Failed to create meeting", { description: result.error })
      }
    } catch (error) {
      console.error("Error creating meeting:", error)
      toast.error("An unexpected error occurred while creating the meeting.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        <MeetingForm
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
          {isSubmitting ? "Adding..." : "Add Meeting"}
        </Button>
      </div>
    </div>
  )
}

// Edit Form Wrapper
export function MeetingEditForm({
  data,
  onSuccess,
  onCancel,
  updateAction
}: {
  data: Meeting
  onSuccess?: () => void
  onCancel?: () => void
  updateAction?: (id: string, data: Partial<Meeting>) => Promise<{ success: boolean; error?: string }>
}) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<MeetingFormData | null>(null)

  const handleFormDataChange = useCallback((formData: MeetingFormData) => {
    setFormData(formData)
  }, [])

  const handleSubmit = async () => {
    if (!formData || !updateAction) return

    setIsSubmitting(true)
    try {
      const meetingData = transformFormDataToMeeting(formData)
      const result = await updateAction(data.id, meetingData)
      
      if (result.success) {
        router.refresh()
        onSuccess?.()
        toast.success("Meeting updated successfully")
      } else {
        console.error("Failed to update meeting:", result.error)
        toast.error("Failed to update meeting", { description: result.error })
      }
    } catch (error) {
      console.error("Error updating meeting:", error)
      toast.error("An unexpected error occurred while updating the meeting.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Convert date strings to datetime-local format for form inputs
  const formatDateTimeLocal = (dateString: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toISOString().slice(0, 16)
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        <MeetingForm
          initialTitle={data.title || ""}
          initialDescription={data.description || ""}
          initialStartTime={formatDateTimeLocal(data.start_time)}
          initialEndTime={formatDateTimeLocal(data.end_time)}
          initialStatus={data.status || "scheduled"}
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
export function MeetingMultiEditForm({
  selectedCount,
  onSuccess,
  onCancel,
  updateActionMulti
}: {
  selectedCount: number
  onSuccess?: () => void
  onCancel?: () => void
  updateActionMulti?: (ids: string[], data: Partial<Meeting>) => Promise<{ success: boolean; error?: string; updatedCount?: number }>
}) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<MeetingFormData | null>(null)

  const handleFormDataChange = useCallback((data: MeetingFormData) => {
    setFormData(data)
  }, [])

  const handleSubmit = async () => {
    if (!formData || !updateActionMulti) return

    setIsSubmitting(true)
    try {
      const meetingData = transformFormDataToMeeting(formData)
      
      // Filter out undefined values for multi edit - only update fields that were actually modified
      const filteredData = Object.fromEntries(
        Object.entries(meetingData).filter(([, value]) => {
          if (value === undefined || value === null) return false
          if (typeof value === 'string' && value.trim() === '') return false
          return true
        })
      )
      
      // The updateActionMulti function will be called with the selected meeting IDs
      // by the DataTableRowEditMulti component
      const result = await updateActionMulti([], filteredData)
      
      if (result.success) {
        router.refresh()
        onSuccess?.()
        toast.success("Meetings updated successfully", {
          description: `${result.updatedCount || selectedCount} meeting${(result.updatedCount || selectedCount) > 1 ? 's' : ''} updated.`
        })
      } else {
        console.error("Failed to update meetings:", result.error)
        toast.error("Failed to update meetings", { description: result.error })
      }
    } catch (error) {
      console.error("Error updating meetings:", error)
      toast.error("An unexpected error occurred while updating the meetings.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        <MeetingForm
          onChange={handleFormDataChange}
          // Start with empty values for multi edit
          initialTitle=""
          initialDescription=""
          initialStartTime=""
          initialEndTime=""
          initialStatus="scheduled"
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
          {isSubmitting ? "Updating..." : `Update ${selectedCount} Meeting${selectedCount > 1 ? 's' : ''}`}
        </Button>
      </div>
    </div>
  )
}
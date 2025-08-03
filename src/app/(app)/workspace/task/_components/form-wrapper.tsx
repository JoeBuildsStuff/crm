"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import TaskForm from "./form"
import { Task, TaskFormData, TaskWithRelations } from "../_lib/validations"
import { Button } from "@/components/ui/button"
import { X, Plus, Save } from "lucide-react"
import { toast } from "sonner"
import { getAssignableContacts, getLinkableMeetings } from "../_lib/actions"
import { Person } from "../../person/_lib/validations"
import { Meeting } from "../../meeting/_lib/validations"

type ContactForTask = Pick<Person, "id" | "first_name" | "last_name">
type MeetingForTask = Pick<Meeting, "id" | "title">

// Helper function to transform form data to database format
function transformFormDataToTask(formData: TaskFormData): Partial<Task> {
  return {
    title: formData.title,
    description: formData.description,
    status: formData.status || null,
    due_date: formData.due_date || null,
    assigned_to_contact_id: formData.assigned_to_contact_id || null,
    meeting_id: formData.meeting_id || undefined, // Required field
  }
}

// Add Form Wrapper
export function TaskAddForm({
  onSuccess,
  onCancel,
  createAction
}: {
  onSuccess?: () => void
  onCancel?: () => void
  createAction?: (data: Partial<Task>) => Promise<{ success: boolean; error?: string }>
}) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<TaskFormData | null>(null)
  const [contacts, setContacts] = useState<ContactForTask[]>([])
  const [meetings, setMeetings] = useState<MeetingForTask[]>([])

  useEffect(() => {
    async function fetchData() {
      const [contactsRes, meetingsRes] = await Promise.all([
        getAssignableContacts(),
        getLinkableMeetings()
      ]);

      if (contactsRes.error) {
        toast.error("Could not fetch contacts.")
        console.error(contactsRes.error)
      } else if (contactsRes.data) {
        setContacts(contactsRes.data)
      }

      if (meetingsRes.error) {
        toast.error("Could not fetch meetings.")
        console.error(meetingsRes.error)
      } else if (meetingsRes.data) {
        setMeetings(meetingsRes.data)
      }
    }
    fetchData()
  }, [])

  const handleFormDataChange = useCallback((data: TaskFormData) => {
    setFormData(data)
  }, [])

  const handleSubmit = async () => {
    if (!formData || !createAction) return

    setIsSubmitting(true)
    try {
      const taskData = transformFormDataToTask(formData)
      if (!taskData.meeting_id) {
        toast.error("Meeting ID is required.")
        setIsSubmitting(false)
        return
      }

      const result = await createAction(taskData)
      
      if (result.success) {
        router.refresh()
        onSuccess?.()
        toast.success("Task created successfully")
      } else {
        console.error("Failed to create task:", result.error)
        toast.error("Failed to create task", { description: result.error })
      }
    } catch (error) {
      console.error("Error creating task:", error)
      toast.error("An unexpected error occurred while creating the task.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        <TaskForm
          onChange={handleFormDataChange}
          availableContacts={contacts}
          availableMeetings={meetings}
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
          {isSubmitting ? "Adding..." : "Add Task"}
        </Button>
      </div>
    </div>
  )
}

// Edit Form Wrapper
export function TaskEditForm({
  data,
  onSuccess,
  onCancel,
  updateAction
}: {
  data: TaskWithRelations
  onSuccess?: () => void
  onCancel?: () => void
  updateAction?: (id: string, data: Partial<Task>) => Promise<{ success: boolean; error?: string }>
}) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<TaskFormData | null>(null)
  const [contacts, setContacts] = useState<ContactForTask[]>([])
  const [meetings, setMeetings] = useState<MeetingForTask[]>([])

  useEffect(() => {
    async function fetchData() {
      const [contactsRes, meetingsRes] = await Promise.all([
        getAssignableContacts(),
        getLinkableMeetings()
      ]);

      if (contactsRes.error) {
        toast.error("Could not fetch contacts.")
        console.error(contactsRes.error)
      } else if (contactsRes.data) {
        setContacts(contactsRes.data)
      }

      if (meetingsRes.error) {
        toast.error("Could not fetch meetings.")
        console.error(meetingsRes.error)
      } else if (meetingsRes.data) {
        setMeetings(meetingsRes.data)
      }
    }
    fetchData()
  }, [])

  const handleFormDataChange = useCallback((formData: TaskFormData) => {
    setFormData(formData)
  }, [])

  const handleSubmit = async () => {
    if (!formData || !updateAction) return

    setIsSubmitting(true)
    try {
      const taskData = transformFormDataToTask(formData)
      const result = await updateAction(data.id, taskData)
      
      if (result.success) {
        router.refresh()
        onSuccess?.()
        toast.success("Task updated successfully")
      } else {
        console.error("Failed to update task:", result.error)
        toast.error("Failed to update task", { description: result.error })
      }
    } catch (error) {
      console.error("Error updating task:", error)
      toast.error("An unexpected error occurred while updating the task.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        <TaskForm
          initialData={{
            title: data.title || "",
            description: data.description || "",
            due_date: data.due_date || "",
            status: data.status || "",
            assigned_to_contact_id: data.assigned_to_contact_id || "",
            meeting_id: data.meeting_id || "",
          }}
          onChange={handleFormDataChange}
          availableContacts={contacts}
          availableMeetings={meetings}
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
export function TaskMultiEditForm({
  selectedCount,
  onSuccess,
  onCancel,
  updateActionMulti
}: {
  selectedCount: number
  onSuccess?: () => void
  onCancel?: () => void
  updateActionMulti?: (ids: string[], data: Partial<Task>) => Promise<{ success: boolean; error?: string; updatedCount?: number }>
}) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<TaskFormData | null>(null)
  const [contacts, setContacts] = useState<ContactForTask[]>([])
  const [meetings, setMeetings] = useState<MeetingForTask[]>([])

  useEffect(() => {
    async function fetchData() {
      const [contactsRes, meetingsRes] = await Promise.all([
        getAssignableContacts(),
        getLinkableMeetings()
      ]);

      if (contactsRes.error) {
        toast.error("Could not fetch contacts.")
        console.error(contactsRes.error)
      } else if (contactsRes.data) {
        setContacts(contactsRes.data)
      }

      if (meetingsRes.error) {
        toast.error("Could not fetch meetings.")
        console.error(meetingsRes.error)
      } else if (meetingsRes.data) {
        setMeetings(meetingsRes.data)
      }
    }
    fetchData()
  }, [])

  const handleFormDataChange = useCallback((data: TaskFormData) => {
    setFormData(data)
  }, [])

  const handleSubmit = async () => {
    if (!formData || !updateActionMulti) return

    setIsSubmitting(true)
    try {
      const taskData = transformFormDataToTask(formData)
      
      // Filter out undefined values for multi edit - only update fields that were actually modified
      const filteredData = Object.fromEntries(
        Object.entries(taskData).filter(([, value]) => {
          if (value === undefined || value === null) return false
          if (typeof value === 'string' && value.trim() === '') return false
          return true
        })
      )
      
      // The updateActionMulti function will be called with the selected task IDs
      // by the DataTableRowEditMulti component
      const result = await updateActionMulti([], filteredData)
      
      if (result.success) {
        router.refresh()
        onSuccess?.()
        toast.success("Tasks updated successfully", {
          description: `${result.updatedCount || selectedCount} task${(result.updatedCount || selectedCount) > 1 ? 's' : ''} updated.`
        })
      } else {
        console.error("Failed to update tasks:", result.error)
        toast.error("Failed to update tasks", { description: result.error })
      }
    } catch (error) {
      console.error("Error updating tasks:", error)
      toast.error("An unexpected error occurred while updating the tasks.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        <TaskForm
          onChange={handleFormDataChange}
          // Start with empty values for multi edit
          initialData={{
            title: "",
            description: "",
            due_date: "",
            status: "",
            assigned_to_contact_id: "",
            meeting_id: "",
          }}
          availableContacts={contacts}
          availableMeetings={meetings}
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
          {isSubmitting ? "Updating..." : `Update ${selectedCount} Task${selectedCount > 1 ? 's' : ''}`}
        </Button>
      </div>
    </div>
  )
}
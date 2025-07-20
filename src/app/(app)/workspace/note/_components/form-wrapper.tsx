"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import NoteForm from "./form"
import { Note, NoteFormData, NoteWithRelations } from "../_lib/validations"
import { Button } from "@/components/ui/button"
import { X, Plus, Save } from "lucide-react"
import { toast } from "sonner"
import { getAssignableContacts, getLinkableMeetings } from "../_lib/actions"
import { Person } from "../../person/_lib/validations"
import { Meeting } from "../../meeting/_lib/validations"

type ContactForNote = Pick<Person, "id" | "first_name" | "last_name">
type MeetingForNote = Pick<Meeting, "id" | "title">

// Helper function to transform form data to database format
function transformFormDataToNote(formData: NoteFormData): Partial<Note> {
  return {
    title: formData.title || null,
    content: formData.content,
    contact_id: formData.contact_id || null,
    meeting_id: formData.meeting_id || null,
  }
}

// Add Form Wrapper
export function NoteAddForm({
  onSuccess,
  onCancel,
  createAction
}: {
  onSuccess?: () => void
  onCancel?: () => void
  createAction?: (data: Partial<Note>) => Promise<{ success: boolean; error?: string }>
}) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<NoteFormData | null>(null)
  const [contacts, setContacts] = useState<ContactForNote[]>([])
  const [meetings, setMeetings] = useState<MeetingForNote[]>([])

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

  const handleFormDataChange = useCallback((data: NoteFormData) => {
    setFormData(data)
  }, [])

  const handleSubmit = async () => {
    if (!formData || !createAction) return

    setIsSubmitting(true)
    try {
      const noteData = transformFormDataToNote(formData)
      if (!noteData.content) {
        toast.error("Note content cannot be empty.")
        setIsSubmitting(false)
        return
      }

      const result = await createAction(noteData)
      
      if (result.success) {
        router.refresh()
        onSuccess?.()
        toast.success("Note created successfully")
      } else {
        console.error("Failed to create note:", result.error)
        toast.error("Failed to create note", { description: result.error })
      }
    } catch (error) {
      console.error("Error creating note:", error)
      toast.error("An unexpected error occurred while creating the note.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        <NoteForm
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
          {isSubmitting ? "Adding..." : "Add Note"}
        </Button>
      </div>
    </div>
  )
}

// Edit Form Wrapper
export function NoteEditForm({
  data,
  onSuccess,
  onCancel,
  updateAction
}: {
  data: NoteWithRelations
  onSuccess?: () => void
  onCancel?: () => void
  updateAction?: (id: string, data: Partial<Note>) => Promise<{ success: boolean; error?: string }>
}) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<NoteFormData | null>(null)
  const [contacts, setContacts] = useState<ContactForNote[]>([])
  const [meetings, setMeetings] = useState<MeetingForNote[]>([])

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

  const handleFormDataChange = useCallback((formData: NoteFormData) => {
    setFormData(formData)
  }, [])

  const handleSubmit = async () => {
    if (!formData || !updateAction) return

    setIsSubmitting(true)
    try {
      const noteData = transformFormDataToNote(formData)
      const result = await updateAction(data.id, noteData)
      
      if (result.success) {
        router.refresh()
        onSuccess?.()
        toast.success("Note updated successfully")
      } else {
        console.error("Failed to update note:", result.error)
        toast.error("Failed to update note", { description: result.error })
      }
    } catch (error) {
      console.error("Error updating note:", error)
      toast.error("An unexpected error occurred while updating the note.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        <NoteForm
          initialData={{
            title: data.title || "",
            content: data.content || "",
            contact_id: data.contact_id || "",
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
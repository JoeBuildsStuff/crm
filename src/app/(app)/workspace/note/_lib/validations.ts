import { z } from "zod"
import { Person } from "../../person/_lib/validations"
import { Meeting } from "../../meeting/_lib/validations"
import { Database } from "@/types/supabase"

export type Note = Database['registry']['Tables']['notes']['Row']

export type NoteWithRelations = Note & {
  meetings?: Pick<Meeting, "id" | "title"> | null
  contacts?: Pick<Person, "id" | "first_name" | "last_name"> | null
}

// Zod validation schema
export const noteSchema = z.object({
  title: z.string().max(255, "Title must be 255 characters or less").optional().or(z.literal("")),
  content: z.string().min(1, "Content is required"),
  contact_id: z.string().nullable(),
  meeting_id: z.string().nullable(),
})

// Form-specific types
export type NoteFormData = {
  title?: string
  content: string
  contact_id: string | null
  meeting_id: string | null
}

// API response types
export type NoteListResponse = {
  notes: NoteWithRelations[]
  total: number
}

export type NoteDetailResponse = NoteWithRelations

// Insert/Update types
export type NoteInsert = Database['registry']['Tables']['notes']['Insert']
export type NoteUpdate = Database['registry']['Tables']['notes']['Update']
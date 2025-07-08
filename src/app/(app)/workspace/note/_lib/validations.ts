import { Person } from "../../person/_lib/validations"
import { Meeting } from "../../meeting/_lib/validations"
import { Tables, TablesInsert, TablesUpdate } from "@/types/supabase"

export type Note = Tables<{ schema: "registry" }, "notes">

export type NoteWithRelations = Note & {
  meetings?: Pick<Meeting, "id" | "title"> | null
  contacts?: Pick<Person, "id" | "first_name" | "last_name"> | null
}

// Form-specific types
export type NoteFormData = {
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
export type NoteInsert = TablesInsert<{ schema: "registry" }, "notes">
export type NoteUpdate = Partial<TablesUpdate<{ schema: "registry" }, "notes">>
import { Person } from "../../person/_lib/validations"
import { Meeting } from "../../meeting/_lib/validations"

export type Task = {
  id: string
  created_at?: string | null
  updated_at?: string | null
  meeting_id: string
  description: string
  due_date?: string | null
  status?: string | null
  assigned_to_contact_id?: string | null
}

export type TaskWithRelations = Task & {
  meetings?: Pick<Meeting, "id" | "title"> | null
  contacts?: Pick<Person, "id" | "first_name" | "last_name"> | null
}

// Form-specific types (for your React component)
export type TaskFormData = {
  description: string
  due_date: string | null
  status: string | null
  assigned_to_contact_id: string | null
  meeting_id: string | null
}

// API response types
export type TaskListResponse = {
  tasks: TaskWithRelations[]
  total: number
}

export type TaskDetailResponse = TaskWithRelations

// Insert/Update types (without generated fields)
export type TaskInsert = Omit<Task, "id" | "created_at" | "updated_at">
export type TaskUpdate = Partial<TaskInsert>

// Utility types for the component
export type TaskData = {
  description: string
  due_date: string | null
  status: string | null
  assigned_to_contact_id: string | null
  meeting_id: string | null
}
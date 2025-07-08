"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { getAssignableContacts as dbGetAssignableContacts, getLinkableMeetings as dbGetLinkableMeetings } from "./queries"

export async function createNote(data: Record<string, unknown>) {
  const supabase = await createClient()
  
  try {
    const { data: newNote, error } = await supabase
      .schema("registry")
      .from("notes")
      .insert([data])
      .select()
      .single()
    
    if (error) {
      console.error("Error creating note:", error)
      return { success: false, error: error.message }
    }
    
    revalidatePath("/workspace/note")
    return { success: true, data: newNote }
  } catch (error) {
    console.error("Unexpected error creating note:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function updateNote(id: string, data: Record<string, unknown>) {
  const supabase = await createClient()
  
  try {
    const { data: updatedNote, error } = await supabase
      .schema("registry")
      .from("notes")
      .update(data)
      .eq("id", id)
      .select()
      .single()
    
    if (error) {
      console.error("Error updating note:", error)
      return { success: false, error: error.message }
    }
    
    revalidatePath("/workspace/note")
    return { success: true, data: updatedNote }
  } catch (error) {
    console.error("Unexpected error updating note:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function deleteNotes(noteIds: string[]) {
  const supabase = await createClient()
  
  try {
    const { error } = await supabase
      .schema("registry")
      .from("notes")
      .delete()
      .in("id", noteIds)
    
    if (error) {
      console.error("Error deleting notes:", error)
      return { success: false, error: error.message }
    }
    
    revalidatePath("/workspace/note")
    return { success: true, deletedCount: noteIds.length }
  } catch (error) {
    console.error("Unexpected error deleting notes:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function getAssignableContacts() {
  return await dbGetAssignableContacts()
}

export async function getLinkableMeetings() {
  return await dbGetLinkableMeetings()
}
"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { getAssignableContacts as dbGetAssignableContacts, getLinkableMeetings as dbGetLinkableMeetings } from "./queries"

export async function createTask(data: Record<string, unknown>) {
  const supabase = await createClient()
  
  try {

    console.log("data", data)
    const { data: newTask, error } = await supabase
      .schema("registry")
      .from("meeting_action_items")
      .insert([data])
      .select()
      .single()
    
    if (error) {
      console.error("Error creating task:", error)
      return { success: false, error: error.message }
    }
    
    revalidatePath("/workspace/task")
    return { success: true, data: newTask }
  } catch (error) {
    console.error("Unexpected error creating task:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function updateTask(id: string, data: Record<string, unknown>) {
  const supabase = await createClient()
  
  try {
    const { data: updatedTask, error } = await supabase
      .schema("registry")
      .from("meeting_action_items")
      .update(data)
      .eq("id", id)
      .select()
      .single()
    
    if (error) {
      console.error("Error updating task:", error)
      return { success: false, error: error.message }
    }
    
    revalidatePath("/workspace/task")
    return { success: true, data: updatedTask }
  } catch (error) {
    console.error("Unexpected error updating task:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function multiUpdateTasks(taskIds: string[], data: Record<string, unknown>) {
  const supabase = await createClient()
  
  try {
    // Only process fields that are actually provided (not undefined)
    const fieldsToUpdate = Object.fromEntries(
      Object.entries(data).filter(([, value]) => value !== undefined)
    )
    
    // Update all tasks with the provided data
    if (Object.keys(fieldsToUpdate).length > 0) {
      const { error } = await supabase
        .schema("registry")
        .from("meeting_action_items")
        .update(fieldsToUpdate)
        .in("id", taskIds)
      
      if (error) {
        console.error("Error multi updating tasks:", error)
        return { success: false, error: error.message }
      }
    }
    
    revalidatePath("/workspace/task")
    return { success: true, updatedCount: taskIds.length }
  } catch (error) {
    console.error("Unexpected error multi updating tasks:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function deleteTasks(taskIds: string[]) {
  const supabase = await createClient()
  
  try {
    const { error } = await supabase
      .schema("registry")
      .from("meeting_action_items")
      .delete()
      .in("id", taskIds)
    
    if (error) {
      console.error("Error deleting tasks:", error)
      return { success: false, error: error.message }
    }
    
    revalidatePath("/workspace/task")
    return { success: true, deletedCount: taskIds.length }
  } catch (error) {
    console.error("Unexpected error deleting tasks:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function getAssignableContacts() {
  return await dbGetAssignableContacts()
}

export async function getLinkableMeetings() {
  return await dbGetLinkableMeetings()
}
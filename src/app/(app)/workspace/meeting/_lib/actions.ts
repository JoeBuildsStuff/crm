"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createMeeting(data: Record<string, unknown>) {
  const supabase = await createClient()
  
  try {
    const { data: newMeeting, error } = await supabase
      .schema("registry")
      .from("meetings")
      .insert([data])
      .select()
      .single()
    
    if (error) {
      console.error("Error creating meeting:", error)
      return { success: false, error: error.message }
    }
    
    revalidatePath("/workspace/meeting")
    return { success: true, data: newMeeting }
  } catch (error) {
    console.error("Unexpected error creating meeting:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function updateMeeting(id: string, data: Record<string, unknown>) {
  const supabase = await createClient()
  
  try {
    const { data: updatedMeeting, error } = await supabase
      .schema("registry")
      .from("meetings")
      .update(data)
      .eq("id", id)
      .select()
      .single()
    
    if (error) {
      console.error("Error updating meeting:", error)
      return { success: false, error: error.message }
    }
    
    revalidatePath("/workspace/meeting")
    return { success: true, data: updatedMeeting }
  } catch (error) {
    console.error("Unexpected error updating meeting:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function multiUpdateMeetings(meetingIds: string[], data: Record<string, unknown>) {
  const supabase = await createClient()
  
  try {
    // Only process fields that are actually provided (not undefined)
    const fieldsToUpdate = Object.fromEntries(
      Object.entries(data).filter(([, value]) => value !== undefined)
    )
    
    // Update all meetings with the provided data
    if (Object.keys(fieldsToUpdate).length > 0) {
      const { error } = await supabase
        .schema("registry")
        .from("meetings")
        .update(fieldsToUpdate)
        .in("id", meetingIds)
      
      if (error) {
        console.error("Error multi updating meetings:", error)
        return { success: false, error: error.message }
      }
    }
    
    revalidatePath("/workspace/meeting")
    return { success: true, updatedCount: meetingIds.length }
  } catch (error) {
    console.error("Unexpected error multi updating meetings:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function deleteMeetings(meetingIds: string[]) {
  const supabase = await createClient()
  
  try {
    const { error } = await supabase
      .schema("registry")
      .from("meetings")
      .delete()
      .in("id", meetingIds)
    
    if (error) {
      console.error("Error deleting meetings:", error)
      return { success: false, error: error.message }
    }
    
    revalidatePath("/workspace/meeting")
    return { success: true, deletedCount: meetingIds.length }
  } catch (error) {
    console.error("Unexpected error deleting meetings:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}
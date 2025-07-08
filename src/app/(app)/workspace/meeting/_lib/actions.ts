"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { getAvailableContacts } from "./queries"

interface MeetingWithExtras extends Record<string, unknown> {
  _attendees?: string[]
}

export async function getAvailableContactsAction() {
  return await getAvailableContacts()
}

export async function createMeeting(data: Record<string, unknown>) {
  const supabase = await createClient()
  
  try {
    // Extract attendees from the data
    const { _attendees, ...meetingData } = data as MeetingWithExtras
    
    // Start a transaction by creating the meeting first
    const { data: newMeeting, error } = await supabase
      .schema("registry")
      .from("meetings")
      .insert([meetingData])
      .select()
      .single()
    
    if (error) {
      console.error("Error creating meeting:", error)
      return { success: false, error: error.message }
    }
    
    // Create attendees if provided
    if (_attendees && _attendees.length > 0) {
      const attendeesToInsert = _attendees.map((contactId) => ({
        meeting_id: newMeeting.id,
        contact_id: contactId,
        attendance_status: "invited",
        is_organizer: false
      }))
      
      const { error: attendeeError } = await supabase
        .schema("registry")
        .from("meeting_attendees")
        .insert(attendeesToInsert)
      
      if (attendeeError) {
        console.error("Error creating attendees:", attendeeError)
        // Optionally rollback by deleting the meeting
        await supabase.schema("registry").from("meetings").delete().eq("id", newMeeting.id)
        return { success: false, error: attendeeError.message }
      }
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
    // Extract attendees from the data
    const { _attendees, ...meetingData } = data as MeetingWithExtras
    
    // Update the meeting
    const { data: updatedMeeting, error: meetingError } = await supabase
      .schema("registry")
      .from("meetings")
      .update(meetingData)
      .eq("id", id)
      .select()
      .single()
    
    if (meetingError) {
      console.error("Error updating meeting:", meetingError)
      return { success: false, error: meetingError.message }
    }
    
    // Update attendees if provided
    if (_attendees !== undefined) {
      // Delete existing attendees
      const { error: deleteAttendeeError } = await supabase
        .schema("registry")
        .from("meeting_attendees")
        .delete()
        .eq("meeting_id", id)
      
      if (deleteAttendeeError) {
        console.error("Error deleting existing attendees:", deleteAttendeeError)
        return { success: false, error: deleteAttendeeError.message }
      }
      
      // Insert new attendees
      if (_attendees.length > 0) {
        const attendeesToInsert = _attendees.map((contactId) => ({
          meeting_id: id,
          contact_id: contactId,
          attendance_status: "invited",
          is_organizer: false
        }))
        
        const { error: attendeeError } = await supabase
          .schema("registry")
          .from("meeting_attendees")
          .insert(attendeesToInsert)
        
        if (attendeeError) {
          console.error("Error creating attendees:", attendeeError)
          return { success: false, error: attendeeError.message }
        }
      }
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
    // Extract attendees from the data
    const { _attendees, ...meetingData } = data as MeetingWithExtras
    
    // Only process fields that are actually provided (not undefined)
    const fieldsToUpdate = Object.fromEntries(
      Object.entries(meetingData).filter(([, value]) => value !== undefined)
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
    
    // Handle multi attendee updates if provided
    if (_attendees !== undefined) {
      // Delete existing attendees for all meetings
      const { error: deleteAttendeeError } = await supabase
        .schema("registry")
        .from("meeting_attendees")
        .delete()
        .in("meeting_id", meetingIds)
      
      if (deleteAttendeeError) {
        console.error("Error deleting existing attendees:", deleteAttendeeError)
        return { success: false, error: deleteAttendeeError.message }
      }
      
      // Insert new attendees for all meetings
      if (_attendees.length > 0) {
        const attendeesToInsert = meetingIds.flatMap(meetingId =>
          _attendees.map((contactId) => ({
            meeting_id: meetingId,
            contact_id: contactId,
            attendance_status: "invited",
            is_organizer: false
          }))
        )
        
        const { error: attendeeError } = await supabase
          .schema("registry")
          .from("meeting_attendees")
          .insert(attendeesToInsert)
        
        if (attendeeError) {
          console.error("Error creating attendees:", attendeeError)
          return { success: false, error: attendeeError.message }
        }
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
    // Delete related attendees first (due to foreign key constraints)
    const { error: attendeeError } = await supabase
      .schema("registry")
      .from("meeting_attendees")
      .delete()
      .in("meeting_id", meetingIds)
    
    if (attendeeError) {
      console.error("Error deleting attendees:", attendeeError)
      return { success: false, error: attendeeError.message }
    }
    
    // Now delete the meetings
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
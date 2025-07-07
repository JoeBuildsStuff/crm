"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createCompany(data: Record<string, unknown>) {
  const supabase = await createClient()
  
  try {
    const { data: newCompany, error } = await supabase
      .schema("registry")
      .from("companies")
      .insert([data])
      .select()
      .single()
    
    if (error) {
      console.error("Error creating company:", error)
      return { success: false, error: error.message }
    }
    
    revalidatePath("/workspace/company")
    return { success: true, data: newCompany }
  } catch (error) {
    console.error("Unexpected error creating company:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function updateCompany(id: string, data: Record<string, unknown>) {
  const supabase = await createClient()
  
  try {
    const { data: updatedCompany, error } = await supabase
      .schema("registry")
      .from("companies")
      .update(data)
      .eq("id", id)
      .select()
      .single()
    
    if (error) {
      console.error("Error updating company:", error)
      return { success: false, error: error.message }
    }
    
    revalidatePath("/workspace/company")
    return { success: true, data: updatedCompany }
  } catch (error) {
    console.error("Unexpected error updating company:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function multiUpdateCompanies(companyIds: string[], data: Record<string, unknown>) {
  const supabase = await createClient()
  
  try {
    // Only process fields that are actually provided (not undefined)
    const fieldsToUpdate = Object.fromEntries(
      Object.entries(data).filter(([, value]) => value !== undefined)
    )
    
    // Update all companies with the provided data
    if (Object.keys(fieldsToUpdate).length > 0) {
      const { error } = await supabase
        .schema("registry")
        .from("companies")
        .update(fieldsToUpdate)
        .in("id", companyIds)
      
      if (error) {
        console.error("Error multi updating companies:", error)
        return { success: false, error: error.message }
      }
    }
    
    revalidatePath("/workspace/company")
    return { success: true, updatedCount: companyIds.length }
  } catch (error) {
    console.error("Unexpected error multi updating companies:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function deleteCompanies(companyIds: string[]) {
  const supabase = await createClient()
  
  try {
    const { error } = await supabase
      .schema("registry")
      .from("companies")
      .delete()
      .in("id", companyIds)
    
    if (error) {
      console.error("Error deleting companies:", error)
      return { success: false, error: error.message }
    }
    
    revalidatePath("/workspace/company")
    return { success: true, deletedCount: companyIds.length }
  } catch (error) {
    console.error("Unexpected error deleting companies:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}
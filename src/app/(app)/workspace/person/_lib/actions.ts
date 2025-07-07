"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { Person } from "./validations"
import { getCompanies as dbGetCompanies } from "./queries"
import type { SupabaseClient } from '@supabase/supabase-js'

interface PersonWithExtras extends Omit<Person, "id" | "created_at" | "updated_at"> {
  _emails?: string[]
  _phones?: string[]
  company_name?: string
}

async function findOrCreateCompany(supabase: SupabaseClient, companyName: string | undefined): Promise<string | null> {
    if (!companyName) return null

    // Check if company exists
    const { data: existingCompany, error: findError } = await supabase
        .schema("registry")
        .from("companies")
        .select("id")
        .eq("name", companyName)
        .single()

    if (findError && findError.code !== 'PGRST116') { // PGRST116: no rows found
        console.error("Error finding company:", findError)
        throw new Error(findError.message)
    }

    if (existingCompany) {
        return existingCompany.id
    }

    // Create company if it doesn't exist
    const { data: newCompany, error: createError } = await supabase
        .schema("registry")
        .from("companies")
        .insert({ name: companyName })
        .select("id")
        .single()

    if (createError) {
        console.error("Error creating company:", createError)
        throw new Error(createError.message)
    }

    return newCompany.id
}

export async function createPerson(data: Record<string, unknown>) {
  const supabase = await createClient()
  
  try {
    // Extract emails, phones and company from the data
    const { _emails, _phones, company_name, ...contactData } = data as PersonWithExtras
    
    if (company_name) {
      const companyId = await findOrCreateCompany(supabase, company_name)
      contactData.company_id = companyId
    }

    // Start a transaction by creating the contact first
    const { data: newContact, error: contactError } = await supabase
      .schema("registry")
      .from("contacts")
      .insert([contactData])
      .select()
      .single()
    
    if (contactError) {
      console.error("Error creating contact:", contactError)
      return { success: false, error: contactError.message }
    }
    
    // Create emails if provided
    if (_emails && _emails.length > 0) {
      const emailsToInsert = _emails.map((email, index) => ({
        contact_id: newContact.id,
        email: email,
        display_order: index
      }))
      
      const { error: emailError } = await supabase
        .schema("registry")
        .from("contact_emails")
        .insert(emailsToInsert)
      
      if (emailError) {
        console.error("Error creating emails:", emailError)
        // Optionally rollback by deleting the contact
        await supabase.schema("registry").from("contacts").delete().eq("id", newContact.id)
        return { success: false, error: emailError.message }
      }
    }
    
    // Create phones if provided
    if (_phones && _phones.length > 0) {
      const phonesToInsert = _phones.map((phone, index) => ({
        contact_id: newContact.id,
        phone: phone,
        display_order: index
      }))
      
      const { error: phoneError } = await supabase
        .schema("registry")
        .from("contact_phones")
        .insert(phonesToInsert)
      
      if (phoneError) {
        console.error("Error creating phones:", phoneError)
        // Optionally rollback
        await supabase.schema("registry").from("contacts").delete().eq("id", newContact.id)
        return { success: false, error: phoneError.message }
      }
    }
    
    revalidatePath("/contacts")
    return { success: true, data: newContact }
  } catch (error) {
    console.error("Unexpected error creating contact:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function updatePerson(id: string, data: Record<string, unknown>) {
  const supabase = await createClient()
  
  try {
    // Extract emails and phones from the data
    const { _emails, _phones, company_name, ...contactData } = data as PersonWithExtras
    
    if (company_name !== undefined) {
      const companyId = await findOrCreateCompany(supabase, company_name)
      contactData.company_id = companyId
    }
    
    // Update the contact
    const { data: updatedContact, error: contactError } = await supabase
      .schema("registry")
      .from("contacts")
      .update(contactData)
      .eq("id", id)
      .select()
      .single()
    
    if (contactError) {
      console.error("Error updating contact:", contactError)
      return { success: false, error: contactError.message }
    }
    
    // Update emails if provided
    if (_emails !== undefined) {
      // Delete existing emails
      const { error: deleteEmailError } = await supabase
        .schema("registry")
        .from("contact_emails")
        .delete()
        .eq("contact_id", id)
      
      if (deleteEmailError) {
        console.error("Error deleting existing emails:", deleteEmailError)
        return { success: false, error: deleteEmailError.message }
      }
      
      // Insert new emails
      if (_emails.length > 0) {
        const emailsToInsert = _emails.map((email, index) => ({
          contact_id: id,
          email: email,
          display_order: index
        }))
        
        const { error: emailError } = await supabase
          .schema("registry")
          .from("contact_emails")
          .insert(emailsToInsert)
        
        if (emailError) {
          console.error("Error creating emails:", emailError)
          return { success: false, error: emailError.message }
        }
      }
    }
    
    // Update phones if provided
    if (_phones !== undefined) {
      // Delete existing phones
      const { error: deletePhoneError } = await supabase
        .schema("registry")
        .from("contact_phones")
        .delete()
        .eq("contact_id", id)
      
      if (deletePhoneError) {
        console.error("Error deleting existing phones:", deletePhoneError)
        return { success: false, error: deletePhoneError.message }
      }
      
      // Insert new phones
      if (_phones.length > 0) {
        const phonesToInsert = _phones.map((phone, index) => ({
          contact_id: id,
          phone: phone,
          display_order: index
        }))
        
        const { error: phoneError } = await supabase
          .schema("registry")
          .from("contact_phones")
          .insert(phonesToInsert)
        
        if (phoneError) {
          console.error("Error creating phones:", phoneError)
          return { success: false, error: phoneError.message }
        }
      }
    }
    
    revalidatePath("/contacts")
    return { success: true, data: updatedContact }
  } catch (error) {
    console.error("Unexpected error updating contact:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function getCompanies() {
  return await dbGetCompanies()
}

export async function multiUpdatePersons(personIds: string[], data: Record<string, unknown>) {
  const supabase = await createClient()
  
  try {
    // Extract emails, phones and company from the data
    const { _emails, _phones, company_name, ...contactData } = data as PersonWithExtras
    
    // Only process fields that are actually provided (not undefined)
    const fieldsToUpdate = Object.fromEntries(
      Object.entries(contactData).filter(([, value]) => value !== undefined)
    )
    
    if (company_name !== undefined) {
      const companyId = await findOrCreateCompany(supabase, company_name)
      fieldsToUpdate.company_id = companyId
    }
    
    // Update all contacts with the provided data
    if (Object.keys(fieldsToUpdate).length > 0) {
      const { error: contactError } = await supabase
        .schema("registry")
        .from("contacts")
        .update(fieldsToUpdate)
        .in("id", personIds)
      
      if (contactError) {
        console.error("Error multi updating contacts:", contactError)
        return { success: false, error: contactError.message }
      }
    }
    
    // Handle multi email updates if provided
    if (_emails !== undefined) {
      // Delete existing emails for all contacts
      const { error: deleteEmailError } = await supabase
        .schema("registry")
        .from("contact_emails")
        .delete()
        .in("contact_id", personIds)
      
      if (deleteEmailError) {
        console.error("Error deleting existing emails:", deleteEmailError)
        return { success: false, error: deleteEmailError.message }
      }
      
      // Insert new emails for all contacts
      if (_emails.length > 0) {
        const emailsToInsert = personIds.flatMap(contactId =>
          _emails.map((email, index) => ({
            contact_id: contactId,
            email: email,
            display_order: index
          }))
        )
        
        const { error: emailError } = await supabase
          .schema("registry")
          .from("contact_emails")
          .insert(emailsToInsert)
        
        if (emailError) {
          console.error("Error creating emails:", emailError)
          return { success: false, error: emailError.message }
        }
      }
    }
    
    // Handle multi phone updates if provided
    if (_phones !== undefined) {
      // Delete existing phones for all contacts
      const { error: deletePhoneError } = await supabase
        .schema("registry")
        .from("contact_phones")
        .delete()
        .in("contact_id", personIds)
      
      if (deletePhoneError) {
        console.error("Error deleting existing phones:", deletePhoneError)
        return { success: false, error: deletePhoneError.message }
      }
      
      // Insert new phones for all contacts
      if (_phones.length > 0) {
        const phonesToInsert = personIds.flatMap(contactId =>
          _phones.map((phone, index) => ({
            contact_id: contactId,
            phone: phone,
            display_order: index
          }))
        )
        
        const { error: phoneError } = await supabase
          .schema("registry")
          .from("contact_phones")
          .insert(phonesToInsert)
        
        if (phoneError) {
          console.error("Error creating phones:", phoneError)
          return { success: false, error: phoneError.message }
        }
      }
    }
    
    revalidatePath("/contacts")
    return { success: true, updatedCount: personIds.length }
  } catch (error) {
    console.error("Unexpected error multi updating contacts:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function deletePersons(personIds: string[]) {
  const supabase = await createClient()
  
  try {
    // Delete related emails first (due to foreign key constraints)
    const { error: emailError } = await supabase
      .schema("registry")
      .from("contact_emails")
      .delete()
      .in("contact_id", personIds)
    
    if (emailError) {
      console.error("Error deleting emails:", emailError)
      return { success: false, error: emailError.message }
    }
    
    // Delete related phones
    const { error: phoneError } = await supabase
      .schema("registry")
      .from("contact_phones")
      .delete()
      .in("contact_id", personIds)
    
    if (phoneError) {
      console.error("Error deleting phones:", phoneError)
      return { success: false, error: phoneError.message }
    }
    
    // Now delete the contacts
    const { error } = await supabase
      .schema("registry")
      .from("contacts")
      .delete()
      .in("id", personIds)
    
    if (error) {
      console.error("Error deleting contacts:", error)
      return { success: false, error: error.message }
    }
    
    revalidatePath("/contacts")
      return { success: true, deletedCount: personIds.length }
  } catch (error) {
    console.error("Unexpected error deleting contacts:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}
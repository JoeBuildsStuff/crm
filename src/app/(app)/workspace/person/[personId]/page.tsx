import PersonForm from "../_components/form"
import { getPerson, getCompanies } from "../_lib/queries"

export default async function Page({ params }: { params: Promise<{ personId: string }> }) {
  const { personId } = await params

  // Fetch data on the server
  const [personResult, companiesRes] = await Promise.all([
    getPerson(personId),
    getCompanies()
  ])

  if (personResult.error) {
    console.error("Error fetching person:", personResult.error)
    return (
      <div className="flex flex-col gap-4 p-1">
        <div className="text-center text-muted-foreground">
          Error loading person
        </div>
      </div>
    )
  }

  if (!personResult.data) {
    return (
      <div className="flex flex-col gap-4 p-1">
        <div className="text-center text-muted-foreground">
          Person not found
        </div>
      </div>
    )
  }

  const person = personResult.data
  const companies = companiesRes.data || []

  return (
    <div className="flex flex-col gap-4 p-1">
      <PersonForm 
        initialFirstName={person.first_name || ""}
        initialLastName={person.last_name || ""}
        initialDescription={person.description || ""}
        initialJobTitle={person.job_title || ""}
        initialCity={person.city || ""}
        initialState={person.state || ""}
        initialLinkedin={person.linkedin || ""}
        initialCompany={person.company_id || ""}
        initialEmails={person.emails?.map(email => email.email) || []}
        initialPhones={person.phones?.map(phone => phone.phone) || []}
        availableCompanies={companies}
      />
    </div>
  )
} 
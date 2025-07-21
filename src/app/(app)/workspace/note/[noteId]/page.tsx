import NoteForm from "../_components/form"
import { getNote, getAssignableContacts, getLinkableMeetings } from "../_lib/queries"

export default async function Page({ params }: { params: Promise<{ noteId: string }> }) {
  const { noteId } = await params

  // Fetch data on the server
  const [noteResult, contactsRes, meetingsRes] = await Promise.all([
    getNote(noteId),
    getAssignableContacts(),
    getLinkableMeetings()
  ])

  if (noteResult.error) {
    console.error("Error fetching note:", noteResult.error)
    return (
      <div className="flex flex-col gap-4 p-1">
        <div className="text-center text-muted-foreground">
          Error loading note
        </div>
      </div>
    )
  }

  if (!noteResult.data) {
    return (
      <div className="flex flex-col gap-4 p-1">
        <div className="text-center text-muted-foreground">
          Note not found
        </div>
      </div>
    )
  }

  const note = noteResult.data
  const contacts = contactsRes.data || []
  const meetings = meetingsRes.data || []

  return (
    <div className="flex flex-col gap-4 p-1">
      <NoteForm 
        initialData={{
          title: note.title || "",
          content: note.content || "",
          contact_id: note.contact_id || "",
          meeting_id: note.meeting_id || "",
        }}
        availableContacts={contacts}
        availableMeetings={meetings}
      />
    </div>
  )
}